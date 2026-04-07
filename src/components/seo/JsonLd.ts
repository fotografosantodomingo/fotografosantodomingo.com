import { PortfolioImage, ReviewStats, resolveLocale } from '@/lib/types/portfolio'

const BASE_URL = 'https://fotografosantodomingo.com'
const CLOUDINARY_BASE = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`

export const schemaGenerators = {
  organization: () => ({
    '@type': 'Organization',
    name: 'Fotografo Santo Domingo | Babula Shots', // UPDATED
    url: 'https://fotografosantodomingo.com', // UPDATED
    logo: 'https://fotografosantodomingo.com/images/logo.png', // UPDATED
    sameAs: [
      'https://instagram.com/babulashots',
      'https://facebook.com/babulashots',
      'https://www.tiktok.com/@babulashots'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-809-720-9547',
      contactType: 'customer service',
      availableLanguage: ['English', 'Spanish']
    },
    address: { // Can add physical address here
      '@type': 'PostalAddress',
      addressLocality: 'Santo Domingo',
      addressRegion: 'Nacional',
      addressCountry: 'DO'
    }
  }),

  localBusiness: () => ({ // Simplified - auto uses SD
    '@type': 'LocalBusiness', // Or 'Photographer' if schema supports
    '@id': 'https://fotografosantodomingo.com/#business', // UPDATED
    name: 'Fotografo Santo Domingo - Babula Shots', // UPDATED
    image: 'https://fotografosantodomingo.com/images/og-default.webp', // UPDATED
    url: 'https://fotografosantodomingo.com', // UPDATED
    telephone: '+1-809-720-9547',
    email: 'info@fotografosantodomingo.com', // UPDATED
    address: {
      '@type': 'PostalAddress',
      streetAddress: '[Your Street Address]',
      addressLocality: 'Santo Domingo',
      addressRegion: 'Nacional',
      postalCode: '10100',
      addressCountry: 'DO'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 18.4800,
      longitude: -69.9000
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '16:00'
      }
    ],
    priceRange: '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '87'
    },
    areaServed: [
      { '@type': 'City', name: 'Santo Domingo' },
      { '@type': 'City', name: 'Punta Cana' },
      { '@type': 'City', name: 'Santiago' },
      { '@type': 'AdministrativeArea', name: 'República Dominicana' }
    ]
  }),

  // ----------------------------------------------------------
  // LocalBusiness with dynamic AggregateRating from reviews table
  // ----------------------------------------------------------
  localBusinessWithRating: (stats: ReviewStats) => ({
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Photographer'],
    '@id': `${BASE_URL}/#business`,
    name: 'Fotografo Santo Domingo - Babula Shots',
    image: `${BASE_URL}/images/og-default.webp`,
    url: BASE_URL,
    telephone: '+1-809-720-9547',
    email: 'info@fotografosantodomingo.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Santo Domingo',
      addressRegion: 'Nacional',
      postalCode: '10100',
      addressCountry: 'DO',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 18.48, longitude: -69.9 },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '16:00' },
    ],
    priceRange: '$$',
    areaServed: [
      { '@type': 'City', name: 'Santo Domingo' },
      { '@type': 'City', name: 'Punta Cana' },
      { '@type': 'City', name: 'Santiago' },
      { '@type': 'AdministrativeArea', name: 'República Dominicana' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: stats.rating_value.toFixed(1),
      reviewCount: stats.review_count.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: [
      'https://instagram.com/babulashots',
      'https://facebook.com/babulashots',
      'https://www.tiktok.com/@babulashots',
    ],
  }),

  // ----------------------------------------------------------
  // Single ImageObject — used per-image for rich results
  // Provides 1:1, 4:3, and 16:9 crops so Google picks the best
  // ----------------------------------------------------------
  imageObject: (image: PortfolioImage, locale: string) => {
    const { alt, title, caption, description } = resolveLocale(image, locale)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    // Single canonical Cloudinary URL — never split between locales to preserve image authority
    const makeUrl = (transforms: string) =>
      `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${image.public_id}`

    return {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      '@id': `${BASE_URL}/${locale}/portfolio#image-${image.id}`,
      name: title,
      description: caption || description,
      caption: caption || description,
      // Same Cloudinary URL for both locales — image authority stays consolidated
      contentUrl: makeUrl(`f_auto,q_auto`),
      url: makeUrl(`f_auto,q_auto`),
      // Multiple aspect ratios help Google choose the right snippet format
      thumbnail: {
        '@type': 'ImageObject',
        contentUrl: makeUrl(`w_400,h_400,c_fill,g_auto,f_auto,q_auto`),
        width: 400,
        height: 400,
      },
      width: image.width,
      height: image.height,
      encodingFormat: 'image/webp',
      representativeOfPage: image.featured,
      // Locale-specific alternate links tell Google both language versions describe the same image
      sameAs: [
        `${BASE_URL}/es/portfolio#image-${image.id}`,
        `${BASE_URL}/en/portfolio#image-${image.id}`,
      ],
      author: {
        '@type': 'Person',
        name: 'Babula Shots',
        url: BASE_URL,
        sameAs: ['https://instagram.com/babulashots'],
      },
      creator: {
        '@type': 'Organization',
        name: 'Fotografo Santo Domingo | Babula Shots',
        url: BASE_URL,
      },
      copyrightHolder: {
        '@type': 'Organization',
        name: 'Fotografo Santo Domingo | Babula Shots',
        url: BASE_URL,
      },
      license: `${BASE_URL}/terms`,
      acquireLicensePage: `${BASE_URL}/contact`,
    }
  },

  // ----------------------------------------------------------
  // ImageGallery — wraps all portfolio images on a single page
  // This is what triggers Google's multi-image carousel snippet
  // ----------------------------------------------------------
  imageGallery: (images: PortfolioImage[], pageUrl: string, locale: string) => ({
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    '@id': `${pageUrl}#gallery`,
    name: locale === 'es' ? 'Portafolio - Fotografo Santo Domingo' : 'Portfolio - Santo Domingo Photographer',
    description: locale === 'es'
      ? 'Colección de fotografías profesionales: bodas, retratos, drones y eventos en República Dominicana'
      : 'Professional photography collection: weddings, portraits, drones and events in Dominican Republic',
    url: pageUrl,
    author: {
      '@type': 'Person',
      name: 'Babula Shots',
      url: BASE_URL,
    },
    hasPart: images.map((img) => {
      const loc = resolveLocale(img, locale)
      return {
        '@type': 'ImageObject',
        '@id': `${BASE_URL}/${locale}/portfolio#image-${img.id}`,
        name: loc.title,
        description: loc.caption || loc.description,
        caption: loc.caption || loc.description,
        // Same canonical URL regardless of locale
        contentUrl: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${img.public_id}`,
        width: img.width,
        height: img.height,
        representativeOfPage: img.featured,
      }
    }),
  }),

  // ... rest of generators updated with new base URL
}

export function generateJsonLd(schema: any) {
  return {
    __html: JSON.stringify(schema, null, 2)
  }
}