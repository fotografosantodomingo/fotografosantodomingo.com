import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { getUsdToDopRate } from '@/lib/currency/exchange-rate'
import { formatServicePrice } from '@/lib/currency/format'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const FAMILY_SLUG = 'family-beach-photography'

// Photos rendered in the gallery section. Mirrors src/data/* convention but
// hand-listed here since this is a single-purpose page. SEO metadata for each
// image lives in the portfolio_images table (migration 023) for crawlers; the
// alt strings below are the visual hooks users see.
const PHOTOS = [
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1777485280/Punta_Cana_fotografo_profesional_en_la_playa_sesion_de_fotos_q4wdyf.webp',
    alt: { es: 'Sesión de fotos profesional en la playa de Punta Cana, República Dominicana', en: 'Professional beach photo session in Punta Cana, Dominican Republic' },
    caption: { es: 'Punta Cana — sesión editorial al borde del mar', en: 'Punta Cana — editorial session at the seaside' },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1777485278/Fotografo_en_Punta_Cana_babula_shots_awej9w.webp',
    alt: { es: 'Fotógrafo en Punta Cana — Babula Shots, sesión profesional en la playa', en: 'Photographer in Punta Cana — Babula Shots, professional beach session' },
    caption: { es: 'Punta Cana — Babula Shots', en: 'Punta Cana — Babula Shots' },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1777485282/Sesion_de_fotos_en_Isla_Saona_mqu1bu.webp',
    alt: { es: 'Sesión de fotos en Isla Saona — playa virgen, República Dominicana', en: 'Photo session on Saona Island — virgin beach, Dominican Republic' },
    caption: { es: 'Isla Saona — sesión exclusiva', en: 'Saona Island — exclusive session' },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1777485279/Punta_Cana_fotografo_en_la_playa_retratos_en_hotel_rdxotd.webp',
    alt: { es: 'Fotógrafo en la playa de Punta Cana — retratos en hotel resort', en: 'Photographer at Punta Cana beach — portraits at resort hotel' },
    caption: { es: 'Punta Cana — retratos en hotel resort', en: 'Punta Cana — resort hotel portraits' },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1777485278/Isla_saona_session_de_fotos_en_la_playa_kt9zoj.webp',
    alt: { es: 'Sesión de fotos en la playa de Isla Saona, República Dominicana', en: 'Beach photo session on Saona Island, Dominican Republic' },
    caption: { es: 'Isla Saona — playa virgen', en: 'Saona Island — virgin beach' },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1777485276/fotografo_en_la_playa_punta_cana_republica_dominicana_mhq0ov.webp',
    alt: { es: 'Fotógrafo en la playa de Punta Cana, República Dominicana', en: 'Beach photographer in Punta Cana, Dominican Republic' },
    caption: { es: 'Punta Cana — costa caribeña', en: 'Punta Cana — Caribbean coast' },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1777485275/Bayahibe_Session_de_fotos_en_la_playa_la_romana_fotograf_profesional_i0ypcf.webp',
    alt: { es: 'Sesión de fotos en la playa de Bayahíbe, La Romana — fotógrafo profesional', en: 'Beach photo session in Bayahíbe, La Romana — professional photographer' },
    caption: { es: 'Bayahíbe — La Romana', en: 'Bayahíbe — La Romana' },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1777485274/Juan_Doolio_retratoos_en_la_playa_con_luz_natuiral_fotografo_servicio_boj11c.webp',
    alt: { es: 'Retratos en la playa de Juan Dolio con luz natural — fotógrafo profesional', en: 'Beach portraits in Juan Dolio with natural light — professional photographer' },
    caption: { es: 'Juan Dolio — luz natural', en: 'Juan Dolio — natural light' },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1777485274/playa_fotografo_republica_dominicana_pi8mpw.webp',
    alt: { es: 'Fotógrafo de playa en República Dominicana — sesiones profesionales', en: 'Beach photographer in the Dominican Republic — professional sessions' },
    caption: { es: 'República Dominicana — costa', en: 'Dominican Republic — coast' },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1777485273/fotografo_profesional_fotos_en_la_playa_republica_doominicana_b97k5m.webp',
    alt: { es: 'Fotógrafo profesional fotos en la playa, República Dominicana', en: 'Professional photographer beach photos, Dominican Republic' },
    caption: { es: 'Profesional · República Dominicana', en: 'Professional · Dominican Republic' },
  },
] as const

