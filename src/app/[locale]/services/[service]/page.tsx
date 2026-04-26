import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import {
  LEGACY_SERVICE_SLUG_TO_FAMILY,
  resolveFamilySlug,
} from '@/lib/services/legacy-aliases'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string; service: string } }

type FamilyRow = {
  id: string
  slug: string
  title_es: string
  title_en: string
  tagline_es: string | null
  tagline_en: string | null
  icon: string
  bookable: boolean
  quoteable: boolean
}

type PackageRow = {
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
  featured: boolean
  popular_badge: 'most_booked' | 'best_value' | null
  sort_order: number
}

async function loadFamily(slug: string): Promise<{
  family: FamilyRow
  packages: PackageRow[]
} | null> {
  const supabase = createServiceClient()
  const { data: family } = await supabase
    .from('service_families')
    .select('id, slug, title_es, title_en, tagline_es, tagline_en, icon, bookable, quoteable')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()
  if (!family) return null
  const { data: packages } = await supabase
    .from('service_packages')
    .select('id, slug, name_es, name_en, description_short_es, description_short_en, inclusions_es, inclusions_en, duration_min, starting_price_usd, deposit_percent, photo_count, minimum_billable_hours, bookable_direct, custom_quote_allowed, featured, popular_badge, sort_order')
    .eq('family_id', family.id)
    .eq('active', true)
    .order('sort_order', { ascending: true })
  return {
    family: family as FamilyRow,
    packages: (packages ?? []) as PackageRow[],
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service } = params
  const isEs = locale === 'es'
  const canonicalSlug = resolveFamilySlug(service)
  const result = await loadFamily(canonicalSlug)
  if (!result) return {}
  const { family } = result
  const title = isEs
    ? `${family.title_es} — Babula Shots`
    : `${family.title_en} — Babula Shots`
  const description = (isEs ? family.tagline_es : family.tagline_en) ?? ''

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/services/${family.slug}`,
      languages: {
        es: `${BASE_URL}/es/services/${family.slug}`,
        en: `${BASE_URL}/en/services/${family.slug}`,
        'x-default': `${BASE_URL}/es/services/${family.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title,
      description,
      url: `${BASE_URL}/${locale}/services/${family.slug}`,
      locale: isEs ? 'es_DO' : 'en_US',
    },
    robots: { index: true, follow: true },
  }
}

