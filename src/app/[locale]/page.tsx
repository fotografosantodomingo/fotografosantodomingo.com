import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { CONTACT_INFO, BOOKING_LINKS } from '@/lib/utils/constants'
import HomeFaq, { getFaqData } from '@/components/HomeFaq'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  return {
    title: isEs
      ? 'Fotógrafo Santo Domingo — Bodas, Retratos & Drone | Babula Shots'
      : 'Photographer Santo Domingo — Weddings, Portraits & Drone | Babula Shots',
    description: isEs
      ? 'Fotógrafo profesional en Santo Domingo especializado en bodas, sesiones pre-boda, quinceañeras, retratos y drone. Cubrimos Punta Cana y toda la República Dominicana.'
      : 'Professional photographer in Santo Domingo specializing in weddings, portraits and drone photography. Serving Punta Cana and all of Dominican Republic.',
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        es: `${BASE_URL}/es`,
        en: `${BASE_URL}/en`,
        'x-default': `${BASE_URL}/es`,
      },
    },
    openGraph: {
      title: isEs ? 'Fotógrafo Santo Domingo — Babula Shots' : 'Photographer Santo Domingo — Babula Shots',
      description: isEs
        ? 'Fotografía profesional de bodas, retratos y eventos en Santo Domingo, República Dominicana.'
        : 'Professional wedding, portrait and event photography in Santo Domingo, Dominican Republic.',
      url: `${BASE_URL}/${locale}/`,
      images: [{ url: `${BASE_URL}/api/og`, width: 1200, height: 630 }],
    },
  }
}

export default async function HomePage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'hero' })

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t('title_main')}{' '}
              <span className="text-primary-600 relative">
                {t('title_highlight')}
                {/* Decorative underline */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-primary-200"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,0 Q50,12 100,0"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              {t('subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href={`/${locale}/portfolio`}
                className="btn-primary text-lg px-8 py-4"
              >
                {t('cta_primary')}
              </Link>
              <a
                href={BOOKING_LINKS.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-lg px-8 py-4"
              >
                {t('cta_secondary')}
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {t('stats_weddings')}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">
                  {locale === 'es' ? 'Bodas Cubiertas' : 'Weddings Covered'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {t('stats_years')}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">
                  {locale === 'es' ? 'Años de Experiencia' : 'Years Experience'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {t('stats_locations')}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">
                  {locale === 'es' ? 'Ubicaciones' : 'Locations Served'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {t('stats_reviews')}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">
                  Google Reviews
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'es' ? 'Nuestros Servicios' : 'Our Services'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Fotografía profesional para cada momento especial de tu vida'
                : 'Professional photography for every special moment in your life'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: locale === 'es' ? 'Fotografía de Bodas' : 'Wedding Photography',
                description: locale === 'es'
                  ? 'Capturamos los momentos más importantes de tu día especial'
                  : 'We capture the most important moments of your special day',
                icon: '💍',
              },
              {
                title: locale === 'es' ? 'Retratos Corporativos' : 'Corporate Portraits',
                description: locale === 'es'
                  ? 'Imágenes profesionales para tu marca personal o empresa'
                  : 'Professional images for your personal brand or company',
                icon: '👔',
              },
              {
                title: locale === 'es' ? 'Drones & Aéreos' : 'Drone & Aerial',
                description: locale === 'es'
                  ? 'Perspectivas únicas desde el cielo para eventos y propiedades'
                  : 'Unique perspectives from the sky for events and properties',
                icon: '🚁',
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {service.description}
                </p>
                <Link
                  href={`/${locale}/services`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {locale === 'es' ? 'Ver Más' : 'Learn More'} →
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href={`/${locale}/services`}
              className="btn-primary"
            >
              {locale === 'es' ? 'Ver Todos los Servicios' : 'View All Services'}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'es' ? '¿Listo para capturar tus momentos?' : 'Ready to capture your moments?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {locale === 'es'
              ? 'Contáctanos hoy para discutir tu proyecto fotográfico y obtener una cotización personalizada.'
              : 'Contact us today to discuss your photography project and get a personalized quote.'
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
            <Link
              href={`/${locale}/contact`}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {locale === 'es' ? 'Enviar Mensaje' : 'Send Message'}
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Instagram icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white mb-6 shadow-lg">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'es' ? 'Sigue nuestra historia' : 'Follow our story'}
            </h2>
            <p className="text-xl text-gray-500 mb-2">@babulashotsrd</p>
            <p className="text-gray-600 mb-8">
              {locale === 'es'
                ? 'Detrás de cámaras, bodas, retratos y los mejores momentos de la República Dominicana.'
                : 'Behind the scenes, weddings, portraits and the best moments from the Dominican Republic.'
              }
            </p>
            <a
              href="https://instagram.com/babulashotsrd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold text-lg px-8 py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              {locale === 'es' ? 'Ver en Instagram' : 'Follow on Instagram'}
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <HomeFaq locale={locale} />

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: getFaqData(locale).map(item => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />

      {/* Quick Booking CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {locale === 'es' ? '¿Listo para reservar?' : 'Ready to book?'}
              </h2>
              <p className="text-gray-300">
                {locale === 'es' ? 'Confirma tu fecha en minutos.' : 'Confirm your date in minutes.'}
              </p>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <a
                href={`https://babulashotsrd.setmore.com/reserva`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-500 hover:bg-primary-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                📅 {locale === 'es' ? 'Reservar Sesión' : 'Book a Session'}
              </a>
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent('Hola! Quiero reservar una sesión fotográfica.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}