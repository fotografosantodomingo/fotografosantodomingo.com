import type { Metadata } from 'next'
import BookingWizard from '@/components/booking/BookingWizard'
import { createServiceClient } from '@/lib/supabase/service'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const BUSINESS_NAME = 'Fotografo Santo Domingo | Babula Shots'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const isEs = params.locale === 'es'
  const title = isEs
    ? 'Reservar sesión fotográfica — Babula Shots'
    : 'Book a photo session — Babula Shots'
  const description = isEs
    ? 'Reserva tu sesión fotográfica en Santo Domingo o Punta Cana. Pago seguro con depósito del 50% por Stripe. Confirmación inmediata.'
    : 'Book your photo session in Santo Domingo or Punta Cana. Secure 50% deposit payment via Stripe. Instant confirmation.'

  return {
    title,
    description,
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
  description_es: string | null
  description_en: string | null
  price_usd: number
  duration_min: number
}

async function buildJsonLd(locale: 'es' | 'en') {
  const isEs = locale === 'es'
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('booking_services')
    .select('slug, name_es, name_en, description_es, description_en, price_usd, duration_min')
    .eq('active', true)
    .eq('bookable', true)
    .order('sort_order', { ascending: true })

  const services = (data as ServiceRow[] | null) ?? []

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
        url: `${BASE_URL}/${locale}/book?service=${svc.slug}`,
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
  searchParams: { service?: string }
}) {
  const locale = (params.locale === 'en' ? 'en' : 'es') as 'es' | 'en'
  const schemas = await buildJsonLd(locale)

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <BookingWizard locale={locale} preselectedServiceSlug={searchParams.service} />
    </main>
  )
}
