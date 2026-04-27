/**
 * Geo-pages registry public API.
 */

import { GEO_PAGES } from './registry'
import type { GeoPage } from './types'

export type { GeoPage } from './types'
export { GEO_PAGES } from './registry'

/**
 * Resolve a geo slug (in either locale) to its registry entry. Returns
 * null when the slug is unknown — caller should notFound() in that case.
 */
export function getGeoPageBySlug(slug: string): GeoPage | null {
  for (const page of GEO_PAGES) {
    if (page.enSlug === slug || page.esSlug === slug) return page
  }
  return null
}

/** All geo slugs across both locales — used by generateStaticParams. */
export function getAllGeoSlugs(): Array<{ locale: 'es' | 'en'; geoSlug: string }> {
  return GEO_PAGES.flatMap((g) => [
    { locale: 'es' as const, geoSlug: g.esSlug },
    { locale: 'en' as const, geoSlug: g.enSlug },
  ])
}

/** Sibling geo pages within the same family — used for cross-linking. */
export function getSiblingGeoPages(family: string, excludeSlug: string): GeoPage[] {
  return GEO_PAGES.filter(
    (g) => g.familySlug === family && g.enSlug !== excludeSlug && g.esSlug !== excludeSlug
  )
}
