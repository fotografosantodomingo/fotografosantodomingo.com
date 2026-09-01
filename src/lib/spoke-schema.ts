/**
 * Spoke-page JSON-LD schema builder
 *
 * Usage:
 *   const schemas = buildSpokeSchemas(spoke, locale, BASE_URL)
 *   // → [breadcrumbSchema, localServiceSchema, faqSchema, imageObjectSchema]
 *
 * Returns an array of plain objects — pass each to generateJsonLd() from
 * @/components/seo/JsonLd.
 */

import type { SpokePage } from '@/data/spoke-pages'
import { PHOTOGRAPHER, SAME_AS_LINKS } from '@/lib/utils/constants'

const DEFAULT_BASE_URL = 'https://www.fotografosantodomingo.com'

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────────────────────────────────────

function buildBreadcrumb(spoke: SpokePage, locale: string, baseUrl: string) {
  const isEs = locale === 'es'
  const slug = isEs ? spoke.esSlug : spoke.enSlug
  const title = isEs ? spoke.titleEs : spoke.titleEn
  const hubPart = slug.split('/')[0]
  const hubLabel = hubPart.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isEs ? 'Inicio' : 'Home',
        item: `${baseUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isEs ? 'Servicios' : 'Services',
        item: `${baseUrl}/${locale}/services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: hubLabel,
        item: `${baseUrl}/${locale}/services/${spoke.hubSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: title !== '[CONTENT — Sprint 2]' ? title : hubLabel,
        item: `${baseUrl}/${locale}/${slug}`,
      },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Local Service (spoke-specific)
// ─────────────────────────────────────────────────────────────────────────────

function buildLocalService(spoke: SpokePage, locale: string, baseUrl: string) {
  const isEs = locale === 'es'
  const slug = isEs ? spoke.esSlug : spoke.enSlug
  const title = isEs ? spoke.titleEs : spoke.titleEn
  const description = isEs ? spoke.descriptionEs : spoke.descriptionEn

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title !== '[CONTENT — Sprint 2]' ? title : `Photographer in ${spoke.geoCity}`,
    description: description !== '[CONTENT — Sprint 2]' ? description : '',
    url: `${baseUrl}/${locale}/${slug}`,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Babula Shots',
      url: baseUrl,
      telephone: PHOTOGRAPHER.phone,
      priceRange: '$$',
      image: `${baseUrl}/images/babula-shots-logo.jpg`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: PHOTOGRAPHER.address.street,
        addressLocality: PHOTOGRAPHER.address.locality,
        addressRegion: PHOTOGRAPHER.address.region,
        postalCode: PHOTOGRAPHER.address.postalCode,
        addressCountry: {
          '@type': 'Country',
          name: PHOTOGRAPHER.address.country,
        },
      },
      sameAs: SAME_AS_LINKS,
    },
    areaServed: {
      '@type': 'City',
      name: spoke.geoCity,
      addressRegion: spoke.geoRegion,
      addressCountry: 'DO',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: spoke.geo.latitude,
        longitude: spoke.geo.longitude,
      },
    },
    ...(spoke.priceFromUsd !== '[CONTENT — Sprint 2]'
      ? {
          offers: [
            {
              '@type': 'Offer',
              price: spoke.priceFromUsd.replace(/[^0-9.]/g, ''),
              priceCurrency: spoke.priceFromUsd.includes('RD$') ? 'DOP' : 'USD',
              description: isEs ? spoke.pricingDescEs : spoke.pricingDescEn,
              url: `${baseUrl}/${locale}/${slug}`,
            },
            ...(spoke.pricingTiers ?? []).map((tier) => ({
              '@type': 'Offer',
              name: isEs ? tier.labelEs : tier.labelEn,
              price: tier.priceUsd.replace(/[^0-9.]/g, ''),
              priceCurrency: 'USD',
              description: isEs ? tier.descriptionEs : tier.descriptionEn,
              url: `${baseUrl}/${locale}/book?service=${tier.bookingServiceSlug}`,
              availability: 'https://schema.org/InStock',
            })),
          ],
        }
      : {}),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────

function buildFaq(spoke: SpokePage, locale: string) {
  const isEs = locale === 'es'
  const filledFaq = spoke.faq.filter(
    (f) => f.questionEn !== '[CONTENT — Sprint 2]' && f.answerEn !== '[CONTENT — Sprint 2]'
  )
  if (filledFaq.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: filledFaq.map((f) => ({
      '@type': 'Question',
      name: isEs ? f.questionEs : f.questionEn,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isEs ? f.answerEs : f.answerEn,
      },
    })),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageObject for hero image
// ─────────────────────────────────────────────────────────────────────────────

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dwewurxla/image/upload'

/** Returns true only if the publicId is a real Cloudinary ID, not a placeholder */
function isRealCloudinaryId(id: string | undefined | null): boolean {
  if (!id) return false
  if (id.startsWith('[')) return false   // e.g. '[CONTENT — Sprint 2]'
  if (id.includes('+Coming+Soon')) return false
  if (id.length < 4) return false
  return true
}

function buildImageObject(spoke: SpokePage, locale: string, baseUrl: string) {
  if (!isRealCloudinaryId(spoke.heroImagePublicId)) {
    return null
  }

  const isEs = locale === 'es'
  const slug = isEs ? spoke.esSlug : spoke.enSlug
  const alt = isEs ? spoke.heroImageAltEs : spoke.heroImageAltEn

  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: `${CLOUDINARY_BASE}/c_fill,w_1200,h_630,f_auto,q_auto/${spoke.heroImagePublicId}`,
    description: alt,
    url: `${baseUrl}/${locale}/${slug}`,
    width: 1200,
    height: 630,
    license: PHOTOGRAPHER.license,
    acquireLicensePage: PHOTOGRAPHER.acquireLicensePage,
    creditText: PHOTOGRAPHER.creditText,
    copyrightNotice: `© ${new Date().getFullYear()} ${PHOTOGRAPHER.brandName}. All rights reserved.`,
    creator: {
      '@type': 'Person',
      name: PHOTOGRAPHER.name,
      url: PHOTOGRAPHER.aboutUrl,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main builder
// ─────────────────────────────────────────────────────────────────────────────

/** Returns an array of JSON-LD schema objects — filter out nulls before use */
export function buildSpokeSchemas(
  spoke: SpokePage,
  locale: string,
  baseUrl: string = DEFAULT_BASE_URL,
) {
  return [
    buildBreadcrumb(spoke, locale, baseUrl),
    buildLocalService(spoke, locale, baseUrl),
    buildFaq(spoke, locale),
    buildImageObject(spoke, locale, baseUrl),
  ].filter(Boolean)
}
