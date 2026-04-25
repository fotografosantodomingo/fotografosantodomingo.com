import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  getAvailableSlots,
  releaseStalePendingBookings,
  utcToAstDate,
} from '@/lib/bookings/availability'
import {
  BOOKING_MIN_ADVANCE_HOURS,
  BOOKING_STRIPE_CURRENCY,
} from '@/lib/bookings/constants'

export const runtime = 'edge'

const BodySchema = z.object({
  service_id: z.string().uuid(),
  // ISO 8601 datetime with offset (e.g. "2026-04-25T14:00:00.000Z" or with "-04:00")
  starts_at: z.string().datetime({ offset: true }),
  customer_name: z.string().trim().min(1).max(200),
  customer_email: z.string().trim().email().max(200),
  customer_phone: z.string().trim().max(40).optional(),
  locale: z.enum(['es', 'en']).default('es'),
  terms_accepted: z.literal(true),
})

/**
 * POST /api/bookings
 *
 * Creates a PENDING_PAYMENT booking and a Stripe PaymentIntent for the 50%
 * deposit. Returns { booking_id, client_secret } for the wizard's
 * Stripe Payment Element.
 *
 * Concurrency model:
 *   1. Pre-check: slot must appear in get_available_slots()
 *   2. Insert booking with PENDING_PAYMENT (DB function will exclude this slot
 *      from availability for any concurrent request)
 *   3. Post-check: count bookings overlapping this window — if another booking
 *      was inserted *before* ours, we lost the race; delete ours and return 409
 *   4. Create Stripe PaymentIntent — if it fails, delete the booking (rollback)
 *
 * Solo-staff mode: the single active staff_member is auto-assigned.
 */
export async function POST(request: NextRequest) {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const data = parsed.data
  const supabase = createServiceClient()

  // Free abandoned slots before doing anything else
  await releaseStalePendingBookings(supabase)

  // 1. Service lookup + bookable/active gate
  const { data: service, error: svcErr } = await supabase
    .from('booking_services')
    .select(
      'id, slug, name_es, name_en, duration_min, price_usd, deposit_percent, bookable, active'
    )
    .eq('id', data.service_id)
    .single()

  if (svcErr || !service || !service.active || !service.bookable) {
    return NextResponse.json({ error: 'Service not available' }, { status: 404 })
  }

  // 2. Solo-staff: auto-pick the first active staff member
  const { data: staff, error: staffErr } = await supabase
    .from('staff_members')
    .select('id, name')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .single()

  if (staffErr || !staff) {
    return NextResponse.json({ error: 'No staff available' }, { status: 503 })
  }

  // 3. Compute scheduling window
  const startsAt = new Date(data.starts_at)
  const endsAt = new Date(startsAt.getTime() + service.duration_min * 60_000)
  const startsAtIso = startsAt.toISOString()
  const endsAtIso = endsAt.toISOString()

  // Reject past or too-soon bookings
  const minAdvanceMs = Date.now() + BOOKING_MIN_ADVANCE_HOURS * 60 * 60 * 1000
  if (startsAt.getTime() < minAdvanceMs) {
    return NextResponse.json(
      { error: `Booking must be at least ${BOOKING_MIN_ADVANCE_HOURS}h in advance` },
      { status: 400 }
    )
  }

  // 4. Compute deposit (50% by default, per service config)
  const fullUsd = Number(service.price_usd)
  const depositPct = service.deposit_percent ?? 50
  const depositUsd = Math.round((fullUsd * depositPct) / 100 * 100) / 100
  const depositCents = Math.round(depositUsd * 100)

  if (!Number.isFinite(depositCents) || depositCents <= 0) {
    return NextResponse.json({ error: 'Invalid deposit amount' }, { status: 422 })
  }

  // 5. Pre-check slot availability
  const astDate = utcToAstDate(startsAt)
  let slots
  try {
    slots = await getAvailableSlots(supabase, {
      staffId: staff.id,
      dateYmd: astDate,
      durationMin: service.duration_min,
    })
  } catch (err) {
    console.error('Slot lookup failed:', err)
    return NextResponse.json({ error: 'Failed to verify availability' }, { status: 500 })
  }

  const slotMatch = slots.find(s => s.startsAtUtc === startsAtIso)
  if (!slotMatch) {
    return NextResponse.json({ error: 'Slot is not available' }, { status: 409 })
  }

  // 6. Insert booking (PENDING_PAYMENT)
  const { data: inserted, error: insErr } = await supabase
    .from('bookings')
    .insert({
      service_id: service.id,
      staff_id: staff.id,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone ?? null,
      locale: data.locale,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      status: 'PENDING_PAYMENT',
      stripe_amount_usd: fullUsd,
      deposit_amount_usd: depositUsd,
      currency_display: 'USD',
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
    })
    .select('id, created_at')
    .single()

  if (insErr || !inserted) {
    console.error('Booking insert error:', insErr)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // 7. Post-check: is there a concurrent booking that landed before ours?
  const { data: overlaps } = await supabase
    .from('bookings')
    .select('id, created_at')
    .eq('staff_id', staff.id)
    .in('status', ['PENDING_PAYMENT', 'CONFIRMED'])
    .lt('starts_at', endsAtIso)
    .gt('ends_at', startsAtIso)
    .order('created_at', { ascending: true })

  if (overlaps && overlaps.length > 1 && overlaps[0].id !== inserted.id) {
    // We lost the TOCTOU race — release our booking
    await supabase.from('bookings').delete().eq('id', inserted.id)
    return NextResponse.json(
      { error: 'Slot was taken by another customer' },
      { status: 409 }
    )
  }

  // 8. Create Stripe PaymentIntent (deposit only)
  let paymentIntent
  try {
    const stripe = getStripe()
    paymentIntent = await stripe.paymentIntents.create({
      amount: depositCents,
      currency: BOOKING_STRIPE_CURRENCY,
      automatic_payment_methods: { enabled: true },
      receipt_email: data.customer_email,
      description: `Deposit (${depositPct}%) — ${service.name_en}`,
      metadata: {
        booking_id: inserted.id,
        service_slug: service.slug,
        deposit_pct: String(depositPct),
        full_price_usd: String(fullUsd),
      },
    })
  } catch (err) {
    console.error('Stripe paymentIntents.create failed:', err)
    // Rollback the booking — slot frees up for the next customer
    await supabase.from('bookings').delete().eq('id', inserted.id)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 502 }
    )
  }

  // 9. Persist the PI id on the booking
  const { error: updErr } = await supabase
    .from('bookings')
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq('id', inserted.id)

  if (updErr) {
    // Booking + PaymentIntent both exist; log so ops can reconcile.
    // The webhook can still find the booking via metadata.booking_id.
    console.error(
      `Booking ${inserted.id} created but failed to store PI ${paymentIntent.id}:`,
      updErr
    )
  }

  return NextResponse.json({
    booking_id: inserted.id,
    client_secret: paymentIntent.client_secret,
  })
}
