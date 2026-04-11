import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type PageProps = {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  const isEs = locale === 'es'
  const slug = 'replace-me'
  // Keep canonical and hreflang in the exact same URL format (no trailing slash)
  // to avoid canonical/hreflang mismatch warnings in SEO validators.
  const title = isEs
    ? 'Primary ES Intent | Babula Shots'
    : 'Primary EN Intent | Babula Shots'
  const description = isEs
    ? 'Descripcion unica en espanol para esta pagina. Debe reflejar la intencion principal de busqueda.'
    : 'Unique English description for this page. It should reflect the main search intent.'

  return {
    title,
    description,
    keywords: isEs
      ? 'frase clave 1, frase clave 2, frase clave 3, fotografo santo domingo'
      : 'keyword phrase 1, keyword phrase 2, keyword phrase 3, santo domingo photographer',
    alternates: {
      canonical: `${BASE_URL}/${locale}/${slug}`,
      languages: {
        es: `${BASE_URL}/es/${slug}`,
        en: `${BASE_URL}/en/${slug}`,
        'x-default': `${BASE_URL}/es/${slug}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Short ES OG Title' : 'Short EN OG Title',
      description,
      url: `${BASE_URL}/${locale}/${slug}`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=URL+Encoded+Title&subtitle=URL+Encoded+Subtitle`,
        width: 1200,
        height: 630,
        alt: isEs ? 'ES image alt text' : 'EN image alt text',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Short ES Twitter Title' : 'Short EN Twitter Title',
      description,
      images: [`${BASE_URL}/api/og?title=URL+Encoded+Title`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export default async function LocalizedSeoPageTemplate({ params: { locale } }: PageProps) {
  const t = await getTranslations({ locale, namespace: 'replace_me' })

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: locale === 'es' ? 'Section Name ES' : 'Section Name EN', url: `${BASE_URL}/${locale}/replace-me` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <main className="min-h-screen bg-gray-950 text-white">
        <section className="relative py-20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />
          <div className="relative container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {t('hero_title')}
              </h1>
              <p className="text-xl text-gray-400">
                {t('hero_description')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-900/40">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-white">{t('section_one_title')}</h2>
                <p className="text-gray-300 leading-8">{t('section_one_body')}</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-white">{t('section_two_title')}</h2>
                <p className="text-gray-300 leading-8">{t('section_two_body')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}