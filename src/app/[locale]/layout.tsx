import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import GoogleTagManager from '@/components/GoogleTagManager'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const BASE_URL = 'https://www.fotografosantodomingo.com'

const globalSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'ProfessionalService'],
      '@id': `${BASE_URL}/#business`,
      name: 'Fotografo Santo Domingo',
      alternateName: 'Babula Shots',
      url: BASE_URL,
      telephone: '+18097209547',
      email: 'info@fotografosantodomingo.com',
      image: `${BASE_URL}/api/og`,
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'C. El Conde 142',
        addressLocality: 'Santo Domingo',
        addressRegion: 'Distrito Nacional',
        postalCode: '11111',
        addressCountry: 'DO',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 18.4727,
        longitude: -69.8866,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
          opens: '00:00',
          closes: '23:59',
        },
      ],
      sameAs: [
        'https://www.instagram.com/babulashotsrd',
        'https://babulashotsrd.com',
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '91',
        bestRating: '5',
        worstRating: '1',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Fotografo Santo Domingo',
      inLanguage: ['es', 'en'],
      publisher: { '@id': `${BASE_URL}/#business` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/es/portfolio?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

async function loadLocaleMessages(locale: string) {
  try {
    const messages = await import(`@/messages/${locale}.json`)
    return messages.default
  } catch (error) {
    return null
  }
}

export async function generateMetadata({
  params: { locale }
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' })
  
  return {
    title: {
      default: t('title'),
      template: `%s | ${locale === 'es' ? 'Fotógrafo SD' : 'Photographer SD'}`
    },
    description: t('description'),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        es: `${BASE_URL}/es`,
        en: `${BASE_URL}/en`,
        'x-default': `${BASE_URL}/es`,
      }
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${BASE_URL}/${locale}`,
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      locale: locale === 'es' ? 'es_DO' : 'en_US',
      type: 'website',
      images: [{
        url: `${BASE_URL}/api/og?title=Fotógrafo+Profesional+Santo+Domingo&subtitle=República+Dominicana`,
        width: 1200,
        height: 630,
        alt: 'Fotógrafo Profesional Santo Domingo'
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`${BASE_URL}/api/og`],
      creator: '@babulashots',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ?? 'Dnr12nhf50Akvud2jQDU4kA5ObExCJ3u9ddrf-dF5L4',
    },
  }
}

export default async function RootLayout({
  children,
  params: { locale }
}: Props) {
  const normalizedLocale = locale.toLowerCase()

  if (!['en', 'es'].includes(normalizedLocale)) {
    notFound()
  }

  if (normalizedLocale !== locale) {
    redirect(`/${normalizedLocale}`)
  }

  const messages = await loadLocaleMessages(normalizedLocale)

  if (!messages) {
    notFound()
  }

  return (
    <NextIntlClientProvider locale={normalizedLocale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
      />
      {process.env.NEXT_PUBLIC_GTM_ID && <GoogleTagManager />}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <GoogleAnalytics />}
      <ErrorBoundary>
        <Navigation />
        {children}
        <Footer />
      </ErrorBoundary>
      <WhatsAppButton />
    </NextIntlClientProvider>
  )
}