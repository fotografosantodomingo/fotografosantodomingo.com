import type { Metadata } from 'next'
import BookingWizard from '@/components/booking/BookingWizard'

const BASE_URL = 'https://www.fotografosantodomingo.com'

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
      siteName: 'Fotografo Santo Domingo | Babula Shots',
    },
    robots: { index: true, follow: true },
  }
}

export default function BookPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { service?: string }
}) {
  const locale = (params.locale === 'en' ? 'en' : 'es') as 'es' | 'en'
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <BookingWizard locale={locale} preselectedServiceSlug={searchParams.service} />
    </main>
  )
}
