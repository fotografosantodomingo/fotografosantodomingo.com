import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'edge'

/**
 * GET /api/bookings/services
 *
 * Returns active + bookable services for the booking wizard.
 * Sorted by sort_order. Includes price, duration, and deposit info so the
 * frontend can show the deposit amount before payment.
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('booking_services')
      .select(
        'id, slug, name_es, name_en, description_es, description_en, icon, category, duration_min, price_usd, deposit_percent'
      )
      .eq('active', true)
      .eq('bookable', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('GET /api/bookings/services DB error:', error)
      return NextResponse.json({ error: 'Failed to load services' }, { status: 500 })
    }

    return NextResponse.json({ services: data ?? [] })
  } catch (err) {
    console.error('GET /api/bookings/services unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
