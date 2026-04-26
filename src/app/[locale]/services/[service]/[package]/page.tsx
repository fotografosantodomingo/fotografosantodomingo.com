import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import {
  LEGACY_SERVICE_SLUG_TO_FAMILY,
} from '@/lib/services/legacy-aliases'

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

  return {
    title,
    description: desc,
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

      <main className="min-h-screen bg-gray-950 text-white">
        <section className="border-b border-white/5 py-10">
          <div className="container mx-auto px-4">
            <nav className="text-xs text-gray-500">
              <Link href={`/${locale}/services`} className="hover:text-gray-300">
                {isEs ? 'Servicios' : 'Services'}
              </Link>
              <span className="mx-2">/</span>
              <Link href={`/${locale}/services/${detail.family.slug}`} className="hover:text-gray-300">
                {familyTitle}
              </Link>
            </nav>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{detail.family.icon}</span>
                  <h1 className="text-3xl font-bold md:text-4xl">{name}</h1>
                </div>
                {desc && <p className="mt-2 max-w-2xl text-gray-400">{desc}</p>}
                {detail.popular_badge && (
                  <span className="mt-3 inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                    {detail.popular_badge.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-right">
                <div className="text-3xl font-bold text-emerald-300">
                  ${price.toFixed(0)}
                </div>
                <div className="text-xs text-gray-400">
                  {isEs ? 'desde · USD' : 'starting · USD'}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {detail.minimum_billable_hours
                    ? `${detail.minimum_billable_hours}h ${isEs ? 'mínimo' : 'minimum'}`
                    : `${detail.duration_min} min`}
                  {detail.photo_count
                    ? ` · ${detail.photo_count} ${isEs ? 'fotos' : 'photos'}`
                    : ''}
                </div>
              </div>
            </div>
          </div>
        </section>

        {inclusions.length > 0 && (
          <section className="py-10">
            <div className="container mx-auto px-4">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                {isEs ? 'Incluye' : 'Includes'}
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {inclusions.map((inc, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-4 text-sm text-gray-200"
                  >
                    <span className="mt-0.5 text-emerald-400">✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="border-t border-white/5 py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {detail.bookable_direct ? (
                  <p className="text-sm text-gray-400">
                    {isEs
                      ? `Depósito del ${detail.deposit_percent}% para reservar — $${deposit} USD`
                      : `${detail.deposit_percent}% deposit to book — $${deposit} USD`}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    {isEs
                      ? 'Este paquete se cotiza de forma personalizada.'
                      : 'This package is custom-quoted.'}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {detail.bookable_direct && (
                  <Link
                    href={`/${locale}/book?service=${detail.slug}`}
                    className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-gray-950 transition hover:bg-emerald-400"
                  >
                    {isEs ? 'Reservar ahora' : 'Book now'}
                  </Link>
                )}
                <Link
                  href={`/${locale}/get-quote?family=${detail.family.slug}&package=${detail.slug}&cta=package-detail`}
                  className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-white/40"
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
