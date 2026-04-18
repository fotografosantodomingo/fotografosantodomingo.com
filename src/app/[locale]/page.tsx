import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { CONTACT_INFO } from '@/lib/utils/constants'
import HomeFaq from '@/components/HomeFaq'
import { getFaqData } from '@/lib/faq-data'
import { getPortfolioImages, getReviewStats } from '@/lib/supabase/images'
import CloudinaryImage from '@/components/CloudinaryImage'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  return {
    title: isEs
      ? 'Fotógrafo en Santo Domingo, República Dominicana | Sesión de Fotos — Babula Shots'
      : 'Photographer in Santo Domingo, Dominican Republic | Photo Session — Babula Shots',
    description: isEs
      ? 'Fotógrafo profesional en Santo Domingo, República Dominicana para sesión de fotos, bodas, retratos, eventos y drone. Reserva tu sesión personalizada en RD.'
      : 'Professional photographer in Santo Domingo, Dominican Republic for photo sessions, weddings, portraits, events, and drone. Book your custom session in DR.',
    keywords: isEs
      ? 'fotografo en santo domingo republica dominicana, sesion de fotos en santo domingo, fotografo profesional en republica dominicana, fotografo para eventos santo domingo, babula shots'
      : 'photographer in santo domingo dominican republic, photo session santo domingo, professional photographer dominican republic, event photographer santo domingo, babula shots',
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        es: `${BASE_URL}/es`,
        en: `${BASE_URL}/en`,
        'x-default': `${BASE_URL}/es`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Fotógrafo Santo Domingo — Babula Shots' : 'Photographer Santo Domingo — Babula Shots',
      description: isEs
        ? 'Fotografía profesional de bodas, retratos y eventos en Santo Domingo, República Dominicana.'
        : 'Professional wedding, portrait and event photography in Santo Domingo, Dominican Republic.',
      url: `${BASE_URL}/${locale}`,
      images: [{ url: `${BASE_URL}/api/og`, width: 1200, height: 630, alt: isEs ? 'Fotógrafo Santo Domingo — Babula Shots' : 'Photographer Santo Domingo — Babula Shots' }],
      locale: isEs ? 'es_DO' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Fotógrafo Santo Domingo — Babula Shots' : 'Photographer Santo Domingo — Babula Shots',
      description: isEs
        ? 'Fotografía profesional de bodas, retratos y eventos en Santo Domingo, República Dominicana.'
        : 'Professional wedding, portrait and event photography in Santo Domingo, Dominican Republic.',
      images: [`${BASE_URL}/api/og`],
    },
    ...(isEs
      ? {
          other: {
            'p:domain_verify': '56a531ff79ed1871bf40b084b8df668f',
          },
        }
      : {}),
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

