import type { Metadata } from 'next'
import Link from 'next/link'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'
import { CONTACT_INFO } from '@/lib/utils/constants'

export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const PAGE_SLUG = 'services/analog-film-photography'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Fotografía Analógica — Complemento a tu Sesión | Babula Shots'
    : 'Analog Film Photography — An Add-On to Your Session | Babula Shots'
  const description = isEs
    ? 'Añade rollos de fotografía analógica a tu boda, retrato, sesión familiar o propuesta. Complemento artístico junto a tu cobertura digital — entrega por separado, 1-2 semanas.'
    : 'Add real analog film to your wedding, portrait, family session, or proposal. An artistic complement alongside your digital coverage — delivered separately, in 1-2 weeks.'

  return {
    title: { absolute: title },
    description,
    keywords: isEs
      ? 'fotografia analogica republica dominicana, fotografo rollo de pelicula santo domingo, fotografia en carrete boda RD, complemento fotografia analogica, fotografo film santo domingo'
      : 'analog film photography dominican republic, film photographer santo domingo, film camera wedding add-on DR, analog photography complement, 35mm film photographer dominican republic',
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
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

const AVAILABLE_FOR = [
  { es: 'Bodas', en: 'Weddings', href: 'wedding-photography' },
  { es: 'Retratos de lujo', en: 'Luxury portraits', href: 'luxury-portrait-photography' },
  { es: 'Sesiones familiares', en: 'Family sessions', href: 'family-beach-photography' },
  { es: 'Propuestas de matrimonio', en: 'Proposals', href: 'proposal-photography' },
  { es: 'Cumpleaños y quinceañeras', en: 'Birthdays & quinceañeras', href: 'birthday-event-photography' },
]

export default function AnalogFilmPhotographyPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const pageUrl = `${BASE_URL}/${locale}/${PAGE_SLUG}`

  const waMessage = isEs
    ? 'Hola! Me interesa añadir fotografía analógica a mi sesión. ¿Podemos hablar de disponibilidad y precio?'
    : 'Hello! I\'m interested in adding analog film photography to my session. Can we talk about availability and pricing?'
  const waHref = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(waMessage)}`

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Servicios' : 'Services', url: `${BASE_URL}/${locale}/services` },
    { name: isEs ? 'Fotografía Analógica' : 'Analog Film Photography', url: pageUrl },
  ])

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: isEs ? 'Fotografía Analógica — Complemento' : 'Analog Film Photography — Add-On',
    serviceType: isEs ? 'Fotografía Analógica' : 'Analog Film Photography',
    description: isEs
      ? 'Complemento artístico en película analógica, añadido a una sesión de fotografía digital existente. Entrega por separado, 1-2 semanas.'
      : 'An artistic film-photography complement added to an existing digital photography session. Delivered separately, in 1-2 weeks.',
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#business`,
      name: 'Babula Shots',
      url: BASE_URL,
      telephone: CONTACT_INFO.phone,
    },
    areaServed: { '@type': 'Country', name: isEs ? 'República Dominicana' : 'Dominican Republic' },
    url: pageUrl,
    // Quote-only, like the site's other add-ons (e.g. drone) — no fixed
    // Offer here rather than inventing a price.
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <main className="min-h-screen bg-canvas text-ink">

        {/* ── HEADER ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24 lg:py-28">
          <div className="container mx-auto px-4">
            <nav>
              <Link
                href={`/${locale}/services`}
                className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
              >
                ← {isEs ? 'Servicios' : 'Services'}
              </Link>
            </nav>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mt-10 mb-6">
              {isEs ? 'Complemento · No Reemplaza tu Cobertura Digital' : 'Add-On · Not a Replacement for Your Digital Coverage'}
            </p>
            <h1
              className="font-display uppercase text-ink max-w-4xl"
              style={{ fontSize: 'clamp(32px, 6vw, 72px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}
            >
              {isEs ? 'Fotografía Analógica' : 'Analog Film Photography'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-8 leading-relaxed">
              {isEs
                ? 'Rollos de película real, disparados junto a tu sesión digital — un complemento artístico, no un reemplazo. Tu cobertura digital sigue llegando en el tiempo de entrega normal; el rollo analógico se revela y escanea por separado.'
                : 'Real film, shot alongside your digital session — an artistic complement, not a replacement. Your digital coverage still arrives on the normal delivery timeline; the film roll is developed and scanned separately.'}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
              >
                {isEs ? 'Consultar Disponibilidad' : 'Ask About Availability'}
              </a>
              <Link
                href={`/${locale}/services`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
              >
                {isEs ? 'Ver Todos los Servicios' : 'See All Services'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── WHAT THIS IS / WHY NOW ── */}
        <section className="border-b border-hairline-soft py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
                {isEs ? 'Por Qué Ahora' : 'Why Now'}
              </p>
              <p className="text-ink text-lg md:text-xl leading-relaxed">
                {isEs
                  ? 'He pasado el último tiempo dedicado a dominar la fotografía analógica — cámaras de película real, sin pantalla, sin vista previa. Ahora que confío en el proceso, lo ofrezco como complemento opcional: mientras cubro tu sesión digitalmente como siempre, también disparo un rollo de película en los momentos que se prestan para ese look.'
                  : 'I\'ve spent the last stretch mastering analog film photography — real film cameras, no screen, no preview. Now that I trust the process, I\'m offering it as an optional complement: while I cover your session digitally as always, I also shoot a roll of film during the moments that suit that look.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── DELIVERY TIMELINE — the key thing to make unmistakably clear ── */}
        <section className="border-b border-hairline-soft py-20 md:py-28 bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-sky-400 mb-6">
                {isEs ? 'Importante — Tiempo de Entrega' : 'Important — Delivery Time'}
              </p>
              <h2
                className="font-display uppercase text-white mb-8"
                style={{ fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: '1.05' }}
              >
                {isEs ? 'Dos Entregas Separadas' : 'Two Separate Deliveries'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <span className="text-3xl mb-3 block">📷</span>
                  <h3 className="text-white font-semibold mb-2">{isEs ? 'Tus Fotos Digitales' : 'Your Digital Photos'}</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">
                    {isEs
                      ? 'Llegan en el tiempo de entrega normal de tu paquete, como siempre — el rollo analógico no las retrasa en absoluto.'
                      : 'Arrive on your package\'s normal delivery timeline, exactly as always — the film roll never delays them.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-sky-400/30 bg-sky-400/5 p-6">
                  <span className="text-3xl mb-3 block">🎞️</span>
                  <h3 className="text-white font-semibold mb-2">{isEs ? 'Tu Rollo Analógico' : 'Your Film Roll'}</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">
                    {isEs
                      ? 'Se revela y escanea por separado — la entrega toma entre 1 y 2 semanas adicionales. Es un proceso físico real, no digital, y ese tiempo es parte de lo que lo hace especial.'
                      : 'Is developed and scanned separately — delivery takes an additional 1 to 2 weeks. It\'s a real, physical process, not a digital one, and that time is part of what makes it special.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── AVAILABLE FOR ── */}
        <section className="border-b border-hairline-soft py-20 md:py-28">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Disponible Como Complemento En' : 'Available As An Add-On For'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-12"
              style={{ fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: '1.05' }}
            >
              {isEs ? 'Cualquiera de Estas Sesiones' : 'Any of These Sessions'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AVAILABLE_FOR.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}/services/${item.href}`}
                  className="group flex items-center justify-between rounded-xl border border-hairline-soft px-6 py-5 hover:border-hairline transition-colors"
                >
                  <span className="text-ink font-medium">{isEs ? item.es : item.en}</span>
                  <span className="text-ink-muted group-hover:text-ink transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Precio' : 'Pricing'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-5"
                style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs ? '¿Quieres Añadir un Rollo a tu Sesión?' : 'Want to Add a Roll to Your Session?'}
              </h2>
              <p className="text-ink-muted text-base md:text-lg mb-10 leading-relaxed max-w-xl">
                {isEs
                  ? 'El precio se cotiza según tu sesión y disponibilidad — escríbeme y lo revisamos juntos.'
                  : 'Pricing is quoted based on your session and availability — message me and we\'ll work it out together.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                >
                  {isEs ? 'Consultar por WhatsApp' : 'Ask via WhatsApp'}
                </a>
                <Link
                  href={`/${locale}/services`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
                >
                  {isEs ? 'Ver Servicios' : 'See Services'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
