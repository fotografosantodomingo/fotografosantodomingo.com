/**
 * Registry of rich SEO content per canonical service family slug.
 *
 * The family page imports `getServiceContent(familySlug)` and renders
 * extra sections only when the family has content registered. Families
 * without content fall through to the package-grid-only Bugatti page.
 *
 * Adding a new family: create `src/data/service-content/<slug>.ts`
 * exporting a `ServiceContent`, then add it to the map below.
 */

import type { ServiceContent } from './types'
import { weddingPhotographyContent } from './wedding-photography'

const CONTENT_BY_FAMILY_SLUG: Record<string, ServiceContent> = {
  'wedding-photography': weddingPhotographyContent,
}

export function getServiceContent(familySlug: string): ServiceContent | null {
  return CONTENT_BY_FAMILY_SLUG[familySlug] ?? null
}

export type { ServiceContent } from './types'
