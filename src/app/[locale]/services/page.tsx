import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { CONTACT_INFO, BOOKING_LINKS } from '@/lib/utils/constants'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  return {
    title: isEs
      ? 'Servicios de Fotografía — Bodas, Drone, Retratos | Fotógrafo Santo Domingo'
      : 'Photography Services — Weddings, Drone, Portraits | Photographer Santo Domingo',
    description: isEs
      ? 'Servicios profesionales de fotografía en Santo Domingo: bodas, pre-boda, quinceañeras, retratos, moda, drone, eventos corporativos. Cotiza tu sesión hoy.'
      : 'Professional photography services in Santo Domingo: weddings, pre-wedding, portraits, fashion, drone, corporate events. Get a quote today.',
    alternates: {
      canonical: `${BASE_URL}/${locale}/services`,
      languages: { es: `${BASE_URL}/es/services`, en: `${BASE_URL}/en/services`, 'x-default': `${BASE_URL}/es/services` },
    },
    openGraph: {
      title: isEs ? 'Servicios de Fotografía — Fotógrafo Santo Domingo' : 'Photography Services — Photographer Santo Domingo',
      url: `${BASE_URL}/${locale}/services`,
      images: [{ url: `${BASE_URL}/api/og?title=Servicios+de+Fotografía&subtitle=Bodas+·+Drone+·+Retratos+·+Santo+Domingo`, width: 1200, height: 630 }],
    },
  }
}

