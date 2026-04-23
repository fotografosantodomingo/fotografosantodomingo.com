/**
 * SPOKE PAGE TEMPLATE — definitive standard as of April 2026
 *
 * Reference implementation: Zona Colonial wedding spoke
 *   EN: /en/weddings/zona-colonial-santo-domingo
 *   ES: /es/bodas/zona-colonial-santo-domingo
 *
 * SPOKE PAGES do NOT use this file at runtime.
 * They use:
 *   data:   src/data/spoke-pages.ts   ← content, status, FAQ, gallery IDs
 *   layout: src/components/spoke/SpokePageTemplate.tsx
 *   route:  src/app/[locale]/[hub]/[spoke]/page.tsx
 *   schema: src/lib/spoke-schema.ts
 *
 * This file documents the metadata + schema pattern every spoke page uses.
 * Copy generateMetadata() into page.tsx when adding spoke variants that
 * need custom metadata beyond what generateStaticParams() + findSpokeByRoute()
 * already provide.
 *
 * ─── SPOKE TEMPLATE RULES ────────────────────────────────────────────────────
 *
 * ALWAYS INCLUDED
 *   • Hero: text only — noHeroImage={true} — no background image ever
 *   • What to Expect — 3 cards, real local knowledge, not generic
 *   • Gallery — real Cloudinary IDs, never placeholders
 *   • Investment — real starting price with $ amount shown
 *   • Why Babula Shots — 4 location-specific reasons
 *   • FAQ — minimum 5 questions unique to this city/venue
 *   • Related spokes — minimum 3 once available; hide section when < 3
 *   • Final CTA — urgency line specific to this location
 *   • Schema — BreadcrumbList, Service, FAQPage, ImageObject — zero warnings
 *   • Footer in correct locale (layout passes normalizedLocale explicitly)
 *   • Dynamic last-updated date via formatSiteLastUpdated(locale)
 *
 * NEVER ALLOWED
 *   • Placeholder images (Image+Coming+Soon or public ID starting with "[")
 *   • Generic FAQ reusable for any photographer anywhere
 *   • Missing or estimated pricing
 *   • Hardcoded review counts, dates, or business hours
 *   • Schema warnings in Google Rich Results Test
 *   • Publishing without client desktop + mobile visual sign-off
 *
 * PRE-PUBLISH CHECKLIST (run before status: 'approved' → 'published')
 *   □ Real Cloudinary images in gallery — grep for "Image+Coming+Soon" returns 0
 *   □ curl -s {url} | grep -c 'application/ld+json'  ≥ 1
 *   □ Rich Results Test: 0 errors, 0 warnings — both EN and ES
 *   □ Title tag once, < 60 chars
 *   □ Meta description unique, < 160 chars
 *   □ noindex off (status = 'published')
 *   □ Hreflang EN + ES + x-default present
 *   □ Footer in correct language on both locales
 *   □ Language switcher EN ↔ ES works on both versions
 *   □ FAQ has ≥ 5 location-specific questions
 *   □ Real dollar price shown (not "contact for pricing")
 *   □ ≥ 1 related spoke link
 *   □ Both EN and ES deployed in the same commit
 *   □ Both URLs submitted to GSC on publish day
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Metadata } from 'next'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'
// formatSiteLastUpdated is dynamic — always use it, never hardcode a date
import { formatSiteLastUpdated } from '@/lib/seo/freshness'
import { PHOTOGRAPHER } from '@/lib/utils/constants'

const BASE_URL = 'https://www.fotografosantodomingo.com'

// ─── Replace these with real values for each new spoke ───────────────────────
const EN_SLUG = 'weddings/replace-me'   // e.g. 'weddings/zona-colonial-santo-domingo'
const ES_SLUG = 'bodas/replace-me'      // e.g. 'bodas/zona-colonial-santo-domingo'
// ─────────────────────────────────────────────────────────────────────────────

type PageProps = {
  params: { locale: string }
}

// ─── Metadata — copy this block into page.tsx for each new spoke ─────────────
export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  const isEs = locale === 'es'
  const slug = isEs ? ES_SLUG : EN_SLUG

  // Titles: search intent first, brand second
  // Target a long-tail query the buyer actually types, not a vague editorial label
  const title = isEs
    ? 'Fotógrafo de Bodas Ciudad/Venue | Babula Shots'  // < 60 chars
    : 'Wedding Photographer City/Venue | Babula Shots'   // < 60 chars

  const description = isEs
    ? 'Descripción única ≤ 160 chars. Menciona ciudad, tipo de servicio e intención de compra.'
    : 'Unique description ≤ 160 chars. Mention city, service type, and buyer intent.'

  const ogImageUrl = `${BASE_URL}/api/og?title=URL+Encoded+Title&subtitle=City+Name`

  return {
    title,
    description,
    // 4–6 long-tail phrases, never single-word keywords
    keywords: isEs
      ? 'fotografo bodas CIUDAD, fotografo boda VENUE, bodas destino republica dominicana, fotografo santo domingo'
      : 'wedding photographer CITY, wedding photographer VENUE, destination weddings dominican republic, santo domingo photographer',
    alternates: {
      // canonical + hreflang must use identical URL format — no trailing slash
      canonical: `${BASE_URL}/${locale}/${slug}`,
      languages: {
        es: `${BASE_URL}/es/${ES_SLUG}`,
        en: `${BASE_URL}/en/${EN_SLUG}`,
        'x-default': `${BASE_URL}/es/${ES_SLUG}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'OG Title ES ≤ 55 chars' : 'OG Title EN ≤ 55 chars',
      description,
      url: `${BASE_URL}/${locale}/${slug}`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: isEs ? 'Alt text del hero en español' : 'Hero alt text in English',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Twitter Title ES ≤ 70 chars' : 'Twitter Title EN ≤ 70 chars',
      description,
      images: [ogImageUrl],
    },
    // 'approved' pages are noindex; 'published' pages get full indexing below
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

// ─── Schema — all 4 blocks are required for zero Rich Results warnings ────────
// In real spoke pages these are built by buildSpokeSchemas() in spoke-schema.ts
// and rendered inline in the page component via <script> tags.
//
// This export shows the expected shape for documentation purposes.
export function spokeSchemaExample(locale: string) {
  const isEs = locale === 'es'
  const slug = isEs ? ES_SLUG : EN_SLUG
  const pageUrl = `${BASE_URL}/${locale}/${slug}`

  const breadcrumb = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Bodas' : 'Weddings', url: `${BASE_URL}/${locale}/services` },
    { name: isEs ? 'Ciudad/Venue' : 'City/Venue', url: pageUrl },
  ])

  // ImageObject — requires contentUrl + license + creditText + creator
  // See buildImageObject() in src/lib/spoke-schema.ts for the full implementation
  const imageObject = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: `https://res.cloudinary.com/dwewurxla/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/YOUR_CLOUDINARY_ID`,
    description: isEs ? 'Alt text ES' : 'Alt text EN',
    url: pageUrl,
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

  return { breadcrumb, imageObject }
}

// ─── Page component stub — real spoke pages use SpokePageTemplate ─────────────
export default async function SpokePageTemplateStub({ params: { locale } }: PageProps) {
  const lastUpdatedLabel = formatSiteLastUpdated(locale)
  const { breadcrumb } = spokeSchemaExample(locale)

  return (
    <>
      {/* Breadcrumb is always the first schema block */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD schema, no user input
        dangerouslySetInnerHTML={generateJsonLd(breadcrumb)}
      />
      {/*
        Real spokes render via:
          <SpokePageTemplate
            spoke={spokeData}
            locale={locale}
            noHeroImage={true}
            customGallery={<YourGallery locale={locale} />}
          />
        See src/app/[locale]/[hub]/[spoke]/page.tsx
      */}
      <main className="min-h-screen bg-gray-950 text-white">
        <p className="p-20 text-center text-gray-400">
          {locale === 'es'
            ? `Última actualización: ${lastUpdatedLabel}`
            : `Last updated: ${lastUpdatedLabel}`}
        </p>
      </main>
    </>
  )
}