// Groupings used by the "Beaches we cover" block. Stays inline here because
// it is content for the marketing copy, not a data-layer concept.
const BEACH_REGIONS = {
  east: {
    titleEs: 'Este — Punta Cana, Bávaro & La Romana',
    titleEn: 'East — Punta Cana, Bávaro & La Romana',
    beaches: [
      'Bávaro · Cabeza de Toro · Macao',
      'Punta Cana · Juanillo · Cap Cana',
      'Bayahíbe · Dominicus · La Romana',
      'Isla Saona · Catalina',
    ],
  },
  southCentral: {
    titleEs: 'Sur-Centro — Santo Domingo & alrededores',
    titleEn: 'South-Central — Santo Domingo & surroundings',
    beaches: [
      'Boca Chica · Caribe · Guayacanes',
      'Juan Dolio · Playa Real',
      'Najayo · Palenque',
      'Güibia (urbana en SD)',
    ],
  },
  north: {
    titleEs: 'Norte — Costa Ámbar & Samaná',
    titleEn: 'North — Amber Coast & Samaná',
    beaches: [
      'Cabarete · Sosúa · Encuentro',
      'Puerto Plata · Playa Dorada',
      'Las Terrenas · Playa Cosón',
      'Las Galeras · Playa Rincón',
    ],
  },
  southwest: {
    titleEs: 'Suroeste — Barahona & Pedernales',
    titleEn: 'Southwest — Barahona & Pedernales',
    beaches: [
      'Bahía de las Águilas',
      'Playa San Rafael',
      'Los Patos · Paraíso',
    ],
  },
} as const

type PackageRow = {
  id: string
  slug: string
  name_es: string
  name_en: string
  description_short_es: string | null
  description_short_en: string | null
  inclusions_es: string[]
  inclusions_en: string[]
  duration_min: number
  starting_price_usd: number
  deposit_percent: number
  minimum_billable_hours: number | null
  bookable_direct: boolean
  custom_quote_allowed: boolean
  featured: boolean
  popular_badge: 'most_booked' | 'best_value' | null
  sort_order: number
}

