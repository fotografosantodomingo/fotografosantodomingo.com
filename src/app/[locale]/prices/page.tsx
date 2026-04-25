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
  bookable: boolean // true = "Book Now", false = "Get Quote"
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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
        bookable: true,
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

      <main className="min-h-screen bg-neutral-950 text-white">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="pt-24 pb-12 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-sky-400 text-sm font-semibold tracking-widest uppercase mb-3">
              {isEs ? 'Precios transparentes · Santo Domingo, RD' : 'Transparent pricing · Santo Domingo, DR'}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {isEs ? 'Precios y Servicios' : 'Pricing & Services'}
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              {isEs
                ? 'Todos los precios que ves son de partida. Cada sesión es única — contáctanos si tienes algo especial en mente.'
                : 'All prices shown are starting rates. Every session is unique — reach out if you have something special in mind.'}
            </p>

            {/* quick stats */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
              {[
                { label: isEs ? '25+ servicios' : '25+ services', icon: '📷' },
                { label: isEs ? '50% adelanto' : '50% deposit', icon: '💳' },
                { label: 'USD · DOP', icon: '💱' },
                { label: isEs ? 'Respuesta en 1 h' : '1-hour response', icon: '⚡' },
              ].map(({ label, icon }) => (
                <div key={label} className="flex items-center gap-1.5 text-neutral-300">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Policy banner ─────────────────────────────────────────────────── */}
        <section className="px-4 pb-12">
          <div className="max-w-4xl mx-auto bg-sky-950/60 border border-sky-800/50 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-sky-300 mb-4">
              {isEs ? 'Política de Reserva y Pago' : 'Booking & Payment Policy'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-neutral-300">
              <div className="flex gap-3">
                <span className="text-sky-400 mt-0.5">✓</span>
                <span>
                  {isEs
                    ? '50% de adelanto al reservar vía Stripe (tarjeta, Apple Pay, Google Pay)'
                    : '50% deposit at booking via Stripe (card, Apple Pay, Google Pay)'}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-sky-400 mt-0.5">✓</span>
                <span>
                  {isEs
                    ? 'Saldo restante (50%) pagado en persona el día de la sesión'
                    : 'Remaining balance (50%) paid in person on session day'}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 mt-0.5">↺</span>
                <span>
                  {isEs
                    ? 'Reprogramación gratuita hasta 3 días antes de la sesión'
                    : 'Free rescheduling up to 3 days before the session'}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-amber-400 mt-0.5">!</span>
                <span>
                  {isEs
                    ? 'Sin reembolso si se cancela con menos de 24 h de anticipación'
                    : 'No refund if cancelled within 24 hours of the session'}
                </span>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <span className="text-neutral-400 mt-0.5">💱</span>
                <span>
                  {isEs
                    ? 'Precio en USD. También aceptamos DOP al tipo de cambio del día. El cobro de Stripe siempre es en dólares.'
                    : 'Price in USD. We also accept DOP at the day\'s exchange rate. Stripe charge is always in dollars.'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Service categories ─────────────────────────────────────────────── */}
        {CATEGORIES.map((cat) => (
          <section key={cat.key} className="px-4 pb-16">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-sky-500 inline-block" />
                {isEs ? cat.titleEs : cat.titleEn}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cat.services.map((svc) => (
                  <article
                    key={svc.slug}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-sky-800 transition-colors"
                  >
                    {/* header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-2xl mb-1">{svc.icon}</div>
                        <h3 className="font-semibold text-white leading-tight">
                          {isEs ? svc.nameEs : svc.nameEn}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {isEs ? svc.durationEs : svc.durationEn}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sky-400 font-bold text-lg leading-tight">
                          {isEs ? 'Desde' : 'From'}{' '}
                          <span className="text-white">${svc.priceUsd.toLocaleString()}</span>
                        </div>
                        {svc.priceNote && (
                          <div className="text-xs text-neutral-500">{svc.priceNote}</div>
                        )}
                        {/* TODO Phase 2: add live DOP equivalent via exchange rate API */}
                        <div className="text-xs text-neutral-600 mt-0.5">USD</div>
                      </div>
                    </div>

                    {/* includes */}
                    <ul className="space-y-1.5 flex-1">
                      {(isEs ? svc.includesEs : svc.includesEn).map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-neutral-400">
                          <span className="text-sky-600 mt-0.5 shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* CTAs */}
                    <div className="flex gap-2 mt-auto pt-2">
                      {svc.bookable ? (
                        <Link
                          href={`/${locale}/get-quote?service=${svc.slug}`}
                          className="flex-1 text-center bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                        >
                          {isEs ? 'Reservar' : 'Book Now'}
                        </Link>
                      ) : null}
                      <Link
                        href={`/${locale}/get-quote`}
                        className="flex-1 text-center border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                      >
                        {isEs ? 'Cotizar' : 'Get Quote'}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ── Something special / Other ──────────────────────────────────────── */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-sky-500 inline-block" />
              {isEs ? 'Otro · Personalizado' : 'Other · Custom'}
            </h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="text-5xl">✨</div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-white text-xl mb-1">
                  {isEs ? '¿Tienes algo especial en mente?' : 'Have something special in mind?'}
                </h3>
                <p className="text-neutral-400 text-sm">
                  {isEs
                    ? 'Si tu proyecto no encaja en ninguna categoría — teatro, moda, arte, video musical u otro — cuéntanos y lo hacemos a medida.'
                    : 'If your project doesn\'t fit any category — theater, fashion, art, music video, or other — tell us and we\'ll tailor it for you.'}
                </p>
              </div>
              <Link
                href={`/${locale}/get-quote`}
                className="shrink-0 bg-sky-600 hover:bg-sky-500 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                {isEs ? 'Solicitar Cotización' : 'Request a Quote'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
        <section className="px-4 pb-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">
              {isEs ? '¿Listo para reservar?' : 'Ready to book?'}
            </h2>
            <p className="text-neutral-400 mb-6 text-sm">
              {isEs
                ? 'Elige tu servicio, selecciona fecha y hora, y confirma con tu depósito del 50% en segundos.'
                : 'Choose your service, pick a date and time, and confirm with your 50% deposit in seconds.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${locale}/get-quote`}
                className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
              >
                {isEs ? 'Reservar Ahora' : 'Book Now'}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white font-semibold py-3 px-8 rounded-xl transition-colors"
              >
                {isEs ? 'Hablar con Michal' : 'Talk to Michal'}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
