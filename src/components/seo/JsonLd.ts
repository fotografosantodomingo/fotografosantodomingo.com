import { PortfolioImage, ReviewStats, resolveLocale } from '@/lib/types/portfolio'
import { getServiceCatalog, serviceSlugById } from '@/lib/services/catalog'

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
      'https://www.trustpilot.com/review/fotografosantodomingo.com',
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
      'https://www.trustpilot.com/review/fotografosantodomingo.com',
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
      'https://www.trustpilot.com/review/fotografosantodomingo.com',
    ],
  }),

  professionalServiceReference: () => ({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${BASE_URL}/#business`,
    name: 'Babula Shots',
    url: BASE_URL,
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
    slug_es: string
    slug_en: string
    title_es: string
    title_en: string
    excerpt_es: string | null
    excerpt_en: string | null
    og_title_es?: string | null
    og_title_en?: string | null
    meta_description_es?: string | null
    meta_description_en?: string | null
    primary_keyword_es?: string | null
    primary_keyword_en?: string | null
    published_at: string
    updated_at?: string | null
    cover_image_url?: string | null
    service_type?: string | null
    location?: string | null
  }, locale: string) => {
    const isEs = locale === 'es'
    const title = isEs ? (post.og_title_es ?? post.title_es) : (post.og_title_en ?? post.title_en)
    const description = isEs
      ? (post.meta_description_es ?? post.excerpt_es ?? '')
      : (post.meta_description_en ?? post.excerpt_en ?? '')
    const slug = isEs ? post.slug_es : post.slug_en
    const url = `${BASE_URL}/${locale}/blog/${slug}`
    const image = post.cover_image_url ?? `${BASE_URL}/api/og?title=${encodeURIComponent(title)}`

    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': url,
      headline: title,
      description,
      image: { '@type': 'ImageObject', url: image, width: 1200, height: 630 },
      author: {
        '@type': 'Person',
        name: 'Babula Shots',
        url: BASE_URL,
        sameAs: ['https://www.instagram.com/babulashotsrd'],
      },
      publisher: {
        '@type': 'Organization',
        name: 'Fotografo Santo Domingo | Babula Shots',
        url: BASE_URL,
        logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/logo.png`, width: 200, height: 60 },
      },
      datePublished: post.published_at,
      dateModified: post.updated_at ?? post.published_at,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      keywords: [post.primary_keyword_es, post.primary_keyword_en, post.service_type, post.location]
        .filter(Boolean)
        .join(', '),
      inLanguage: isEs ? 'es-DO' : 'en-US',
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
    itemListElement: getServiceCatalog(locale).map((svc, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        '@id': `${BASE_URL}/${locale}/services/${serviceSlugById[svc.id]}`,
        name: svc.title,
        url: `${BASE_URL}/${locale}/services/${serviceSlugById[svc.id]}`,
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
          price: svc.pricing.starting.replace(/[^0-9.]/g, ''),
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