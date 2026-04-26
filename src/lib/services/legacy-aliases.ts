/**
 * Legacy /services/<slug> URL aliases → canonical service_families.slug.
 *
 * Slice A · Step A6 — old marketing slugs from the pre-canonical service
 * catalog (lib/services/catalog.ts) need to keep resolving to the new
 * 9-family architecture. Listed here in alphabetical order.
 *
 * If a slug isn't in this map AND isn't itself a service_families.slug,
 * the page returns 404.
 */
export const LEGACY_SERVICE_SLUG_TO_FAMILY: Record<string, string> = {
  'commercial': 'commercial-branding-photography',
  'commercial-photography': 'commercial-branding-photography',
  'corporate-portrait': 'luxury-portrait-photography',
  'drone-aerial': 'real-estate-drone-photography',
  'drone-services-photography-punta-cana': 'real-estate-drone-photography',
  'event-photography': 'corporate-event-photography',
  'family-photography': 'family-beach-photography',
  'family-session': 'family-beach-photography',
  'portrait-photography': 'luxury-portrait-photography',
  'weddings': 'wedding-photography',
}

export function resolveFamilySlug(rawSlug: string): string {
  return LEGACY_SERVICE_SLUG_TO_FAMILY[rawSlug] ?? rawSlug
}