export default async function ServicesPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'services' })

  const services = [
    {
      id: 'wedding',
      title: locale === 'es' ? 'Fotografía de Bodas' : 'Wedding Photography',
      subtitle: locale === 'es' ? 'El día más importante de tu vida' : 'Your most important day',
      description: locale === 'es'
        ? 'Capturamos cada momento mágico de tu boda con estilo artístico y atención al detalle. Desde la preparación hasta el último baile, documentamos la historia de amor única de tu pareja.'
        : 'We capture every magical moment of your wedding with artistic style and attention to detail. From preparation to the last dance, we document your couple\'s unique love story.',
      features: [
        locale === 'es' ? 'Cobertura completa del día de la boda' : 'Full wedding day coverage',
        locale === 'es' ? 'Sesión de compromiso incluida' : 'Engagement session included',
        locale === 'es' ? 'Álbum profesional de alta calidad' : 'Professional high-quality album',
        locale === 'es' ? 'Todas las fotos editadas en alta resolución' : 'All photos edited in high resolution',
        locale === 'es' ? 'Galería online privada para compartir' : 'Private online gallery for sharing',
        locale === 'es' ? 'Impresiones de regalo' : 'Complimentary prints',
      ],
      pricing: {
        starting: locale === 'es' ? 'Desde $2,500' : 'Starting at $2,500',
        includes: locale === 'es' ? '8 horas de cobertura + edición completa' : '8 hours coverage + full editing',
      },
      image: 'wedding-hero',
      popular: true,
    },
    {
      id: 'portrait',
      title: locale === 'es' ? 'Retratos Corporativos' : 'Corporate Portraits',
      subtitle: locale === 'es' ? 'Profesionalismo y elegancia' : 'Professionalism and elegance',
      description: locale === 'es'
        ? 'Fotografía ejecutiva y corporativa que refleja la personalidad y profesionalismo de tu marca. Ideal para LinkedIn, sitios web corporativos y material de marketing.'
        : 'Executive and corporate photography that reflects your brand\'s personality and professionalism. Perfect for LinkedIn, corporate websites, and marketing materials.',
      features: [
        locale === 'es' ? 'Sesión en estudio o ubicación personalizada' : 'Studio session or custom location',
        locale === 'es' ? 'Múltiples looks y estilos' : 'Multiple looks and styles',
        locale === 'es' ? 'Edición profesional para redes sociales' : 'Professional editing for social media',
        locale === 'es' ? 'Entrega rápida (24-48 horas)' : 'Fast delivery (24-48 hours)',
        locale === 'es' ? 'Uso comercial autorizado' : 'Authorized commercial use',
        locale === 'es' ? 'Archivos en alta resolución' : 'High-resolution files',
      ],
      pricing: {
        starting: locale === 'es' ? 'Desde $150' : 'Starting at $150',
        includes: locale === 'es' ? 'Por sesión individual' : 'Per individual session',
      },
      image: 'corporate-portrait',
    },
    {
      id: 'drone',
      title: locale === 'es' ? 'Fotografía con Dron' : 'Drone Photography',
      subtitle: locale === 'es' ? 'Perspectivas únicas desde el cielo' : 'Unique perspectives from the sky',
      description: locale === 'es'
        ? 'Capturamos vistas aéreas espectaculares para bodas, eventos corporativos, propiedades inmobiliarias y proyectos comerciales. Licencia FAA certificada.'
        : 'We capture spectacular aerial views for weddings, corporate events, real estate properties, and commercial projects. FAA certified license.',
      features: [
        locale === 'es' ? 'Licencia FAA certificada' : 'FAA certified license',
        locale === 'es' ? 'Cobertura de hasta 500 acres' : 'Coverage up to 500 acres',
        locale === 'es' ? 'Video 4K y fotos de alta resolución' : '4K video and high-resolution photos',
        locale === 'es' ? 'Edición profesional incluida' : 'Professional editing included',
        locale === 'es' ? 'Entrega digital completa' : 'Complete digital delivery',
        locale === 'es' ? 'Permisos legales gestionados' : 'Legal permissions managed',
      ],
      pricing: {
        starting: locale === 'es' ? 'Desde $500' : 'Starting at $500',
        includes: locale === 'es' ? 'Por ubicación + edición' : 'Per location + editing',
      },
      image: 'drone-aerial',
    },
    {
      id: 'event',
      title: locale === 'es' ? 'Fotografía de Eventos' : 'Event Photography',
      subtitle: locale === 'es' ? 'Capturamos el ambiente y la energía' : 'We capture the atmosphere and energy',
      description: locale === 'es'
        ? 'Documentación completa de eventos corporativos, fiestas privadas, bautizos, cumpleaños y celebraciones especiales. Capturamos no solo las personas, sino también el ambiente único de tu evento.'
        : 'Complete documentation of corporate events, private parties, baptisms, birthdays, and special celebrations. We capture not only the people, but also the unique atmosphere of your event.',
      features: [
        locale === 'es' ? 'Cobertura completa del evento' : 'Full event coverage',
        locale === 'es' ? 'Entrega el mismo día (opción express)' : 'Same-day delivery (express option)',
        locale === 'es' ? 'Galería online para invitados' : 'Online gallery for guests',
        locale === 'es' ? 'Fotos grupales organizadas' : 'Organized group photos',
        locale === 'es' ? 'Edición de color y estilo consistente' : 'Consistent color and style editing',
        locale === 'es' ? 'Paquete de impresiones disponible' : 'Print package available',
      ],
      pricing: {
        starting: locale === 'es' ? 'Desde $300' : 'Starting at $300',
        includes: locale === 'es' ? 'Por hora de cobertura' : 'Per hour of coverage',
      },
      image: 'event-coverage',
    },
    {
      id: 'family',
      title: locale === 'es' ? 'Sesiones Familiares' : 'Family Sessions',
      subtitle: locale === 'es' ? 'Momentos preciosos para toda la vida' : 'Precious moments for life',
      description: locale === 'es'
        ? 'Sesiones fotográficas familiares naturales y divertidas. Capturamos la esencia de tu familia en locaciones hermosas alrededor de Santo Domingo y Punta Cana.'
        : 'Natural and fun family photography sessions. We capture the essence of your family in beautiful locations around Santo Domingo and Punta Cana.',
      features: [
        locale === 'es' ? 'Sesión de 1-2 horas en locación' : '1-2 hour session on location',
        locale === 'es' ? 'Hasta 10 personas incluidas' : 'Up to 10 people included',
        locale === 'es' ? 'Múltiples locaciones disponibles' : 'Multiple locations available',
        locale === 'es' ? 'Álbum familiar personalizado' : 'Custom family album',
        locale === 'es' ? 'Fotos en alta resolución' : 'High-resolution photos',
        locale === 'es' ? 'Sesión de recién nacido disponible' : 'Newborn session available',
      ],
      pricing: {
        starting: locale === 'es' ? 'Desde $200' : 'Starting at $200',
        includes: locale === 'es' ? 'Sesión + 20 fotos editadas' : 'Session + 20 edited photos',
      },
      image: 'family-session',
    },
    {
      id: 'commercial',
      title: locale === 'es' ? 'Fotografía Comercial' : 'Commercial Photography',
      subtitle: locale === 'es' ? 'Para negocios y marcas' : 'For businesses and brands',
      description: locale === 'es'
        ? 'Fotografía publicitaria y comercial para restaurantes, hoteles, productos, arquitectura y branding. Creamos imágenes que venden y conectan con tu audiencia.'
        : 'Advertising and commercial photography for restaurants, hotels, products, architecture, and branding. We create images that sell and connect with your audience.',
      features: [
        locale === 'es' ? 'Fotografía de productos y alimentos' : 'Product and food photography',
        locale === 'es' ? 'Arquitectura e inmuebles' : 'Architecture and real estate',
        locale === 'es' ? 'Branding y marketing visual' : 'Branding and visual marketing',
        locale === 'es' ? 'Estudio profesional equipado' : 'Professional equipped studio',
        locale === 'es' ? 'Derechos de uso comercial' : 'Commercial usage rights',
        locale === 'es' ? 'Entrega rápida para deadlines' : 'Fast delivery for deadlines',
      ],
      pricing: {
        starting: locale === 'es' ? 'Desde $250' : 'Starting at $250',
        includes: locale === 'es' ? 'Por hora + edición' : 'Per hour + editing',
      },
      image: 'commercial-product',
    },
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {locale === 'es' ? 'Nuestros Servicios Fotográficos' : 'Our Photography Services'}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {locale === 'es'
                ? 'Fotografía profesional para cada momento especial de tu vida y negocio'
                : 'Professional photography for every special moment in your life and business'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={BOOKING_LINKS.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                {locale === 'es' ? 'Reservar Consulta Gratuita' : 'Book Free Consultation'}
              </a>
              <Link href={`/${locale}/portfolio`} className="btn-secondary">
                {locale === 'es' ? 'Ver Nuestro Trabajo' : 'View Our Work'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                  service.popular ? 'ring-2 ring-primary-500 relative' : ''
                }`}
              >
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {locale === 'es' ? 'Más Popular' : 'Most Popular'}
                  </div>
                )}

                {/* Service Image Placeholder */}
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-6xl opacity-20">
                    {service.id === 'wedding' && '💍'}
                    {service.id === 'portrait' && '👔'}
                    {service.id === 'drone' && '🚁'}
                    {service.id === 'event' && '🎉'}
                    {service.id === 'family' && '👨‍👩‍👧‍👦'}
                    {service.id === 'commercial' && '📸'}
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-primary-600 font-medium">
                      {service.subtitle}
                    </p>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {locale === 'es' ? 'Incluye:' : 'Includes:'}
                    </h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm text-gray-600">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary-600">
                          {service.pricing.starting}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.pricing.includes}
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(
                          locale === 'es'
                            ? `Hola! Me interesa información sobre ${service.title}`
                            : `Hello! I'm interested in information about ${service.title}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        {locale === 'es' ? 'Cotizar' : 'Get Quote'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'es' ? 'Nuestro Proceso de Trabajo' : 'Our Work Process'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                <div className="relative">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-primary-200" style={{ width: 'calc(100vw / 4 - 5rem)' }} />
                  )}
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-sm font-bold text-primary-600 mb-2">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'es' ? '¿Listo para comenzar tu proyecto?' : 'Ready to start your project?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {locale === 'es'
              ? 'Contáctanos hoy para una consulta gratuita y comienza a planificar las fotos de tus sueños.'
              : 'Contact us today for a free consultation and start planning the photos of your dreams.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              WhatsApp: {CONTACT_INFO.phone}
            </a>
            <a
              href={BOOKING_LINKS.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {locale === 'es' ? 'Agendar Consulta' : 'Schedule Consultation'}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}