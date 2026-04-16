import type { Metadata } from 'next'
import Link from 'next/link'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'
import { getServiceCatalog } from '@/lib/services/catalog'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Servicios de Fotografía — Bodas, Drone, Retratos | Fotógrafo Santo Domingo'
    : 'Photography Services — Weddings, Drone, Portraits | Photographer Santo Domingo'
  const description = isEs
    ? 'Servicios de fotografía para bodas, retratos, drone, eventos, sesiones familiares y fotografía comercial en Santo Domingo y Punta Cana. Reserva tu sesión con Babula Shots.'
    : 'Wedding, portrait, drone, event, family, and commercial photography services in Santo Domingo and Punta Cana. Book your session with Babula Shots.'

  const ogTitle = isEs ? 'Servicios+de+Fotografía' : 'Photography+Services'
  const ogSubtitle = isEs
    ? 'Bodas+·+Drone+·+Retratos+·+Santo+Domingo'
    : 'Weddings+·+Drone+·+Portraits+·+Santo+Domingo'
  return {
    title,
    description,
    keywords: isEs
      ? 'servicios fotografia santo domingo, fotografo bodas RD, fotografia drone republica dominicana, retratos ejecutivos santo domingo, fotografia comercial punta cana'
      : 'photography services santo domingo, wedding photographer DR, drone photography dominican republic, executive portrait sessions, photography packages',
    alternates: {
      canonical: `${BASE_URL}/${locale}/services`,
      languages: { es: `${BASE_URL}/es/services`, en: `${BASE_URL}/en/services`, 'x-default': `${BASE_URL}/es/services` },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Servicios de Fotografía — Fotógrafo Santo Domingo' : 'Photography Services — Photographer Santo Domingo',
      description,
      url: `${BASE_URL}/${locale}/services`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=${ogTitle}&subtitle=${ogSubtitle}`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Servicios de Fotografía Santo Domingo — Babula Shots' : 'Photography Services Santo Domingo — Babula Shots',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Servicios de Fotografía — Fotógrafo Santo Domingo' : 'Photography Services — Photographer Santo Domingo',
      description,
      images: [`${BASE_URL}/api/og?title=${ogTitle}&subtitle=${ogSubtitle}`],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

export default async function ServicesPage({ params: { locale } }: Props) {
  const services = getServiceCatalog(locale)

  const serviceListSchema = schemaGenerators.serviceList(locale)
  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: locale === 'es' ? 'Servicios' : 'Services', url: `${BASE_URL}/${locale}/services` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(serviceListSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative bg-gray-950 py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {locale === 'es' ? 'Nuestros Servicios Fotográficos' : 'Our Photography Services'}
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              {locale === 'es'
                ? 'Fotografía profesional para cada momento especial de tu vida y negocio'
                : 'Professional photography for every special moment in your life and business'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/get-quote`} className="btn-primary">
                {locale === 'es' ? 'Solicitar Presupuesto' : 'Request a Quote'}
              </Link>
              <Link href={`/${locale}/portfolio`} className="btn-secondary">
                {locale === 'es' ? 'Ver Nuestro Trabajo' : 'View Our Work'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-10 rounded-2xl border border-amber-300/30 bg-gradient-to-r from-amber-400/10 via-orange-300/10 to-rose-300/10 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                  {locale === 'es' ? 'Nuevo servicio especializado' : 'New specialized service'}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                  {locale === 'es' ? 'Fotografo de Cumpleanos en Santo Domingo y Punta Cana' : 'Birthday Photographer in Santo Domingo and Punta Cana'}
                </h2>
                <p className="mt-2 text-gray-300">
                  {locale === 'es'
                    ? 'Cobertura para smash cake, cumpleanos en playa, estudio, fiestas infantiles y quinceaneras.'
                    : 'Coverage for smash cake, beach birthdays, studio sessions, kids parties, and quinceaneras.'}
                </p>
              </div>
              <Link href={`/${locale}/services/birthday-photographer`} className="inline-flex rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-gray-950 hover:bg-amber-300">
                {locale === 'es' ? 'Ver servicio de cumpleaños' : 'View birthday service'}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {services.map((service) => (
              <div
                key={service.id}
                id={`service-${service.id}`}
                className={`bg-gray-950 rounded-2xl border overflow-hidden hover:border-sky-500/40 transition-all duration-300 ${
                  service.popular ? 'border-sky-500 ring-1 ring-sky-500/50 relative' : 'border-white/10'
                }`}
              >
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-sky-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                    {locale === 'es' ? 'Más Popular' : 'Most Popular'}
                  </div>
                )}

                {/* Service Card Header */}
                <div className={`h-56 flex flex-col items-center justify-center relative overflow-hidden ${service.gradientClass}`}>
                  <div className="text-7xl mb-3 drop-shadow-lg">
                    {service.icon}
                  </div>
                  <span className="text-white/90 font-semibold text-sm tracking-widest uppercase">
                    {service.subtitle}
                  </span>
                </div>

                <div className="p-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sky-400 font-medium">
                      {service.subtitle}
                    </p>
                  </div>

                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-white mb-3">
                      {locale === 'es' ? 'Incluye:' : 'Includes:'}
                    </h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm text-gray-300">
                          <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-gray-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-sky-400">
                          {service.pricing.starting}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.pricing.includes}
                        </div>
                      </div>
                      <Link href={`/${locale}/get-quote`} className="btn-primary">
                        {locale === 'es' ? 'Cotizar' : 'Get Quote'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === 'es' ? 'Nuestro Proceso de Trabajo' : 'Our Work Process'}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Un proceso simple y transparente para resultados excepcionales'
                : 'A simple and transparent process for exceptional results'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: locale === 'es' ? 'Consulta Inicial' : 'Initial Consultation',
                description: locale === 'es'
                  ? 'Hablamos de tu visión y requerimientos específicos'
                  : 'We discuss your vision and specific requirements',
                icon: '💬',
              },
              {
                step: '02',
                title: locale === 'es' ? 'Planificación' : 'Planning',
                description: locale === 'es'
                  ? 'Coordinamos fechas, locaciones y detalles del proyecto'
                  : 'We coordinate dates, locations, and project details',
                icon: '📅',
              },
              {
                step: '03',
                title: locale === 'es' ? 'Sesión Fotográfica' : 'Photo Session',
                description: locale === 'es'
                  ? 'Capturamos los momentos con profesionalismo y creatividad'
                  : 'We capture the moments with professionalism and creativity',
                icon: '📸',
              },
              {
                step: '04',
                title: locale === 'es' ? 'Entrega Final' : 'Final Delivery',
                description: locale === 'es'
                  ? 'Recibes tus fotos editadas en alta resolución'
                  : 'You receive your edited photos in high resolution',
                icon: '✨',
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 border border-white/10">
                  <div className="text-sm font-bold text-sky-400 mb-2">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {locale === 'es' ? '¿Listo para comenzar tu proyecto?' : 'Ready to start your project?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-400">
            {locale === 'es'
              ? 'Contáctanos hoy para una consulta gratuita y comienza a planificar las fotos de tus sueños.'
              : 'Contact us today for a free consultation and start planning the photos of your dreams.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/get-quote`} className="bg-white text-gray-950 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {locale === 'es' ? 'Solicitar Presupuesto' : 'Request a Quote'}
            </Link>
            <Link href={`/${locale}/contact`} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
              {locale === 'es' ? 'Hablar con el equipo' : 'Talk to the team'}
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}