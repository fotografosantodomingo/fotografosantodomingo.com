import type { Metadata } from 'next'
import BookingWizard from '@/components/booking/BookingWizard'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUsdToDopRate } from '@/lib/currency/exchange-rate'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const BUSINESS_NAME = 'Fotografo Santo Domingo | Babula Shots'

// This route is force-dynamic; on Cloudflare Pages (@cloudflare/next-on-pages)
// a dynamic route MUST declare the edge runtime, otherwise next-on-pages emits a
// broken function that fails at request time with
// "ReferenceError: async__chunk_XXXX is not defined" → HTTP 500.
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const isEs = params.locale === 'es'
  const title = isEs
    ? 'Reservar Fotógrafo en Santo Domingo, Punta Cana & República Dominicana | Babula Shots'
    : 'Book a Photographer in Punta Cana, Santo Domingo & Dominican Republic | Babula Shots'
  const description = isEs
    ? 'Reserva online tu fotógrafo para bodas, familia, retratos o eventos en República Dominicana. Confirmación rápida y depósito seguro por Stripe.'
    : 'Book your photographer online for weddings, family, portraits, or events in the Dominican Republic. Fast confirmation and secure Stripe deposit.'
  const keywords = isEs
    ? 'reservar fotografo punta cana, reservar fotografo santo domingo, contratar fotografo republica dominicana, deposito stripe fotografia, booking fotografo bodas rd, reservar sesion fotos dominicana'
    : 'book photographer punta cana, book photographer santo domingo, hire photographer dominican republic, stripe deposit photography, wedding photographer booking DR, book photo session dominican republic'

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${BASE_URL}/${params.locale}/book`,
      languages: {
        es: `${BASE_URL}/es/book`,
        en: `${BASE_URL}/en/book`,
        'x-default': `${BASE_URL}/es/book`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${params.locale}/book`,
      type: 'website',
      locale: isEs ? 'es_DO' : 'en_US',
      siteName: BUSINESS_NAME,
    },
    robots: { index: true, follow: true },
  }
}

type ServiceRow = {
  slug: string
  name_es: string
  name_en: string
  description_short_es: string | null
  description_short_en: string | null
  starting_price_usd: number
  duration_min: number
}

async function buildJsonLd(locale: 'es' | 'en') {
  const isEs = locale === 'es'
  // Public booking page: read package data with the anon client (covered by the
  // service_packages/service_families public-read RLS policies). The service-role
  // client throws when SUPABASE_SERVICE_ROLE_KEY is absent in the edge/prod env,
  // which 500'd this page in production; this data is public, so anon is correct.
  const supabase = createSupabaseServerClient()
  // Pull family_slug too so JSON-LD offer URLs use the disambiguated
  // `<family>__<package>` form. Package slugs alone collide across
  // families (5 'essential', 5 'premium', 4 'luxury', 6 'custom').
  const { data } = await supabase
    .from('service_packages')
    .select(
      'slug, name_es, name_en, description_short_es, description_short_en, starting_price_usd, duration_min, family:service_families!inner(slug)'
    )
    .eq('active', true)
    .eq('bookable_direct', true)
    .order('sort_order', { ascending: true })

  type RowWithFamily = ServiceRow & { family: { slug: string } | null }
  const rows = (data as RowWithFamily[] | null) ?? []
  const services = rows.map(r => ({
    slug: r.slug,
    family_slug: r.family?.slug ?? '',
    name_es: r.name_es,
    name_en: r.name_en,
    description_es: r.description_short_es,
    description_en: r.description_short_en,
    price_usd: Number(r.starting_price_usd),
    duration_min: r.duration_min,
  }))

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isEs ? 'Reservar' : 'Book', item: `${BASE_URL}/${locale}/book` },
    ],
  }

  // Single Service node with an OfferCatalog of all bookable sessions.
  // Each Offer carries its own price and a deep-link availability URL
  // (?service=<slug>) so search engines can route users to the exact wizard step.
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: isEs ? 'Reserva de fotografía profesional' : 'Professional photography booking',
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#business`,
      name: BUSINESS_NAME,
      url: BASE_URL,
      areaServed: { '@type': 'Country', name: 'Dominican Republic' },
    },
    areaServed: { '@type': 'Country', name: 'Dominican Republic' },
    url: `${BASE_URL}/${locale}/book`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isEs ? 'Servicios fotográficos disponibles' : 'Available photography services',
      itemListElement: services.map(svc => ({
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: Number(svc.price_usd).toFixed(2),
        url: `${BASE_URL}/${locale}/book?service=${svc.family_slug}__${svc.slug}`,
        availability: 'https://schema.org/InStock',
        category: 'Photography',
        itemOffered: {
          '@type': 'Service',
          name: isEs ? svc.name_es : svc.name_en,
          description: (isEs ? svc.description_es : svc.description_en) ?? undefined,
        },
        eligibleQuantity: {
          '@type': 'QuantitativeValue',
          value: svc.duration_min,
          unitCode: 'MIN',
        },
      })),
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: services.length
        ? Math.min(...services.map(s => Number(s.price_usd))).toFixed(2)
        : '0',
      highPrice: services.length
        ? Math.max(...services.map(s => Number(s.price_usd))).toFixed(2)
        : '0',
      offerCount: services.length,
    },
  }

  return [breadcrumb, serviceSchema]
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { service?: string; city?: string }
}) {
  const locale = (params.locale === 'en' ? 'en' : 'es') as 'es' | 'en'
  const [schemas, dopRate] = await Promise.all([
    buildJsonLd(locale),
    getUsdToDopRate(),
  ])

  return (
    <main className="min-h-screen bg-canvas text-ink">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <BookingWizard
        locale={locale}
        preselectedServiceSlug={searchParams.service}
        attributionCity={searchParams.city}
        dopRate={dopRate.usdToDop}
      />
    </main>
  )
}
