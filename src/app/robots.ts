import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/']
      }
    ],
    sitemap: [
      'https://www.fotografosantodomingo.com/sitemap.xml',
      'https://www.fotografosantodomingo.com/image-sitemap.xml',
      'https://www.fotografosantodomingo.com/hreflang-sitemap.xml',
    ]
  }
}