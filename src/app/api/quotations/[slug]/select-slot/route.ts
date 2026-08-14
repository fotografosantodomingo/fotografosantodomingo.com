import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  getAvailableSlots,
  releaseStalePendingBookings,
  utcToAstDate,
} from '@/lib/bookings/availability'
import { BOOKING_MIN_ADVANCE_HOURS, BOOKING_MAX_ADVANCE_DAYS } from '@/lib/bookings/constants'
import { getPrimaryStaffId } from '@/lib/quotes/availability-check'

export const runtime = 'edge'

/**
 * POST /api/quotations/[slug]/select-slot
 *
 * Customer-facing: called from ProposalView's date/time picker once they
 * pick a slot. Only reachable for quotes with a package_id (auto-generated
 * dual-quote options) — manually-drafted WhatsApp-bot quotes have no
 * package_id/duration and keep the static event_date/event_time flow.
 *
 * Mirrors /api/bookings/route.ts's collision-safe insert pattern (stale-hold
 * release → live availability re-check → insert → concurrent-overlap
 * post-check) applied to the quotes/proposal-slug context instead of the
 * direct booking wizard.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const { slug } = params
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const startsAtRaw = (body as { startsAtUtc?: unknown })?.startsAtUtc
  if (typeof startsAtRaw !== 'string') {
    return NextResponse.json({ error: 'Missing startsAtUtc' }, { status: 400 })
  }
  const startsAt = new Date(startsAtRaw)
  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: 'Invalid startsAtUtc' }, { status: 400 })
  }

  const sb = createServiceClient()

  await releaseStalePendingBookings(sb)

  const { data: quote, error } = await sb
    .from('quotes')
    .select('id, status, package_id, family_id, booking_id, full_name, email, whatsapp_phone, locale, final_price_usd, deposit_amount_usd, proposal_expires_at')
    .eq('proposal_slug', slug)
    .single()

  if (error || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (!quote.package_id) return NextResponse.json({ error: 'This quote is not self-service bookable' }, { status: 404 })
  if (quote.status !== 'SENT_TO_CUSTOMER') return NextResponse.json({ error: 'This quote is not ready for booking' }, { status: 409 })
  if (quote.booking_id) return NextResponse.json({ error: 'already_selected' }, { status: 409 })
  if (quote.proposal_expires_at && new Date(quote.proposal_expires_at) < new Date()) {
    return NextResponse.json({ error: 'This proposal has expired' }, { status: 410 })
  }

  const { data: pkg, error: pkgErr } = await sb
    .from('service_packages')
    .select('id, name_es, name_en, duration_min, inclusions_es, inclusions_en')
    .eq('id', quote.package_id)
    .single()
  if (pkgErr || !pkg) return NextResponse.json({ error: 'Could not load package' }, { status: 500 })

  const staffId = await getPrimaryStaffId(sb)
  if (!staffId) return NextResponse.json({ error: 'No active staff member configured' }, { status: 503 })

  // Never trust a client-supplied end time — recompute from the package's
  // real duration.
  const endsAt = new Date(startsAt.getTime() + pkg.duration_min * 60_000)
  const startsAtIso = startsAt.toISOString()
  const endsAtIso = endsAt.toISOString()

  const minAdvanceMs = Date.now() + BOOKING_MIN_ADVANCE_HOURS * 60 * 60 * 1000
  if (startsAt.getTime() < minAdvanceMs) {
    return NextResponse.json({ error: `Must be at least ${BOOKING_MIN_ADVANCE_HOURS}h in advance` }, { status: 400 })
  }
  const maxAdvanceMs = Date.now() + BOOKING_MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000
  if (startsAt.getTime() > maxAdvanceMs) {
    return NextResponse.json({ error: `Must be within ${BOOKING_MAX_ADVANCE_DAYS} days` }, { status: 400 })
  }

  const dateYmd = utcToAstDate(startsAt)
  let slots
  try {
    slots = await getAvailableSlots(sb, { staffId, dateYmd, durationMin: pkg.duration_min })
  } catch (err) {
    console.error('select-slot: getAvailableSlots failed:', err)
    return NextResponse.json({ error: 'Failed to verify availability' }, { status: 500 })
  }
  const slotMatch = slots.find(s => s.startsAtUtc === startsAtIso)
  if (!slotMatch) {
    return NextResponse.json({ error: 'That slot is no longer available' }, { status: 409 })
  }

  const { data: booking, error: bookErr } = await sb
    .from('bookings')
    .insert({
      package_id: quote.package_id,
      family_id: quote.family_id,
      package_snapshot: {
        family_id: quote.family_id,
        package_id: quote.package_id,
        name_es: pkg.name_es,
        name_en: pkg.name_en,
        duration_min: pkg.duration_min,
        price_usd: Number(quote.final_price_usd),
        inclusions_es: pkg.inclusions_es ?? [],
        inclusions_en: pkg.inclusions_en ?? [],
        snapshotted_at: new Date().toISOString(),
      },
      staff_id: staffId,
      customer_name: quote.full_name,
      customer_email: quote.email,
      customer_phone: quote.whatsapp_phone,
      locale: quote.locale,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      status: 'PENDING_PAYMENT',
      stripe_amount_usd: Number(quote.final_price_usd),
      deposit_amount_usd: Number(quote.deposit_amount_usd ?? 0),
      currency_display: 'USD',
      terms_accepted: false,
    })
    .select('id')
    .single()
  if (bookErr || !booking) {
    console.error('select-slot: bookings insert failed:', bookErr)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // Concurrent-overlap post-check — identical pattern to /api/bookings/route.ts.
  const { data: overlaps } = await sb
    .from('bookings')
    .select('id, created_at')
    .eq('staff_id', staffId)
    .in('status', ['PENDING_PAYMENT', 'CONFIRMED'])
    .lt('starts_at', endsAtIso)
    .gt('ends_at', startsAtIso)
    .order('created_at', { ascending: true })

  if (overlaps && overlaps.length > 1 && overlaps[0].id !== booking.id) {
    await sb.from('bookings').delete().eq('id', booking.id)
    return NextResponse.json({ error: 'That slot was just taken by someone else' }, { status: 409 })
  }

  // Compare-and-swap the link-back: only succeeds if nobody else (a second
  // concurrent request for this same quote) already claimed a slot first.
  const { data: linked, error: linkErr } = await sb
    .from('quotes')
    .update({ booking_id: booking.id, event_date: dateYmd, event_time: slotMatch.time })
    .eq('id', quote.id)
    .is('booking_id', null)
    .select('id')

  if (linkErr || !linked || linked.length === 0) {
    // Lost the race — this request's booking is orphaned, remove it.
    await sb.from('bookings').delete().eq('id', booking.id)
    return NextResponse.json({ error: 'already_selected' }, { status: 409 })
  }

  return NextResponse.json({ ok: true, date: dateYmd, time: slotMatch.time })
}
