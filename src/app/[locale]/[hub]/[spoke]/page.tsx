/**
 * Dynamic route — /[locale]/[hub]/[spoke]
 *
 * STATUS GATING:
 *   draft     → notFound() (404)
 *   approved  → renders, noindex
 *   published → renders, indexed, in sitemap
 *
 * JSON-LD schemas are injected via <script> tags in the page body following the
 * official Next.js App Router pattern for JSON-LD:
 * https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld
 *
 * Locale routing is handled by next-intl middleware (src/middleware.ts).
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SpokePageTemplate from '@/components/spoke/SpokePageTemplate'
import ZonaColonialGallery from '@/components/spoke/ZonaColonialGallery'
import ProposalGallery from '@/components/spoke/ProposalGallery'
import { buildSpokeSchemas } from '@/lib/spoke-schema'
import {
  findSpokeByRoute,
  getLiveSpokes,
} from '@/data/spoke-pages'

// Inherit edge runtime from [locale]/layout.tsx; force static pre-rendering
// at build time for all approved/published spoke pages.
export const dynamic = 'force-static'

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
    // Return bare title so layout template doesn't double-append brand
    return { title: '404' }
  }

  const isEs = params.locale === 'es'
  const slug = isEs ? spokeData.esSlug : spokeData.enSlug
  // titleEn/titleEs do NOT include brand name — layout template appends " | Babula Shots"
  const title = isEs ? spokeData.titleEs : spokeData.titleEn
  const description = isEs ? spokeData.descriptionEs : spokeData.descriptionEn
  const keywords = isEs ? spokeData.keywordsEs : spokeData.keywordsEn
  // OG/Twitter titles include brand name explicitly since they bypass the template
  const brandedTitle = `${title} | Babula Shots`
  const ogImageUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(spokeData.geoCity)}`

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
      title: brandedTitle,
      description,
      url: `${BASE_URL}/${params.locale}/${slug}`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [
        {
          url: ogImageUrl,
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
      title: brandedTitle,
      description,
      images: [ogImageUrl],
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

  // Custom overrides keyed by spoke ID
  const isZonaColonial = spokeData.id === 'weddings-zona-colonial-santo-domingo'
  const isProposalSpoke =
    spokeData.id === 'weddings-proposal-photographer-dominican-republic' ||
    spokeData.id === 'proposal-hidden-mode-ninja-photographer'

  return (
    <>
      {/* JSON-LD — placed inline per official Next.js App Router pattern:
          https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld
          RSC guarantees server-side rendering so Google sees these on first fetch. */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD schema, no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <SpokePageTemplate
        spoke={spokeData}
        locale={params.locale}
        noHeroImage={isZonaColonial || isProposalSpoke}
        customGallery={
          isZonaColonial
            ? <ZonaColonialGallery locale={params.locale} />
            : isProposalSpoke
            ? <ProposalGallery locale={params.locale} />
            : undefined
        }
      />
    </>
  )
}
