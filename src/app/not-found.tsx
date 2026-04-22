import type { Metadata } from 'next'
import { headers } from 'next/headers'
import NotFoundClient from '@/components/NotFoundClient'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The requested photography gallery or page is missing. Explore our portfolio instead.',
  robots: {
    index: false,
    follow: true,
  },
}

function detectInitialLocale() {
  const h = headers()
  const acceptLanguage = h.get('accept-language') || ''
  return acceptLanguage.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export default function NotFound() {
  const initialLocale = detectInitialLocale()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '404 - Page Not Found',
    description: 'The requested photography gallery or page is missing. Explore our portfolio instead.',
    publisher: {
      '@type': 'ProfessionalService',
      name: 'Fotografo Santo Domingo | Babula Shots',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NotFoundClient initialLocale={initialLocale} />
    </>
  )
}
