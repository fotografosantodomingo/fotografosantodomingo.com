import { type NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  sendBookingConfirmation,
  sendBookingAdminAlert,
  type BookingEmailContext,
} from '@/lib/email/bookings'
import { createGallery } from '@/lib/gallery/service'

export const runtime = 'edge'

/**
 * POST /api/stripe/booking-webhook
 *
 * Stripe webhook for booking events. Separate from /api/stripe/webhook (quote
 * checkout) so each can have its own signing secret in the Stripe Dashboard.
 *
 * Handled events:
 *   - payment_intent.succeeded     → status = CONFIRMED, store charge id
 *   - payment_intent.payment_failed → status = CANCELLED (only if PENDING_PAYMENT),
 *                                     so the slot is released
 *   - charge.refunded              → record refund_amount_usd; if fully refunded,
 *                                     status = CANCELLED
 *
 * Configure in Stripe Dashboard → Webhooks → endpoint URL:
 *   https://www.fotografosantodomingo.com/api/stripe/booking-webhook
 * Required env: STRIPE_BOOKING_WEBHOOK_SECRET (falls back to STRIPE_WEBHOOK_SECRET
 * for development convenience, but production should set the dedicated secret).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  const webhookSecret =
    process.env.STRIPE_BOOKING_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('Booking webhook secret not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Booking webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent
      const bookingId = pi.metadata?.booking_id
      if (!bookingId) {
        // Not a booking PI — silently acknowledge
        return NextResponse.json({ received: true })
      }

      const chargeId = typeof pi.latest_charge === 'string' ? pi.latest_charge : null

      // Update + return the previous status so we know if this is a fresh confirmation
      const { data: updated, error } = await supabase
        .from('bookings')
        .update({
          status: 'CONFIRMED',
          stripe_payment_intent_id: pi.id,
          stripe_charge_id: chargeId,
        })
        .eq('id', bookingId)
        .neq('status', 'CONFIRMED') // idempotency guard
        .select(
          `id, customer_name, customer_email, customer_phone, locale,
           starts_at, ends_at,
           stripe_amount_usd, deposit_amount_usd,
           package_snapshot,
           family:service_families ( icon ),
           staff:staff_members ( name )`
        )
        .maybeSingle()

      if (error) {
        console.error('Booking CONFIRMED update error:', error)
        // 500 → Stripe will retry
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      // updated is null when the row was already CONFIRMED — that's fine, no emails needed
      if (updated) {
        type Snap = {
          name_es?: string
          name_en?: string
          family_icon?: string
          duration_min?: number
        } | null
        const snap = (updated.package_snapshot ?? null) as Snap
        const fam = updated.family as unknown as { icon: string } | null
        const staff = updated.staff as unknown as { name: string } | null

        const ctx: BookingEmailContext = {
          bookingId: updated.id,
          customerName: updated.customer_name,
          customerEmail: updated.customer_email,
          locale: (updated.locale ?? 'es') as 'es' | 'en',
          serviceNameEs: snap?.name_es ?? '',
          serviceNameEn: snap?.name_en ?? '',
          serviceIcon: snap?.family_icon ?? fam?.icon ?? '📷',
          durationMin: snap?.duration_min ?? 60,
          startsAt: updated.starts_at,
          endsAt: updated.ends_at,
          staffName: staff?.name ?? 'Babula Shots',
          fullPriceUsd: Number(updated.stripe_amount_usd ?? 0),
          depositUsd: Number(updated.deposit_amount_usd ?? 0),
        }

        // Fire and forget — failure already logged in booking_email_log.
        // Gallery starts in 'draft' (no photos, no expiry clock) — admin
        // uploads to it after the shoot and marks it ready.
        await Promise.all([
          sendBookingConfirmation(supabase, ctx),
          sendBookingAdminAlert(supabase, { ...ctx, customerPhone: updated.customer_phone }),
          createGallery(supabase, {
            clientName: updated.customer_name,
            clientEmail: updated.customer_email,
            bookingId: updated.id,
          }).catch((err) => console.error('createGallery failed for booking', updated.id, err)),
        ])
      }

      console.log(`Booking ${bookingId} CONFIRMED via Stripe webhook`)
    }

    else if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent
      const bookingId = pi.metadata?.booking_id
      if (!bookingId) return NextResponse.json({ received: true })

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'CANCELLED',
          cancellation_reason: 'Payment failed',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .eq('status', 'PENDING_PAYMENT') // only cancel pending; never override CONFIRMED

      if (error) {
        console.error('Booking payment_failed update error:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      console.log(`Booking ${bookingId} CANCELLED (payment failed) — slot released`)
    }

    else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null
      if (!piId) return NextResponse.json({ received: true })

      const refundedUsd = (charge.amount_refunded ?? 0) / 100
      const fullyRefunded =
        charge.amount != null && charge.amount_refunded === charge.amount

      const update: Record<string, unknown> = { refund_amount_usd: refundedUsd }
      if (fullyRefunded) {
        update.status = 'CANCELLED'
        update.cancelled_at = new Date().toISOString()
        if (!('cancellation_reason' in update)) {
          update.cancellation_reason = 'Refunded'
        }
      }

      const { error } = await supabase
        .from('bookings')
        .update(update)
        .eq('stripe_payment_intent_id', piId)

      if (error) {
        console.error('Booking refund update error:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      console.log(
        `Booking refund recorded: $${refundedUsd}${fullyRefunded ? ' (full)' : ''} for PI ${piId}`
      )
    }
  } catch (err) {
    console.error('Booking webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
