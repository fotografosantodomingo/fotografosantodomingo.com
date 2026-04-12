import type { Metadata } from 'next'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'
import GetQuoteWizard from '@/components/quote/GetQuoteWizard'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Solicitar Presupuesto de Fotografia | Fotografo Santo Domingo'
    : 'Request Photography Quote | Photographer Santo Domingo'
  const description = isEs
    ? 'Solicita tu presupuesto personalizado para bodas, retratos, eventos, drone y produccion comercial en Santo Domingo y toda Republica Dominicana.'
    : 'Request your personalized quote for weddings, portraits, events, drone, and commercial production in Santo Domingo and across the Dominican Republic.'

  return {
    title,
    description,
    keywords: isEs
      ? 'solicitar presupuesto fotografia santo domingo, cotizacion fotografo bodas RD, quote fotografia punta cana, presupuesto sesion fotos republica dominicana'
      : 'request photography quote santo domingo, wedding quote dominican republic, punta cana photo session quote, custom photography pricing DR',
    alternates: {
      canonical: `${BASE_URL}/${locale}/get-quote`,
      languages: {
        es: `${BASE_URL}/es/get-quote`,
        en: `${BASE_URL}/en/get-quote`,
        'x-default': `${BASE_URL}/es/get-quote`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Solicitar Presupuesto | Babula Shots' : 'Request a Quote | Babula Shots',
      description,
      url: `${BASE_URL}/${locale}/get-quote`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=${isEs ? 'Solicitar+Presupuesto' : 'Request+a+Quote'}&subtitle=${isEs ? 'Babula+Shots' : 'Babula+Shots'}`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Solicitar presupuesto fotografico' : 'Request photography quote',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Solicitar Presupuesto | Babula Shots' : 'Request a Quote | Babula Shots',
      description,
      images: [`${BASE_URL}/api/og?title=${isEs ? 'Solicitar+Presupuesto' : 'Request+a+Quote'}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export default function GetQuotePage({ params: { locale } }: Props) {
  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: locale === 'es' ? 'Solicitar presupuesto' : 'Get quote', url: `${BASE_URL}/${locale}/get-quote` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <main className="min-h-screen bg-slate-50 py-10 md:py-14 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <GetQuoteWizard locale={locale} />
          </div>
        </div>
      </main>
    </>
  )
}
