import type { Metadata } from 'next'
import ContactClient from './ContactClient'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  return {
    title: isEs ? 'Contacto — Fotógrafo Santo Domingo | Babula Shots' : 'Contact — Photographer Santo Domingo | Babula Shots',
    description: isEs
      ? 'Contáctame para cotizar tu sesión fotográfica en Santo Domingo. Bodas, retratos, eventos, drone. Respuesta en menos de 4 horas. WhatsApp: +1 (809) 720-9547.'
      : 'Contact me for a photography quote in Santo Domingo. Weddings, portraits, events, drone. Response within 4 hours. WhatsApp: +1 (809) 720-9547.',
    alternates: {
      canonical: `${BASE_URL}/${locale}/contact`,
      languages: { es: `${BASE_URL}/es/contact`, en: `${BASE_URL}/en/contact`, 'x-default': `${BASE_URL}/es/contact` },
    },
    openGraph: {
      title: isEs ? 'Contacto — Fotógrafo Santo Domingo' : 'Contact — Photographer Santo Domingo',
      url: `${BASE_URL}/${locale}/contact`,
      images: [{ url: `${BASE_URL}/api/og?title=Contácta+al+Fotógrafo&subtitle=WhatsApp+·+Email+·+Santo+Domingo`, width: 1200, height: 630 }],
    },
  }
}

export default function ContactPage({ params }: Props) {
  return <ContactClient />
}
