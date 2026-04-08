import { PortfolioImage, ReviewStats, resolveLocale } from '@/lib/types/portfolio'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const CLOUDINARY_BASE = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`

export const schemaGenerators = {
  organization: () => ({
    '@type': 'Organization',
    name: 'Fotografo Santo Domingo | Babula Shots',
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    sameAs: [
      'https://www.instagram.com/babulashotsrd',
      'https://www.facebook.com/babulashots',
      'https://www.tiktok.com/@babulashots',
      'https://babulashotsrd.com',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-809-720-9547',
      contactType: 'customer service',
      availableLanguage: ['English', 'Spanish']
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'C. El Conde 142',
      addressLocality: 'Santo Domingo',
      addressRegion: 'Distrito Nacional',
      postalCode: '11111',
      addressCountry: 'DO'
    }
  }),

  localBusiness: () => ({
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${BASE_URL}/#business`,
    name: 'Fotografo Santo Domingo',
    alternateName: 'Babula Shots',
    image: `${BASE_URL}/api/og`,
    url: BASE_URL,
    telephone: '+1-809-720-9547',
    email: 'info@fotografosantodomingo.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'C. El Conde 142',
      addressLocality: 'Santo Domingo',
      addressRegion: 'Distrito Nacional',
      postalCode: '11111',
      addressCountry: 'DO'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 18.4727,
      longitude: -69.8866
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        opens: '08:00',
        closes: '22:00'
      },
    ],
    priceRange: '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '91',
      bestRating: '5',
      worstRating: '1'
    },
    areaServed: [
      { '@type': 'City', name: 'Santo Domingo' },
      { '@type': 'City', name: 'Punta Cana' },
      { '@type': 'City', name: 'Santiago' },
      { '@type': 'AdministrativeArea', name: 'República Dominicana' }
    ],
    sameAs: [
      'https://www.instagram.com/babulashotsrd',
      'https://www.facebook.com/babulashots',
      'https://www.tiktok.com/@babulashots',
      'https://babulashotsrd.com',
    ],
  }),

  // ----------------------------------------------------------
  // LocalBusiness with dynamic AggregateRating from reviews table
  // ----------------------------------------------------------
  localBusinessWithRating: (stats: ReviewStats) => ({
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${BASE_URL}/#business`,
    name: 'Fotografo Santo Domingo',
    alternateName: 'Babula Shots',
    image: `${BASE_URL}/api/og`,
    url: BASE_URL,
    telephone: '+18097209547',
    email: 'info@fotografosantodomingo.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'C. El Conde 142',
      addressLocality: 'Santo Domingo',
      addressRegion: 'Distrito Nacional',
      postalCode: '11111',
      addressCountry: 'DO',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 18.4727, longitude: -69.8866 },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], opens: '08:00', closes: '22:00' },
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
      'https://www.instagram.com/babulashotsrd',
      'https://www.facebook.com/babulashots',
      'https://www.tiktok.com/@babulashots',
      'https://babulashotsrd.com',
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

  // ----------------------------------------------------------
  // Article / BlogPosting — for individual blog post pages
  // Enables Google Discover, article rich results, and sitelinks
  // ----------------------------------------------------------
  article: (post: {
    slug: string
    title: string
    titleEs: string
    excerpt: string
    excerptEs: string
    author: string
    publishedAt: string
    updatedAt?: string
    tags: string[]
    image?: string
    seo: { title: string; titleEs: string; description: string; descriptionEs: string }
  }, locale: string) => {
    const title = locale === 'es' ? post.titleEs : post.title
    const description = locale === 'es' ? post.excerptEs : post.excerpt
    const url = `${BASE_URL}/${locale}/blog/${post.slug}`
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const image = post.image && cloudName
      ? `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1200/${post.image}`
      : `${BASE_URL}/api/og?title=${encodeURIComponent(title)}`

    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': url,
      headline: title,
      description,
      image: { '@type': 'ImageObject', url: image, width: 1200, height: 630 },
      author: {
        '@type': 'Person',
        name: post.author,
        url: BASE_URL,
        sameAs: ['https://www.instagram.com/babulashotsrd'],
      },
      publisher: {
        '@type': 'Organization',
        name: 'Fotografo Santo Domingo | Babula Shots',
        url: BASE_URL,
        logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/logo.png`, width: 200, height: 60 },
      },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      keywords: post.tags.join(', '),
      inLanguage: locale === 'es' ? 'es-DO' : 'en-US',
      isPartOf: { '@id': `${BASE_URL}/${locale}/blog` },
    }
  },

  // ----------------------------------------------------------
  // BreadcrumbList — for all inner pages (blog, services, etc.)
  // Enables breadcrumb rich results in Google SERPs
  // ----------------------------------------------------------
  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  // ----------------------------------------------------------
  // Person — for the About page
  // Establishes photographer identity in the knowledge graph
  // ----------------------------------------------------------
  person: (locale: string) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/#person`,
    name: 'Michal Babula',
    alternateName: 'Babula Shots',
    url: BASE_URL,
    image: `${BASE_URL}/images/og-default.webp`,
    jobTitle: locale === 'es' ? 'Fotógrafo Profesional' : 'Professional Photographer',
    description: locale === 'es'
      ? 'Fotógrafo profesional con más de 10 años de experiencia en bodas, retratos, drone y eventos en Santo Domingo, República Dominicana.'
      : 'Professional photographer with over 10 years of experience in weddings, portraits, drone and events in Santo Domingo, Dominican Republic.',
    worksFor: {
      '@type': 'Organization',
      name: 'Fotografo Santo Domingo | Babula Shots',
      url: BASE_URL,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'C. El Conde 142',
      addressLocality: 'Santo Domingo',
      addressCountry: 'DO',
    },
    knowsAbout: locale === 'es'
      ? ['fotografía de bodas', 'fotografía de retratos', 'fotografía con dron', 'fotografía de eventos', 'fotografía comercial']
      : ['wedding photography', 'portrait photography', 'drone photography', 'event photography', 'commercial photography'],
    sameAs: [
      'https://www.instagram.com/babulashotsrd',
      'https://babulashotsrd.com',
    ],
  }),

  // ----------------------------------------------------------
  // ServiceList — for the Services page
  // Uses ItemList + Service for rich service results
  // ----------------------------------------------------------
  serviceList: (locale: string) => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'es' ? 'Servicios Fotográficos — Babula Shots' : 'Photography Services — Babula Shots',
    url: `${BASE_URL}/${locale}/services`,
    itemListElement: [
      { id: 'wedding', nameEs: 'Fotografía de Bodas', nameEn: 'Wedding Photography', price: '$2,500' },
      { id: 'portrait', nameEs: 'Retratos Corporativos', nameEn: 'Corporate Portraits', price: '$150' },
      { id: 'drone', nameEs: 'Fotografía con Dron', nameEn: 'Drone Photography', price: '$500' },
      { id: 'event', nameEs: 'Fotografía de Eventos', nameEn: 'Event Photography', price: '$300' },
      { id: 'family', nameEs: 'Sesiones Familiares', nameEn: 'Family Sessions', price: '$200' },
      { id: 'commercial', nameEs: 'Fotografía Comercial', nameEn: 'Commercial Photography', price: '$250' },
    ].map((svc, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        '@id': `${BASE_URL}/${locale}/services#${svc.id}`,
        name: locale === 'es' ? svc.nameEs : svc.nameEn,
        url: `${BASE_URL}/${locale}/services#${svc.id}`,
        provider: {
          '@type': 'LocalBusiness',
          name: 'Fotografo Santo Domingo | Babula Shots',
          url: BASE_URL,
        },
        areaServed: {
          '@type': 'AdministrativeArea',
          name: locale === 'es' ? 'República Dominicana' : 'Dominican Republic',
        },
        offers: {
          '@type': 'Offer',
          price: svc.price.replace('$', ''),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  }),
}

export function generateJsonLd(schema: any) {
  return {
    __html: JSON.stringify(schema, null, 2)
  }
}