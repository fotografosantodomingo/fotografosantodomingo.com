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
  // Slice A · Step A4 — canonical id is package_id from service_packages.
  // Legacy clients still sending service_id (booking_services.id) are
  // accepted for back-compat and resolved to a canonical package via
  // legacy_aliases.
  package_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  starts_at: z.string().datetime({ offset: true }),
  customer_name: z.string().trim().min(1).max(200),
  customer_email: z.string().trim().email().max(200),
  customer_phone: z.string().trim().max(40).optional(),
  locale: z.enum(['es', 'en']).default('es'),
  terms_accepted: z.literal(true),
  // Geo-block attribution. Set when the booking originates from a
  // /services/<family>#<city> CTA (e.g. punta-cana). Optional + loose so
  // adding a new city never requires another schema or API change.
  attribution_city: z.string().trim().min(1).max(100).optional(),
})

/**
 * POST /api/bookings
 *
 * Creates a PENDING_PAYMENT booking + Stripe PaymentIntent for the deposit.
 * Returns { booking_id, client_secret }.
 *
 * Slice A · Step A4: data source is service_packages (canonical). The
 * legacy bookings.service_id FK is satisfied opportunistically when a
 * legacy_aliases match exists; otherwise it stays NULL (relaxed in
 * migration 20260426017).
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
  if (!data.package_id && !data.service_id) {
    return NextResponse.json(
      { error: 'Either package_id or service_id is required' },
      { status: 400 }
    )
  }
  const supabase = createServiceClient()

  await releaseStalePendingBookings(supabase)

  // 1. Resolve to a canonical package
  let pkgId = data.package_id
  if (!pkgId && data.service_id) {
    const { data: legacySvc, error: lsvcErr } = await supabase
      .from('booking_services')
      .select('slug')
      .eq('id', data.service_id)
      .maybeSingle()
    if (lsvcErr || !legacySvc) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    const { data: viaAlias, error: aliasErr } = await supabase
      .from('service_packages')
      .select('id')
      .contains('legacy_aliases', [legacySvc.slug])
      .eq('active', true)
      .eq('bookable_direct', true)
      .limit(1)
      .maybeSingle()
    if (aliasErr || !viaAlias) {
      return NextResponse.json(
        { error: 'No canonical package mapped to that legacy service' },
        { status: 404 }
      )
    }
    pkgId = viaAlias.id
  }

  // 2. Load package + family
  const { data: pkg, error: pkgErr } = await supabase
    .from('service_packages')
    .select('id, slug, family_id, name_es, name_en, duration_min, starting_price_usd, deposit_percent, photo_count, inclusions_es, inclusions_en, minimum_billable_hours, bookable_direct, active, legacy_aliases')
    .eq('id', pkgId!)
    .single()
  if (pkgErr || !pkg || !pkg.active || !pkg.bookable_direct) {
    return NextResponse.json({ error: 'Package not available for direct booking' }, { status: 404 })
  }

  const { data: family, error: famErr } = await supabase
    .from('service_families')
    .select('id, slug, title_es, title_en, icon, active, bookable')
    .eq('id', pkg.family_id)
    .single()
  if (famErr || !family || !family.active || !family.bookable) {
    return NextResponse.json({ error: 'Family not bookable' }, { status: 404 })
  }

  // 3. Solo-staff: auto-pick the first active staff member
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

  // 4. Compute scheduling window
  const startsAt = new Date(data.starts_at)
  const endsAt = new Date(startsAt.getTime() + pkg.duration_min * 60_000)
  const startsAtIso = startsAt.toISOString()
  const endsAtIso = endsAt.toISOString()

  const minAdvanceMs = Date.now() + BOOKING_MIN_ADVANCE_HOURS * 60 * 60 * 1000
  if (startsAt.getTime() < minAdvanceMs) {
    return NextResponse.json(
      { error: `Booking must be at least ${BOOKING_MIN_ADVANCE_HOURS}h in advance` },
      { status: 400 }
    )
  }

  // 5. Pricing
  const fullUsd = Number(pkg.starting_price_usd)
  const depositPct = pkg.deposit_percent ?? 50
  const depositUsd = Math.round((fullUsd * depositPct) / 100 * 100) / 100
  const depositCents = Math.round(depositUsd * 100)
  if (!Number.isFinite(depositCents) || depositCents <= 0) {
    return NextResponse.json({ error: 'Invalid deposit amount' }, { status: 422 })
  }

  // 6. Availability pre-check
  const astDate = utcToAstDate(startsAt)
  let slots
  try {
    slots = await getAvailableSlots(supabase, {
      staffId: staff.id,
      dateYmd: astDate,
      durationMin: pkg.duration_min,
    })
  } catch (err) {
    console.error('Slot lookup failed:', err)
    return NextResponse.json({ error: 'Failed to verify availability' }, { status: 500 })
  }
  const slotMatch = slots.find(s => s.startsAtUtc === startsAtIso)
  if (!slotMatch) {
    return NextResponse.json({ error: 'Slot is not available' }, { status: 409 })
  }

  // 7. Best-effort legacy service_id resolution (NULL-safe under relaxed FK)
  let legacyServiceId: string | null = null
  if ((pkg.legacy_aliases ?? []).length > 0) {
    const { data: legacy } = await supabase
      .from('booking_services')
      .select('id')
      .in('slug', pkg.legacy_aliases as string[])
      .limit(1)
      .maybeSingle()
    if (legacy?.id) legacyServiceId = legacy.id
  }

  // 8. Build immutable snapshot — frozen at booking time so historical
  //    reads survive future package edits.
  const packageSnapshot = {
    family_id: family.id,
    family_slug: family.slug,
    family_title_es: family.title_es,
    family_title_en: family.title_en,
    family_icon: family.icon,
    package_id: pkg.id,
    package_slug: pkg.slug,
    name_es: pkg.name_es,
    name_en: pkg.name_en,
    price_usd: fullUsd,
    deposit_percent: depositPct,
    duration_min: pkg.duration_min,
    photo_count: pkg.photo_count,
    inclusions_es: pkg.inclusions_es ?? [],
    inclusions_en: pkg.inclusions_en ?? [],
    minimum_billable_hours: pkg.minimum_billable_hours,
    snapshotted_at: new Date().toISOString(),
    legacy_slug: null,
    historic_price_usd: fullUsd,
    backfilled: false,
  }

  // 9. Insert booking
  const { data: inserted, error: insErr } = await supabase
    .from('bookings')
    .insert({
      service_id: legacyServiceId,
      package_id: pkg.id,
      family_id: family.id,
      package_snapshot: packageSnapshot,
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
      attribution_city: data.attribution_city ?? null,
    })
    .select('id, created_at')
    .single()
  if (insErr || !inserted) {
    console.error('Booking insert error:', insErr)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // 10. Concurrent-overlap post-check
  const { data: overlaps } = await supabase
    .from('bookings')
    .select('id, created_at')
    .eq('staff_id', staff.id)
    .in('status', ['PENDING_PAYMENT', 'CONFIRMED'])
    .lt('starts_at', endsAtIso)
    .gt('ends_at', startsAtIso)
    .order('created_at', { ascending: true })

  if (overlaps && overlaps.length > 1 && overlaps[0].id !== inserted.id) {
    await supabase.from('bookings').delete().eq('id', inserted.id)
    return NextResponse.json(
      { error: 'Slot was taken by another customer' },
      { status: 409 }
    )
  }

  // 11. Stripe PaymentIntent
  let paymentIntent
  try {
    const stripe = getStripe()
    paymentIntent = await stripe.paymentIntents.create({
      amount: depositCents,
      currency: BOOKING_STRIPE_CURRENCY,
      automatic_payment_methods: { enabled: true },
      receipt_email: data.customer_email,
      description: `Deposit (${depositPct}%) — ${pkg.name_en}`,
      metadata: {
        booking_id: inserted.id,
        package_id: pkg.id,
        package_slug: pkg.slug,
        family_slug: family.slug,
        deposit_pct: String(depositPct),
        full_price_usd: String(fullUsd),
      },
    })
  } catch (err) {
    console.error('Stripe paymentIntents.create failed:', err)
    await supabase.from('bookings').delete().eq('id', inserted.id)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 502 }
    )
  }

  const { error: updErr } = await supabase
    .from('bookings')
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq('id', inserted.id)
  if (updErr) {
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
