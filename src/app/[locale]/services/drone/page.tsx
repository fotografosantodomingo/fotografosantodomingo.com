import type { Metadata } from 'next'
import Link from 'next/link'
import { CONTACT_INFO } from '@/lib/utils/constants'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'

export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const PAGE_SLUG = 'services/drone'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Servicios de Drone en República Dominicana | Bienes Raíces, Industrial y Eventos | Babula Shots'
    : 'Drone Services in the Dominican Republic | Real Estate, Industrial & Events | Babula Shots'
  const description = isEs
    ? 'Fotografía y video aéreo con drone en toda República Dominicana — bienes raíces, bodas, y proyectos industriales/comerciales como análisis de tráfico y levantamientos portuarios. 4K, piloto certificado.'
    : 'Aerial drone photography and video across the Dominican Republic — real estate, weddings, and industrial/commercial projects like traffic analytics and port surveys. 4K, certified pilot.'
  return {
    title,
    description,
    keywords: isEs
      ? 'servicios de dron republica dominicana, fotografo drone santo domingo, dron para bienes raices, dron industrial republica dominicana, video aereo 4k dron'
      : 'drone services dominican republic, drone photographer santo domingo, drone for real estate, industrial drone dominican republic, 4k aerial video drone',
    alternates: {
      canonical: `${BASE_URL}/${locale}/${PAGE_SLUG}`,
      languages: {
        es: `${BASE_URL}/es/${PAGE_SLUG}`,
        en: `${BASE_URL}/en/${PAGE_SLUG}`,
        'x-default': `${BASE_URL}/es/${PAGE_SLUG}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title,
      description,
      url: `${BASE_URL}/${locale}/${PAGE_SLUG}`,
      locale: isEs ? 'es_DO' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title,
      description,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

const cards = [
  {
    href: 'services/real-estate-drone-photography',
    icon: '🏝️',
    titleEs: 'Bienes Raíces y Bodas',
    titleEn: 'Real Estate & Weddings',
    descEs: 'Fotografía y video aéreo para propiedades, resorts y bodas en Punta Cana, Cap Cana y toda la isla — desde $250 USD.',
    descEn: 'Aerial photography and video for properties, resorts, and weddings in Punta Cana, Cap Cana, and island-wide — starting at $250 USD.',
  },
  {
    href: 'drone/proyecto-drone-zona-industrial-haina',
    icon: '🚌',
    titleEs: 'Análisis Industrial — Haina',
    titleEn: 'Industrial Analytics — Haina',
    descEs: 'Vuelo continuo de 1 hora para una empresa de análisis de tráfico — llegadas y salidas de autobuses documentadas en 4K.',
    descEn: 'A continuous 1-hour flight for a traffic-analytics company — bus arrivals and departures documented in 4K.',
  },
  {
    href: 'drone/proyecto-drone-puerto-manzanillo-monte-cristi',
    icon: '⚓',
    titleEs: 'Levantamiento Portuario — Manzanillo',
    titleEn: 'Port Survey — Manzanillo',
    descEs: 'Documentación aérea de operaciones de izaje pesado y logística marítima en el Puerto de Manzanillo, Monte Cristi.',
    descEn: 'Aerial documentation of heavy-lift operations and maritime logistics at Puerto de Manzanillo, Monte Cristi.',
  },
]

export default function DroneServicesPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const pageUrl = `${BASE_URL}/${locale}/${PAGE_SLUG}`

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Servicios' : 'Services', url: `${BASE_URL}/${locale}/services` },
    { name: isEs ? 'Servicios de Drone' : 'Drone Services', url: pageUrl },
  ])

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: isEs ? 'Servicios de Drone' : 'Drone Services',
    serviceType: isEs ? 'Fotografía y Video Aéreo con Drone' : 'Aerial Drone Photography & Video',
    description: isEs
      ? 'Servicios de drone en República Dominicana para bienes raíces, bodas, y proyectos industriales/comerciales — análisis de tráfico, levantamientos portuarios, y más.'
      : 'Drone services in the Dominican Republic for real estate, weddings, and industrial/commercial projects — traffic analytics, port surveys, and more.',
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#business`,
      name: 'Babula Shots',
      url: BASE_URL,
      telephone: CONTACT_INFO.phone,
    },
    areaServed: { '@type': 'Country', name: isEs ? 'República Dominicana' : 'Dominican Republic' },
    url: pageUrl,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <main className="min-h-screen bg-canvas text-ink">
        {/* ── Hero ── */}
        <section className="relative bg-canvas py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />
          <div className="relative container mx-auto px-4">
            <nav aria-label="breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                <li><Link href={`/${locale}`} className="hover:text-ink transition-colors">{isEs ? 'Inicio' : 'Home'}</Link></li>
                <li aria-hidden="true" className="text-ink-muted/50">›</li>
                <li><Link href={`/${locale}/services`} className="hover:text-ink transition-colors">{isEs ? 'Servicios' : 'Services'}</Link></li>
                <li aria-hidden="true" className="text-ink-muted/50">›</li>
                <li className="text-ink" aria-current="page">{isEs ? 'Drone' : 'Drone'}</li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <span className="inline-block font-mono uppercase tracking-widest text-[11px] text-sky-400 mb-4">
                {isEs ? 'Servicios de Drone' : 'Drone Services'}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {isEs ? 'Fotografía y Video Aéreo con Drone' : 'Aerial Drone Photography & Video'}
              </h1>
              <p className="text-xl text-ink-muted mb-8 max-w-3xl leading-relaxed">
                {isEs
                  ? 'Bienes raíces y bodas frente al mar, pero también proyectos industriales y comerciales reales — análisis de tráfico, levantamientos portuarios, documentación de infraestructura. Piloto certificado, 4K, cobertura en toda la isla.'
                  : 'Beachfront real estate and weddings, but also real industrial and commercial projects — traffic analytics, port surveys, infrastructure documentation. Certified pilot, 4K, island-wide coverage.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(isEs ? 'Hola, quisiera información sobre servicios de drone.' : 'Hi, I would like information about drone services.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  WhatsApp
                </a>
                <Link href={`/${locale}/get-quote?family=real-estate-drone-photography&cta=drone-hub-page`} className="btn-secondary">
                  {isEs ? 'Solicitar Cotización' : 'Request a Quote'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Hero image ── */}
        <section className="w-full bg-gray-950" aria-label={isEs ? 'Piloto de drone con licencia en República Dominicana' : 'Licensed drone pilot in the Dominican Republic'}>
          <figure className="w-full max-h-[65vh] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/dwewurxla/image/upload/v1776369513/republica_dominicana_piloto_con_drone_y_licencia_urk2n7.webp"
              alt={isEs
                ? 'Piloto de drone con licencia operando en República Dominicana — Babula Shots'
                : 'Licensed drone pilot operating in the Dominican Republic — Babula Shots'}
              className="w-full h-full object-cover object-center"
              loading="eager"
              width={1600}
              height={900}
            />
          </figure>
        </section>

        {/* ── Bienes Raíces y Drone intro ── */}
        <section className="py-20 bg-canvas">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {isEs ? 'Bienes Raíces y Drone' : 'Real Estate & Drone'}
              </h2>
              <p className="text-lg text-ink-muted leading-relaxed">
                {isEs
                  ? 'La producción con dron en República Dominicana necesita una mezcla de creatividad y disciplina operativa. Nuestro enfoque combina planificación de vuelo, seguridad, cumplimiento local y dirección visual para que hoteles, real estate y marcas reciban activos aéreos listos para vender mejor.'
                  : 'Drone production in the Dominican Republic needs a mix of creativity and operational discipline. Our approach combines flight planning, safety, local compliance, and visual direction so hotels, real estate, and brands receive aerial assets ready to sell better.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── Three cards ── */}
        <section className="py-20 bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isEs ? 'Nuestro Trabajo con Drone' : 'Our Drone Work'}
              </h2>
              <p className="text-ink-muted text-lg max-w-2xl mx-auto">
                {isEs
                  ? 'Desde marketing inmobiliario hasta datos aéreos para empresas de logística — cada proyecto es real, no una muestra.'
                  : 'From real estate marketing to aerial data for logistics companies — every project is real, not a sample.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {cards.map((card) => (
                <Link
                  key={card.href}
                  href={`/${locale}/${card.href}`}
                  className="group bg-gray-900 rounded-2xl p-8 border border-hairline-soft flex flex-col gap-4 transition-colors hover:border-sky-500/50"
                >
                  <div className="text-4xl">{card.icon}</div>
                  <h3 className="text-xl font-bold text-white">{isEs ? card.titleEs : card.titleEn}</h3>
                  <p className="text-ink-muted leading-relaxed flex-1">{isEs ? card.descEs : card.descEn}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 group-hover:underline underline-offset-4">
                    {isEs ? 'Ver más' : 'Learn more'} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why us ── */}
        <section className="py-20 bg-canvas">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: '🎓',
                  titleEs: 'Piloto Certificado',
                  titleEn: 'Certified Pilot',
                  descEs: 'Licenciado y asegurado para operar en sitios industriales, comerciales y residenciales.',
                  descEn: 'Licensed and insured to operate at industrial, commercial, and residential sites.',
                },
                {
                  icon: '📽️',
                  titleEs: 'Entrega en 4K',
                  titleEn: '4K Delivery',
                  descEs: 'Video raw y editado en alta resolución, listo para marketing o análisis técnico.',
                  descEn: 'Raw and edited high-resolution video, ready for marketing or technical analysis.',
                },
                {
                  icon: '🗺️',
                  titleEs: 'Cobertura Isla Completa',
                  titleEn: 'Island-Wide Coverage',
                  descEs: 'De Santo Domingo a Punta Cana, de Haina a Monte Cristi — viajamos donde el proyecto lo requiera.',
                  descEn: 'From Santo Domingo to Punta Cana, from Haina to Monte Cristi — we travel wherever the project needs us.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-900 rounded-xl p-6 border border-hairline-soft">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{isEs ? item.titleEs : item.titleEn}</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">{isEs ? item.descEs : item.descEn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-gray-950 border-t border-hairline-soft">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {isEs ? '¿Tienes un proyecto de drone en mente?' : 'Have a drone project in mind?'}
            </h2>
            <p className="text-xl text-ink-muted mb-8 max-w-2xl mx-auto">
              {isEs
                ? 'Bienes raíces, evento, o un proyecto industrial/comercial — escríbenos y armamos un plan.'
                : 'Real estate, an event, or an industrial/commercial project — message us and we\'ll put together a plan.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(isEs ? 'Hola, quisiera información sobre servicios de drone.' : 'Hi, I would like information about drone services.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold text-white transition-colors"
              >
                WhatsApp: {CONTACT_INFO.phone}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
