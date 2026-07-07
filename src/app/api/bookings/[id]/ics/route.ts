/**
 * GET /api/bookings/[id]/ics
 *
 * Returns the iCalendar (.ics) file for a CONFIRMED booking. iOS/macOS
 * Safari will hand the response to Calendar.app on click; Outlook
 * recognizes the Content-Type and offers to import. Used by the "Add to
 * Apple Calendar" / "Add to Outlook" button in the confirmation email.
 *
 * Auth: none (public). The booking_id UUID is effectively a 122-bit
 * shared secret — only people with the email link can guess it. The
 * data exposed (title, date, photographer name) is what the customer
 * already received in the confirmation email; no PII leak.
 *
 * Returns:
 *   200 text/calendar              valid CONFIRMED booking
 *   404                            booking missing or not yet CONFIRMED
 *   500                            DB error
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { buildIcsDocument } from '@/lib/bookings/ics'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type BookingRow = {
  id: string
  starts_at: string
  ends_at: string
  locale: 'es' | 'en' | null
  status: string
  customer_name: string
  customer_email: string
  package_snapshot: {
    name_es?: string
    name_en?: string
    family_title_es?: string
    family_title_en?: string
  } | null
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid booking id' }, { status: 404 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('id, starts_at, ends_at, locale, status, customer_name, customer_email, package_snapshot')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[ics] booking lookup failed:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  // Only confirmed bookings are exportable. PENDING_PAYMENT or CANCELLED
  // shouldn't be added to a calendar.
  if (!data || data.status !== 'CONFIRMED') {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const booking = data as BookingRow
  const isEs = (booking.locale ?? 'es') === 'es'
  const snap = booking.package_snapshot ?? {}
  const serviceName = isEs ? snap.name_es ?? '' : snap.name_en ?? ''
  const familyTitle = isEs
    ? snap.family_title_es ?? snap.name_es ?? 'Sesión fotográfica'
    : snap.family_title_en ?? snap.name_en ?? 'Photo session'
  const title = `${serviceName || familyTitle} — Babula Shots`
  const description = isEs
    ? `Sesión confirmada con Babula Shots. Punto de encuentro y detalles finales por WhatsApp +1 (809) 778-9547.`
    : `Confirmed session with Babula Shots. Meeting point and final details via WhatsApp +1 (809) 778-9547.`

  const ics = buildIcsDocument({
    bookingId: booking.id,
    title,
    description,
    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
    customerEmail: booking.customer_email,
    customerName: booking.customer_name,
  })

  return new Response(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="babula-shots-${booking.id.slice(0, 8)}.ics"`,
      'Cache-Control': 'private, no-cache, must-revalidate',
    },
  })
}
