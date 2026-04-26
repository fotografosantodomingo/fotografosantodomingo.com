import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'edge'

/**
 * GET /api/services/packages?family=<slug>
 *
 * Returns family metadata + ordered packages for the family compare page or
 * booking selector. Returns 404 if the family slug doesn't exist or is inactive.
 *
 * Reads ONLY from service_families and service_packages.
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function GET(request: NextRequest) {
  try {
    const familySlug = request.nextUrl.searchParams.get('family')
    if (!familySlug || !SLUG_RE.test(familySlug)) {
      return NextResponse.json(
        { error: 'Missing or invalid `family` query parameter' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Family + nested packages in one round trip via PostgREST embedding.
    const { data, error } = await supabase
      .from('service_families')
      .select(
        `id, slug, title_es, title_en, tagline_es, tagline_en, icon, sort_order,
         service_packages (
           id, slug, name_es, name_en,
           description_short_es, description_short_en,
           starting_price_usd, duration_min, minimum_billable_hours,
           deposit_percent, photo_count,
           bookable_direct, featured, popular_badge,
           inclusions_es, inclusions_en, sort_order, active
         )`
      )
      .eq('slug', familySlug)
      .eq('active', true)
      .maybeSingle()

    if (error) {
      console.error('GET /api/services/packages query error:', error)
      return NextResponse.json({ error: 'Failed to load family' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    // Filter out inactive packages + sort by sort_order ASC
    type DbPackage = {
      id: string
      slug: string
      name_es: string
      name_en: string
      description_short_es: string | null
      description_short_en: string | null
      starting_price_usd: number
      duration_min: number
      minimum_billable_hours: number | null
      deposit_percent: number
      photo_count: number | null
      bookable_direct: boolean
      featured: boolean
      popular_badge: 'most_booked' | 'best_value' | null
      inclusions_es: string[]
      inclusions_en: string[]
      sort_order: number
      active: boolean
    }

    const rawPackages = (data.service_packages ?? []) as DbPackage[]
    const packages = rawPackages
      .filter(p => p.active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(p => ({
        id: p.id,
        slug: p.slug,
        name_es: p.name_es,
        name_en: p.name_en,
        description_short_es: p.description_short_es,
        description_short_en: p.description_short_en,
        price_usd: Number(p.starting_price_usd),
        duration_min: p.duration_min,
        minimum_billable_hours: p.minimum_billable_hours,
        deposit_percent: p.deposit_percent,
        photo_count: p.photo_count,
        bookable_direct: p.bookable_direct,
        featured: p.featured,
        popular_badge: p.popular_badge,
        inclusions_es: p.inclusions_es,
        inclusions_en: p.inclusions_en,
      }))

    return NextResponse.json({
      family: {
        id: data.id,
        slug: data.slug,
        title_es: data.title_es,
        title_en: data.title_en,
        tagline_es: data.tagline_es,
        tagline_en: data.tagline_en,
        icon: data.icon,
        sort_order: data.sort_order,
      },
      packages,
    })
  } catch (err) {
    console.error('GET /api/services/packages unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
