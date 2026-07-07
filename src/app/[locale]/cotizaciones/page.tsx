import type { Metadata } from 'next'
import Link from 'next/link'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'

export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const WA_NUMBER = '18097789547'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Cotización Formal de Drone en Punta Cana | Babula Shots'
    : 'Formal Drone Quote in Punta Cana | Babula Shots'
  const description = isEs
    ? 'Cotización formal para documentación visual con drone en Punta Cana y Santo Domingo. Incluye alcance, entregables, inversión y condiciones de pago.'
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
      title: isEs ? 'Cotización Formal de Drone' : 'Formal Drone Quotation',
      description,
      url: `${BASE_URL}/${locale}/cotizaciones`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=Cotizacion+Formal+Drone&subtitle=Punta+Cana+y+Santo+Domingo`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Cotización formal de servicios de drone' : 'Formal drone service quotation',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Cotización Formal de Drone' : 'Formal Drone Quotation',
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

const PROCESS_STEPS = {
  es: [
    {
      num: '01',
      title: 'Escríbenos por WhatsApp',
      body: 'Cuéntanos tu proyecto: qué necesitas documentar, la ubicación y la fecha aproximada. Con esa información comenzamos a estructurar tu cotización.',
    },
    {
      num: '02',
      title: 'Revisión técnica',
      body: 'Verificamos el espacio aéreo con el IDAC, analizamos el alcance del vuelo y te confirmamos la viabilidad operativa antes de presentar cualquier precio.',
    },
    {
      num: '03',
      title: 'Propuesta formal',
      body: 'Recibes un enlace privado con el desglose completo de servicios, inversión, entregables, plazo de entrega y condiciones. Sin sorpresas.',
    },
    {
      num: '04',
      title: 'Reserva online',
      body: 'Con un clic reservas tu fecha con el 50% de depósito via Stripe — tarjeta, Apple Pay o Google Pay. El saldo se liquida el día de la sesión.',
    },
  ],
  en: [
    {
      num: '01',
      title: 'Message us on WhatsApp',
      body: 'Tell us about your project: what you need documented, the location, and your target date. That is all we need to start structuring your quote.',
    },
    {
      num: '02',
      title: 'Technical review',
      body: 'We verify airspace with the IDAC, analyze the flight scope, and confirm operational feasibility before presenting any price.',
    },
    {
      num: '03',
      title: 'Formal proposal',
      body: 'You receive a private link with a complete breakdown: services, investment, deliverables, turnaround, and terms. No surprises.',
    },
    {
      num: '04',
      title: 'Online reservation',
      body: 'One click reserves your date with a 50% deposit via Stripe — card, Apple Pay, or Google Pay. The balance is due on session day.',
    },
  ],
}

const DELIVERABLES = {
  es: [
    '4K RAW footage (sin compresión)',
    'Video editado con música licenciada',
    'Fotografías aéreas en alta resolución',
    'Entrega via enlace de descarga privado',
    'Firma de acuerdo de confidencialidad opcional',
  ],
  en: [
    '4K RAW footage (uncompressed)',
    'Edited video with licensed music',
    'High-resolution aerial photographs',
    'Delivery via private download link',
    'Optional NDA / confidentiality agreement',
  ],
}

export default function CotizacionesPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const steps = isEs ? PROCESS_STEPS.es : PROCESS_STEPS.en
  const deliverables = isEs ? DELIVERABLES.es : DELIVERABLES.en

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Cotizaciones' : 'Quotations', url: `${BASE_URL}/${locale}/cotizaciones` },
  ])

  const waMsg = isEs
    ? 'Hola, necesito una cotización formal de drone para mi proyecto.'
    : 'Hi, I need a formal drone quotation for my project.'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />

      <main className="min-h-screen bg-[#0e0e0d] text-[#f0ede6]">

        {/* Hero */}
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-24">
          <p className="mb-4 font-[family-name:var(--font-bugatti-display)] text-xs tracking-[0.4em] text-[#c8a96e]">
            BABULA SHOTS
          </p>
          <div className="mb-6 h-px bg-[#1e1c1a]" />
          <h1 className="mb-6 font-[family-name:var(--font-bugatti-display)] text-3xl leading-tight tracking-wide text-[#f0ede6] sm:text-4xl">
            {isEs
              ? 'Cotización Formal\nde Drone'
              : 'Formal Drone\nQuotation'}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[#8a8680]">
            {isEs
              ? 'No cotizamos en el aire. Cada propuesta incluye verificación de espacio aéreo, alcance técnico, desglose de costos y términos claros — antes de cobrar un centavo.'
              : 'We do not quote blindly. Every proposal includes airspace verification, technical scope, cost breakdown, and clear terms — before charging a cent.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#c8a96e] px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-[#0e0e0d] transition hover:opacity-90"
            >
              {isEs ? 'Solicitar cotización →' : 'Request a quote →'}
            </a>
            <Link
              href={`/${locale}/drone-services-photography-punta-cana`}
              className="inline-block border border-[#2e2c29] px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-[#8a8680] transition hover:border-[#c8a96e] hover:text-[#c8a96e]"
            >
              {isEs ? 'Ver servicios de drone' : 'Drone services'}
            </Link>
          </div>
        </section>

        {/* Process */}
        <section className="border-t border-[#1e1c1a] bg-[#111110] py-20">
          <div className="mx-auto max-w-3xl px-6">
            <p className="mb-12 text-xs tracking-[0.3em] text-[#8a8680]">
              {isEs ? 'EL PROCESO' : 'THE PROCESS'}
            </p>
            <div className="grid gap-10 sm:grid-cols-2">
              {steps.map(step => (
                <div key={step.num}>
                  <p className="mb-3 font-[family-name:var(--font-bugatti-mono)] text-xs text-[#c8a96e]">{step.num}</p>
                  <h3 className="mb-3 text-sm font-semibold tracking-wide text-[#f0ede6]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#8a8680]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deliverables */}
        <section className="border-t border-[#1e1c1a] py-20">
          <div className="mx-auto max-w-3xl px-6">
            <p className="mb-10 text-xs tracking-[0.3em] text-[#8a8680]">
              {isEs ? 'LO QUE INCLUYE' : 'WHAT IS INCLUDED'}
            </p>
            <ul className="space-y-4">
              {deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-4 border-b border-[#1e1c1a] pb-4 last:border-0 last:pb-0">
                  <span className="mt-0.5 shrink-0 text-[#c8a96e]">—</span>
                  <span className="text-sm text-[#8a8680]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-[#1e1c1a] bg-[#111110] py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="mb-2 font-[family-name:var(--font-bugatti-display)] text-xs tracking-[0.3em] text-[#c8a96e]">
              {isEs ? 'LISTO PARA COMENZAR' : 'READY TO START'}
            </p>
            <h2 className="mb-6 text-xl tracking-wide text-[#f0ede6]">
              {isEs
                ? 'Recibe tu propuesta formal en menos de 24 horas'
                : 'Receive your formal proposal in under 24 hours'}
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-[#8a8680]">
              {isEs
                ? 'Escríbenos por WhatsApp con los detalles de tu proyecto. Revisamos el espacio aéreo, preparamos el alcance y te enviamos un enlace privado con tu cotización completa.'
                : 'Message us on WhatsApp with your project details. We verify the airspace, prepare the scope, and send you a private link with your full quote.'}
            </p>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#c8a96e] px-10 py-4 text-sm font-semibold uppercase tracking-widest text-[#0e0e0d] transition hover:opacity-90"
            >
              {isEs ? 'Escribir por WhatsApp →' : 'Message on WhatsApp →'}
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
