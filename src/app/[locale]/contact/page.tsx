import type { Metadata } from 'next'
import ContactClient from './ContactClient'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Contacto — Fotógrafo Santo Domingo | Babula Shots'
    : 'Contact — Photographer Santo Domingo | Babula Shots'
  const description = isEs
    ? 'Contáctame para cotizar tu sesión fotográfica en Santo Domingo. Bodas, retratos, eventos, drone. Respuesta en menos de 4 horas. WhatsApp: +1 (809) 720-9547.'
    : 'Contact me for a photography quote in Santo Domingo. Weddings, portraits, events, drone. Response within 4 hours. WhatsApp: +1 (809) 720-9547.'
  return {
    title,
    description,
    keywords: isEs
      ? 'contacto fotógrafo santo domingo, cotizar sesión fotográfica RD, whatsapp fotógrafo bodas, reservar fotógrafo dominicana, presupuesto fotografía'
      : 'contact photographer santo domingo, photography quote DR, whatsapp wedding photographer, book photographer dominican republic, photography estimate',
    alternates: {
      canonical: `${BASE_URL}/${locale}/contact`,
      languages: { es: `${BASE_URL}/es/contact`, en: `${BASE_URL}/en/contact`, 'x-default': `${BASE_URL}/es/contact` },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Contacto — Fotógrafo Santo Domingo' : 'Contact — Photographer Santo Domingo',
      description,
      url: `${BASE_URL}/${locale}/contact`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=Contácta+al+Fotógrafo&subtitle=WhatsApp+·+Email+·+Santo+Domingo`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Contacto Fotógrafo Santo Domingo' : 'Contact Photographer Santo Domingo',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Contacto — Fotógrafo Santo Domingo' : 'Contact — Photographer Santo Domingo',
      description,
      images: [`${BASE_URL}/api/og?title=Contácta+al+Fotógrafo&subtitle=WhatsApp+·+Email`],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

export default function ContactPage({ params: { locale } }: Props) {
  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: locale === 'es' ? 'Contacto' : 'Contact', url: `${BASE_URL}/${locale}/contact` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <ContactClient />
    </>
  )
}
