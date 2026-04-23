/**
 * Dynamic route — /[locale]/[hub]/[spoke]
 *
 * STATUS GATING:
 *   draft     → notFound() (404)
 *   approved  → renders, NOT in sitemap
 *   published → renders, in sitemap
 *
 * generateStaticParams returns only approved + published pages so Next.js
 * pre-renders those at build time. Any other path that reaches this handler
 * at runtime will also apply the notFound() guard.
 *
 * Locale routing is handled by next-intl middleware (src/middleware.ts).
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateJsonLd } from '@/components/seo/JsonLd'
import SpokePageTemplate from '@/components/spoke/SpokePageTemplate'
import { buildSpokeSchemas } from '@/lib/spoke-schema'
import {
  findSpokeByRoute,
  getLiveSpokes,
  SPOKE_PAGES,
} from '@/data/spoke-pages'

const BASE_URL = 'https://www.fotografosantodomingo.com'

// ─────────────────────────────────────────────────────────────────────────────
// Static params for build-time pre-rendering
// ─────────────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  const locales = ['en', 'es']
  const liveSpokes = getLiveSpokes()

  const params: Array<{ locale: string; hub: string; spoke: string }> = []

  for (const locale of locales) {
    for (const sp of liveSpokes) {
      const slug = locale === 'es' ? sp.esSlug : sp.enSlug
      const parts = slug.split('/')
      if (parts.length === 2) {
        params.push({ locale, hub: parts[0], spoke: parts[1] })
      }
    }
  }

  return params
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { locale: string; hub: string; spoke: string }
}): Promise<Metadata> {
  const spokeData = findSpokeByRoute(params.locale, params.hub, params.spoke)
  if (!spokeData || spokeData.status === 'draft') {
    return { title: '404 | Babula Shots' }
  }

  const isEs = params.locale === 'es'
  const slug = isEs ? spokeData.esSlug : spokeData.enSlug
  const title = isEs ? spokeData.titleEs : spokeData.titleEn
  const description = isEs ? spokeData.descriptionEs : spokeData.descriptionEn
  const keywords = isEs ? spokeData.keywordsEs : spokeData.keywordsEn

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${BASE_URL}/${params.locale}/${slug}`,
      languages: {
        es: `${BASE_URL}/es/${spokeData.esSlug}`,
        en: `${BASE_URL}/en/${spokeData.enSlug}`,
        'x-default': `${BASE_URL}/es/${spokeData.esSlug}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? spokeData.titleEs : spokeData.titleEn,
      description,
      url: `${BASE_URL}/${params.locale}/${slug}`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [
        {
          url: `${BASE_URL}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(spokeData.geoCity)}`,
          width: 1200,
          height: 630,
          alt: isEs ? spokeData.heroImageAltEs : spokeData.heroImageAltEn,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? spokeData.titleEs : spokeData.titleEn,
      description,
      images: [
        `${BASE_URL}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(spokeData.geoCity)}`,
      ],
    },
    robots:
      spokeData.status === 'approved'
        ? { index: false, follow: false }
        : {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              'max-image-preview': 'large',
              'max-snippet': -1,
            },
          },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────

export default function SpokePage({
  params,
}: {
  params: { locale: string; hub: string; spoke: string }
}) {
  const spokeData = findSpokeByRoute(params.locale, params.hub, params.spoke)

  // Guard: draft pages always 404
  if (!spokeData || spokeData.status === 'draft') {
    notFound()
  }

  const schemas = buildSpokeSchemas(spokeData, params.locale, BASE_URL)

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={generateJsonLd(schema)}
        />
      ))}
      <SpokePageTemplate spoke={spokeData} locale={params.locale} />
    </>
  )
}
