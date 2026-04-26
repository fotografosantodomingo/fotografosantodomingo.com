import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import {
  LEGACY_SERVICE_SLUG_TO_FAMILY,
} from '@/lib/services/legacy-aliases'
import { getServiceContent } from '@/data/service-content'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string; service: string; package: string }
}

type PackageDetail = {
  id: string
  slug: string
  name_es: string
  name_en: string
  description_short_es: string | null
  description_short_en: string | null
  inclusions_es: string[]
  inclusions_en: string[]
  duration_min: number
  starting_price_usd: number
  deposit_percent: number
  photo_count: number | null
  minimum_billable_hours: number | null
  bookable_direct: boolean
  custom_quote_allowed: boolean
  popular_badge: 'most_booked' | 'best_value' | null
  legacy_aliases: string[]
  family: {
    id: string
    slug: string
    title_es: string
    title_en: string
    icon: string
  }
}

async function loadPackage(
  familySlug: string,
  packageSlug: string
): Promise<PackageDetail | null> {
  const supabase = createServiceClient()
  const { data: family } = await supabase
    .from('service_families')
    .select('id, slug, title_es, title_en, icon, active')
    .eq('slug', familySlug)
    .eq('active', true)
    .maybeSingle()
  if (!family) return null

  const { data: pkg } = await supabase
    .from('service_packages')
    .select('id, slug, name_es, name_en, description_short_es, description_short_en, inclusions_es, inclusions_en, duration_min, starting_price_usd, deposit_percent, photo_count, minimum_billable_hours, bookable_direct, custom_quote_allowed, popular_badge, legacy_aliases')
    .eq('family_id', family.id)
    .eq('slug', packageSlug)
    .eq('active', true)
    .maybeSingle()
  if (!pkg) return null

  return {
    ...pkg,
    family: {
      id: family.id,
      slug: family.slug,
      title_es: family.title_es,
      title_en: family.title_en,
      icon: family.icon,
    },
  } as PackageDetail
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service, package: packageSlug } = params
  const isEs = locale === 'es'
  const familySlug = LEGACY_SERVICE_SLUG_TO_FAMILY[service] ?? service
  const detail = await loadPackage(familySlug, packageSlug)
  if (!detail) return {}

  const name = isEs ? detail.name_es : detail.name_en
  const familyTitle = isEs ? detail.family.title_es : detail.family.title_en
  const desc = (isEs ? detail.description_short_es : detail.description_short_en) ?? ''
  const title = isEs
    ? `${name} — ${familyTitle} | Babula Shots`
    : `${name} — ${familyTitle} | Babula Shots`

  // Inherit family-level keyword cluster and prepend the package name as the
  // unique buyer-intent term. Falls back to undefined if the family has no
  // seo block authored yet.
  const familyKeywords = getServiceContent(detail.family.slug)?.seo?.keywords
  const keywords = familyKeywords
    ? `${name.toLowerCase()}, ${isEs ? familyKeywords.es : familyKeywords.en}`
    : undefined

  return {
    title,
    description: desc,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: `${BASE_URL}/${locale}/services/${detail.family.slug}/${detail.slug}`,
      languages: {
        es: `${BASE_URL}/es/services/${detail.family.slug}/${detail.slug}`,
        en: `${BASE_URL}/en/services/${detail.family.slug}/${detail.slug}`,
        'x-default': `${BASE_URL}/es/services/${detail.family.slug}/${detail.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title,
      description: desc,
      url: `${BASE_URL}/${locale}/services/${detail.family.slug}/${detail.slug}`,
      locale: isEs ? 'es_DO' : 'en_US',
    },
    robots: { index: true, follow: true },
  }
}

export default async function PackageDetailPage({ params }: Props) {
  const { locale, service, package: packageSlug } = params
  const isEs = locale === 'es'

  // Legacy family-slug → 301
  if (service in LEGACY_SERVICE_SLUG_TO_FAMILY) {
    redirect(
      `/${locale}/services/${LEGACY_SERVICE_SLUG_TO_FAMILY[service]}/${packageSlug}`
    )
  }

  const detail = await loadPackage(service, packageSlug)
  if (!detail) notFound()

  const name = isEs ? detail.name_es : detail.name_en
  const familyTitle = isEs ? detail.family.title_es : detail.family.title_en
  const desc = isEs ? detail.description_short_es : detail.description_short_en
  const inclusions = isEs ? detail.inclusions_es : detail.inclusions_en
  const price = Number(detail.starting_price_usd)
  const deposit = Math.round((price * detail.deposit_percent) / 100)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isEs ? 'Servicios' : 'Services', item: `${BASE_URL}/${locale}/services` },
      { '@type': 'ListItem', position: 3, name: familyTitle, item: `${BASE_URL}/${locale}/services/${detail.family.slug}` },
      { '@type': 'ListItem', position: 4, name, item: `${BASE_URL}/${locale}/services/${detail.family.slug}/${detail.slug}` },
    ],
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    name,
    description: desc ?? name,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#business`,
      name: 'Fotografo Santo Domingo | Babula Shots',
      url: BASE_URL,
    },
    areaServed: { '@type': 'Country', name: 'Dominican Republic' },
    url: `${BASE_URL}/${locale}/services/${detail.family.slug}/${detail.slug}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: price.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/${locale}/services/${detail.family.slug}/${detail.slug}`,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <main className="min-h-screen bg-canvas text-ink">
        {/* ── HEADER ── package hero with price block */}
        <section className="border-b border-hairline-soft py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <nav className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
              <Link href={`/${locale}/services`} className="hover:text-ink transition-opacity">
                {isEs ? 'Servicios' : 'Services'}
              </Link>
              <span className="mx-2 text-ink-muted/60">·</span>
              <Link
                href={`/${locale}/services/${detail.family.slug}`}
                className="hover:text-ink transition-opacity"
              >
                {familyTitle}
              </Link>
            </nav>

            <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:gap-12 items-start">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl md:text-4xl" aria-hidden="true">{detail.family.icon}</span>
                  {detail.popular_badge && (
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted border border-hairline-soft px-2 py-1">
                      {detail.popular_badge.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <h1
                  className="font-display uppercase text-ink"
                  style={{
                    fontSize: 'clamp(36px, 7vw, 96px)',
                    lineHeight: '0.95',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {name}
                </h1>
                {desc && (
                  <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-6 leading-relaxed">
                    {desc}
                  </p>
                )}
              </div>

              {/* Price block — flat, no card chassis, hairline only */}
              <div className="border-l-0 md:border-l border-t md:border-t-0 border-hairline-soft pt-8 md:pt-0 md:pl-8 lg:pl-12 md:min-w-[240px]">
                <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
                  {isEs ? 'Desde · USD' : 'From · USD'}
                </p>
                <div
                  className="font-display text-ink"
                  style={{ fontSize: 'clamp(56px, 6vw, 88px)', lineHeight: '1.0' }}
                >
                  ${price.toFixed(0)}
                </div>
                <div className="mt-4 space-y-1.5 font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                  <div>
                    {detail.minimum_billable_hours
                      ? `${detail.minimum_billable_hours}h ${isEs ? 'mínimo' : 'minimum'}`
                      : `${detail.duration_min} min`}
                  </div>
                  {detail.photo_count && (
                    <div>
                      {detail.photo_count} {isEs ? 'fotos' : 'photos'}
                    </div>
                  )}
                  {detail.bookable_direct && (
                    <div>
                      {detail.deposit_percent}% {isEs ? 'depósito' : 'deposit'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INCLUSIONS ── */}
        {inclusions.length > 0 && (
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <h2 className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-10">
                {isEs ? 'Qué incluye' : 'What’s included'}
              </h2>
              <ul className="grid gap-x-12 gap-y-5 md:grid-cols-2 max-w-4xl">
                {inclusions.map((inc, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 pb-5 border-b border-hairline-soft text-ink leading-relaxed"
                  >
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 mt-0.5 w-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-base">{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── BOTTOM CTA ── pill discipline */}
        <section className="border-t border-hairline-soft py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
              <div className="md:max-w-md">
                <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
                  {detail.bookable_direct
                    ? (isEs ? 'Reservar' : 'Book')
                    : (isEs ? 'Cotización' : 'Quote')}
                </p>
                <p className="text-ink text-base md:text-lg leading-relaxed">
                  {detail.bookable_direct
                    ? (isEs
                        ? `Depósito del ${detail.deposit_percent}% — $${deposit} USD para asegurar tu fecha.`
                        : `${detail.deposit_percent}% deposit — $${deposit} USD to lock your date.`)
                    : (isEs
                        ? 'Este paquete se cotiza de forma personalizada.'
                        : 'This package is custom-quoted.')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                {detail.bookable_direct && (
                  <Link
                    href={`/${locale}/book?service=${detail.slug}`}
                    className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                  >
                    {isEs ? 'Reservar ahora' : 'Book now'}
                  </Link>
                )}
                <Link
                  href={`/${locale}/get-quote?family=${detail.family.slug}&package=${detail.slug}&cta=package-detail`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
                >
                  {isEs ? 'Solicitar presupuesto' : 'Request a quote'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
