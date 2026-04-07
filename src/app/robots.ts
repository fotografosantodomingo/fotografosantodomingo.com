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
      'https://fotografosantodomingo.com/sitemap.xml',
      'https://fotografosantodomingo.com/image-sitemap.xml',
    ]
  }
}