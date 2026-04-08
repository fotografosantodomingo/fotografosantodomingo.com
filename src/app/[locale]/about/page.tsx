import type { Metadata } from 'next'
import Link from 'next/link'
import { CONTACT_INFO, BOOKING_LINKS } from '@/lib/utils/constants'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Sobre Mí — Fotógrafo Santo Domingo | Babula Shots'
    : 'About — Photographer Santo Domingo | Babula Shots'
  const description = isEs
    ? 'Conoce a tu fotógrafo profesional en Santo Domingo. Más de 10 años de experiencia en bodas, retratos, eventos y fotografía drone en República Dominicana.'
    : 'Meet your professional photographer in Santo Domingo. Over 10 years of experience in weddings, portraits, events and drone photography in Dominican Republic.'
  return {
    title,
    description,
    keywords: isEs
      ? 'fotógrafo profesional santo domingo, Michal Babula fotógrafo, babula shots RD, fotógrafo con experiencia bodas, retratos ejecutivos santo domingo'
      : 'professional photographer santo domingo, Michal Babula photographer, babula shots DR, experienced wedding photographer, executive portraits santo domingo',
    alternates: {
      canonical: `${BASE_URL}/${locale}/about`,
      languages: { es: `${BASE_URL}/es/about`, en: `${BASE_URL}/en/about`, 'x-default': `${BASE_URL}/es/about` },
    },
    openGraph: {
      type: 'profile',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Sobre Mí — Fotógrafo Santo Domingo' : 'About — Photographer Santo Domingo',
      description,
      url: `${BASE_URL}/${locale}/about`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=Sobre+el+Fotógrafo&subtitle=Babula+Shots+·+Santo+Domingo`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Michal Babula — Fotógrafo Profesional Santo Domingo' : 'Michal Babula — Professional Photographer Santo Domingo',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Sobre Mí — Fotógrafo Santo Domingo' : 'About — Photographer Santo Domingo',
      description,
      images: [`${BASE_URL}/api/og?title=Sobre+el+Fotógrafo&subtitle=Babula+Shots`],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

export default function AboutPage({ params: { locale } }: Props) {
  const testimonials = [
    {
      name: 'Kasia Sosenko',
      role: locale === 'es' ? 'Cliente — Google Reviews' : 'Client — Google Reviews',
      content: locale === 'es'
        ? 'Gran ojo fotográfico y siempre con energía positiva. Fotografía europea con el temperamento latino.'
        : 'Great Eye, and always positive energy. European sense of photography with the Latin temper.',
      rating: 5,
    },
    {
      name: 'Alessio Dattola',
      role: locale === 'es' ? 'Cliente — Google Reviews' : 'Client — Google Reviews',
      content: locale === 'es'
        ? 'El mejor fotógrafo profesional que puedes encontrar en Santo Domingo. Su perspectiva única y atención al detalle son incomparables.'
        : 'The Best professional photographer You can find in Santo Domingo. His unique perspective and attention to detail are unmatched.',
      rating: 5,
    },
    {
      name: 'NET Z',
      role: locale === 'es' ? 'Cliente — Google Reviews' : 'Client — Google Reviews',
      content: locale === 'es'
        ? 'Babula Shots es muy profesional y puntual. Trabaja eficientemente en cada proyecto y es comunicativo de inicio a fin.'
        : 'Babula Shots is very professional and punctual. Works efficiently in every project and is communicative from start to finish.',
      rating: 5,
    },
  ]

  const achievements = [
    {
      number: '500+',
      label: locale === 'es' ? 'Bodas Fotografiadas' : 'Weddings Photographed',
      icon: '💍',
    },
    {
      number: '10+',
      label: locale === 'es' ? 'Años de Experiencia' : 'Years Experience',
      icon: '📅',
    },
    {
      number: '20+',
      label: locale === 'es' ? 'Ubicaciones Servidas' : 'Locations Served',
      icon: '📍',
    },
    {
      number: '4.9★',
      label: locale === 'es' ? '91 Reseñas en Google' : '91 Google Reviews',
      icon: '⭐',
    },
  ]

  const personSchema = schemaGenerators.person(locale)
  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: locale === 'es' ? 'Sobre Mí' : 'About', url: `${BASE_URL}/${locale}/about` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(personSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative bg-gray-950 py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {locale === 'es' ? 'Sobre Babula Shots' : 'About Babula Shots'}
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              {locale === 'es'
                ? 'Fotógrafo profesional especializado en capturar los momentos más importantes de tu vida con pasión y creatividad'
                : 'Professional photographer specialized in capturing the most important moments of your life with passion and creativity'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Story Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {locale === 'es' ? 'Mi Historia' : 'My Story'}
              </h2>
              <div className="space-y-6 text-gray-400 leading-relaxed">
                <p>
                  {locale === 'es'
                    ? 'Hola, soy Michal Babula — fotógrafo profesional con sede en la Zona Colonial de Santo Domingo. Llevo más de 10 años capturando historias auténticas con luz, emoción y detalle.'
                    : "Hi, I'm Michal Babula — professional photographer based in the Zona Colonial of Santo Domingo. For over 10 years I've been capturing authentic stories with light, emotion, and detail."
                  }
                </p>
                <p>
                  {locale === 'es'
                    ? 'Especializado en bodas, retratos, sesiones de estudio, fotografía corporativa y tomas aéreas con dron por toda República Dominicana. He trabajado en Punta Cana, Cap Cana, Casa de Campo, Santiago y más.'
                    : 'Specialized in weddings, portraits, studio sessions, corporate photography and aerial drone shots across the Dominican Republic. I have worked in Punta Cana, Cap Cana, Casa de Campo, Santiago and more.'
                  }
                </p>
                <p>
                  {locale === 'es'
                    ? 'Mi estilo combina la sensibilidad europea con la energía latina — una perspectiva única que mis clientes valoran. Trabajo con pasión, puntualidad y comunicación clara de inicio a fin.'
                    : 'My style blends European sensitivity with Latin energy — a unique perspective my clients value. I work with passion, punctuality and clear communication from start to finish.'
                  }
                </p>
                <p>
                  {locale === 'es'
                    ? 'Con más de 500 bodas fotografiadas, 91+ reseñas 5 estrellas en Google y clientes que regresan una y otra vez — me enorgullece ser tu fotógrafo de confianza en Santo Domingo.'
                    : 'With 500+ weddings photographed, 91+ five-star Google reviews and clients who return again and again — I am proud to be your trusted photographer in Santo Domingo.'
                  }
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href={`/${locale}/portfolio`}
                  className="btn-primary mr-4"
                >
                  {locale === 'es' ? 'Ver Mi Trabajo' : 'View My Work'}
                </Link>
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  {locale === 'es' ? 'Hablemos' : "Let's Talk"}
                </a>
              </div>
            </div>

            {/* Photographer Profile Card */}
            <div className="relative">
              {/* Main card — ready for headshot image */}
              <div className="aspect-square bg-gradient-to-br from-gray-900 via-primary-900 to-primary-700 rounded-2xl flex flex-col items-center justify-center shadow-xl text-white overflow-hidden">
                {/* Camera shutter decoration */}
                <div className="absolute inset-0 opacity-5">
                  <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
                    <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="2" fill="none"/>
                    <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="1.5" fill="none"/>
                    <circle cx="50" cy="50" r="15" fill="white" opacity="0.3"/>
                  </svg>
                </div>
                <div className="text-7xl mb-4">📷</div>
                <p className="text-2xl font-bold tracking-wide">Babula Shots</p>
                <p className="text-primary-300 text-sm mt-1 tracking-widest uppercase">
                  {locale === 'es' ? 'Fotógrafo Profesional' : 'Professional Photographer'}
                </p>
                <a
                  href="https://instagram.com/babulashotsrd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  @babulashotsrd
                </a>
              </div>
              {/* Rating badge */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 whitespace-nowrap">
                <span className="text-yellow-400 text-lg">⭐</span>
                <span className="font-bold text-white">4.9</span>
                <span className="text-gray-500 text-sm">· 162+ reseñas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === 'es' ? 'Logros y Experiencia' : 'Achievements & Experience'}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Más de una década capturando momentos inolvidables'
                : 'Over a decade capturing unforgettable moments'
              }
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{achievement.icon}</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-sky-400 mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-400 font-medium">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === 'es' ? 'Especialidades' : 'Specialties'}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Servicios especializados para cada tipo de ocasión'
                : 'Specialized services for every type of occasion'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: locale === 'es' ? 'Fotografía de Bodas' : 'Wedding Photography',
                description: locale === 'es'
                  ? 'Cobertura completa desde la preparación hasta el último baile'
                  : 'Full coverage from preparation to the last dance',
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
                title: locale === 'es' ? 'Fotografía con Dron' : 'Drone Photography',
                description: locale === 'es'
                  ? 'Perspectivas únicas desde el cielo con licencia FAA'
                  : 'Unique perspectives from the sky with FAA license',
                icon: '🚁',
              },
              {
                title: locale === 'es' ? 'Eventos Especiales' : 'Special Events',
                description: locale === 'es'
                  ? 'Bautizos, cumpleaños, aniversarios y celebraciones'
                  : 'Baptisms, birthdays, anniversaries, and celebrations',
                icon: '🎉',
              },
              {
                title: locale === 'es' ? 'Sesiones Familiares' : 'Family Sessions',
                description: locale === 'es'
                  ? 'Momentos naturales y auténticos con tu familia'
                  : 'Natural and authentic moments with your family',
                icon: '👨‍👩‍👧‍👦',
              },
              {
                title: locale === 'es' ? 'Fotografía Comercial' : 'Commercial Photography',
                description: locale === 'es'
                  ? 'Productos, alimentos, arquitectura y branding'
                  : 'Products, food, architecture, and branding',
                icon: '📸',
              },
            ].map((service, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-6 text-center border border-white/10 hover:border-sky-500/40 transition-colors duration-300">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-400">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-900 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === 'es' ? 'Lo que dicen mis clientes' : 'What my clients say'}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Historias de parejas, familias y empresas que confiaron en mí'
                : 'Stories from couples, families, and businesses who trusted me'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                <blockquote className="text-white mb-4 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-primary-200 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment & Approach */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Equipment */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {locale === 'es' ? 'Equipo Profesional' : 'Professional Equipment'}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📷</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Cámaras Profesionales</h3>
                    <p className="text-gray-400">Sony A7R series con lentes de alta calidad</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Iluminación Profesional</h3>
                    <p className="text-gray-400">Sistema de iluminación continuo y flash</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🚁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Dron Licenciado</h3>
                    <p className="text-gray-400">DJI con licencia FAA para fotografía aérea</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💻</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Post-producción</h3>
                    <p className="text-gray-400">Adobe Lightroom y Photoshop para edición profesional</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approach */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {locale === 'es' ? 'Mi Enfoque' : 'My Approach'}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {locale === 'es' ? 'Autenticidad' : 'Authenticity'}
                  </h3>
                  <p className="text-gray-400">
                    {locale === 'es'
                      ? 'Capturo momentos genuinos y emociones reales, no poses forzadas.'
                      : 'I capture genuine moments and real emotions, not forced poses.'
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {locale === 'es' ? 'Conexión Personal' : 'Personal Connection'}
                  </h3>
                  <p className="text-gray-400">
                    {locale === 'es'
                      ? 'Creo una relación de confianza para que te sientas cómodo durante la sesión.'
                      : 'I create a trusting relationship so you feel comfortable during the session.'
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {locale === 'es' ? 'Atención al Detalle' : 'Attention to Detail'}
                  </h3>
                  <p className="text-gray-400">
                    {locale === 'es'
                      ? 'Cada imagen es editada meticulosamente para resaltar lo mejor de cada momento.'
                      : 'Each image is meticulously edited to highlight the best of each moment.'
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {locale === 'es' ? 'Experiencia Local' : 'Local Experience'}
                  </h3>
                  <p className="text-gray-400">
                    {locale === 'es'
                      ? 'Conozco los mejores lugares de Santo Domingo y Punta Cana para sesiones inolvidables.'
                      : 'I know the best places in Santo Domingo and Punta Cana for unforgettable sessions.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'es' ? '¿Listo para trabajar juntos?' : 'Ready to work together?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {locale === 'es'
              ? 'Hablemos de tu proyecto fotográfico y creemos algo increíble juntos.'
              : "Let's talk about your photography project and create something amazing together."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={BOOKING_LINKS.setmore}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-600 hover:bg-sky-700 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              📅 {locale === 'es' ? 'Reservar Sesión' : 'Book a Session'}
            </a>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold transition-colors"
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