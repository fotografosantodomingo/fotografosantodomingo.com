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
  
  const baseUrl = 'https://fotografosantodomingo.com'
  
  return {
    title: {
      default: t('title'),
      template: `%s | ${locale === 'es' ? 'Fotógrafo SD' : 'Photographer SD'}`
    },
    description: t('description'),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        es: '/es'
      }
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}`,
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      locale: locale === 'es' ? 'es_DO' : 'en_US',
      type: 'website',
      images: [{
        url: `${baseUrl}/images/og-default.webp`,
        width: 1200,
        height: 628,
        alt: 'Fotógrafo Profesional Santo Domingo'
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`${baseUrl}/images/og-default.webp`],
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
      google: 'your-google-verification-code',
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