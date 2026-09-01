/**
 * Registry of rich SEO content per canonical service family slug.
 *
 * The family page imports `getServiceContent(familySlug)` and renders
 * extra sections only when the family has content registered. Families
 * without content fall through to the package-grid-only Bugatti page.
 *
 * Coverage status (9 of 9 canonical families):
 *   ✅ wedding-photography             (recovered from 94fdc10^)
 *   ✅ proposal-photography            (recovered from 94fdc10^)
 *   ✅ family-beach-photography        (recovered from 94fdc10^ family-photography)
 *   ✅ luxury-portrait-photography     (recovered from 94fdc10^ portrait-photography)
 *   ✅ commercial-branding-photography (recovered from 94fdc10^ commercial-photography)
 *   ✅ real-estate-drone-photography   (recovered from 94fdc10^ drone-services-photography-punta-cana)
 *   ✅ corporate-event-photography     (recovered from 94fdc10^ event-photography)
 *   ✅ birthday-event-photography      (authored fresh — no legacy match)
 *   ✅ custom-specialty-photography    (authored fresh — quote-only family)
 *
 * Adding a new family: create `src/data/service-content/<slug>.ts`
 * exporting a `ServiceContent`, then add it to the map below.
 */

import type { ServiceContent } from './types'
import { weddingPhotographyContent } from './wedding-photography'
import { proposalPhotographyContent } from './proposal-photography'
import { familyBeachPhotographyContent } from './family-beach-photography'
import { luxuryPortraitPhotographyContent } from './luxury-portrait-photography'
import { commercialBrandingPhotographyContent } from './commercial-branding-photography'
import { realEstateDronePhotographyContent } from './real-estate-drone-photography'
import { corporateEventPhotographyContent } from './corporate-event-photography'
import { birthdayEventPhotographyContent } from './birthday-event-photography'
import { customSpecialtyPhotographyContent } from './custom-specialty-photography'
import { foodPhotographyContent } from './food-photography'

const CONTENT_BY_FAMILY_SLUG: Record<string, ServiceContent> = {
  'wedding-photography': weddingPhotographyContent,
  'proposal-photography': proposalPhotographyContent,
  'family-beach-photography': familyBeachPhotographyContent,
  'luxury-portrait-photography': luxuryPortraitPhotographyContent,
  'commercial-branding-photography': commercialBrandingPhotographyContent,
  'real-estate-drone-photography': realEstateDronePhotographyContent,
  'corporate-event-photography': corporateEventPhotographyContent,
  'birthday-event-photography': birthdayEventPhotographyContent,
  'custom-specialty-photography': customSpecialtyPhotographyContent,
  'food-photography': foodPhotographyContent,
}

export function getServiceContent(familySlug: string): ServiceContent | null {
  return CONTENT_BY_FAMILY_SLUG[familySlug] ?? null
}

export type { ServiceContent } from './types'