export default async function FamilyPage({ params }: Props) {
  const { locale, service } = params
  const isEs = locale === 'es'

  // Legacy slug → 301 to canonical (preserves existing inbound links)
  if (service in LEGACY_SERVICE_SLUG_TO_FAMILY) {
    redirect(`/${locale}/services/${LEGACY_SERVICE_SLUG_TO_FAMILY[service]}`)
  }

  const result = await loadFamily(service)
  if (!result) notFound()
  const { family, packages } = result

  const title = isEs ? family.title_es : family.title_en
  const tagline = isEs ? family.tagline_es : family.tagline_en

  const directPackages = packages.filter(p => p.bookable_direct)
  const quoteOnlyPackages = packages.filter(p => !p.bookable_direct)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isEs ? 'Servicios' : 'Services', item: `${BASE_URL}/${locale}/services` },
      { '@type': 'ListItem', position: 3, name: title, item: `${BASE_URL}/${locale}/services/${family.slug}` },
    ],
  }

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: title,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#business`,
      name: 'Fotografo Santo Domingo | Babula Shots',
      url: BASE_URL,
    },
    areaServed: { '@type': 'Country', name: 'Dominican Republic' },
    description: tagline ?? title,
    url: `${BASE_URL}/${locale}/services/${family.slug}`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: title,
      itemListElement: packages.map(p => ({
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: Number(p.starting_price_usd).toFixed(2),
        url: `${BASE_URL}/${locale}/services/${family.slug}/${p.slug}`,
        availability: 'https://schema.org/InStock',
        itemOffered: {
          '@type': 'Service',
          name: isEs ? p.name_es : p.name_en,
          description: (isEs ? p.description_short_es : p.description_short_en) ?? undefined,
        },
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <main className="min-h-screen bg-canvas text-ink">
        {/* ── HEADER ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24 lg:py-28">
          <div className="container mx-auto px-4">
            <nav>
              <Link
                href={`/${locale}/services`}
                className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
              >
                ← {isEs ? 'Todos los servicios' : 'All services'}
              </Link>
            </nav>
            <div className="mt-10 flex items-start gap-6">
              <span className="text-5xl md:text-6xl shrink-0" aria-hidden="true">{family.icon}</span>
              <div>
                <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
                  {isEs ? 'Familia' : 'Family'}
                </p>
                <h1
                  className="font-display uppercase text-ink"
                  style={{
                    fontSize: 'clamp(36px, 7vw, 112px)',
                    lineHeight: '0.95',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {title}
                </h1>
                {tagline && (
                  <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-6">{tagline}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {directPackages.length > 0 && (
          <PackageGrid
            heading={isEs ? 'Paquetes para reservar online' : 'Packages bookable online'}
            packages={directPackages}
            family={family}
            locale={locale}
            isEs={isEs}
          />
        )}

        {quoteOnlyPackages.length > 0 && (
          <PackageGrid
            heading={isEs ? 'Solo por cotización personalizada' : 'Custom quote only'}
            packages={quoteOnlyPackages}
            family={family}
            locale={locale}
            isEs={isEs}
            quoteOnly
          />
        )}

        {/* ── BOTTOM RFQ CTA ── */}
        <section className="border-t border-hairline-soft py-20 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Personalizado' : 'Custom'}
            </p>
            <h2
              className="font-display uppercase text-ink mx-auto max-w-3xl"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
            >
              {isEs ? '¿Tu visión no encaja?' : 'Vision off the menu?'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg mt-6 max-w-xl mx-auto">
              {isEs
                ? 'Cuéntanos los detalles y te enviamos un presupuesto a medida.'
                : "Tell us the details and we'll send a tailored quote."}
            </p>
            <Link
              href={`/${locale}/get-quote?family=${family.slug}&cta=family-page-bottom`}
              className="mt-10 inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
            >
              {isEs ? 'Solicitar presupuesto' : 'Request a quote'}
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}

function PackageGrid({
  heading,
  packages,
  family,
  locale,
  isEs,
  quoteOnly,
}: {
  heading: string
  packages: PackageRow[]
  family: FamilyRow
  locale: string
  isEs: boolean
  quoteOnly?: boolean
}) {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 font-mono uppercase tracking-widest text-[11px] text-ink-muted">
          {heading}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline-soft">
          {packages.map(p => {
            const name = isEs ? p.name_es : p.name_en
            const desc = isEs ? p.description_short_es : p.description_short_en
            const inclusions = isEs ? p.inclusions_es : p.inclusions_en
            const price = Number(p.starting_price_usd)
            return (
              <li key={p.id} className="border-r border-b border-hairline-soft">
                <Link
                  href={`/${locale}/services/${family.slug}/${p.slug}`}
                  className={`group flex flex-col h-full p-7 md:p-8 lg:p-10 hover:bg-ink/5 transition-colors duration-200 ${
                    p.featured ? 'bg-ink/[0.03]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-5 min-h-[24px]">
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {p.popular_badge
                        ? p.popular_badge.replace('_', ' ')
                        : p.featured
                          ? (isEs ? 'Destacado' : 'Featured')
                          : ''}
                    </span>
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {p.minimum_billable_hours
                        ? `${p.minimum_billable_hours}h ${isEs ? 'mín' : 'min'}`
                        : `${p.duration_min} min`}
                    </span>
                  </div>

                  <h3
                    className="font-display uppercase text-ink"
                    style={{ fontSize: 'clamp(22px, 2.2vw, 30px)', lineHeight: '1.05' }}
                  >
                    {name}
                  </h3>

                  <div className="mt-5 mb-1 flex items-baseline gap-2">
                    <span
                      className="font-display text-ink"
                      style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: '1.0' }}
                    >
                      ${price.toFixed(0)}
                    </span>
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {isEs ? 'USD desde' : 'USD start'}
                    </span>
                  </div>

                  {desc && <p className="mt-4 text-sm text-ink-muted leading-relaxed">{desc}</p>}

                  {inclusions.length > 0 && (
                    <ul className="mt-6 space-y-2 text-sm text-ink/80 flex-1">
                      {inclusions.slice(0, 4).map((inc, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-1.5 inline-block w-2 h-px bg-ink/60 shrink-0" aria-hidden="true" />
                          <span className="leading-snug">{inc}</span>
                        </li>
                      ))}
                      {inclusions.length > 4 && (
                        <li className="font-mono uppercase tracking-widest text-[10px] text-ink-muted pl-[18px]">
                          +{inclusions.length - 4} {isEs ? 'más' : 'more'}
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="mt-8 pt-6 border-t border-hairline-soft flex items-center justify-between">
                    <span className="font-mono uppercase tracking-widest text-[11px] text-ink inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                      {isEs ? 'Ver detalles' : 'View details'}
                      <span aria-hidden="true">→</span>
                    </span>
                    {!quoteOnly && p.bookable_direct && (
                      <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                        {p.deposit_percent}% {isEs ? 'depósito' : 'deposit'}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
