import type { Metadata } from 'next'
import Link from 'next/link'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Cotizacion Formal de Drone en Punta Cana | Babula Shots'
    : 'Formal Drone Quote in Punta Cana | Babula Shots'
  const description = isEs
    ? 'Cotizacion formal para documentacion visual con drone en Punta Cana y Santo Domingo. Incluye alcance, entregables, inversion y condiciones de pago.'
    : 'Formal quotation for drone visual documentation in Punta Cana and Santo Domingo. Includes scope, deliverables, investment, and payment terms.'

  return {
    title,
    description,
    keywords: isEs
      ? 'cotizacion drone punta cana, propuesta servicios drone republica dominicana, documentacion visual de construccion, cotizacion formal audiovisual'
      : 'drone quotation punta cana, drone services proposal dominican republic, construction visual documentation quote, formal audiovisual quotation',
    alternates: {
      canonical: `${BASE_URL}/${locale}/cotizaciones`,
      languages: {
        es: `${BASE_URL}/es/cotizaciones`,
        en: `${BASE_URL}/en/cotizaciones`,
        'x-default': `${BASE_URL}/es/cotizaciones`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Cotizacion Formal de Drone' : 'Formal Drone Quotation',
      description,
      url: `${BASE_URL}/${locale}/cotizaciones`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=Cotizacion+Formal+Drone&subtitle=Punta+Cana+y+Santo+Domingo`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Cotizacion formal de servicios de drone' : 'Formal drone service quotation',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Cotizacion Formal de Drone' : 'Formal Drone Quotation',
      description,
      images: [`${BASE_URL}/api/og?title=Cotizacion+Formal+Drone`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export default function CotizacionesPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Cotizaciones' : 'Quotations', url: `${BASE_URL}/${locale}/cotizaciones` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <main className="min-h-screen bg-stone-100 py-8">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h1 className="mb-4 text-2xl font-bold text-stone-900">
            {isEs ? 'Cotizacion Formal' : 'Formal Quotation'}
          </h1>
          <p className="mb-6 text-sm text-stone-700">
            {isEs
              ? 'Pagina dedicada con la cotizacion completa y descarga PDF en un clic.'
              : 'Dedicated page with the full quotation and one-click PDF download.'}
          </p>

          <div className="overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm">
            <iframe
              title={isEs ? 'Cotizacion Formal' : 'Formal Quotation'}
              src="/cotizaciones/Right-Constructions-1.html"
              className="h-[92vh] w-full"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href={`/${locale}/services`} className="rounded bg-stone-900 px-4 py-2 text-white hover:bg-stone-700">
              {isEs ? 'Ver servicios' : 'View services'}
            </Link>
            <Link href={`/${locale}/contact`} className="rounded border border-stone-300 bg-white px-4 py-2 text-stone-900 hover:bg-stone-50">
              {isEs ? 'Contactar' : 'Contact'}
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
