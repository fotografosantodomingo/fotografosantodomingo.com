import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { CONTACT_INFO } from '@/lib/utils/constants'
import HomeFaq from '@/components/HomeFaq'
import { getFaqData } from '@/lib/faq-data'
import { getReviewStats } from '@/lib/supabase/images'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'
import { createServiceClient } from '@/lib/supabase/service'

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
  const supabase = createServiceClient()
  const [t, reviewStats, familiesRes] = await Promise.all([
    getTranslations({ locale, namespace: 'hero' }),
    getReviewStats(),
    supabase
      .from('service_families')
      .select('id, slug, title_es, title_en, tagline_es, tagline_en, icon, sort_order, bookable, quoteable')
      .eq('active', true)
      .order('sort_order', { ascending: true }),
  ])

  const isEs = locale === 'es'
  type FamilyRow = {
    id: string
    slug: string
    title_es: string
    title_en: string
    tagline_es: string | null
    tagline_en: string | null
    icon: string
    bookable: boolean
    quoteable: boolean
  }
  const families = (familiesRes.data ?? []) as FamilyRow[]

  const desktopWorkImages = [
    'https://res.cloudinary.com/dwewurxla/image/upload/w_1200,c_limit,f_auto,q_auto/v1776563769/sesion-fotos-pareja-playa-punta-cana_nniebt.webp',
    'https://res.cloudinary.com/dwewurxla/image/upload/w_1200,c_limit,f_auto,q_auto/v1776561751/fotografo-retratos-profesionales-santo-domingo_r93azo.webp',
    'https://res.cloudinary.com/dwewurxla/image/upload/w_1200,c_limit,f_auto,q_auto/v1776561751/Fotografo_profesional_Santo_Domingo_Sesion_de_Fotos_aradxg.webp',
    'https://res.cloudinary.com/dwewurxla/image/upload/w_1200,c_limit,f_auto,q_auto/v1776561751/Fotografo_en_Santo_Domingo_retratos_arte_srdiz0.webp',
  ]

  const mobileWorkImages = [
    'https://res.cloudinary.com/dwewurxla/image/upload/w_900,c_limit,f_auto,q_auto/v1776562590/sesion-fotos-pareja-playa-punta-cana_mobvic.webp',
    'https://res.cloudinary.com/dwewurxla/image/upload/w_900,c_limit,f_auto,q_auto/v1776562590/Fotografo_profesional_Santo_Domingo_Sesion_de_Fotos_yi7dq9.webp',
    'https://res.cloudinary.com/dwewurxla/image/upload/w_900,c_limit,f_auto,q_auto/v1776562589/fotografo-retratos-profesionales-santo-domingo_efdy3v.webp',
    'https://res.cloudinary.com/dwewurxla/image/upload/w_900,c_limit,f_auto,q_auto/v1776562589/Fotografo_en_Santo_Domingo_retratos_arte_w7cmuw.webp',
  ]

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

  return (
    <main className="min-h-screen bg-canvas text-ink">

      {/* ── HERO ── Bugatti monumental hero. Photograph stays untouched.
           Vignette overlay is the only "shadow" Bugatti permits (DESIGN.md §4).
           Hero text remains white-on-photo in BOTH themes via .hero-white-* classes
           (existing legibility lock from globals.css — preserved). */}
      <section className="hero-white-lock relative overflow-hidden bg-black pt-0 pb-16 md:pb-20 lg:pb-24">
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="hidden md:block relative w-full overflow-hidden" style={{ aspectRatio: '1200 / 675' }}>
            <img
              src="https://res.cloudinary.com/dwewurxla/image/upload/w_1200,c_limit,f_auto,q_auto/v1776564550/Fotografo_Santo_Domingo_Zona_Colonial_republica_Domincana_mn2u2j.webp"
              alt={isEs
                ? 'Fotografo Santo Domingo Zona Colonial Republica Dominicana'
                : 'Photographer Santo Domingo Zona Colonial Dominican Republic'}
              width={1200}
              height={675}
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-cover"
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
            {/* Bugatti legibility vignette — the only shadow in the system */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          </div>
          <div className="md:hidden relative w-full overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
            <img
              src="https://res.cloudinary.com/dwewurxla/image/upload/w_800,c_limit,f_auto,q_auto/v1776563250/Fotografo_En_Santo_Domingo_Republica_Dominicana_if1in7.webp"
              alt={isEs
                ? 'Fotografo en Santo Domingo Republica Dominicana sesion de fotos'
                : 'Photographer in Santo Domingo Dominican Republic photo session'}
              width={800}
              height={1000}
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-cover"
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="relative container mx-auto px-4 text-center mt-10 md:mt-14 lg:mt-16">

          {/* Availability badge — restyled as thin transparent pill, white pulse */}
          <div className="hero-white-text inline-flex items-center gap-2.5 border border-white/40 rounded-full px-4 py-2 mb-10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            <span className="font-mono uppercase tracking-widest text-[10px] md:text-[11px] text-white">
              {isEs ? 'Disponible · Santo Domingo, RD' : 'Available · Santo Domingo, DR'}
            </span>
          </div>

          {/* Monumental display headline — Bugatti scale curve */}
          <h1
            className="hero-white-text font-display uppercase font-normal text-white mb-8"
            style={{
              fontSize: 'clamp(48px, 11vw, 168px)',
              lineHeight: '0.95',
              letterSpacing: '-0.01em',
            }}
          >
            {t('title_main')}{' '}
            <span className="hero-white-highlight text-white">
              {t('title_highlight')}
            </span>
          </h1>

          <p className="hero-white-text text-base md:text-lg text-white/85 mb-10 leading-relaxed max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          {/* Pill CTAs — Bugatti primary + secondary discipline */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link
              href={`/${locale}/portfolio`}
              className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors duration-200"
            >
              {t('cta_primary')}
            </Link>
            <Link
              href={`/${locale}/get-quote`}
              className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-white text-white hover:bg-white hover:text-black transition-colors duration-200"
            >
              {t('cta_secondary')}
            </Link>
          </div>

          {/* Stats — flat, no cards, mono caps labels under display numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 max-w-3xl mx-auto pt-10 border-t border-white/15">
            {[
              { value: t('stats_weddings'), label: isEs ? 'Clientes satisfech@s' : 'Satisfied clients' },
              { value: t('stats_years'),    label: isEs ? 'Años de experiencia' : 'Years experience' },
              { value: t('stats_locations'),label: isEs ? 'Ubicaciones' : 'Locations served' },
              { value: t('stats_reviews'),  label: isEs ? '91 reseñas en Google' : '91 Google reviews' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="hero-white-text font-display text-3xl md:text-4xl text-white">{value}</div>
                <div className="hero-white-text font-mono uppercase tracking-widest text-[10px] text-white/70 mt-2">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO PREVIEW ── */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-0 md:px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {isEs ? 'Nuestro Trabajo' : 'Our Work'}
            </h2>
            <p className="text-gray-400 text-lg">
              {isEs ? 'Algunos momentos recientes del lente de Michal Babula' : 'Some recent moments through Michal Babula\'s lens'}
            </p>
          </div>

          <div className="mb-10">
            <div className="hidden md:grid relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid-cols-2 gap-0">
              {desktopWorkImages.map((src, index) => (
                <Link key={`desktop-work-${index}`} href={`/${locale}/portfolio`} className="block">
                  <img
                    src={src}
                    alt={isEs
                      ? `Sesion de fotos profesional en Santo Domingo Republica Dominicana ${index + 1}`
                      : `Professional photo session in Santo Domingo Dominican Republic ${index + 1}`}
                    width={2400}
                    height={1350}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-contain"
                  />
                </Link>
              ))}
            </div>

            <div className="md:hidden relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid grid-cols-1 gap-0">
              {mobileWorkImages.map((src, index) => (
                <Link key={`mobile-work-${index}`} href={`/${locale}/portfolio`} className="block">
                  <img
                    src={src}
                    alt={isEs
                      ? `Sesion vertical de fotos en Santo Domingo Republica Dominicana ${index + 1}`
                      : `Vertical photo session in Santo Domingo Dominican Republic ${index + 1}`}
                    width={1080}
                    height={1350}
                    sizes="100vw"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-contain"
                  />
                </Link>
              ))}
            </div>
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

      {/* ── SERVICE GATEWAY ── canonical 9 service_families.
           Visually leads into /services/[family] per Phase B mission.
           No cards: each family is a typographic block separated by hairlines. */}
      <section className="py-24 md:py-32 bg-canvas">
        <div className="container mx-auto px-4">
          <div className="mb-14 md:mb-20">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Servicios · Nueve familias' : 'Services · Nine families'}
            </p>
            <h2
              className="font-display uppercase text-ink"
              style={{
                fontSize: 'clamp(40px, 7vw, 88px)',
                lineHeight: '0.95',
                letterSpacing: '-0.01em',
              }}
            >
              {isEs ? 'Cada momento, su lente.' : 'Each moment, its lens.'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-6">
              {isEs
                ? 'Reserva en línea o solicita un presupuesto personalizado. Cobertura en Santo Domingo y toda la República Dominicana.'
                : 'Book online or request a custom quote. Coverage across Santo Domingo and the entire Dominican Republic.'}
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline-soft">
            {families.map((f) => {
              const title = isEs ? f.title_es : f.title_en
              const tagline = isEs ? f.tagline_es : f.tagline_en
              return (
                <li key={f.id} className="border-r border-b border-hairline-soft">
                  <Link
                    href={`/${locale}/services/${f.slug}`}
                    className="group flex flex-col gap-3 p-7 md:p-8 lg:p-10 h-full hover:bg-ink/5 transition-colors duration-200"
                  >
                    <span className="text-2xl mb-1" aria-hidden="true">{f.icon}</span>
                    <h3
                      className="font-display uppercase text-ink"
                      style={{ fontSize: 'clamp(24px, 2.4vw, 32px)', lineHeight: '1.05' }}
                    >
                      {title}
                    </h3>
                    {tagline && (
                      <p className="text-ink-muted text-sm leading-relaxed flex-1">{tagline}</p>
                    )}
                    <span className="font-mono uppercase tracking-widest text-[11px] text-ink mt-4 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                      {isEs ? 'Explorar' : 'Explore'}
                      <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-12 md:mt-16 text-center">
            <Link
              href={`/${locale}/services`}
              className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
            >
              {isEs ? 'Ver todos los servicios' : 'View all services'}
            </Link>
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
                <p className="text-gray-300 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
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
      {/* ── BOOKING CTA ── pill discipline, WhatsApp keeps brand green
           (single intentional palette break — flagged in B1 proposal). */}
      <section className="py-20 md:py-24 bg-canvas border-t border-hairline-soft">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="md:max-w-md">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Reserva' : 'Booking'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '1.0' }}
              >
                {isEs ? '¿Listo?' : 'Ready?'}
              </h2>
              <p className="text-ink-muted text-base leading-relaxed">
                {isEs
                  ? 'Respondo en menos de 4 horas. También puedes reservar directamente online.'
                  : 'I reply within 4 hours. You can also book directly online.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={`/${locale}/book`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
              >
                {isEs ? 'Reservar sesión' : 'Book a session'}
              </Link>
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(isEs ? 'Hola, quiero reservar una sesión fotográfica.' : 'Hi, I would like to book a photography session.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-[#25D366] text-black hover:opacity-90 transition-opacity duration-200"
              >
                WhatsApp
              </a>
              <Link
                href={`/${locale}/get-quote`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
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
