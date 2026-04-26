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

      <main className="min-h-screen bg-gray-950 text-white">
        <section className="border-b border-white/5 py-12">
          <div className="container mx-auto px-4">
            <nav className="text-xs text-gray-500">
              <Link href={`/${locale}/services`} className="hover:text-gray-300">
                ← {isEs ? 'Todos los servicios' : 'All services'}
              </Link>
            </nav>
            <div className="mt-4 flex items-start gap-4">
              <span className="text-5xl">{family.icon}</span>
              <div>
                <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
                {tagline && <p className="mt-2 max-w-2xl text-gray-400">{tagline}</p>}
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

        <section className="border-t border-white/5 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-semibold">
              {isEs ? '¿No encuentras lo que buscas?' : 'Not finding what you need?'}
            </h2>
            <p className="mt-2 text-gray-400">
              {isEs
                ? 'Cuéntanos tus detalles y te enviamos un presupuesto personalizado.'
                : 'Tell us about your project and we\'ll send a custom quote.'}
            </p>
            <Link
              href={`/${locale}/get-quote?family=${family.slug}&cta=family-page-bottom`}
              className="mt-6 inline-flex rounded-lg border border-white/20 px-6 py-3 font-semibold text-white hover:border-white/40"
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
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
          {heading}
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {packages.map(p => {
            const name = isEs ? p.name_es : p.name_en
            const desc = isEs ? p.description_short_es : p.description_short_en
            const inclusions = isEs ? p.inclusions_es : p.inclusions_en
            const price = Number(p.starting_price_usd)
            return (
              <Link
                key={p.id}
                href={`/${locale}/services/${family.slug}/${p.slug}`}
                className={`group flex flex-col rounded-xl border p-5 transition ${
                  p.featured
                    ? 'border-emerald-400/40 bg-emerald-500/5 hover:border-emerald-400/70'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white">{name}</h3>
                  {p.popular_badge && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                      {p.popular_badge.replace('_', ' ')}
                    </span>
                  )}
                </div>
                {desc && <p className="mt-2 text-sm text-gray-400">{desc}</p>}

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-300">
                    ${price.toFixed(0)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {isEs ? 'desde' : 'starting'} ·{' '}
                    {p.minimum_billable_hours
                      ? `${p.minimum_billable_hours}h ${isEs ? 'mín' : 'min'}`
                      : `${p.duration_min} min`}
                  </span>
                </div>

                {inclusions.length > 0 && (
                  <ul className="mt-4 space-y-1 text-xs text-gray-300">
                    {inclusions.slice(0, 4).map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 text-emerald-400">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                    {inclusions.length > 4 && (
                      <li className="text-gray-500">
                        +{inclusions.length - 4} {isEs ? 'más' : 'more'}
                      </li>
                    )}
                  </ul>
                )}

                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-emerald-300 group-hover:text-emerald-200">
                    {isEs ? 'Ver detalles →' : 'View details →'}
                  </span>
                  {!quoteOnly && p.bookable_direct && (
                    <span className="text-xs text-gray-500">
                      {isEs ? `${p.deposit_percent}% depósito` : `${p.deposit_percent}% deposit`}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
