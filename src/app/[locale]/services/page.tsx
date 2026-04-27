import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { getUsdToDopRate } from '@/lib/currency/exchange-rate'
import { formatServicePrice } from '@/lib/currency/format'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Fotógrafo Profesional en Santo Domingo, Punta Cana & República Dominicana | Servicios Babula Shots'
    : 'Professional Photographer in Punta Cana, Santo Domingo & Dominican Republic | Babula Shots Services'
  const description = isEs
    ? 'Servicios de bodas, retratos, drone, eventos corporativos, familia y comercial en Santo Domingo, Punta Cana y RD. Reserva online con confirmación inmediata.'
    : 'Wedding, portrait, drone, corporate event, family, and commercial services in Santo Domingo, Punta Cana, and DR. Online booking with instant confirmation.'
  const keywords = isEs
    ? 'fotografo santo domingo, fotografo punta cana, fotografo profesional republica dominicana, servicios fotografia rd, contratar fotografo dominicana, reservar fotografo bodas dr'
    : 'photographer santo domingo, punta cana photographer, professional photographer dominican republic, photography services DR, hire photographer dominican republic, book wedding photographer DR'

  return {
    title,
    description,
    keywords,
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
  const [families, dopRate] = await Promise.all([
    loadFamilies(),
    getUsdToDopRate(),
  ])
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

      <main className="min-h-screen bg-canvas text-ink">
        {/* ── HEADER ── */}
        <section className="border-b border-hairline-soft py-20 md:py-28 lg:py-32">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Servicios' : 'Services'} · {families.length}
            </p>
            <h1
              className="font-display uppercase text-ink max-w-5xl"
              style={{
                fontSize: 'clamp(40px, 9vw, 144px)',
                lineHeight: '0.95',
                letterSpacing: '-0.01em',
              }}
            >
              {isEs ? 'Cada momento, su lente.' : 'Each moment, its lens.'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-8">
              {isEs
                ? 'Nueve familias de servicio. Reserva en línea o solicita un presupuesto personalizado.'
                : 'Nine service families. Book online or request a custom quote.'}
            </p>
            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
              <Link
                href={`/${locale}/book`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
              >
                {isEs ? 'Reservar ahora' : 'Book now'}
              </Link>
              <Link
                href={`/${locale}/get-quote`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
              >
                {isEs ? 'Solicitar presupuesto' : 'Request a quote'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAMILIES — hairline grid, no cards, no shadows ── */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline-soft">
              {families.map(f => {
                const title = isEs ? f.title_es : f.title_en
                const tagline = isEs ? f.tagline_es : f.tagline_en
                const priceLabel = (() => {
                  if (f.starting_price_usd == null) {
                    return isEs ? 'Solo cotización' : 'Quote only'
                  }
                  const formatted = formatServicePrice(f.starting_price_usd, locale, dopRate.usdToDop)
                  return `${isEs ? 'Desde' : 'From'} ${formatted.primary}`
                })()
                return (
                  <li key={f.id} className="border-r border-b border-hairline-soft">
                    <Link
                      href={`/${locale}/services/${f.slug}`}
                      className="group flex flex-col h-full p-7 md:p-8 lg:p-10 hover:bg-ink/5 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <span className="text-2xl" aria-hidden="true">{f.icon}</span>
                        <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {priceLabel}
                        </span>
                      </div>
                      <h2
                        className="font-display uppercase text-ink"
                        style={{ fontSize: 'clamp(24px, 2.4vw, 32px)', lineHeight: '1.05' }}
                      >
                        {title}
                      </h2>
                      {tagline && (
                        <p className="text-ink-muted text-sm leading-relaxed mt-3 flex-1">{tagline}</p>
                      )}
                      <div className="mt-8 flex items-center justify-between">
                        <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {f.package_count} {isEs ? 'paquetes' : 'packages'}
                        </span>
                        <span className="font-mono uppercase tracking-widest text-[11px] text-ink inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                          {isEs ? 'Explorar' : 'Explore'}
                          <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </main>
    </>
  )
}
