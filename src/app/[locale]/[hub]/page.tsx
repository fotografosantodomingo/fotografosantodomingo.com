/**
 * Tier-1 dedicated geo URL handler.
 *
 * Routes like /es/fotografo-de-bodas-en-punta-cana resolve here. Falls
 * through to notFound() for any slug not registered in src/data/geo-pages
 * (Next.js's static routes — about, blog, services, etc. — win first via
 * file-based routing, so this handler only sees unknown top-level paths).
 *
 * Content sourcing:
 *   - city pages pull intro, venues, miniFaq, bestSeasonNote from the
 *     family's geoCoverage[citySlug] block (no content duplication)
 *   - country-level pages use the registry's `countryContent` field
 *
 * SEO graph:
 *   - BreadcrumbList (Home → Family → City)
 *   - Service with serviceArea = the City (or Country)
 *   - LocalBusiness reference
 *   - FAQPage (mini-FAQs + family FAQs)
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GEO_PAGES, getGeoPageBySlug, getSiblingGeoPages } from '@/data/geo-pages'
import type { GeoPage } from '@/data/geo-pages/types'
import { getServiceContent } from '@/data/service-content'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string; hub: string } }

export async function generateStaticParams() {
  return GEO_PAGES.flatMap((g) => [
    { locale: 'es', hub: g.esSlug },
    { locale: 'en', hub: g.enSlug },
  ])
}

function getLocaleSlugPair(geo: GeoPage, currentLocale: string) {
  return {
    current: currentLocale === 'es' ? geo.esSlug : geo.enSlug,
    es: geo.esSlug,
    en: geo.enSlug,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, hub } = params
  const geo = getGeoPageBySlug(hub)
  if (!geo) return {}

  const isEs = locale === 'es'
  const slugs = getLocaleSlugPair(geo, locale)
  const cityName = isEs ? geo.cityName.es : geo.cityName.en
  const familyContent = getServiceContent(geo.familySlug)

  // Pull family-level seo as a fallback base, override with geo-specific copy.
  const familySeo = familyContent?.seo
  const familyTitle = familySeo
    ? (isEs ? familySeo.title.es : familySeo.title.en)
    : 'Babula Shots'

  const h1 = geo.h1Override
    ? (isEs ? geo.h1Override.es : geo.h1Override.en)
    : `${familyTitle} · ${cityName}`

  const description = isEs
    ? `${h1} con cobertura premium en ${cityName}. Fotografía editorial, galería editada y reserva online segura. Babula Shots — desde 2015 en República Dominicana.`
    : `${h1} with premium coverage in ${cityName}. Editorial photography, edited gallery, and secure online booking. Babula Shots — since 2015 in the Dominican Republic.`

  const keywords = isEs
    ? `fotografo ${cityName.toLowerCase()}, ${familyTitle.toLowerCase()} ${cityName.toLowerCase()}, ${familySeo?.keywords.es ?? ''}`
    : `${cityName.toLowerCase()} photographer, ${familyTitle.toLowerCase()} ${cityName.toLowerCase()}, ${familySeo?.keywords.en ?? ''}`

  return {
    title: `${h1} | Babula Shots`,
    description,
    keywords,
    alternates: {
      canonical: `${BASE_URL}/${locale}/${slugs.current}`,
      languages: {
        es: `${BASE_URL}/es/${slugs.es}`,
        en: `${BASE_URL}/en/${slugs.en}`,
        'x-default': `${BASE_URL}/es/${slugs.es}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: `${h1} | Babula Shots`,
      description,
      url: `${BASE_URL}/${locale}/${slugs.current}`,
      locale: isEs ? 'es_DO' : 'en_US',
    },
    robots: { index: true, follow: true },
  }
}

async function loadFamilyTitle(familySlug: string): Promise<{ title_es: string; title_en: string } | null> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('service_families')
      .select('title_es, title_en')
      .eq('slug', familySlug)
      .eq('active', true)
      .maybeSingle()
    if (!data) return null
    return data as unknown as { title_es: string; title_en: string }
  } catch {
    return null
  }
}

export default async function GeoPageRoute({ params }: Props) {
  const { locale, hub } = params
  const geo = getGeoPageBySlug(hub)
  if (!geo) notFound()

  const isEs = locale === 'es'
  const slugs = getLocaleSlugPair(geo, locale)
  const familyContent = getServiceContent(geo.familySlug)
  const cityName = isEs ? geo.cityName.es : geo.cityName.en

  // For city pages: pull the matching geoCoverage block from the family.
  const geoBlock = geo.citySlug
    ? familyContent?.geoCoverage?.find((g) => g.citySlug === geo.citySlug)
    : undefined
  const isCountryLevel = geo.citySlug === null

  const familyTitleData = await loadFamilyTitle(geo.familySlug)
  const familyTitle = familyTitleData
    ? (isEs ? familyTitleData.title_es : familyTitleData.title_en)
    : 'Babula Shots'

  const h1 = geo.h1Override
    ? (isEs ? geo.h1Override.es : geo.h1Override.en)
    : `${familyTitle} · ${cityName}`

  // Compose content blocks per page type.
  const intro = isCountryLevel
    ? (isEs ? geo.countryContent!.intro.es : geo.countryContent!.intro.en)
    : geoBlock
      ? (isEs ? geoBlock.intro.es : geoBlock.intro.en)
      : ''
  const venues = isCountryLevel
    ? (isEs ? geo.countryContent!.cityHighlights.es : geo.countryContent!.cityHighlights.en)
    : geoBlock
      ? (isEs ? geoBlock.venues.es : geoBlock.venues.en)
      : []
  const bestSeasonNote = !isCountryLevel && geoBlock?.bestSeasonNote
    ? (isEs ? geoBlock.bestSeasonNote.es : geoBlock.bestSeasonNote.en)
    : null
  const miniFaq = isCountryLevel
    ? geo.countryContent!.faqs
    : geoBlock?.miniFaq ?? []

  // Family-level FAQs added to FAQPage schema (visible UI uses miniFaq only).
  const allFaqs = [
    ...miniFaq,
    ...(familyContent?.faqs ?? []),
  ]

  // Sibling geos within the same family — sideways navigation.
  const siblings = getSiblingGeoPages(geo.familySlug, isEs ? geo.esSlug : geo.enSlug)

  // ── JSON-LD ──────────────────────────────────────────────────────────
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
      {
        '@type': 'ListItem',
        position: 2,
        name: familyTitle,
        item: `${BASE_URL}/${locale}/services/${geo.familySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: h1,
        item: `${BASE_URL}/${locale}/${slugs.current}`,
      },
    ],
  }

  const areaServed = isCountryLevel
    ? { '@type': 'Country', name: 'Dominican Republic' }
    : {
        '@type': 'City',
        name: cityName,
        containedInPlace: { '@type': 'Country', name: 'Dominican Republic' },
      }

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: h1,
    description: intro.slice(0, 250),
    provider: { '@id': `${BASE_URL}/#business` },
    areaServed,
    url: `${BASE_URL}/${locale}/${slugs.current}`,
  }

  const faqJsonLd =
    allFaqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: allFaqs.map((f) => ({
            '@type': 'Question',
            name: isEs ? f.question.es : f.question.en,
            acceptedAnswer: {
              '@type': 'Answer',
              text: isEs ? f.answer.es : f.answer.en,
            },
          })),
        }
      : null

  // ── CTAs ─────────────────────────────────────────────────────────────
  // City-level CTAs flow ?city= for booking/quote attribution.
  const bookingHref = geo.citySlug
    ? `/${locale}/book?service=${geo.familySlug}&city=${geo.citySlug}&cta=geo-page-${geo.citySlug}`
    : `/${locale}/book?service=${geo.familySlug}&cta=geo-page-country`
  const quoteHref = geo.citySlug
    ? `/${locale}/get-quote?family=${geo.familySlug}&city=${geo.citySlug}&cta=geo-page-${geo.citySlug}`
    : `/${locale}/get-quote?family=${geo.familySlug}&cta=geo-page-country`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <main className="min-h-screen bg-canvas text-ink">
        {/* ── HEADER ── breadcrumb + hero */}
        <section className="border-b border-hairline-soft py-16 md:py-20 lg:py-24">
          <div className="container mx-auto px-4">
            <nav className="mb-10">
              <Link
                href={`/${locale}/services/${geo.familySlug}`}
                className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
              >
                ← {familyTitle}
              </Link>
            </nav>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isCountryLevel
                ? (isEs ? 'Cobertura nacional' : 'National coverage')
                : `${cityName} · ${isEs ? 'Cobertura dedicada' : 'Dedicated coverage'}`}
            </p>
            <h1
              className="font-display uppercase text-ink max-w-5xl"
              style={{ fontSize: 'clamp(36px, 7vw, 96px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}
            >
              {h1}
            </h1>

            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <Link
                href={bookingHref}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
              >
                {isEs ? 'Reservar online' : 'Book online'}
              </Link>
              <Link
                href={quoteHref}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
              >
                {isEs ? 'Solicitar cotización' : 'Request quote'}
              </Link>
              <Link
                href={`/${locale}/services/${geo.familySlug}`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline-soft text-ink-muted hover:text-ink hover:border-hairline transition-colors duration-200"
              >
                {isEs ? 'Ver paquetes' : 'See packages'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── INTRO ── 120-180 word geo-specific intro */}
        {intro && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="text-ink text-base md:text-lg leading-relaxed max-w-3xl">{intro}</p>
              {bestSeasonNote && (
                <p className="mt-6 max-w-3xl font-mono uppercase tracking-widest text-[11px] text-ink-muted leading-relaxed">
                  {bestSeasonNote}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── VENUES (city pages) or CITY HIGHLIGHTS (country page) ── */}
        {venues.length > 0 && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isCountryLevel
                  ? (isEs ? 'Ciudades cubiertas' : 'Cities covered')
                  : (isEs ? 'Venues que conocemos' : 'Venues we know')}
              </p>
              <h2
                className="font-display uppercase text-ink mb-12"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isCountryLevel
                  ? (isEs ? 'Dónde fotografiamos' : 'Where we photograph')
                  : (isEs ? `Locaciones en ${cityName}` : `Locations in ${cityName}`)}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl">
                {venues.map((venue, vi) => (
                  <li key={vi} className="flex items-start gap-3 text-ink/85 text-base leading-relaxed">
                    <span className="mt-2 inline-block w-2 h-px bg-ink/60 shrink-0" aria-hidden="true" />
                    <span>{venue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── FAQ ── geo-specific questions */}
        {miniFaq.length > 0 && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">FAQ</p>
                <h2
                  className="font-display uppercase text-ink mb-12"
                  style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
                >
                  {isEs ? 'Preguntas frecuentes' : 'Frequently asked'}
                </h2>
                <ul className="border-t border-hairline-soft">
                  {miniFaq.map((q, qi) => (
                    <li key={qi} className="border-b border-hairline-soft py-6">
                      <h3 className="text-ink text-base md:text-lg leading-snug font-medium">
                        {isEs ? q.question.es : q.question.en}
                      </h3>
                      <p className="text-ink-muted text-sm md:text-base leading-relaxed mt-3">
                        {isEs ? q.answer.es : q.answer.en}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* ── SIBLING CITIES (sideways internal links) ── */}
        {siblings.length > 0 && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'También cubrimos' : 'Also covering'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-10"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.05' }}
              >
                {isEs ? `${familyTitle} en otras ciudades` : `${familyTitle} in other cities`}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {siblings.map((s) => (
                  <li key={s.enSlug}>
                    <Link
                      href={`/${locale}/${isEs ? s.esSlug : s.enSlug}`}
                      className="block border border-hairline-soft p-5 hover:bg-ink/5 transition-colors duration-200"
                    >
                      <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
                        {isEs ? 'Página dedicada' : 'Dedicated page'}
                      </p>
                      <p className="font-display uppercase text-ink" style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', lineHeight: '1.15' }}>
                        {isEs ? s.cityName.es : s.cityName.en}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── BOTTOM CTA ── */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Reserva' : 'Booking'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '1.0' }}
              >
                {isEs ? '¿Listo?' : 'Ready?'}
              </h2>
              <p className="text-ink-muted text-base md:text-lg mb-10 leading-relaxed max-w-xl">
                {isEs
                  ? `Confirmación inmediata con depósito seguro del 50% por Stripe, o solicita una propuesta personalizada para tu evento en ${cityName}.`
                  : `Instant confirmation with a secure 50% Stripe deposit, or request a custom proposal for your ${cityName} event.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={bookingHref}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                >
                  {isEs ? 'Reservar ahora' : 'Book now'}
                </Link>
                <Link
                  href={quoteHref}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
                >
                  {isEs ? 'Solicitar cotización' : 'Request quote'}
                </Link>
                <a
                  href="https://wa.me/18097209547"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline-soft text-ink-muted hover:text-ink hover:border-hairline transition-colors duration-200"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
