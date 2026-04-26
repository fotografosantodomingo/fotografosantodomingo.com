import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'edge'

/**
 * GET /api/services/families
 *
 * Public canonical family directory for the homepage / services hub.
 * Returns active families ordered by sort_order, each enriched with
 * package aggregates (counts + starting price + featured slug).
 *
 * Reads ONLY from service_families and service_packages.
 *
 * Note: service_families schema has no description_short_* or
 * hero_image_url columns. Those fields in the response default to:
 *   - description_short_es/en: tagline_es/en (the closest semantic match)
 *   - hero_image_url: null (column does not exist yet)
 */

type FamilyRow = {
  id: string
  slug: string
  title_es: string
  title_en: string
  tagline_es: string | null
  tagline_en: string | null
  icon: string
  sort_order: number
}

type PackageAggRow = {
  family_id: string
  bookable_direct: boolean
  starting_price_usd: number
  slug: string
  featured: boolean
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = createServiceClient()

    const [familiesResult, packagesResult] = await Promise.all([
      supabase
        .from('service_families')
        .select('id, slug, title_es, title_en, tagline_es, tagline_en, icon, sort_order')
        .eq('active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('service_packages')
        .select('family_id, bookable_direct, starting_price_usd, slug, featured')
        .eq('active', true),
    ])

    if (familiesResult.error) {
      console.error('GET /api/services/families families query error:', familiesResult.error)
      return NextResponse.json({ error: 'Failed to load families' }, { status: 500 })
    }
    if (packagesResult.error) {
      console.error('GET /api/services/families packages query error:', packagesResult.error)
      return NextResponse.json({ error: 'Failed to load packages' }, { status: 500 })
    }

    const families = (familiesResult.data ?? []) as FamilyRow[]
    const packages = (packagesResult.data ?? []) as PackageAggRow[]

    // Index packages by family_id for aggregation
    const packagesByFamily = new Map<string, PackageAggRow[]>()
    for (const p of packages) {
      const arr = packagesByFamily.get(p.family_id) ?? []
      arr.push(p)
      packagesByFamily.set(p.family_id, arr)
    }

    const enriched = families.map(f => {
      const fp = packagesByFamily.get(f.id) ?? []
      const direct = fp.filter(p => p.bookable_direct)
      const rfq = fp.filter(p => !p.bookable_direct)

      const directPrices = direct.map(p => Number(p.starting_price_usd)).filter(n => n > 0)
      const startingPriceUsd = directPrices.length > 0 ? Math.min(...directPrices) : null

      const featuredPkg = fp.find(p => p.featured)

      return {
        id: f.id,
        slug: f.slug,
        title_es: f.title_es,
        title_en: f.title_en,
        tagline_es: f.tagline_es,
        tagline_en: f.tagline_en,
        // schema does not yet carry these fields — see route file header
        description_short_es: f.tagline_es,
        description_short_en: f.tagline_en,
        icon: f.icon,
        hero_image_url: null,
        sort_order: f.sort_order,
        has_direct_packages: direct.length > 0,
        direct_package_count: direct.length,
        rfq_package_count: rfq.length,
        starting_price_usd: startingPriceUsd,
        featured_package_slug: featuredPkg?.slug ?? null,
      }
    })

    return NextResponse.json({ families: enriched })
  } catch (err) {
    console.error('GET /api/services/families unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