// Only surfaces packages whose slug starts with "beach-" so this page stays
// scoped to the new offering even though family-beach-photography also hosts
// the existing essential / premium / luxury / custom (those continue to live
// on /services/family-beach-photography).
async function loadBeachPackages(): Promise<PackageRow[]> {
  const supabase = createServiceClient()
  const { data: family } = await supabase
    .from('service_families')
    .select('id')
    .eq('slug', FAMILY_SLUG)
    .eq('active', true)
    .maybeSingle()
  if (!family) return []
  const { data: packages } = await supabase
    .from('service_packages')
    .select('id, slug, name_es, name_en, description_short_es, description_short_en, inclusions_es, inclusions_en, duration_min, starting_price_usd, deposit_percent, minimum_billable_hours, bookable_direct, custom_quote_allowed, featured, popular_badge, sort_order')
    .eq('family_id', (family as { id: string }).id)
    .eq('active', true)
    .like('slug', 'beach-%')
    .order('sort_order', { ascending: true })
  return (packages ?? []) as PackageRow[]
}

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  if (locale !== 'es' && locale !== 'en') return { title: 'Not found' }
  const isEs = locale === 'es'
  const title = isEs
    ? 'Sesiones de Fotos en la Playa · República Dominicana | Babula Shots'
    : 'Beach Photo Sessions · Dominican Republic | Babula Shots'
  const description = isEs
    ? 'Sesiones de fotos profesionales en la playa cubriendo Punta Cana, Bávaro, Bayahíbe, Juan Dolio, Isla Saona, Las Terrenas, Cabarete y todas las costas de RD. Desde $250 USD. Golden hour, luz natural y flash editorial.'
    : 'Professional beach photo sessions covering Punta Cana, Bávaro, Bayahíbe, Juan Dolio, Saona Island, Las Terrenas, Cabarete and the entire Dominican coast. From $250 USD. Golden hour, natural light, and editorial flash.'
  const keywords = isEs
    ? 'sesion de fotos en la playa, fotografo de playa republica dominicana, fotos punta cana playa, sesion isla saona, fotografo bavaro, golden hour playa rd, fotos boda playa, fotografo profesional costa caribe'
    : 'beach photo session dominican republic, punta cana beach photographer, saona island photo session, bavaro beach photographer, golden hour beach photography, dominican coast photographer, caribbean beach session'
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${BASE_URL}/${locale}/beach-photo-sessions`,
      languages: {
        es: `${BASE_URL}/es/beach-photo-sessions`,
        en: `${BASE_URL}/en/beach-photo-sessions`,
        'x-default': `${BASE_URL}/es/beach-photo-sessions`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${BASE_URL}/${locale}/beach-photo-sessions`,
      title,
      description,
      siteName: 'Babula Shots',
      images: [{ url: PHOTOS[0].src, width: 1600, height: 900, alt: PHOTOS[0].alt[isEs ? 'es' : 'en'] }],
      locale: isEs ? 'es_DO' : 'en_US',
    },
  }
}

