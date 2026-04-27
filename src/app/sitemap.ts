import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/supabase/blog'
import { serviceLandingSlugs } from '@/lib/services/catalog'
import { getPublishedSpokes, spokeTierToPriority } from '@/data/spoke-pages'
import { createServiceClient } from '@/lib/supabase/service'
import { GEO_PAGES } from '@/data/geo-pages'

export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

export const revalidate = 0

/**
 * Loads all canonical (family_slug, package_slug) pairs from active rows
 * for sitemap entries. Falls back to empty array on DB error so the
 * sitemap response never 500s — partial coverage is better than none.
 */
async function loadPackagePairs(): Promise<Array<{ familySlug: string; packageSlug: string }>> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('service_packages')
      .select('slug, service_families!inner(slug, active)')
      .eq('active', true)
      .eq('service_families.active', true)
    type Row = { slug: string; service_families: { slug: string; active: boolean } }
    const rows = (data ?? []) as unknown as Row[]
    return rows.map((r) => ({ familySlug: r.service_families.slug, packageSlug: r.slug }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, packagePairs] = await Promise.all([
    getAllSlugs(),
    loadPackagePairs(),
  ])

  const serviceEntries: MetadataRoute.Sitemap = serviceLandingSlugs.flatMap((serviceSlug) => [
    {
      url: `${BASE_URL}/es/services/${serviceSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/en/services/${serviceSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    },
  ])

  const blogEntries: MetadataRoute.Sitemap = slugs.flatMap(({ slug_es, slug_en }) => [
    {
      url: `${BASE_URL}/es/blog/${slug_es}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/en/blog/${slug_en}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ])

  // Per-package detail URLs (33 active packages × 2 locales = 66 entries
   // typically). High SEO value — these are the leaf pages with full
   // pricing, inclusions, and structured Service+Offer JSON-LD.
  const packageEntries: MetadataRoute.Sitemap = packagePairs.flatMap((p) => [
    {
      url: `${BASE_URL}/es/services/${p.familySlug}/${p.packageSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/services/${p.familySlug}/${p.packageSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ])

  // Tier-1 dedicated geo URLs (e.g. /es/fotografo-de-bodas-en-punta-cana,
   // /en/punta-cana-wedding-photographer). These target exact-match local
   // queries and are the highest-revenue-intent landing pages on the site.
  const geoEntries: MetadataRoute.Sitemap = GEO_PAGES.flatMap((g) => [
    {
      url: `${BASE_URL}/es/${g.esSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: g.sitemapPriority,
    },
    {
      url: `${BASE_URL}/en/${g.enSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: g.sitemapPriority,
    },
  ])

  const publishedSpokes = getPublishedSpokes()
  const spokeEntries: MetadataRoute.Sitemap = publishedSpokes.flatMap((sp) => [
    {
      url: `${BASE_URL}/en/${sp.enSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: spokeTierToPriority(sp.tier),
    },
    {
      url: `${BASE_URL}/es/${sp.esSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: spokeTierToPriority(sp.tier),
    },
  ])

  return [
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/es`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/en/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/services/birthday-photographer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/es/services/birthday-photographer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/en/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/es/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/es/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/get-quote`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/get-quote`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/es/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/en/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/es/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/en/proposal`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/es/proposal`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/en/prices`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/es/prices`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/en/book`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/es/book`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.95,
    },
    ...serviceEntries,
    ...packageEntries,
    ...geoEntries,
    ...blogEntries,
    ...spokeEntries,
  ]
}