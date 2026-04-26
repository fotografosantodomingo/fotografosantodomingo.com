import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'edge'

/**
 * GET /api/bookings/services
 *
 * Returns active service_packages where bookable_direct=true, grouped by
 * family. Powers the booking wizard's first step.
 *
 * Slice A · Step A4 — canonical data source. The shape preserved
 * `services: [...]` for compatibility with the wizard (each row is a
 * package), and adds `families` so the UI can group + label them.
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = createServiceClient()

    const [packagesRes, familiesRes] = await Promise.all([
      supabase
        .from('service_packages')
        .select('id, slug, name_es, name_en, description_short_es, description_short_en, duration_min, starting_price_usd, deposit_percent, photo_count, minimum_billable_hours, family_id, sort_order, popular_badge, featured, legacy_aliases')
        .eq('active', true)
        .eq('bookable_direct', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('service_families')
        .select('id, slug, title_es, title_en, icon, sort_order')
        .eq('active', true)
        .eq('bookable', true)
        .order('sort_order', { ascending: true }),
    ])

    if (packagesRes.error) {
      console.error('GET /api/bookings/services packages error:', packagesRes.error)
      return NextResponse.json({ error: 'Failed to load packages' }, { status: 500 })
    }
    if (familiesRes.error) {
      console.error('GET /api/bookings/services families error:', familiesRes.error)
      return NextResponse.json({ error: 'Failed to load families' }, { status: 500 })
    }

    const familyById = new Map((familiesRes.data ?? []).map(f => [f.id, f]))

    const services = (packagesRes.data ?? [])
      .filter(p => familyById.has(p.family_id))
      .map(p => {
        const f = familyById.get(p.family_id)!
        return {
          id: p.id,
          slug: p.slug,
          name_es: p.name_es,
          name_en: p.name_en,
          description_es: p.description_short_es,
          description_en: p.description_short_en,
          icon: f.icon,
          duration_min: p.duration_min,
          price_usd: Number(p.starting_price_usd),
          deposit_percent: p.deposit_percent,
          photo_count: p.photo_count,
          minimum_billable_hours: p.minimum_billable_hours,
          popular_badge: p.popular_badge,
          featured: p.featured,
          legacy_aliases: p.legacy_aliases ?? [],
          family_id: p.family_id,
          family_slug: f.slug,
          family_title_es: f.title_es,
          family_title_en: f.title_en,
        }
      })

    const families = (familiesRes.data ?? []).map(f => ({
      id: f.id,
      slug: f.slug,
      title_es: f.title_es,
      title_en: f.title_en,
      icon: f.icon,
    }))

    return NextResponse.json({ services, families })
  } catch (err) {
    console.error('GET /api/bookings/services unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
