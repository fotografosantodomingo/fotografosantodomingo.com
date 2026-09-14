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

const FAQ_ITEMS = [
  {
    q: { es: '¿Esto reemplaza mis fotos digitales?', en: 'Does this replace my digital photos?' },
    a: {
      es: 'No. Tu cobertura digital completa sigue exactamente igual, con su entrega normal. La película es un complemento adicional, no un reemplazo.',
      en: 'No. Your full digital coverage stays exactly the same, with its normal delivery. Film is an additional complement, not a replacement.',
    },
  },
  {
    q: { es: '¿Puedo elegir qué momentos se capturan en película?', en: 'Can I choose which moments get shot on film?' },
    a: {
      es: 'Sí — lo coordinamos juntos antes de la sesión, priorizando los momentos con luz natural donde el look de la película se aprecia más.',
      en: 'Yes — we coordinate it together before the session, prioritizing natural-light moments where film\'s look shows best.',
    },
  },
  {
    q: { es: '¿En qué formato recibo las fotos de película?', en: 'What format do I receive the film photos in?' },
    a: {
      es: 'Como escaneos digitales en alta resolución, listos para descargar e imprimir.',
      en: 'As high-resolution digital scans, ready to download and print.',
    },
  },
  {
    q: { es: '¿Por qué toma más tiempo que mis fotos digitales?', en: 'Why does it take longer than my digital photos?' },
    a: {
      es: 'Porque es un proceso físico real — el rollo se revela y escanea en un laboratorio, no es instantáneo como un archivo digital.',
      en: 'Because it\'s a real physical process — the roll is developed and scanned at a lab, not instant like a digital file.',
    },
  },
]

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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: isEs ? item.q.es : item.q.en,
      acceptedAnswer: { '@type': 'Answer', text: isEs ? item.a.es : item.a.en },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
              <div className="space-y-5 text-ink text-lg md:text-xl leading-relaxed">
                <p>
                  {isEs
                    ? 'La película no perdona errores. No hay pantalla para revisar la toma, no hay una segunda oportunidad instantánea — cada disparo del rollo cuenta, y eso cambia por completo la forma de trabajar. Me obliga a ir más lento, a leer la luz real en vez de confiar en un histograma, a esperar el momento exacto en lugar de disparar de más y elegir después.'
                    : 'Film doesn\'t forgive mistakes. There\'s no screen to check the shot, no instant second chance — every frame on the roll counts, and that changes how you work completely. It forces me to slow down, to read real light instead of trusting a histogram, to wait for the exact moment instead of shooting in bulk and choosing later.'}
                </p>
                <p>
                  {isEs
                    ? 'He dedicado el último tiempo a dominar ese proceso completo — exposición, cámaras mecánicas, y todo lo que implica trabajar sin red de seguridad digital. Ahora que confío en el resultado, lo ofrezco como complemento opcional: mientras cubro tu sesión digitalmente como siempre, también disparo uno o más rollos en los momentos que se prestan para ese look.'
                    : 'I\'ve spent the last stretch mastering that entire process — exposure, mechanical cameras, everything that comes with working without a digital safety net. Now that I trust the result, I\'m offering it as an optional complement: while I cover your session digitally as always, I also shoot one or more rolls during the moments that suit that look.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY FILM — the tangible, honest aesthetic case ── */}
        <section className="border-b border-hairline-soft py-20 md:py-28">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'La Diferencia Real' : 'The Real Difference'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-12 max-w-2xl"
              style={{ fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: '1.05' }}
            >
              {isEs ? 'Qué Ofrece la Película Que lo Digital No' : 'What Film Gives You That Digital Doesn\'t'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <span className="text-2xl mb-3 block">🎞️</span>
                <h3 className="text-ink font-semibold mb-2">{isEs ? 'Grano, no ruido' : 'Grain, not noise'}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">
                  {isEs
                    ? 'El grano de la película tiene textura y carácter propio — es parte de la imagen, no un defecto a corregir. El ruido digital, en cambio, siempre se ve como un error.'
                    : 'Film grain has its own texture and character — it\'s part of the image, not a flaw to correct. Digital noise, by contrast, always reads as a mistake.'}
                </p>
              </div>
              <div>
                <span className="text-2xl mb-3 block">🌇</span>
                <h3 className="text-ink font-semibold mb-2">{isEs ? 'Color y luces más suaves' : 'Softer color and highlights'}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">
                  {isEs
                    ? 'La película absorbe cielos brillantes y luz dura de forma más orgánica que un sensor digital, con tonos de piel más cálidos y naturales.'
                    : 'Film absorbs bright skies and harsh light more gracefully than a digital sensor, with warmer, more natural skin tones.'}
                </p>
              </div>
              <div>
                <span className="text-2xl mb-3 block">⏳</span>
                <h3 className="text-ink font-semibold mb-2">{isEs ? 'Momentos más genuinos' : 'More genuine moments'}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">
                  {isEs
                    ? 'Sin pantalla que revisar entre disparos, ni tú ni yo nos distraemos del momento — el resultado son reacciones más naturales, menos posadas.'
                    : 'With no screen to check between shots, neither of us gets pulled out of the moment — the result is more natural, less posed reactions.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="border-b border-hairline-soft py-20 md:py-28">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'El Proceso' : 'The Process'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-12 max-w-2xl"
              style={{ fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: '1.05' }}
            >
              {isEs ? 'Cómo Funciona' : 'How It Works'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  num: '01',
                  es: 'Antes de tu sesión, coordinamos juntos qué momentos se prestan mejor para película — luz natural, instantes íntimos, sin flash de estudio.',
                  en: 'Before your session, we coordinate together which moments suit film best — natural light, intimate instants, no studio flash.',
                },
                {
                  num: '02',
                  es: 'Durante tu sesión digital normal, también disparo uno o más rollos en esos momentos clave.',
                  en: 'During your normal digital session, I also shoot one or more rolls during those key moments.',
                },
                {
                  num: '03',
                  es: 'El rollo se revela y escanea en un laboratorio especializado en película analógica.',
                  en: 'The roll is developed and scanned at a lab specialized in analog film.',
                },
                {
                  num: '04',
                  es: 'Recibes los escaneos en alta resolución digitalmente, en una entrega separada de 1-2 semanas.',
                  en: 'You receive the high-resolution scans digitally, in a separate delivery of 1-2 weeks.',
                },
              ].map((step) => (
                <div key={step.num} className="flex flex-col">
                  <span className="text-4xl font-extrabold text-ink/15 leading-none mb-3">{step.num}</span>
                  <p className="text-ink-muted text-sm leading-relaxed">{isEs ? step.es : step.en}</p>
                </div>
              ))}
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

        {/* ── FAQ ── */}
        <section className="border-b border-hairline-soft py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">FAQ</p>
              <h2
                className="font-display uppercase text-ink mb-12"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked'}
              </h2>
              <ul className="border-t border-hairline-soft">
                {FAQ_ITEMS.map((item, i) => (
                  <li key={item.q.es} className="border-b border-hairline-soft py-6 md:py-7">
                    <div className="flex items-start gap-4 md:gap-6">
                      <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 w-8 mt-1">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-ink text-base md:text-lg leading-snug font-medium">
                          {isEs ? item.q.es : item.q.en}
                        </h3>
                        <p className="text-ink-muted text-sm md:text-base leading-relaxed mt-3">
                          {isEs ? item.a.es : item.a.en}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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
