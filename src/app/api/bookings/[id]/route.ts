import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'edge'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/bookings/[id]
 *
 * Public booking-status lookup, used by the confirmation page after Stripe redirect.
 * Returns a curated subset of fields — no admin notes, no PI id, no charge id.
 *
 * Slice A · Step A4 — service info comes from package_snapshot (frozen at
 * booking time). Falls back to a JOIN against service_packages + service_families
 * if a row somehow lacks a snapshot.
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
       package_snapshot,
       package:service_packages ( slug, name_es, name_en, duration_min ),
       family:service_families ( slug, title_es, title_en, icon ),
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

  type Snap = {
    family_slug?: string
    package_slug?: string
    name_es?: string
    name_en?: string
    family_icon?: string
    duration_min?: number
  } | null
  const snap = (data.package_snapshot ?? null) as Snap
  const pkg = data.package as unknown as
    | { slug: string; name_es: string; name_en: string; duration_min: number }
    | null
  const fam = data.family as unknown as
    | { slug: string; title_es: string; title_en: string; icon: string }
    | null

  const service = {
    slug: snap?.package_slug ?? pkg?.slug ?? null,
    name_es: snap?.name_es ?? pkg?.name_es ?? '',
    name_en: snap?.name_en ?? pkg?.name_en ?? '',
    duration_min: snap?.duration_min ?? pkg?.duration_min ?? 60,
    icon: snap?.family_icon ?? fam?.icon ?? '📷',
  }

  return NextResponse.json({
    booking: {
      id: data.id,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      status: data.status,
      locale: data.locale,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      stripe_amount_usd: data.stripe_amount_usd,
      deposit_amount_usd: data.deposit_amount_usd,
      currency_display: data.currency_display,
      service,
      staff: data.staff,
    },
  })
}
