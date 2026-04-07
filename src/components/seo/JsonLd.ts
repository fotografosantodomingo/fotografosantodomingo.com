import { Metadata } from 'next'

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

  // ... rest of generators updated with new base URL
}

export function generateJsonLd(schema: any) {
  return {
    __html: JSON.stringify(schema, null, 2)
  }
}