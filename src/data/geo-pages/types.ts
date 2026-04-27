/**
 * Tier-1 dedicated geo URL types.
 *
 * Each entry maps an EN slug + ES slug pair to:
 *  - a canonical service_families.slug (for sourcing existing geoCoverage
 *    content + JSON-LD areaServed City nodes)
 *  - a citySlug that matches the family's geoCoverage block (or null for
 *    country-level pages that aggregate multiple cities)
 *
 * The route handler /[locale]/[geoSlug] resolves a request by looking up
 * the registry; unknown slugs notFound() unless they're a recognized
 * top-level static route (about, blog, services, etc. — those are
 * resolved by Next.js file-based routing first, never reach this handler).
 */

import type { Bilingual, BilingualList, FaqItem } from '@/data/service-content/types'

export type GeoPage = {
  /** English URL slug, e.g. 'punta-cana-wedding-photographer'. Must NOT clash with reserved top-level routes. */
  enSlug: string
  /** Spanish URL slug, e.g. 'fotografo-de-bodas-en-punta-cana'. */
  esSlug: string
  /** Canonical service_families.slug — drives data lookup and family-page link. */
  familySlug: string
  /**
   * Family's geoCoverage citySlug to source intro/venues/miniFaq. NULL for
   * country-level aggregate pages (e.g. dominican-republic-destination-
   * wedding-photographer) which carry their own content (countryContent).
   */
  citySlug: string | null
  /** Display name of the location. */
  cityName: Bilingual
  /**
   * H1 of the page. If unset, derived as `${familyTitle} in ${cityName}`.
   * Override when the buyer-search phrase differs from the auto-derived title.
   */
  h1Override?: Bilingual
  /** Country-level page extra content (used when citySlug is null). */
  countryContent?: {
    intro: Bilingual
    cityHighlights: BilingualList
    faqs: FaqItem[]
  }
  /** Sitemap priority. 0.85 for high-revenue intent (weddings), 0.8 for others. */
  sitemapPriority: number
}
