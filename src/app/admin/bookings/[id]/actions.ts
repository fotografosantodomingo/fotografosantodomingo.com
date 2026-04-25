'use server'

import { revalidatePath } from 'next/cache'
import { getStripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  getAvailableSlots,
  releaseStalePendingBookings,
  utcToAstDate,
} from '@/lib/bookings/availability'

export type ActionState = { error: string | null; success: boolean }

// ─── Cancel + refund ─────────────────────────────────────────────────────────

export async function cancelBooking(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const bookingId = String(formData.get('bookingId') ?? '')
  const reason = String(formData.get('reason') ?? '').trim() || 'Cancelled by admin'
  const refundCents = Number(formData.get('refundCents') ?? 0)

  if (!bookingId) {
    return { error: 'Missing booking id', success: false }
  }
  if (!Number.isFinite(refundCents) || refundCents < 0) {
    return { error: 'Invalid refund amount', success: false }
  }

  const supabase = createServiceClient()

  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, status, stripe_payment_intent_id, deposit_amount_usd, refund_amount_usd')
    .eq('id', bookingId)
    .single()

  if (fetchErr || !booking) {
    return { error: 'Booking not found', success: false }
  }

  if (booking.status === 'CANCELLED') {
    return { error: 'Booking is already cancelled', success: false }
  }

  // Issue Stripe refund if requested + we have a PI
  let actualRefundUsd = Number(booking.refund_amount_usd ?? 0)
  if (refundCents > 0) {
    if (!booking.stripe_payment_intent_id) {
      return { error: 'No payment to refund (no Stripe PaymentIntent)', success: false }
    }
    try {
      const stripe = getStripe()
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: refundCents,
        reason: 'requested_by_customer',
        metadata: { booking_id: bookingId, admin_reason: reason },
      })
      actualRefundUsd += (refund.amount ?? 0) / 100
    } catch (err) {
      console.error('Stripe refund failed:', err)
      return {
        error: err instanceof Error ? `Refund failed: ${err.message}` : 'Refund failed',
        success: false,
      }
    }
  }

  const { error: updErr } = await supabase
    .from('bookings')
    .update({
      status: 'CANCELLED',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
      refund_amount_usd: actualRefundUsd,
    })
    .eq('id', bookingId)

  if (updErr) {
    return { error: `DB update failed: ${updErr.message}`, success: false }
  }

  revalidatePath(`/admin/bookings/${bookingId}`)
  revalidatePath('/admin/bookings')
  return { error: null, success: true }
}

// ─── Mark completed / no-show ────────────────────────────────────────────────

export async function markBookingStatus(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const bookingId = String(formData.get('bookingId') ?? '')
  const newStatus = String(formData.get('status') ?? '')

  if (!['COMPLETED', 'NO_SHOW', 'CONFIRMED'].includes(newStatus)) {
    return { error: 'Invalid status', success: false }
  }
  if (!bookingId) {
    return { error: 'Missing booking id', success: false }
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)

  if (error) {
    return { error: `DB update failed: ${error.message}`, success: false }
  }

  revalidatePath(`/admin/bookings/${bookingId}`)
  revalidatePath('/admin/bookings')
  return { error: null, success: true }
}

// ─── Reschedule ──────────────────────────────────────────────────────────────

export async function rescheduleBooking(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const bookingId = String(formData.get('bookingId') ?? '')
  const startsAtIso = String(formData.get('startsAt') ?? '')

  if (!bookingId || !startsAtIso) {
    return { error: 'Missing booking id or new time', success: false }
  }

  const startsAt = new Date(startsAtIso)
  if (Number.isNaN(startsAt.getTime())) {
    return { error: 'Invalid datetime', success: false }
  }

  const supabase = createServiceClient()
  await releaseStalePendingBookings(supabase)

  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select(
      `id, staff_id, status,
       service:booking_services ( duration_min )`
    )
    .eq('id', bookingId)
    .single()

  if (fetchErr || !booking) {
    return { error: 'Booking not found', success: false }
  }

  if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING_PAYMENT') {
    return { error: `Cannot reschedule a ${booking.status} booking`, success: false }
  }

  const service = booking.service as { duration_min: number } | null
  if (!service?.duration_min) {
    return { error: 'Service data missing', success: false }
  }

  const endsAt = new Date(startsAt.getTime() + service.duration_min * 60_000)

  // Verify the new slot is available (excluding the current booking from the check)
  const slots = await getAvailableSlots(supabase, {
    staffId: booking.staff_id,
    dateYmd: utcToAstDate(startsAt),
    durationMin: service.duration_min,
  })

  const targetIso = startsAt.toISOString()
  const slotMatch = slots.find(s => s.startsAtUtc === targetIso)

  if (!slotMatch) {
    // get_available_slots already filters out PENDING_PAYMENT/CONFIRMED bookings,
    // including this one. So if the slot isn't returned, it's either truly busy
    // or outside working hours.
    return { error: 'New slot is not available', success: false }
  }

  const { error: updErr } = await supabase
    .from('bookings')
    .update({
      starts_at: targetIso,
      ends_at: endsAt.toISOString(),
      // Reset reminder flags so they fire for the new time
      reminder_24h_sent: false,
      reminder_same_day_sent: false,
    })
    .eq('id', bookingId)

  if (updErr) {
    return { error: `DB update failed: ${updErr.message}`, success: false }
  }

  revalidatePath(`/admin/bookings/${bookingId}`)
  revalidatePath('/admin/bookings')
  return { error: null, success: true }
}
