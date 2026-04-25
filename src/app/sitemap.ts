import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/supabase/blog'
import { serviceLandingSlugs } from '@/lib/services/catalog'
import { getPublishedSpokes, spokeTierToPriority } from '@/data/spoke-pages'

export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs()

  const serviceEntries: MetadataRoute.Sitemap = serviceLandingSlugs.flatMap((serviceSlug) => [
    {
      url: `${BASE_URL}/es/services/${serviceSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/en/services/${serviceSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    },
  ])

  const blogEntries: MetadataRoute.Sitemap = slugs.flatMap(({ slug_es, slug_en }) => [
    {
      url: `${BASE_URL}/es/blog/${slug_es}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/en/blog/${slug_en}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ])

  const publishedSpokes = getPublishedSpokes()
  const spokeEntries: MetadataRoute.Sitemap = publishedSpokes.flatMap((sp) => [
    {
      url: `${BASE_URL}/en/${sp.enSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: spokeTierToPriority(sp.tier),
    },
    {
      url: `${BASE_URL}/es/${sp.esSlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: spokeTierToPriority(sp.tier),
    },
  ])

  return [
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/es`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/en/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/services/birthday-photographer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/es/services/birthday-photographer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/en/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/es/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/es/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/get-quote`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/get-quote`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/es/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/en/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/es/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/en/proposal`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/es/proposal`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/en/prices`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/es/prices`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    ...serviceEntries,
    ...blogEntries,
    ...spokeEntries,
  ]
}