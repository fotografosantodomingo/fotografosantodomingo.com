import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Servicios de Fotografía — Bodas, Drone, Retratos | Fotógrafo Santo Domingo'
    : 'Photography Services — Weddings, Drone, Portraits | Photographer Santo Domingo'
  const description = isEs
    ? 'Servicios de fotografía para bodas, retratos, drone, eventos, sesiones familiares y fotografía comercial en Santo Domingo y Punta Cana.'
    : 'Wedding, portrait, drone, event, family, and commercial photography services in Santo Domingo and Punta Cana.'

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/services`,
      languages: {
        es: `${BASE_URL}/es/services`,
        en: `${BASE_URL}/en/services`,
        'x-default': `${BASE_URL}/es/services`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title,
      description,
      url: `${BASE_URL}/${locale}/services`,
      locale: isEs ? 'es_DO' : 'en_US',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

type FamilyAggregate = {
  id: string
  slug: string
  title_es: string
  title_en: string
  tagline_es: string | null
  tagline_en: string | null
  icon: string
  bookable: boolean
  quoteable: boolean
  starting_price_usd: number | null
  has_direct_packages: boolean
  package_count: number
}

async function loadFamilies(): Promise<FamilyAggregate[]> {
  const supabase = createServiceClient()
  const [familiesRes, packagesRes] = await Promise.all([
    supabase
      .from('service_families')
      .select('id, slug, title_es, title_en, tagline_es, tagline_en, icon, bookable, quoteable, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('service_packages')
      .select('family_id, bookable_direct, starting_price_usd')
      .eq('active', true),
  ])

  const families = (familiesRes.data ?? []) as Array<{
    id: string
    slug: string
    title_es: string
    title_en: string
    tagline_es: string | null
    tagline_en: string | null
    icon: string
    bookable: boolean
    quoteable: boolean
  }>
  const packages = (packagesRes.data ?? []) as Array<{
    family_id: string
    bookable_direct: boolean
    starting_price_usd: number
  }>

  const byFamily = new Map<string, { count: number; minDirect: number | null; anyDirect: boolean }>()
  for (const p of packages) {
    const cur = byFamily.get(p.family_id) ?? { count: 0, minDirect: null, anyDirect: false }
    cur.count += 1
    if (p.bookable_direct) {
      cur.anyDirect = true
      const price = Number(p.starting_price_usd)
      if (price > 0 && (cur.minDirect == null || price < cur.minDirect)) {
        cur.minDirect = price
      }
    }
    byFamily.set(p.family_id, cur)
  }

  return families.map(f => {
    const agg = byFamily.get(f.id) ?? { count: 0, minDirect: null, anyDirect: false }
    return {
      ...f,
      starting_price_usd: agg.minDirect,
      has_direct_packages: agg.anyDirect,
      package_count: agg.count,
    }
  })
}

export default async function ServicesPage({ params: { locale } }: Props) {
  const families = await loadFamilies()
  const isEs = locale === 'es'

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isEs ? 'Servicios' : 'Services', item: `${BASE_URL}/${locale}/services` },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: families.map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: isEs ? f.title_es : f.title_en,
      url: `${BASE_URL}/${locale}/services/${f.slug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <main className="min-h-screen bg-gray-950 text-white">
        <section className="border-b border-white/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mx-auto max-w-3xl text-4xl font-bold md:text-5xl">
              {isEs ? 'Nuestros Servicios Fotográficos' : 'Our Photography Services'}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              {isEs
                ? 'Nueve familias de servicio. Reserva en línea o solicita un presupuesto personalizado.'
                : 'Nine service families. Book online or request a custom quote.'}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`/${locale}/book`}
                className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-gray-950 transition hover:bg-emerald-400"
              >
                {isEs ? 'Reservar Ahora' : 'Book Now'}
              </Link>
              <Link
                href={`/${locale}/get-quote`}
                className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-white/40"
              >
                {isEs ? 'Solicitar Presupuesto' : 'Request a Quote'}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {families.map(f => {
                const title = isEs ? f.title_es : f.title_en
                const tagline = isEs ? f.tagline_es : f.tagline_en
                return (
                  <Link
                    key={f.id}
                    href={`/${locale}/services/${f.slug}`}
                    className="group flex flex-col rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-emerald-400/50 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{f.icon}</span>
                      {f.starting_price_usd != null ? (
                        <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                          {isEs ? 'Desde' : 'From'} ${Math.round(f.starting_price_usd)}
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/15 px-3 py-0.5 text-xs font-semibold text-gray-300">
                          {isEs ? 'Solo cotización' : 'Quote only'}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-white">{title}</h2>
                    {tagline && <p className="mt-2 text-sm text-gray-400">{tagline}</p>}
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {f.package_count} {isEs ? 'paquetes' : 'packages'}
                      </span>
                      <span className="text-emerald-300 group-hover:text-emerald-200">
                        {isEs ? 'Ver paquetes →' : 'View packages →'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