export default async function HomePage({ params: { locale } }: Props) {
  const [t, allImages, reviewStats] = await Promise.all([
    getTranslations({ locale, namespace: 'hero' }),
    getPortfolioImages(),
    getReviewStats(),
  ])

  const isEs = locale === 'es'
  const previewImages = allImages.slice(0, 6)

  // ── JSON-LD schemas ──
  const localBusinessSchema = schemaGenerators.localBusinessWithRating(reviewStats)
  const testimonials = [
    {
      name: 'Kasia Sosenko',
      role: isEs ? 'Cliente — Google Reviews' : 'Client — Google Reviews',
      text: isEs
        ? 'Gran ojo fotográfico y siempre con energía positiva. Fotografía europea con el temperamento latino.'
        : 'Great Eye, and always positive energy. European sense of photography with the Latin temper.',
      rating: 5,
    },
    {
      name: 'Alessio Dattola',
      role: isEs ? 'Cliente — Google Reviews' : 'Client — Google Reviews',
      text: isEs
        ? 'El mejor fotógrafo profesional que puedes encontrar en Santo Domingo. Su perspectiva única y atención al detalle son incomparables.'
        : 'The best professional photographer you can find in Santo Domingo. His unique perspective and attention to detail are unmatched.',
      rating: 5,
    },
    {
      name: 'NET Z',
      role: isEs ? 'Cliente — Google Reviews' : 'Client — Google Reviews',
      text: isEs
        ? 'Babula Shots es muy profesional y puntual. Trabaja eficientemente en cada proyecto y es comunicativo de inicio a fin.'
        : 'Babula Shots is very professional and punctual. Works efficiently in every project and is communicative from start to finish.',
      rating: 5,
    },
  ]

  const services = [
    {
      slug: 'wedding',
      title: isEs ? 'Bodas & Pre-bodas' : 'Weddings & Pre-wedding',
      desc: isEs ? 'Cobertura completa del día más importante de tu vida.' : 'Full coverage of the most important day of your life.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      slug: 'portrait',
      title: isEs ? 'Retratos & Corporativos' : 'Portraits & Corporate',
      desc: isEs ? 'Sesiones ejecutivas, familiares y de moda con luz profésional.' : 'Executive, family and fashion sessions with professional light.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      slug: 'drone',
      title: isEs ? 'Drone & Aéreo' : 'Drone & Aerial',
      desc: isEs ? 'Perspectivas únicas desde el cielo para eventos y propiedades.' : 'Unique sky-high perspectives for events and real estate.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
    },
    {
      slug: 'quinceañera',
      title: isEs ? 'Quinceañeras' : 'Quinceañeras',
      desc: isEs ? 'Celebra los 15 años con una sesión de película.' : 'Celebrate the 15th birthday with a cinematic session.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
    },
    {
      slug: 'commercial',
      title: isEs ? 'Comercial & Producto' : 'Commercial & Product',
      desc: isEs ? 'Fotografía para marcas, restaurantes, hoteles y comercios.' : 'Photography for brands, restaurants, hotels and businesses.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
        </svg>
      ),
    },
    {
      slug: 'event',
      title: isEs ? 'Eventos & Celebraciones' : 'Events & Celebrations',
      desc: isEs ? 'Cumpleaños, bautizos, graduaciones y eventos corporativos.' : 'Birthdays, baptisms, graduations and corporate events.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-screen bg-gray-950 pt-0 md:pt-24 pb-20 lg:pt-32 lg:pb-28 flex items-start lg:items-center">
        <Image
          src="https://res.cloudinary.com/dwewurxla/image/upload/v1776527725/Photographer_In_Santo_Domingo_Dominican_Republic_ienr6u.webp"
          alt={isEs
            ? 'Fotógrafo en Santo Domingo República Dominicana en sesión de fotos profesional'
            : 'Photographer in Santo Domingo Dominican Republic during a professional photo session'}
          fill
          priority
          sizes="100vw"
          className="hidden md:block object-cover object-center md:brightness-110"
        />
        <div className="absolute inset-0 hidden md:block bg-gray-950/30" />
        <div className="absolute inset-0 hidden md:block bg-gradient-to-b from-black/22 via-black/12 to-black/32" />

        <div className="relative container mx-auto px-4 text-center">
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-8 md:hidden">
            <div className="relative w-full aspect-[16/9]">
              <Image
                src="https://res.cloudinary.com/dwewurxla/image/upload/v1776527725/Photographer_In_Santo_Domingo_Dominican_Republic_ienr6u.webp"
                alt={isEs
                  ? 'Fotógrafo en Santo Domingo República Dominicana en sesión de fotos profesional'
                  : 'Photographer in Santo Domingo Dominican Republic during a professional photo session'}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* badge */}
          <div className="inline-flex items-center gap-2 bg-black/35 border border-white/25 rounded-full px-4 py-1.5 text-sm text-white mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {isEs ? 'Disponible para nuevas reservas · Santo Domingo, RD' : 'Available for new bookings · Santo Domingo, DR'}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white">
            {t('title_main')}{' '}
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              {t('title_highlight')}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white mb-10 leading-relaxed max-w-3xl mx-auto">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href={`/${locale}/portfolio`}
              className="bg-sky-500 hover:bg-sky-400 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              {t('cta_primary')}
            </Link>
            <Link
              href={`/${locale}/get-quote`}
              className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              {t('cta_secondary')}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { value: t('stats_weddings'), label: isEs ? 'Clientes satisfech@s' : 'Satisfied clients' },
              { value: t('stats_years'),    label: isEs ? 'Años de experiencia' : 'Years experience' },
              { value: t('stats_locations'),label: isEs ? 'Ubicaciones' : 'Locations served' },
              { value: t('stats_reviews'),  label: isEs ? '91 reseñas en Google' : '91 Google reviews' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-black/35 rounded-2xl p-4 border border-white/20 backdrop-blur-[1px]">
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-xs text-white uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO PREVIEW ── */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {isEs ? 'Nuestro Trabajo' : 'Our Work'}
            </h2>
            <p className="text-gray-400 text-lg">
              {isEs ? 'Algunos momentos recientes del lente de Michal Babula' : 'Some recent moments through Michal Babula\'s lens'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {previewImages.map((img, i) => (
              <Link
                key={img.id}
                href={`/${locale}/portfolio`}
                className="group relative overflow-hidden rounded-xl bg-gray-800"
              >
                <CloudinaryImage
                  publicId={img.public_id}
                  alt={isEs ? img.alt_es : img.alt_en}
                  title={isEs ? img.title_es : img.title_en}
                  width={img.width || 1200}
                  height={img.height || 800}
                  className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                  priority={i < 2}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 rounded-xl" />
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href={`/${locale}/portfolio`}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              {isEs ? 'Ver portafolio completo' : 'View full portfolio'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {isEs ? 'Servicios' : 'Services'}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {isEs
                ? 'Fotografía profesional para cada momento especial, en Santo Domingo y toda República Dominicana.'
                : 'Professional photography for every special moment, in Santo Domingo and all of Dominican Republic.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => (
              <Link
                key={svc.slug}
                href={`/${locale}/services`}
                className="group flex flex-col gap-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-sky-500/50 rounded-2xl p-6 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                  {svc.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">{svc.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{svc.desc}</p>
                </div>
                <span className="text-sky-400 text-sm font-medium mt-auto">
                  {isEs ? 'Ver detalles →' : 'Learn more →'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-yellow-400">4.9</span>
              <div className="flex text-yellow-400">{'★★★★★'}</div>
              <span className="text-gray-400 text-sm">(91 {isEs ? 'reseñas' : 'reviews'})</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              {isEs ? 'Lo que dicen nuestros clientes' : 'What our clients say'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-950 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex text-yellow-400 text-lg">{'★'.repeat(t.rating)}</div>
                <p className="text-gray-300 leading-relaxed flex-1">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://g.page/r/babulashots/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-700 hover:border-sky-500 text-gray-300 hover:text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.96 5.96 0 014.162 1.632l2.884-2.884A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748L12.545 10.24z"/>
              </svg>
              {isEs ? 'Dejar una reseña en Google' : 'Leave a Google review'}
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <HomeFaq locale={locale} />

      {/* LocalBusiness JSON-LD — triggers star ratings in Google search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLd(localBusinessSchema)}
      />

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
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }),
        }}
      />

      {/* Review JSON-LD — testimonials as structured reviews */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: testimonials.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Review',
                itemReviewed: { '@type': 'LocalBusiness', '@id': `${BASE_URL}/#business` },
                author: { '@type': 'Person', name: t.name },
                reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 },
                reviewBody: t.text,
              },
            })),
          }),
        }}
      />
      {/* ── BOOKING CTA ── */}
      <section className="py-16 bg-gray-950 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {isEs ? '¿Listo para reservar?' : 'Ready to book?'}
              </h2>
              <p className="text-gray-400">
                {isEs
                  ? 'Respondo en menos de 4 horas. También puedes reservar directamente online.'
                  : 'I reply within 4 hours. You can also book directly online.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href="https://babulashotsrd.setmore.com/reserva"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                {isEs ? 'Reservar sesión' : 'Book a session'}
              </a>
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(isEs ? 'Hola, quiero reservar una sesión fotográfica.' : 'Hi, I would like to book a photography session.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                WhatsApp
              </a>
              <Link
                href={`/${locale}/get-quote`}
                className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                {isEs ? 'Solicitar presupuesto' : 'Get quote'}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
