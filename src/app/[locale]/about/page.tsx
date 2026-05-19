import type { Metadata } from 'next'
import Link from 'next/link'
import { CONTACT_INFO, BOOKING_LINKS } from '@/lib/utils/constants'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'
import { getReviewStats } from '@/lib/supabase/images'

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
    ? 'Conoce a Michal Babula, fotógrafo profesional en Santo Domingo desde 2015. Más de 500 clientes satisfech@s en bodas, retratos, drone y eventos por toda República Dominicana.'
    : 'Meet Michal Babula — professional photographer in Santo Domingo since 2015. Over 500 satisfied clients across weddings, portraits, drone, and events throughout the Dominican Republic.'
  return {
    title,
    description,
    keywords: isEs
      ? 'fotógrafo profesional santo domingo, Michal Babula fotógrafo, fotógrafo con experiencia en bodas, retratos ejecutivos santo domingo, fotógrafo dominicana'
      : 'professional photographer santo domingo, Michal Babula photographer, experienced wedding photographer, executive portraits santo domingo, dominican republic photographer',
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

export default async function AboutPage({ params: { locale } }: Props) {
  const reviewStats = await getReviewStats()
  const ratingValueDisplay = reviewStats.rating_value.toFixed(1)
  const reviewCountDisplay = reviewStats.review_count.toString()
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
      label: locale === 'es' ? 'Clientes satisfech@s' : 'Satisfied Clients',
      icon: '🤝',
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
      number: `${ratingValueDisplay}★`,
      label: locale === 'es' ? `${reviewCountDisplay} Reseñas verificadas` : `${reviewCountDisplay} Verified Reviews`,
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
      <main className="min-h-screen bg-canvas text-ink">
      {/* Hero Section */}
      <section className="relative bg-canvas py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {locale === 'es' ? 'Sobre Babula Shots' : 'About Babula Shots'}
            </h1>
            <p className="text-xl text-ink-muted mb-8">
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
              <div className="space-y-6 text-ink-muted leading-relaxed">
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
                    ? `Con más de 500 clientes satisfech@s, ${reviewCountDisplay}+ reseñas verificadas y clientes que regresan una y otra vez — me enorgullece ser tu fotógrafo de confianza en Santo Domingo.`
                    : `With 500+ satisfied clients, ${reviewCountDisplay}+ verified reviews and clients who return again and again — I am proud to be your trusted photographer in Santo Domingo.`
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
              {/* Main card */}
              <div className="aspect-square rounded-2xl shadow-xl overflow-hidden">
                <img
                  src="/images/babula-shots-michal-babula-fotografo-profesional.webp"
                  alt={locale === 'es' ? 'Michal Babula — Fotógrafo Profesional Santo Domingo' : 'Michal Babula — Professional Photographer Santo Domingo'}
                  className="w-full h-full object-cover"
                  loading="eager"
                  width={600}
                  height={600}
                />
              </div>
              {/* Rating badge */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 border border-hairline-soft rounded-full px-4 py-2 flex items-center gap-2 whitespace-nowrap">
                <span className="text-yellow-400 text-lg">⭐</span>
                <span className="font-bold text-white">4.9</span>
                <span className="text-ink-muted text-sm">· {reviewCountDisplay}+ {locale === 'es' ? 'reseñas' : 'reviews'}</span>
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
            <p className="text-xl text-ink-muted max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Más de una década capturando momentos inolvidables'
                : 'Over a decade capturing unforgettable moments'
              }
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-ink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{achievement.icon}</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-ink mb-2">
                  {achievement.number}
                </div>
                <div className="text-ink-muted font-medium">
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
            <p className="text-xl text-ink-muted max-w-2xl mx-auto">
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
              <div key={index} className="bg-gray-900 rounded-xl p-6 text-center border border-hairline-soft hover:border-hairline transition-colors duration-300">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-ink-muted">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-canvas border-t border-hairline-soft">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === 'es' ? 'Lo que dicen mis clientes' : 'What my clients say'}
            </h2>
            <p className="text-xl text-ink-muted max-w-2xl mx-auto">
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
                  <div className="w-12 h-12 bg-ink/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📷</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Cámaras Profesionales</h3>
                    <p className="text-ink-muted">Canon R5</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ink/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Iluminación Profesional</h3>
                    <p className="text-ink-muted">Sistema de iluminación continuo y flash</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ink/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🚁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Dron Licenciado</h3>
                    <p className="text-ink-muted">DJI Mavic 3 Pro</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ink/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💻</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Post-producción</h3>
                    <p className="text-ink-muted">Adobe Lightroom y Photoshop para edición profesional</p>
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
                  <p className="text-ink-muted">
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
                  <p className="text-ink-muted">
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
                  <p className="text-ink-muted">
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
                  <p className="text-ink-muted">
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