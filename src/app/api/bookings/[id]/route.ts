import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'edge'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/bookings/[id]
 *
 * Public booking-status lookup, used by the confirmation page after Stripe redirect.
 * Returns a curated subset of fields — no admin notes, no PI id, no charge id.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!params.id || !UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `id,
       starts_at,
       ends_at,
       status,
       locale,
       customer_name,
       customer_email,
       customer_phone,
       stripe_amount_usd,
       deposit_amount_usd,
       currency_display,
       service:booking_services ( slug, name_es, name_en, duration_min, icon ),
       staff:staff_members ( name )`
    )
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    console.error('GET /api/bookings/[id] DB error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ booking: data })
}