export default async function BeachPhotoSessionsPage({ params: { locale } }: Props) {
  if (locale !== 'es' && locale !== 'en') notFound()
  const isEs = locale === 'es'

  const [packages, dopRate] = await Promise.all([
    loadBeachPackages(),
    getUsdToDopRate(),
  ])
  const directPackages = packages.filter((p) => p.bookable_direct)
  const quoteOnlyPackages = packages.filter((p) => !p.bookable_direct)

  const familyUrl = `/${locale}/services/${FAMILY_SLUG}`
  const quoteUrl = `/${locale}/get-quote?family=${FAMILY_SLUG}&from=beach-sessions`
  const bookUrl = `/${locale}/services/${FAMILY_SLUG}`

  const lowestPrice = directPackages[0]?.starting_price_usd ?? 250
  const highestPrice = directPackages.length
    ? Math.max(...directPackages.map((p) => Number(p.starting_price_usd)))
    : 400

  const pageUrl = `${BASE_URL}/${locale}/beach-photo-sessions`

  // JSON-LD: Service + AggregateOffer + ItemList of bookable offers + Breadcrumb
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: isEs ? 'Servicios' : 'Services', item: `${BASE_URL}/${locale}/services` },
          { '@type': 'ListItem', position: 3, name: isEs ? 'Sesiones de Fotos en la Playa' : 'Beach Photo Sessions' },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: isEs ? 'Sesiones de Fotos en la Playa — República Dominicana' : 'Beach Photo Sessions — Dominican Republic',
        serviceType: 'Photography',
        provider: { '@id': `${BASE_URL}/#business` },
        areaServed: [
          { '@type': 'Country', name: 'Dominican Republic' },
          { '@type': 'City', name: 'Punta Cana' },
          { '@type': 'City', name: 'Bávaro' },
          { '@type': 'City', name: 'Bayahíbe' },
          { '@type': 'City', name: 'Juan Dolio' },
          { '@type': 'City', name: 'Boca Chica' },
          { '@type': 'City', name: 'Las Terrenas' },
          { '@type': 'City', name: 'Cabarete' },
          { '@type': 'Place', name: 'Isla Saona' },
        ],
        description: isEs
          ? 'Sesiones de fotos profesionales en la playa con cobertura de toda la República Dominicana. Tres paquetes desde $250 (mediodía) hasta $400 (golden hour editorial), más cotización personalizada para proyectos a medida.'
          : 'Professional beach photo sessions covering the entire Dominican Republic. Three packages from $250 (mid-day) to $400 (editorial golden hour), plus a custom quote option for bespoke projects.',
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: lowestPrice.toFixed(2),
          highPrice: highestPrice.toFixed(2),
          offerCount: directPackages.length,
          availability: 'https://schema.org/InStock',
          url: pageUrl,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: isEs ? 'Paquetes de sesión en playa' : 'Beach session packages',
          itemListElement: directPackages.map((p) => ({
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: Number(p.starting_price_usd).toFixed(2),
            url: `${BASE_URL}/${locale}/book?service=${FAMILY_SLUG}__${p.slug}`,
            availability: 'https://schema.org/InStock',
            category: 'Beach Photography',
            itemOffered: {
              '@type': 'Service',
              name: isEs ? p.name_es : p.name_en,
              description: (isEs ? p.description_short_es : p.description_short_en) ?? undefined,
            },
            eligibleQuantity: { '@type': 'QuantitativeValue', value: p.duration_min, unitCode: 'MIN' },
          })),
        },
      },
      {
        '@type': 'ImageGallery',
        '@id': `${pageUrl}#gallery`,
        name: isEs ? 'Galería de sesiones en la playa' : 'Beach sessions gallery',
        about: { '@id': `${pageUrl}#service` },
        image: PHOTOS.map((p) => ({
          '@type': 'ImageObject',
          contentUrl: p.src,
          name: p.alt[isEs ? 'es' : 'en'],
          caption: p.caption[isEs ? 'es' : 'en'],
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-canvas text-ink">
        {/* ── HERO ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <nav className="mb-8 flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-ink-muted">
              <Link href={`/${locale}/services`} className="hover:text-ink">{isEs ? 'Servicios' : 'Services'}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-ink">{isEs ? 'Sesiones en la Playa' : 'Beach Sessions'}</span>
            </nav>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Servicio · República Dominicana' : 'Service · Dominican Republic'}
            </p>
            <h1
              className="font-display uppercase text-ink"
              style={{ fontSize: 'clamp(40px, 8vw, 128px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}
            >
              {isEs ? 'Sesiones de fotos en la playa' : 'Beach photo sessions'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-6 leading-relaxed">
              {isEs
                ? 'Cubrimos toda la costa dominicana — Punta Cana, Bávaro, Bayahíbe, Juan Dolio, Isla Saona, Las Terrenas, Cabarete y más. Tres paquetes desde $250, golden hour editorial y opciones a medida con drone, multi-locación y grupos.'
                : 'We cover the entire Dominican coast — Punta Cana, Bávaro, Bayahíbe, Juan Dolio, Saona Island, Las Terrenas, Cabarete and beyond. Three packages from $250, editorial golden hour, and custom options with drone, multi-location, and groups.'}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={bookUrl}
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-canvas hover:opacity-80 transition-opacity"
              >
                {isEs ? 'Reservar ahora' : 'Book now'}
              </Link>
              <Link
                href={quoteUrl}
                className="inline-flex items-center justify-center rounded-full border border-hairline px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink hover:bg-ink hover:text-canvas transition-colors"
              >
                {isEs ? 'Solicitar presupuesto' : 'Request a quote'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── PHOTO GRID ── 2 columns desktop / 1 column mobile, full-bleed
             matching the home-page "Nuestro trabajo" section. */}
        <section className="border-b border-hairline-soft">
          <div className="hidden md:grid relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid-cols-2 gap-0">
            {PHOTOS.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`d-${i}`}
                src={p.src}
                alt={p.alt[isEs ? 'es' : 'en']}
                title={p.caption[isEs ? 'es' : 'en']}
                width={2400}
                height={1350}
                sizes="(min-width: 768px) 50vw, 100vw"
                loading={i < 2 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
                className="w-full h-auto object-contain block"
              />
            ))}
          </div>
          <div className="md:hidden relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid grid-cols-1 gap-0">
            {PHOTOS.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`m-${i}`}
                src={p.src}
                alt={p.alt[isEs ? 'es' : 'en']}
                title={p.caption[isEs ? 'es' : 'en']}
                width={1600}
                height={900}
                sizes="100vw"
                loading={i < 1 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
                className="w-full h-auto object-contain block"
              />
            ))}
          </div>
        </section>

        {/* ── BEACHES WE COVER ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Cobertura' : 'Coverage'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Toda la costa dominicana' : 'The entire Dominican coast'}
            </h2>
            <p className="text-ink/85 text-base md:text-lg leading-relaxed max-w-3xl mb-12">
              {isEs
                ? 'Trabajamos en cualquier playa de República Dominicana. Si tu sesión está fuera del Distrito Nacional sumamos el costo de transporte/peajes con transparencia, sin sorpresas. Si necesitas una playa en concreto que no figura abajo, escríbenos — la conocemos o la encontramos.'
                : 'We work at any beach in the Dominican Republic. If your session is outside the National District we add transparent transport/toll costs — no surprises. If you need a specific beach not listed below, ask us; we either know it or will find it.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-5xl">
              {Object.entries(BEACH_REGIONS).map(([key, r]) => (
                <div key={key}>
                  <h3 className="font-display uppercase text-ink mb-4" style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', lineHeight: '1.1' }}>
                    {isEs ? r.titleEs : r.titleEn}
                  </h3>
                  <ul className="space-y-2 text-ink/85 text-base leading-relaxed">
                    {r.beaches.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <span className="mt-2 inline-block w-2 h-px bg-ink/60 shrink-0" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LIGHTING + TECHNIQUES ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Técnicas' : 'Techniques'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'La luz hace la foto' : 'Light makes the photograph'}
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl mb-12">
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'En la playa la luz cambia cada minuto. La hora dorada — los 60 minutos después del amanecer y antes del atardecer — entrega tonos cálidos, sombras largas y cielos cinematográficos. Es el momento que mejor renderiza piel, agua y arena, y por eso nuestro paquete Golden Hour está editado al nivel de revista.'
                  : 'On the beach the light shifts every minute. Golden hour — the 60 minutes after sunrise and before sunset — delivers warm tones, long shadows, and cinematic skies. It is the window that best renders skin, water, and sand, and that is why our Golden Hour package ships with magazine-grade retouching.'}
              </p>
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Para sesiones a mediodía o cuando el sol pega fuerte, mezclamos luz natural con flash de relleno (off-camera) para mantener la piel uniforme y eliminar sombras duras debajo de los ojos. Si prefieres una estética 100 % natural, dirigimos al cliente buscando la mejor luz disponible y trabajamos contraluz para silueta cuando aplique.'
                  : 'For mid-day sessions or harsh-sun moments, we blend natural light with off-camera fill flash to keep skin even and erase hard under-eye shadows. If you prefer a 100 % natural look, we direct the subject toward the best available light and use backlight for silhouette work when it suits the story.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-hairline-soft max-w-5xl">
              {(isEs
                ? [
                    { num: '01', title: 'Luz natural', body: 'Estética suave, tonos del día. Ideal para retratos casuales y familias.' },
                    { num: '02', title: 'Flash editorial', body: 'Luz controlada con strobes off-camera para look de campaña al mediodía.' },
                    { num: '03', title: 'Golden hour', body: 'Color grading cinematográfico con tonos cálidos y skies dramáticos.' },
                  ]
                : [
                    { num: '01', title: 'Natural light', body: 'Soft aesthetic, daytime tones. Best for casual portraits and families.' },
                    { num: '02', title: 'Editorial flash', body: 'Off-camera strobes for a campaign look even in harsh midday sun.' },
                    { num: '03', title: 'Golden hour', body: 'Cinematic color grading with warm tones and dramatic skies.' },
                  ]
              ).map((item) => (
                <div key={item.num} className="border-r border-b border-hairline-soft p-7 md:p-8">
                  <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">{item.num}</span>
                  <h3 className="font-display uppercase text-ink mt-3" style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: '1.1' }}>
                    {item.title}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed mt-3">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PACKAGES (live from DB) ── */}
        {directPackages.length > 0 && (
          <BeachPackageGrid
            heading={isEs ? 'Paquetes para reservar online' : 'Packages bookable online'}
            packages={directPackages}
            locale={locale}
            isEs={isEs}
            dopRate={dopRate.usdToDop}
          />
        )}

        {quoteOnlyPackages.length > 0 && (
          <BeachPackageGrid
            heading={isEs ? 'Solo por cotización personalizada' : 'Custom quote only'}
            packages={quoteOnlyPackages}
            locale={locale}
            isEs={isEs}
            quoteOnly
            dopRate={dopRate.usdToDop}
          />
        )}

        <section className="border-b border-hairline-soft py-10 md:py-12">
          <div className="container mx-auto px-4">
            <p className="max-w-3xl text-ink-muted text-sm leading-relaxed">
              {isEs ? 'Las galerías completas viven en ' : 'Full galleries live on '}
              <Link href={`/${locale}/portfolio?category=beach`} className="underline hover:text-ink">
                {isEs ? 'el portafolio · categoría Playa' : 'the portfolio · Beach category'}
              </Link>
              {isEs ? '. Para retratos editoriales en estudio, ver ' : '. For editorial studio portraits, see '}
              <Link href={`/${locale}/photo-studio-santo-domingo`} className="underline hover:text-ink">
                {isEs ? 'Estudio · Fashion Editorial' : 'Studio · Fashion Editorial'}
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h2
              className="font-display uppercase text-ink mb-6"
              style={{ fontSize: 'clamp(28px, 5vw, 72px)', lineHeight: '1.0' }}
            >
              {isEs ? '¿Listo para tu sesión?' : 'Ready for your session?'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mx-auto mb-10">
              {isEs
                ? 'Cuéntanos la playa, la fecha y el tipo de sesión. Volvemos con plan de luz, locación recomendada y confirmación en menos de 24 horas.'
                : 'Tell us the beach, the date, and the session type. We come back with a lighting plan, recommended spot, and confirmation in under 24 hours.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={bookUrl}
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-canvas hover:opacity-80 transition-opacity"
              >
                {isEs ? 'Reservar ahora' : 'Book now'}
              </Link>
              <Link
                href={quoteUrl}
                className="inline-flex items-center justify-center rounded-full border border-hairline px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink hover:bg-ink hover:text-canvas transition-colors"
              >
                {isEs ? 'Solicitar presupuesto' : 'Request a quote'}
              </Link>
              <Link
                href={`/${locale}/prices`}
                className="inline-flex items-center justify-center rounded-full border border-hairline-soft px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink-muted hover:text-ink hover:border-hairline transition-colors"
              >
                {isEs ? 'Ver todos los precios' : 'See all pricing'}
              </Link>
            </div>
            <p className="mt-10 text-ink-muted text-sm">
              <a href="https://wa.me/18097209547" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                WhatsApp +1 (809) 720-9547
              </a>
              {' · '}
              <Link href={`/${locale}/contact`} className="underline hover:text-ink">
                {isEs ? 'Contactar' : 'Contact'}
              </Link>
              {' · '}
              <Link href={familyUrl} className="underline hover:text-ink">
                {isEs ? 'Ver familia · Playa & Familia' : 'See family · Beach & Family'}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Package grid — mirrors the family-page layout so users see the same card
// shape across the site. Direct-book packages link to the wizard with the
// composite ?service=family__package param (see project_package_slug_collisions
// memory). Quote-only links straight into the prefilled get-quote form.
function BeachPackageGrid({
  heading,
  packages,
  locale,
  isEs,
  quoteOnly,
  dopRate,
}: {
  heading: string
  packages: PackageRow[]
  locale: string
  isEs: boolean
  quoteOnly?: boolean
  dopRate: number
}) {
  return (
    <section className="border-b border-hairline-soft py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 font-mono uppercase tracking-widest text-[11px] text-ink-muted">
          {heading}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline-soft">
          {packages.map((p) => {
            const name = isEs ? p.name_es : p.name_en
            const desc = isEs ? p.description_short_es : p.description_short_en
            const inclusions = isEs ? p.inclusions_es : p.inclusions_en
            const price = Number(p.starting_price_usd)
            const href = quoteOnly
              ? `/${locale}/get-quote?family=${FAMILY_SLUG}&package=${p.slug}&from=beach-sessions`
              : `/${locale}/book?service=${FAMILY_SLUG}__${p.slug}&from=beach-sessions`
            return (
              <li key={p.id} className="border-r border-b border-hairline-soft">
                <Link
                  href={href}
                  className={`group flex flex-col h-full p-7 md:p-8 lg:p-10 hover:bg-ink/5 transition-colors duration-200 ${
                    p.featured ? 'bg-ink/[0.03]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-5 min-h-[24px]">
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {p.popular_badge
                        ? p.popular_badge.replace('_', ' ')
                        : p.featured
                          ? (isEs ? 'Destacado' : 'Featured')
                          : ''}
                    </span>
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {p.minimum_billable_hours
                        ? `${p.minimum_billable_hours}h ${isEs ? 'mín' : 'min'}`
                        : `${p.duration_min} min`}
                    </span>
                  </div>

                  <h3
                    className="font-display uppercase text-ink"
                    style={{ fontSize: 'clamp(22px, 2.2vw, 30px)', lineHeight: '1.05' }}
                  >
                    {name}
                  </h3>

                  {(() => {
                    const formatted = formatServicePrice(price, locale, dopRate)
                    return (
                      <div className="mt-5 mb-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            className="font-display text-ink"
                            style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: '1.0' }}
                          >
                            {price > 0 ? formatted.primary : (isEs ? 'A medida' : 'Custom')}
                          </span>
                          {price > 0 && (
                            <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                              {isEs ? 'desde' : 'start'}
                              {formatted.primarySuffix ? ` · ${formatted.primarySuffix}` : ''}
                            </span>
                          )}
                        </div>
                        {price > 0 && formatted.usdReference && (
                          <p className="mt-1 font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                            {formatted.usdReference}
                          </p>
                        )}
                      </div>
                    )
                  })()}

                  {desc && <p className="mt-4 text-sm text-ink-muted leading-relaxed">{desc}</p>}

                  {inclusions.length > 0 && (
                    <ul className="mt-6 space-y-2 text-sm text-ink/80 flex-1">
                      {inclusions.slice(0, 4).map((inc, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-1.5 inline-block w-2 h-px bg-ink/60 shrink-0" aria-hidden="true" />
                          <span className="leading-snug">{inc}</span>
                        </li>
                      ))}
                      {inclusions.length > 4 && (
                        <li className="font-mono uppercase tracking-widest text-[10px] text-ink-muted pl-[18px]">
                          +{inclusions.length - 4} {isEs ? 'más' : 'more'}
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="mt-8 pt-6 border-t border-hairline-soft flex items-center justify-between">
                    <span className="font-mono uppercase tracking-widest text-[11px] text-ink inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                      {quoteOnly
                        ? (isEs ? 'Pedir cotización' : 'Get a quote')
                        : (isEs ? 'Reservar' : 'Book now')}
                      <span aria-hidden="true">→</span>
                    </span>
                    {!quoteOnly && p.bookable_direct && (
                      <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                        {p.deposit_percent}% {isEs ? 'depósito' : 'deposit'}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
