import type { Metadata } from 'next'
import Link from 'next/link'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Precios y Servicios | Fotógrafo Santo Domingo — Babula Shots'
    : 'Photography Pricing & Services | Santo Domingo — Babula Shots'
  const description = isEs
    ? 'Precios transparentes para fotografía en República Dominicana: bodas desde $1,000, sesiones playa desde $150, drone desde $160, boudoir, snoot óptico y más. Reserva con 50% de adelanto vía Stripe.'
    : 'Transparent photography pricing in Dominican Republic: weddings from $1,000, beach sessions from $150, drone from $160, boudoir, snoot optical and more. Book with 50% deposit via Stripe.'
  return {
    title,
    description,
    keywords: isEs
      ? 'precios fotógrafo santo domingo, cuánto cuesta fotógrafo república dominicana, tarifa fotografía bodas DR, precio sesión retratos, fotografía comercial costo, drone fotógrafo precio'
      : 'photographer prices santo domingo, photography cost dominican republic, wedding photography rate DR, portrait session price, commercial photography cost dominicana',
    alternates: {
      canonical: `${BASE_URL}/${locale}/prices`,
      languages: {
        es: `${BASE_URL}/es/prices`,
        en: `${BASE_URL}/en/prices`,
        'x-default': `${BASE_URL}/es/prices`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Precios de Fotografía — Babula Shots' : 'Photography Pricing — Babula Shots',
      description,
      url: `${BASE_URL}/${locale}/prices`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=Precios+%26+Servicios&subtitle=Fotógrafo+Santo+Domingo`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Precios Fotografía Santo Domingo' : 'Photography Pricing Santo Domingo',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Precios de Fotografía — Babula Shots' : 'Photography Pricing — Babula Shots',
      description,
      images: [`${BASE_URL}/api/og?title=Precios+%26+Servicios&subtitle=Santo+Domingo`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

// ─── Service data ─────────────────────────────────────────────────────────────

interface PricedService {
  /** Stable identifier for cta tracking (legacy slugs preserved for analytics). */
  slug: string
  icon: string
  nameEs: string
  nameEn: string
  durationEs: string
  durationEn: string
  priceUsd: number
  priceNote?: string // e.g. "per hour" / "por hora"
  includesEs: string[]
  includesEn: string[]
  /**
   * Canonical service_families.slug — drives the /get-quote family
   * preselection. Always required so the quote wizard lands the user
   * on the right family even when no exact canonical package matches.
   */
  familySlug: string
  /**
   * When set: render Reserve button → /book?service=<canonicalPackageSlug>.
   * When unset: render Quote button only → /get-quote?family=<familySlug>.
   *
   * SET ONLY when the canonical service_packages row matches both the
   * displayed price and duration (otherwise users land on a wrong
   * calendar / price). Audited 2026-04-26 — only 2 entries qualify.
   */
  canonicalPackageSlug?: string
}

interface ServiceCategory {
  key: string
  titleEs: string
  titleEn: string
  services: PricedService[]
}

const CATEGORIES: ServiceCategory[] = [
  {
    key: 'celebrations',
    titleEs: 'Celebraciones y Eventos',
    titleEn: 'Celebrations & Events',
    services: [
      {
        slug: 'weddings',
        icon: '💍',
        nameEs: 'Bodas',
        nameEn: 'Wedding Photography',
        durationEs: '4 horas',
        durationEn: '4 hours',
        priceUsd: 1000,
        includesEs: ['Cobertura completa del día', 'Sesión de compromiso incluida', 'Álbum profesional + galería online'],
        includesEn: ['Full wedding day coverage', 'Engagement session included', 'Professional album + online gallery'],
        familySlug: 'wedding-photography',
        // Canonical essential-wedding is $900 (vs $1000 here) — route to quote
      },
      {
        slug: 'engagement-session',
        icon: '💑',
        nameEs: 'Sesión de Compromiso',
        nameEn: 'Engagement Session',
        durationEs: '1 hora',
        durationEn: '1 hour',
        priceUsd: 180,
        includesEs: ['Sesión en locación a elección', '40 fotos editadas en alta res.', 'Galería online privada'],
        includesEn: ['Session at chosen location', '40 edited high-res photos', 'Private online gallery'],
        familySlug: 'wedding-photography',
        // No engagement-only canonical package — route to quote (was wrongly resolving to essential-portrait)
      },
      {
        slug: 'quinceaneras',
        icon: '👑',
        nameEs: 'Quinceañeras',
        nameEn: 'Quinceañera Photography',
        durationEs: '4 horas',
        durationEn: '4 hours',
        priceUsd: 800,
        includesEs: ['Ceremonia, vals y celebración', '80 fotos editadas', 'Álbum diseñado'],
        includesEn: ['Ceremony, waltz, and celebration', '80 edited photos', 'Designed album'],
        familySlug: 'birthday-event-photography',
        // Canonical quinceanera-premium is $500 (vs $800 here) — route to quote
      },
      {
        slug: 'baptism',
        icon: '⛪',
        nameEs: 'Bautizos',
        nameEn: 'Baptism Photography',
        durationEs: '2 horas',
        durationEn: '2 hours',
        priceUsd: 250,
        includesEs: ['Ceremonia + celebración familiar', 'Fotos grupales organizadas', 'Galería online'],
        includesEn: ['Ceremony + family celebration', 'Organized group photos', 'Online gallery'],
        familySlug: 'birthday-event-photography',
        // Canonical essential-event is $200/1hr (vs $250/2hr here) — route to quote
      },
      {
        slug: 'graduation',
        icon: '🎓',
        nameEs: 'Graduación',
        nameEn: 'Graduation Photography',
        durationEs: '1 hora',
        durationEn: '1 hour',
        priceUsd: 200,
        includesEs: ['Sesión individual o grupal', '30 fotos editadas', 'Entrega rápida 24h'],
        includesEn: ['Individual or group session', '30 edited photos', 'Fast 24h delivery'],
        familySlug: 'birthday-event-photography',
        canonicalPackageSlug: 'essential-event', // EXACT MATCH: $200, 1hr
      },
      {
        slug: 'birthday-party',
        icon: '🎂',
        nameEs: 'Fiesta de Cumpleaños',
        nameEn: 'Birthday Party',
        durationEs: '2 horas',
        durationEn: '2 hours',
        priceUsd: 300,
        includesEs: ['Cobertura completa del evento', 'Detalles, decoración y personas', 'Galería digital'],
        includesEn: ['Full event coverage', 'Details, decor, and people', 'Digital gallery'],
        familySlug: 'birthday-event-photography',
        // Canonical signature-celebration is $350 (vs $300 here) — route to quote
      },
    ],
  },
  {
    key: 'beach-sessions',
    titleEs: 'Sesiones en Playa',
    titleEn: 'Beach Sessions',
    services: [
      {
        slug: 'beach-guibia',
        icon: '🏖️',
        nameEs: 'Sesión Playa Güibia',
        nameEn: 'Güibia / Urban Beach Session',
        durationEs: '1 hora',
        durationEn: '1 hour',
        priceUsd: 150,
        includesEs: ['10 fotos editadas premium', 'Playa Güibia cerca del Malecón, Santo Domingo', 'Mejor en golden hour (amanecer/atardecer)'],
        includesEn: ['10 premium edited photos', 'Güibia Beach near the Malecón, Santo Domingo', 'Best at golden hour (sunrise/sunset)'],
        familySlug: 'family-beach-photography',
        // No canonical match — quote-only
      },
      {
        slug: 'beach-session-caribbean',
        icon: '🌊',
        nameEs: 'Sesión Playa Caribeña',
        nameEn: 'Caribbean Beach Session',
        durationEs: '1 hora',
        durationEn: '1 hour',
        priceUsd: 300,
        includesEs: ['10 fotos premium editadas', 'Boca Chica, Juan Dolio, La Romana, Punta Cana, Puerto Plata', 'Dirección fotográfica profesional + consejos de outfits'],
        includesEn: ['10 premium edited photos', 'Boca Chica, Juan Dolio, La Romana, Punta Cana, Puerto Plata', 'Professional photography direction + outfit advice'],
        familySlug: 'family-beach-photography',
        // No canonical match — quote-only
      },
      {
        slug: 'beach-session-saona',
        icon: '🏝️',
        nameEs: 'Sesión Exclusiva Isla Saona',
        nameEn: 'Isla Saona Exclusive Session',
        durationEs: '4 horas',
        durationEn: '4 hours',
        priceUsd: 400,
        includesEs: ['25 fotos editadas en alta resolución', 'Transporte en lancha o catamarán incluido', 'Almuerzo buffet + bebidas incluidas'],
        includesEn: ['25 professionally edited photos', 'Fast boat or catamaran transport included', 'Buffet lunch + drinks included'],
        familySlug: 'family-beach-photography',
        // No canonical match — quote-only
      },
    ],
  },
  {
    key: 'portraits',
    titleEs: 'Retratos y Familia',
    titleEn: 'Portraits & Family',
    services: [
      {
        slug: 'portrait',
        icon: '🧑‍💼',
        nameEs: 'Retratos',
        nameEn: 'Portrait Session',
        durationEs: '1 hora',
        durationEn: '1 hour',
        priceUsd: 100,
        includesEs: ['Sesión en locación o estudio', '15 fotos editadas en alta res.', 'Entrega en 48h'],
        includesEn: ['Session on location or studio', '15 edited high-res photos', 'Delivery in 48h'],
        familySlug: 'luxury-portrait-photography',
        // Canonical essential-portrait is $250 (vs $100 here) — route to quote
      },
      {
        slug: 'family-session',
        icon: '👨‍👩‍👧‍👦',
        nameEs: 'Sesión Familiar',
        nameEn: 'Family Session',
        durationEs: '2 horas',
        durationEn: '2 hours',
        priceUsd: 200,
        includesEs: ['Hasta 10 personas', '40 fotos editadas', 'Galería online privada'],
        includesEn: ['Up to 10 people', '40 edited photos', 'Private online gallery'],
        familySlug: 'family-beach-photography',
        // Canonical essential-family is $350/1hr (vs $200/2hr here) — route to quote
      },
      {
        slug: 'maternity',
        icon: '🤰',
        nameEs: 'Maternidad',
        nameEn: 'Maternity Session',
        durationEs: '1 hora',
        durationEn: '1 hour',
        priceUsd: 150,
        includesEs: ['Sesión íntima en locación', '30 fotos editadas', 'Galería privada'],
        includesEn: ['Intimate location session', '30 edited photos', 'Private gallery'],
        familySlug: 'family-beach-photography',
        // Canonical essential-family is $350 (vs $150 here) — route to quote
      },
      {
        slug: 'children-session',
        icon: '🧸',
        nameEs: 'Sesiones Infantiles',
        nameEn: "Children's Sessions",
        durationEs: '1 hora',
        durationEn: '1 hour',
        priceUsd: 150,
        includesEs: ['Ambiente relajado y divertido', '20 fotos editadas', 'Galería digital'],
        includesEn: ['Relaxed and fun environment', '20 edited photos', 'Digital gallery'],
        familySlug: 'family-beach-photography',
        // Canonical essential-family is $350 (vs $150 here) — route to quote
      },
      {
        slug: 'corporate-portrait',
        icon: '📷',
        nameEs: 'Retratos Corporativos',
        nameEn: 'Corporate Portraits',
        durationEs: '1 hora',
        durationEn: '1 hour',
        priceUsd: 180,
        includesEs: ['Múltiples looks y fondos', 'Uso comercial autorizado', 'Entrega en 24–48h'],
        includesEn: ['Multiple looks and backgrounds', 'Commercial usage rights', 'Delivery in 24–48h'],
        familySlug: 'luxury-portrait-photography',
        // Canonical essential-portrait is $250 (vs $180 here) — route to quote
      },
      {
        slug: 'boudoir-session',
        icon: '🌸',
        nameEs: 'Sesión Boudoir',
        nameEn: 'Boudoir Session',
        durationEs: '2 horas',
        durationEn: '2 hours',
        priceUsd: 400,
        includesEs: ['Estudio privado o habitación de hotel de lujo', 'Iluminación profesional + dirección experta y cómoda', 'Galería privada entregada en 48–72h'],
        includesEn: ['Private studio or luxury hotel room', 'Professional lighting + expert, comfortable direction', 'Private gallery delivered in 48–72h'],
        familySlug: 'luxury-portrait-photography',
        // No canonical match — quote-only
      },
    ],
  },
  {
    key: 'commercial',
    titleEs: 'Comercial y Empresarial',
    titleEn: 'Commercial & Business',
    services: [
      {
        slug: 'corporate-event',
        icon: '🏢',
        nameEs: 'Eventos Corporativos',
        nameEn: 'Corporate Events',
        durationEs: '2 horas',
        durationEn: '2 hours',
        priceUsd: 300,
        priceNote: '/hr',
        includesEs: ['Cobertura completa del evento', 'Fotos grupales y de detalle', 'Galería para la empresa'],
        includesEn: ['Full event coverage', 'Group and detail shots', 'Corporate gallery'],
        familySlug: 'corporate-event-photography',
        // Canonical hourly-premium is $200/hr (vs $300/hr here) — route to quote
      },
      {
        slug: 'commercial',
        icon: '📸',
        nameEs: 'Fotografía Comercial',
        nameEn: 'Commercial Photography',
        durationEs: '1 hora',
        durationEn: '1 hour',
        priceUsd: 250,
        priceNote: '/hr',
        includesEs: ['Productos, hoteles, restaurantes', 'Derechos de uso comercial', 'Edición profesional'],
        includesEn: ['Products, hotels, restaurants', 'Commercial usage rights', 'Professional editing'],
        familySlug: 'commercial-branding-photography',
        // Canonical essential-commercial is $400 (vs $250/hr here) — route to quote
      },
      {
        slug: 'food-and-beverage',
        icon: '🍽️',
        nameEs: 'Alimentos y Bebidas',
        nameEn: 'Food & Beverage',
        durationEs: '2 horas',
        durationEn: '2 hours',
        priceUsd: 250,
        includesEs: ['Sesión en estudio o locación', '30 imágenes editadas', 'Apta para redes y menús'],
        includesEn: ['Studio or on-location session', '30 edited images', 'Ready for social & menus'],
        familySlug: 'commercial-branding-photography',
        // Canonical essential-commercial is $400/1hr (vs $250/2hr here) — route to quote
      },
      {
        slug: 'real-estate',
        icon: '🏠',
        nameEs: 'Bienes Raíces',
        nameEn: 'Real Estate Photography',
        durationEs: '2 horas',
        durationEn: '2 hours',
        priceUsd: 150,
        includesEs: ['Interior y exterior', 'Hasta 3 propiedades', 'Opción con dron disponible'],
        includesEn: ['Interior and exterior', 'Up to 3 properties', 'Drone option available'],
        familySlug: 'real-estate-drone-photography',
        // Canonical essential-listing is $200/90min (vs $150/2hr here) — route to quote
      },
    ],
  },
  {
    key: 'studio-creative',
    titleEs: 'Estudio y Iluminación Creativa',
    titleEn: 'Studio & Creative Lighting',
    services: [
      {
        slug: 'snoot-optico-5',
        icon: '💡',
        nameEs: 'Snoot Óptico — 5 Fotos',
        nameEn: 'Snoot Optical — 5 Photos',
        durationEs: '55 min',
        durationEn: '55 min',
        priceUsd: 150,
        includesEs: ['Técnica de iluminación Snoot Óptico', '5 fotos editadas en alta resolución', 'Efectos dramáticos y cinematográficos'],
        includesEn: ['Snoot Optical lighting technique', '5 edited high-res photos', 'Dramatic cinematic lighting effects'],
        familySlug: 'custom-specialty-photography',
        // Specialty creative lighting — quote-only
      },
      {
        slug: 'snoot-optico-10',
        icon: '💡',
        nameEs: 'Snoot Óptico — 10 Fotos',
        nameEn: 'Snoot Optical — 10 Photos',
        durationEs: '55 min',
        durationEn: '55 min',
        priceUsd: 200,
        includesEs: ['10 fotos con iluminación Snoot', 'Mayor variedad de ángulos y looks', 'Book, branding personal, productos premium'],
        includesEn: ['10 photos with Snoot lighting', 'Greater variety of angles and looks', 'Model book, personal branding, premium products'],
        familySlug: 'custom-specialty-photography',
        // Specialty creative lighting — quote-only
      },
      {
        slug: 'snoot-optico-premium',
        icon: '💡',
        nameEs: 'Snoot Óptico Premium — 15 Fotos',
        nameEn: 'Snoot Optical Premium — 15 Photos',
        durationEs: '2 horas',
        durationEn: '2 hours',
        priceUsd: 250,
        includesEs: ['15 fotos Snoot Óptico', '2h con cambios de look y vestuario', 'Entrega digital lista para uso inmediato'],
        includesEn: ['15 photos with Snoot Optical', '2h with look and wardrobe changes', 'Digital delivery ready for immediate use'],
        familySlug: 'custom-specialty-photography',
        // Specialty creative lighting — quote-only
      },
    ],
  },
  {
    key: 'specialty',
    titleEs: 'Especialidades',
    titleEn: 'Specialties',
    services: [
      {
        slug: 'drone-aerial',
        icon: '🚁',
        nameEs: 'Drone Aéreo',
        nameEn: 'Drone Aerial Photography',
        durationEs: '2 horas',
        durationEn: '2 hours',
        priceUsd: 160,
        includesEs: ['Piloto certificado DJI Mavic 3 Pro', 'Video 5K ultra HD + edición profesional', 'Entrega en 48h o material crudo el mismo día'],
        includesEn: ['Certified DJI Mavic 3 Pro pilot', '5K ultra HD video + professional editing', 'Delivery in 48h or raw material same day'],
        familySlug: 'real-estate-drone-photography',
        // No drone-only canonical at $160/2hr — route to quote (was wrongly resolving to essential-listing)
      },
      {
        slug: 'video-production',
        icon: '🎬',
        nameEs: 'Producción de Video',
        nameEn: 'Video Production',
        durationEs: '6 horas',
        durationEn: '6 hours',
        priceUsd: 800,
        includesEs: ['Rodaje + edición profesional', 'Montaje musical incluido', 'Entrega en formatos web/social'],
        includesEn: ['Shoot + professional editing', 'Music arrangement included', 'Delivered in web/social formats'],
        familySlug: 'custom-specialty-photography',
        // Canonical rfq is quote-only ($0 placeholder) — route to quote
      },
      {
        slug: 'proposal-photography',
        icon: '🥷',
        nameEs: 'Fotografía de Propuesta',
        nameEn: 'Proposal Photography',
        durationEs: '2 horas',
        durationEn: '2 hours',
        priceUsd: 250,
        includesEs: ['Modo ninja 100% oculto', 'Teleobjetivo 400–600 mm', 'Galería esa misma noche'],
        includesEn: ['100% hidden ninja mode', '400–600 mm telephoto lens', 'Gallery that same night'],
        familySlug: 'proposal-photography',
        canonicalPackageSlug: 'secret-beach-proposal', // EXACT MATCH: $250, 2hr
      },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricesPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Precios' : 'Pricing', url: `${BASE_URL}/${locale}/prices` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />

      <main className="min-h-screen bg-canvas text-ink">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="border-b border-hairline-soft pt-20 md:pt-28 lg:pt-32 pb-16 md:pb-20">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Precios · Santo Domingo, RD' : 'Pricing · Santo Domingo, DR'}
            </p>
            <h1
              className="font-display uppercase text-ink max-w-5xl"
              style={{
                fontSize: 'clamp(40px, 9vw, 144px)',
                lineHeight: '0.95',
                letterSpacing: '-0.01em',
              }}
            >
              {isEs ? 'Precios y servicios' : 'Pricing & services'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-8 leading-relaxed">
              {isEs
                ? 'Todos los precios son de partida. Cada sesión es única — contáctanos si tienes algo especial en mente.'
                : 'All prices shown are starting rates. Every session is unique — reach out if you have something special in mind.'}
            </p>

            {/* trust stats — flat, no icons-as-color */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 border-t border-l border-hairline-soft max-w-3xl">
              {[
                { value: isEs ? '25+' : '25+', label: isEs ? 'Servicios' : 'Services' },
                { value: '50%', label: isEs ? 'Adelanto' : 'Deposit' },
                { value: 'USD', label: 'DOP · USD' },
                { value: '1h', label: isEs ? 'Respuesta' : 'Response' },
              ].map(({ value, label }) => (
                <div key={label} className="border-r border-b border-hairline-soft p-5">
                  <div className="font-display text-ink" style={{ fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: '1' }}>
                    {value}
                  </div>
                  <div className="mt-3 font-mono uppercase tracking-widest text-[10px] text-ink-muted">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Policy block ─────────────────────────────────────────────────── */}
        <section className="border-b border-hairline-soft py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-8">
              {isEs ? 'Política de reserva y pago' : 'Booking & payment policy'}
            </h2>
            <ul className="grid gap-x-12 gap-y-5 md:grid-cols-2 max-w-4xl">
              {[
                isEs
                  ? '50% de adelanto al reservar vía Stripe (tarjeta, Apple Pay, Google Pay)'
                  : '50% deposit at booking via Stripe (card, Apple Pay, Google Pay)',
                isEs
                  ? 'Saldo restante (50%) pagado en persona el día de la sesión'
                  : 'Remaining balance (50%) paid in person on session day',
                isEs
                  ? 'Reprogramación gratuita hasta 3 días antes de la sesión'
                  : 'Free rescheduling up to 3 days before the session',
                isEs
                  ? 'Sin reembolso si se cancela con menos de 24 h de anticipación'
                  : 'No refund if cancelled within 24 hours of the session',
              ].map((line, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 pb-5 border-b border-hairline-soft text-ink leading-relaxed"
                >
                  <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 mt-1 w-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-base">{line}</span>
                </li>
              ))}
              <li className="md:col-span-2 flex items-start gap-4 text-ink-muted leading-relaxed text-sm">
                <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 mt-1 w-6">
                  USD
                </span>
                <span>
                  {isEs
                    ? 'Precio en USD. También aceptamos DOP al tipo de cambio del día. El cobro de Stripe siempre es en dólares.'
                    : 'Price in USD. We also accept DOP at the day\'s exchange rate. Stripe charge is always in dollars.'}
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Sticky category jump-nav ──────────────────────────────────────
             B3.6 — addresses /prices mobile long-scroll fatigue.
             Anchors directly to each category + the Custom section.
             Sticks to top-16 so it sits below the global Navigation
             (which is sticky top-0 z-50). z-30 keeps it under the
             mega-menu panel, above page content. Horizontal scroll on
             narrow viewports prevents wrapping. ───────────────────── */}
        <nav
          className="sticky top-16 z-30 bg-canvas border-b border-hairline-soft -mx-px"
          aria-label={isEs ? 'Categorías de precios' : 'Pricing categories'}
        >
          <div className="container mx-auto px-4">
            <ul className="flex gap-6 md:gap-8 overflow-x-auto whitespace-nowrap py-3 md:py-3.5 -mx-4 px-4 scrollbar-thin">
              {CATEGORIES.map((cat) => (
                <li key={cat.key} className="shrink-0">
                  <a
                    href={`#${cat.key}`}
                    className="font-mono uppercase tracking-widest text-[10px] md:text-[11px] text-ink-muted hover:text-ink transition-opacity"
                  >
                    {isEs ? cat.titleEs : cat.titleEn}
                  </a>
                </li>
              ))}
              <li className="shrink-0">
                <a
                  href="#custom"
                  className="font-mono uppercase tracking-widest text-[10px] md:text-[11px] text-ink-muted hover:text-ink transition-opacity"
                >
                  {isEs ? 'Personalizado' : 'Custom'}
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* ── Service categories ─────────────────────────────────────────────── */}
        {CATEGORIES.map((cat) => (
          <section
            key={cat.key}
            id={cat.key}
            className="border-b border-hairline-soft py-16 md:py-20 scroll-mt-32"
          >
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Categoría' : 'Category'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-10 md:mb-12"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs ? cat.titleEs : cat.titleEn}
              </h2>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline-soft">
                {cat.services.map((svc) => (
                  <li key={svc.slug} className="border-r border-b border-hairline-soft">
                    <article className="flex flex-col h-full p-6 md:p-7">
                      <div className="flex items-start justify-between gap-3 mb-5 min-h-[24px]">
                        <span className="text-2xl" aria-hidden="true">{svc.icon}</span>
                        <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {isEs ? svc.durationEs : svc.durationEn}
                        </span>
                      </div>

                      <h3
                        className="font-display uppercase text-ink"
                        style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: '1.1' }}
                      >
                        {isEs ? svc.nameEs : svc.nameEn}
                      </h3>

                      <div className="mt-4 mb-1 flex items-baseline gap-2">
                        <span
                          className="font-display text-ink"
                          style={{ fontSize: 'clamp(32px, 3.5vw, 44px)', lineHeight: '1' }}
                        >
                          ${svc.priceUsd.toLocaleString()}
                        </span>
                        <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {isEs ? 'USD desde' : 'USD start'}
                        </span>
                      </div>
                      {svc.priceNote && (
                        <div className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mt-1">
                          {svc.priceNote}
                        </div>
                      )}

                      <ul className="mt-5 space-y-2 text-sm text-ink/85 flex-1">
                        {(isEs ? svc.includesEs : svc.includesEn).map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <span className="mt-1.5 inline-block w-2 h-px bg-ink/60 shrink-0" aria-hidden="true" />
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 pt-5 border-t border-hairline-soft flex gap-2">
                        {svc.canonicalPackageSlug ? (
                          <Link
                            href={`/${locale}/book?service=${svc.canonicalPackageSlug}&cta=prices-page-${svc.slug}`}
                            className="flex-1 inline-flex items-center justify-center font-mono uppercase tracking-widest text-[11px] py-3 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                          >
                            {isEs ? 'Reservar' : 'Book'}
                          </Link>
                        ) : null}
                        <Link
                          href={`/${locale}/get-quote?family=${svc.familySlug}&cta=prices-page-${svc.slug}`}
                          className="flex-1 inline-flex items-center justify-center font-mono uppercase tracking-widest text-[11px] py-3 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
                        >
                          {isEs ? 'Cotizar' : 'Quote'}
                        </Link>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        {/* ── Custom / something special ──────────────────────────────────── */}
        <section id="custom" className="border-b border-hairline-soft py-16 md:py-20 scroll-mt-32">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Personalizado' : 'Custom'}
            </p>
            <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
              <div className="flex-1">
                <h2
                  className="font-display uppercase text-ink"
                  style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
                >
                  {isEs ? '¿Algo especial en mente?' : 'Something special in mind?'}
                </h2>
                <p className="text-ink-muted text-base md:text-lg mt-5 max-w-xl leading-relaxed">
                  {isEs
                    ? 'Si tu proyecto no encaja en ninguna categoría — teatro, moda, arte, video musical u otro — cuéntanos y lo hacemos a medida.'
                    : 'If your project doesn\'t fit any category — theater, fashion, art, music video, or other — tell us and we\'ll tailor it for you.'}
                </p>
              </div>
              <Link
                href={`/${locale}/get-quote`}
                className="shrink-0 inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
              >
                {isEs ? 'Solicitar cotización' : 'Request a quote'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Reserva' : 'Booking'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '1.0' }}
              >
                {isEs ? '¿Listo?' : 'Ready?'}
              </h2>
              <p className="text-ink-muted mb-10 max-w-md mx-auto leading-relaxed">
                {isEs
                  ? 'Elige tu paquete, selecciona fecha y hora, y confirma con tu depósito del 50% en segundos.'
                  : 'Choose your package, pick a date and time, and confirm with your 50% deposit in seconds.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/${locale}/book`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                >
                  {isEs ? 'Reservar ahora' : 'Book now'}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
                >
                  {isEs ? 'Hablar con Michal' : 'Talk to Michal'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
