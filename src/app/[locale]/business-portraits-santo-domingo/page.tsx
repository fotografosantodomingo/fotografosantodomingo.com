import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { getUsdToDopRate } from '@/lib/currency/exchange-rate'
import { formatServicePrice } from '@/lib/currency/format'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const FAMILY_SLUG = 'commercial-branding-photography'

// Cloudinary URL helper — public_ids stay self-documenting (descriptive
// slugs from migration 025) so search engines pick up the keywords from
// the path even before reading the alt attribute.
const CL = 'https://res.cloudinary.com/dwewurxla/image/upload'
function cl(publicId: string): string {
  return `${CL}/f_auto,q_auto/${publicId}.webp`
}
// Takes a URL produced by cl() and returns a width-resized variant
function clResize(url: string, w: number): string {
  return url.replace('/f_auto,q_auto/', `/w_${w},f_auto,q_auto/`)
}
// Generates a 2-stop srcSet from a cl() URL
function clSrcSet(url: string, small: number, large: number): string {
  return `${clResize(url, small)} ${small}w, ${clResize(url, large)} ${large}w`
}

// 13 studio / indoor business headshots. Order: featured / strongest
// composition first so they ride the eager-load LCP window.
const INDOOR_PHOTOS = [
  {
    src: cl('v1777564259/Babula_Shots_RD_retratos_profesonal_10_ulwcfr'),
    alt: { es: 'Retrato profesional para LinkedIn — Santo Domingo, República Dominicana', en: 'Professional LinkedIn portrait — Santo Domingo, Dominican Republic' },
  },
  {
    src: cl('v1777564258/Babula_Shots_RD_retratos_profesonal_2_ewbn3k'),
    alt: { es: 'Sesión de fotos headshots profesionales en estudio — Santo Domingo', en: 'Professional studio headshot session — Santo Domingo' },
  },
  {
    src: cl('v1777564257/Babula_Shots_Rd_jp8tkg'),
    alt: { es: 'Fotógrafo de marca personal en Santo Domingo, República Dominicana', en: 'Personal-brand photographer in Santo Domingo, Dominican Republic' },
  },
  {
    src: cl('v1777564257/Babula_Shots_Rd_-132_ovgumg'),
    alt: { es: 'Retratos corporativos para ejecutivos en RD — fondo neutro estudio', en: 'Corporate portraits for executives in DR — neutral studio backdrop' },
  },
  {
    src: cl('v1777564256/Babula_Shots_Rd_-116_x5lefx'),
    alt: { es: 'Fotos para perfil profesional LinkedIn Santo Domingo — Babula Shots', en: 'Photos for LinkedIn professional profile Santo Domingo — Babula Shots' },
  },
  {
    src: cl('v1777564254/Babula_Shots_Rd_-23_idqwcx'),
    alt: { es: 'Sesión de fotos para empresa en estudio — Santo Domingo, RD', en: 'Corporate company photo session in studio — Santo Domingo, DR' },
  },
  {
    src: cl('v1777564253/Babula_Shots_Rd_-21_l0rdrb'),
    alt: { es: 'Retratos corporativos profesionales — fotógrafo Santo Domingo', en: 'Professional corporate portraits — photographer Santo Domingo' },
  },
  {
    src: cl('v1777564252/Babula_Shots_Rd_-20_vkanwc'),
    alt: { es: 'Headshot ejecutivo en estudio — Santo Domingo, República Dominicana', en: 'Executive headshot in studio — Santo Domingo, Dominican Republic' },
  },
  {
    src: cl('v1777564255/Babula_Shots_Rd_-108_vvplfw'),
    alt: { es: 'Sesión de marca personal LinkedIn — Babula Shots Santo Domingo', en: 'Personal-branding LinkedIn session — Babula Shots Santo Domingo' },
  },
  {
    src: cl('v1777564252/Babula_Shots_Rd_-19_s1czqc'),
    alt: { es: 'Retrato profesional para empresa en Santo Domingo, RD', en: 'Professional corporate portrait in Santo Domingo, DR' },
  },
  {
    src: cl('v1777564251/Babula_Shots_Rd_-9_2_evh3fr'),
    alt: { es: 'Sesión de headshots profesionales en estudio Santo Domingo', en: 'Professional headshot session in studio Santo Domingo' },
  },
  {
    src: cl('v1777564250/Babula_Shots_Rd_-4_w5y6ot'),
    alt: { es: 'Retratos corporativos para ejecutivos — fotógrafo profesional RD', en: 'Corporate portraits for executives — professional photographer DR' },
  },
  {
    src: cl('v1777564250/Babula_Shots_Rd_-3_atumo9'),
    alt: { es: 'Fotos de marca personal para emprendedores — Santo Domingo, RD', en: 'Personal-brand photos for entrepreneurs — Santo Domingo, DR' },
  },
] as const

// 4 outdoor / location business portraits — for clients who want the
// shoot at their office, on a balcony, or at a chosen Santo Domingo /
// Punta Cana exterior.
const OUTDOOR_PHOTOS = [
  {
    src: cl('v1777564601/Babula_Shots_RD_retratos_profesonal_8_blkhrv'),
    alt: { es: 'Retrato de negocios en exteriores — Santo Domingo o Punta Cana', en: 'Outdoor business portrait — Santo Domingo or Punta Cana' },
  },
  {
    src: cl('v1777564601/Babula_Shots_RD_retratos_profesonal_5_chjpto'),
    alt: { es: 'Sesión de retratos corporativos en exteriores — República Dominicana', en: 'Outdoor corporate portrait session — Dominican Republic' },
  },
  {
    src: cl('v1777564603/Babula_Shots_Rd_-6_xeqivl'),
    alt: { es: 'Fotógrafo de retratos corporativos en exteriores — Santo Domingo', en: 'Outdoor corporate portrait photographer — Santo Domingo' },
  },
  {
    src: cl('v1777564602/Babula_Shots_Rd_-9_ja4tck'),
    alt: { es: 'Retrato corporativo en oficina o locación elegida — RD', en: 'Corporate portrait at office or chosen location — DR' },
  },
] as const

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

async function loadCommercialPackages(): Promise<PackageRow[]> {
  const supabase = createServiceClient()
  const { data: family } = await supabase
    .from('service_families')
    .select('id')
    .eq('slug', FAMILY_SLUG)
    .eq('active', true)
    .maybeSingle()
  if (!family) return []
  const { data } = await supabase
    .from('service_packages')
    .select('id, slug, name_es, name_en, description_short_es, description_short_en, inclusions_es, inclusions_en, duration_min, starting_price_usd, deposit_percent, minimum_billable_hours, bookable_direct, custom_quote_allowed, featured, popular_badge, sort_order')
    .eq('family_id', (family as { id: string }).id)
    .eq('active', true)
    .order('sort_order', { ascending: true })
  return (data ?? []) as PackageRow[]
}

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  if (locale !== 'es' && locale !== 'en') return { title: 'Not found' }
  const isEs = locale === 'es'
  const titleAbsolute = isEs
    ? 'Retratos Corporativos y LinkedIn · Santo Domingo, RD | Babula Shots'
    : 'Corporate & LinkedIn Portraits · Santo Domingo, DR | Babula Shots'
  const description = isEs
    ? 'Fotos para perfil profesional LinkedIn, retratos corporativos para ejecutivos y sesiones de marca personal en Santo Domingo. Estudio profesional con iluminación controlada o servicio in-house en tu oficina. Desde $400 USD.'
    : 'LinkedIn profile photos, corporate executive portraits, and personal-branding sessions in Santo Domingo. Professional studio with controlled lighting or on-site service at your office. From $400 USD.'
  const keywords = isEs
    ? 'fotos para perfil profesional linkedin santo domingo, retratos corporativos para ejecutivos en rd, sesion de fotos headshots profesionales en estudio, fotografo de marca personal en santo domingo, fotografo corporativo republica dominicana, headshots ejecutivos santo domingo'
    : 'linkedin profile photos santo domingo, corporate executive portraits dominican republic, professional headshot session studio, personal brand photographer santo domingo, corporate photographer dominican republic, executive headshots santo domingo'

  return {
    title: { absolute: titleAbsolute },
    description,
    keywords,
    alternates: {
      canonical: `${BASE_URL}/${locale}/business-portraits-santo-domingo`,
      languages: {
        es: `${BASE_URL}/es/business-portraits-santo-domingo`,
        en: `${BASE_URL}/en/business-portraits-santo-domingo`,
        'x-default': `${BASE_URL}/es/business-portraits-santo-domingo`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${BASE_URL}/${locale}/business-portraits-santo-domingo`,
      title: titleAbsolute,
      description,
      siteName: 'Babula Shots',
      images: [{ url: INDOOR_PHOTOS[0].src, width: 1200, height: 1500, alt: INDOOR_PHOTOS[0].alt[isEs ? 'es' : 'en'] }],
      locale: isEs ? 'es_DO' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleAbsolute,
      description,
      images: [INDOOR_PHOTOS[0].src],
    },
  }
}

export default async function BusinessPortraitsPage({ params: { locale } }: Props) {
  if (locale !== 'es' && locale !== 'en') notFound()
  const isEs = locale === 'es'

  const [packages, dopRate] = await Promise.all([
    loadCommercialPackages(),
    getUsdToDopRate(),
  ])
  const directPackages = packages.filter((p) => p.bookable_direct)
  const quoteOnlyPackages = packages.filter((p) => !p.bookable_direct)

  const familyUrl = `/${locale}/services/${FAMILY_SLUG}`
  const quoteUrl = `/${locale}/get-quote?family=${FAMILY_SLUG}&from=business-portraits`
  const bookUrl = `/${locale}/services/${FAMILY_SLUG}`

  const lowestPrice = directPackages[0]?.starting_price_usd ?? 400
  const highestPrice = directPackages.length
    ? Math.max(...directPackages.map((p) => Number(p.starting_price_usd)))
    : 1200

  const pageUrl = `${BASE_URL}/${locale}/business-portraits-santo-domingo`

  // FAQ — long-tail SEO + rich-result eligibility (FAQPage schema below)
  const FAQS: { q: string; a: string }[] = isEs
    ? [
        { q: '¿Cuánto cuesta una sesión de retratos corporativos en Santo Domingo?', a: 'Tres paquetes a precio fijo: $400 USD (Esencial · 1 hora · 1 persona), $700 USD (Branding Premium · 3 horas · multi-look + locación) y $1,200 USD (Campaña de Lujo · día completo con dirección de arte). Para empresas con varios ejecutivos cotizamos por persona con descuentos por volumen.' },
        { q: '¿Hacen sesiones grupales para equipos ejecutivos?', a: 'Sí. Manejamos sesiones de 5 a 50+ ejecutivos en una jornada con consistencia de luz, fondo y dirección — todos con el mismo look para web corporativa, LinkedIn y prensa. Precio por persona en sesiones grupales es típicamente $80-$120 USD según volumen y entregables.' },
        { q: '¿Vienen a la oficina o solo en estudio?', a: 'Ambas opciones. El estudio en Santo Domingo está totalmente equipado (flashes, modeladores, fondos seamless en blanco, gris y negro). Para servicio in-house llegamos a tu oficina con kit completo de iluminación portátil y fondo de viaje — perfecto para días de team photos sin sacar al equipo del edificio.' },
        { q: '¿Cuánto tarda la entrega de fotos?', a: 'Sesión Esencial: 5-7 días con 5 fotos editadas. Branding Premium: 7-10 días con 15 fotos. Campaña de Lujo: 10-14 días con 30 fotos editadas a nivel campaña. Servicio express en 48h disponible con recargo del 50%.' },
        { q: '¿Qué debo llevar a la sesión?', a: '2-3 cambios de outfit (1 formal, 1 business casual, 1 según marca personal). Maquillaje natural — si necesitas MUA profesional la coordinamos por $80-$150 USD. Llega 10 min antes para respiración y ajuste de pelo. Trabajamos con ti la pose y expresión durante toda la sesión.' },
        { q: '¿Editan retoque de piel y color?', a: 'Sí, retoque profesional incluido en todos los paquetes: corrección de color, suavizado natural de piel, eliminación de imperfecciones temporales, ajuste de iluminación y dodge & burn editorial. Mantenemos look natural — no Photoshop excesivo.' },
        { q: '¿Pueden hacer fotos en exteriores en lugar de estudio?', a: 'Sí. Para retratos corporativos en exteriores usamos locaciones como la Zona Colonial, hoteles boutique, oficinas con vista, o cualquier lugar de tu elección en Santo Domingo o Punta Cana. La estética es más editorial y menos formal — ideal para perfiles de emprendedores, marcas personales o ejecutivos que quieren un look diferenciador.' },
        { q: '¿Cómo funciona el depósito y cancelación?', a: '50% de depósito vía Stripe (tarjeta, Apple Pay o Google Pay) para confirmar la fecha. El saldo se paga el día de la sesión. Reembolsable hasta 7 días antes; transferible a otra fecha sin costo dentro del rango.' },
      ]
    : [
        { q: 'How much does a corporate portrait session cost in Santo Domingo?', a: 'Three flat-rate packages: $400 USD (Essential · 1 hour · 1 person), $700 USD (Premium Branding · 3 hours · multi-look + location), and $1,200 USD (Luxury Campaign · full day with art direction). For companies with multiple executives, we quote per-person with volume discounts.' },
        { q: 'Do you handle group sessions for executive teams?', a: 'Yes. We run sessions of 5 to 50+ executives in a single day with consistent light, backdrop, and direction — every team member shot the same way for corporate web, LinkedIn, and press use. Per-person pricing in group sessions is typically $80-$120 USD depending on volume and deliverables.' },
        { q: 'Do you come to the office or only shoot in studio?', a: 'Both. The Santo Domingo studio is fully equipped (strobes, modifiers, seamless backdrops in white, grey, and black). For on-site service we arrive at your office with a full portable lighting kit and travel backdrop — perfect for company team-photo days without taking the team out of the building.' },
        { q: 'How long does delivery take?', a: 'Essential session: 5-7 days with 5 edited photos. Premium Branding: 7-10 days with 15 photos. Luxury Campaign: 10-14 days with 30 campaign-grade edits. Express delivery in 48h is available with a 50% surcharge.' },
        { q: 'What should I bring to the session?', a: '2-3 outfit changes (1 formal, 1 business casual, 1 reflecting your personal brand). Natural makeup — if you need a professional MUA, we coordinate one for $80-$150 USD. Arrive 10 min early to breathe and fix hair. We direct pose and expression throughout the session.' },
        { q: 'Do you edit skin and color retouching?', a: 'Yes — professional retouching included in every package: color correction, natural skin smoothing, temporary blemish removal, lighting cleanup, and editorial dodge & burn. We keep the look natural — no over-Photoshopped feel.' },
        { q: 'Can you shoot outdoors instead of in studio?', a: 'Yes. For outdoor corporate portraits we use locations like the Colonial Zone, boutique hotels, offices with a view, or any spot of your choice in Santo Domingo or Punta Cana. The aesthetic skews more editorial and less formal — ideal for entrepreneurs, personal brands, or executives wanting a differentiated look.' },
        { q: 'How does the deposit and cancellation policy work?', a: '50% deposit via Stripe (card, Apple Pay, or Google Pay) to lock the date. Balance due on session day. Refundable up to 7 days before; transferable to another date at no cost within the window.' },
      ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: isEs ? 'Servicios' : 'Services', item: `${BASE_URL}/${locale}/services` },
          { '@type': 'ListItem', position: 3, name: isEs ? 'Comercial y Branding' : 'Commercial & Branding', item: `${BASE_URL}/${locale}/services/${FAMILY_SLUG}` },
          { '@type': 'ListItem', position: 4, name: isEs ? 'Retratos Corporativos y LinkedIn' : 'Corporate & LinkedIn Portraits' },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: isEs ? 'Retratos Corporativos y LinkedIn — Santo Domingo' : 'Corporate & LinkedIn Portraits — Santo Domingo',
        serviceType: 'Photography',
        provider: { '@id': `${BASE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Santo Domingo' },
          { '@type': 'City', name: 'Punta Cana' },
          { '@type': 'Country', name: 'Dominican Republic' },
        ],
        description: isEs
          ? 'Fotografía profesional de retratos corporativos, headshots para LinkedIn y sesiones de marca personal en estudio o in-house en Santo Domingo y Punta Cana.'
          : 'Professional corporate portrait, LinkedIn headshot, and personal-branding photography in studio or on-site across Santo Domingo and Punta Cana.',
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
          name: isEs ? 'Paquetes de retratos corporativos' : 'Corporate portrait packages',
          itemListElement: directPackages.map((p) => ({
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: Number(p.starting_price_usd).toFixed(2),
            url: `${BASE_URL}/${locale}/book?service=${FAMILY_SLUG}__${p.slug}`,
            availability: 'https://schema.org/InStock',
            category: 'Corporate Photography',
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
        name: isEs ? 'Galería de retratos corporativos' : 'Corporate portrait gallery',
        about: { '@id': `${pageUrl}#service` },
        image: [...INDOOR_PHOTOS, ...OUTDOOR_PHOTOS].map((p) => ({
          '@type': 'ImageObject',
          contentUrl: p.src,
          name: p.alt[isEs ? 'es' : 'en'],
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
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
            <nav className="mb-8 flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-ink-muted flex-wrap">
              <Link href={`/${locale}/services`} className="hover:text-ink">{isEs ? 'Servicios' : 'Services'}</Link>
              <span aria-hidden="true">/</span>
              <Link href={familyUrl} className="hover:text-ink">{isEs ? 'Comercial y Branding' : 'Commercial & Branding'}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-ink">{isEs ? 'Retratos Corporativos' : 'Corporate Portraits'}</span>
            </nav>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'LinkedIn · Ejecutivos · Marca Personal' : 'LinkedIn · Executives · Personal Brand'}
            </p>
            <h1
              className="font-display uppercase text-ink"
              style={{ fontSize: 'clamp(40px, 8vw, 128px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}
            >
              {isEs ? 'Retratos corporativos y LinkedIn' : 'Corporate & LinkedIn portraits'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-6 leading-relaxed">
              {isEs
                ? 'Fotos para perfil profesional LinkedIn, retratos para ejecutivos y sesiones de marca personal en Santo Domingo. Estudio totalmente equipado o servicio in-house en tu oficina — llevamos luz, fondo y dirección.'
                : 'LinkedIn profile photos, executive portraits, and personal-branding sessions in Santo Domingo. Fully equipped studio or on-site service at your office — we bring lighting, backdrop, and direction.'}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={bookUrl}
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-canvas hover:opacity-80 transition-opacity"
              >
                {isEs ? 'Reservar sesión' : 'Book a session'}
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

        {/* ── INDOOR / STUDIO GALLERY ── 13 photos
             Desktop: row 1 = 6 photos (md:grid-cols-6), row 2 = 7 photos
             (md:grid-cols-7). Two separate grids so the split is exact.
             Mobile: 1 column full-bleed, no crop, photos cover screen
             side-to-side via w-screen + negative margin. */}
        <section className="border-b border-hairline-soft bg-canvas">
          <div className="md:hidden relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            {INDOOR_PHOTOS.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`m-${p.src}`}
                src={clResize(p.src, 828)}
                srcSet={clSrcSet(p.src, 828, 1200)}
                sizes="100vw"
                width={1200}
                height={1500}
                alt={p.alt[isEs ? 'es' : 'en']}
                className="block h-auto w-full"
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            ))}
          </div>
          <div className="hidden md:block relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <div className="grid grid-cols-6 gap-0">
              {INDOOR_PHOTOS.slice(0, 6).map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`d1-${p.src}`}
                  src={clResize(p.src, 600)}
                  srcSet={clSrcSet(p.src, 600, 1200)}
                  sizes="calc(100vw / 6)"
                  width={1200}
                  height={1500}
                  alt={p.alt[isEs ? 'es' : 'en']}
                  className="block h-auto w-full object-cover"
                  loading={i < 3 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0">
              {INDOOR_PHOTOS.slice(6).map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`d2-${p.src}`}
                  src={clResize(p.src, 600)}
                  srcSet={clSrcSet(p.src, 600, 1200)}
                  sizes="calc(100vw / 7)"
                  width={1200}
                  height={1500}
                  alt={p.alt[isEs ? 'es' : 'en']}
                  className="block h-auto w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── INDOOR / STUDIO COPY ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Estudio profesional' : 'Professional studio'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Retratos en estudio · luz y fondo controlados' : 'Studio portraits · controlled light & backdrop'}
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl">
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Nuestro estudio en Santo Domingo está pensado para retratos corporativos, headshots de LinkedIn y sesiones de marca personal con la consistencia que esperan medios, web corporativa y agencias. Trabajamos con flashes profesionales, modeladores y fondos seamless en blanco, gris y negro. La luz se decide antes del shoot — no se descubre durante.'
                  : 'Our Santo Domingo studio is built for corporate portraits, LinkedIn headshots, and personal-branding sessions with the consistency media, corporate web, and agencies expect. We use professional strobes, modifiers, and seamless backdrops in white, grey, and black. Lighting is decided before the shoot, not discovered during.'}
              </p>
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Tethering en vivo a un monitor grande durante la sesión: cada toma se revisa en pantalla en tiempo real para ajustar pose, expresión, ángulo de cabeza y micro-detalles antes de cerrar el frame. Es la diferencia entre 200 fotos sin saber cuál usar y 5 fotos editoriales perfectas listas para tu próximo lanzamiento.'
                  : 'Live tethering to a large monitor during the session — every frame is reviewed in real time so we adjust pose, expression, head angle, and micro-details before closing the frame. The difference between 200 photos with no clear keeper and 5 editorial-grade portraits ready for your next launch.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── OUTDOOR GALLERY ── 4 photos in 1 row (desktop) / stacked (mobile) */}
        <section className="border-b border-hairline-soft bg-canvas">
          <div className="md:hidden relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            {OUTDOOR_PHOTOS.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`mo-${p.src}`}
                src={clResize(p.src, 828)}
                srcSet={clSrcSet(p.src, 828, 1200)}
                sizes="100vw"
                width={1500}
                height={1200}
                alt={p.alt[isEs ? 'es' : 'en']}
                className="block h-auto w-full"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
          <div className="hidden md:grid relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid-cols-4 gap-0">
            {OUTDOOR_PHOTOS.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`do-${p.src}`}
                src={clResize(p.src, 828)}
                srcSet={clSrcSet(p.src, 828, 1200)}
                sizes="25vw"
                width={1500}
                height={1200}
                alt={p.alt[isEs ? 'es' : 'en']}
                className="block h-auto w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </section>

        {/* ── OUTDOOR / LOCATION COPY ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Locación a elección' : 'Location of your choice'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Retratos en exteriores' : 'Outdoor portraits'}
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl">
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Si quieres un look más editorial y diferenciador, salimos del estudio. Locaciones típicas: Zona Colonial, hoteles boutique con arquitectura interesante, oficinas con vista, balcones, terrazas o cualquier punto de Santo Domingo y Punta Cana que conecte con tu marca personal o sector.'
                  : 'For a more editorial, differentiated look we step out of the studio. Typical locations: the Colonial Zone, boutique hotels with interesting architecture, offices with a view, balconies, rooftops, or any spot in Santo Domingo or Punta Cana that connects with your personal brand or industry.'}
              </p>
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Llevamos kit de iluminación portátil para mantener la calidad de estudio incluso en exteriores: flash con softbox, reflectores y modeladores compactos. Esto nos permite trabajar en mediodía, luz dura o sombra profunda con resultados consistentes — no dependemos de la luz disponible.'
                  : 'We bring a portable lighting kit so studio-quality lighting comes with us: strobe + softbox, reflectors, and compact modifiers. This means we shoot through midday harsh sun or deep shade with consistent results — never relying solely on available light.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── PACKAGES ── live from DB */}
        {directPackages.length > 0 && (
          <BizPackageGrid
            heading={isEs ? 'Paquetes para reservar online' : 'Packages bookable online'}
            packages={directPackages}
            locale={locale}
            isEs={isEs}
            dopRate={dopRate.usdToDop}
          />
        )}

        {quoteOnlyPackages.length > 0 && (
          <BizPackageGrid
            heading={isEs ? 'Solo por cotización personalizada' : 'Custom quote only'}
            packages={quoteOnlyPackages}
            locale={locale}
            isEs={isEs}
            quoteOnly
            dopRate={dopRate.usdToDop}
          />
        )}

        {/* ── IN-HOUSE / OFFICE SERVICE ── photographer comes to client */}
        <section className="border-b border-hairline-soft py-16 md:py-24 bg-ink/[0.02]">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Servicio in-house' : 'On-site service'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-8"
              style={{ fontSize: 'clamp(28px, 5vw, 64px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Llegamos a tu oficina con luz y fondo' : 'We come to your office with lighting & backdrop'}
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl mb-12">
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Para empresas con varios ejecutivos, equipos de prensa internos o eventos corporativos, montamos un mini-estudio en tu oficina o sala de conferencias. Llevamos: flashes con softbox, fondos seamless de viaje (blanco / gris / negro), trípode, reflectores y monitor para tethering en vivo. En 90 minutos tenemos el set listo y empezamos a fotografiar.'
                  : 'For companies with multiple executives, in-house press teams, or corporate events, we set up a mini-studio in your office or conference room. We bring: strobes with softbox, travel seamless backdrops (white / grey / black), tripod, reflectors, and a monitor for live tethering. In 90 minutes the set is ready and we start shooting.'}
              </p>
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Ideal cuando tienes 5 a 50+ personas a fotografiar — sale más rentable que coordinar agendas con cada ejecutivo en estudio. Día completo de cobertura desde $700 USD (Branding Premium) o $1,200 USD (Campaña de Lujo) según volumen y entregables. Cotizamos por persona en sesiones grupales con descuentos por volumen.'
                  : 'Ideal when you have 5 to 50+ people to photograph — more cost-effective than coordinating schedules with each executive at the studio. Full-day coverage from $700 USD (Premium Branding) or $1,200 USD (Luxury Campaign) depending on volume and deliverables. Per-person pricing in group sessions with volume discounts.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-hairline-soft max-w-5xl">
              {(isEs
                ? [
                    { num: '01', title: 'Kit completo de viaje', body: 'Flashes, modeladores, fondos seamless en 3 colores, reflectores, trípode y monitor.' },
                    { num: '02', title: 'Setup en 90 minutos', body: 'Llegamos antes y montamos el mini-estudio sin interrumpir la jornada laboral.' },
                    { num: '03', title: 'Volumen con descuento', body: '5–50+ ejecutivos en un día con consistencia de luz, fondo y dirección.' },
                  ]
                : [
                    { num: '01', title: 'Full travel kit', body: 'Strobes, modifiers, 3-color seamless backdrops, reflectors, tripod, and monitor.' },
                    { num: '02', title: 'Setup in 90 min', body: 'We arrive ahead of time and build the mini-studio without disrupting the workday.' },
                    { num: '03', title: 'Volume discount', body: '5–50+ executives in a single day with consistent light, backdrop, and direction.' },
                  ]
              ).map((item) => (
                <div key={item.num} className="border-r border-b border-hairline-soft p-7 md:p-8 bg-canvas">
                  <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">{item.num}</span>
                  <h3 className="font-display uppercase text-ink mt-3" style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: '1.1' }}>
                    {item.title}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed mt-3">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link
                href={quoteUrl}
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-canvas hover:opacity-80 transition-opacity"
              >
                {isEs ? 'Cotizar servicio in-house →' : 'Quote on-site service →'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Preguntas frecuentes' : 'Frequently asked questions'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Antes de reservar' : 'Before you book'}
            </h2>
            <div className="space-y-3 max-w-4xl">
              {FAQS.map((f, i) => (
                <details
                  key={i}
                  className="border border-hairline-soft rounded-md p-5 md:p-6 group"
                  {...(i === 0 ? { open: true } : {})}
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-mono uppercase tracking-widest text-[11px] md:text-[12px] text-ink hover:opacity-80">
                    <span className="leading-relaxed normal-case font-display text-ink text-base md:text-lg tracking-normal">
                      {f.q}
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-ink-muted group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-ink/85 text-base leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
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
                ? 'Cuéntanos si prefieres estudio o servicio in-house, cuántas personas y la fecha. Volvemos con plan de luz y cotización en menos de 24 horas.'
                : 'Tell us studio vs on-site, how many people, and the date. We come back with a lighting plan and quote in under 24 hours.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={bookUrl}
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-canvas hover:opacity-80 transition-opacity"
              >
                {isEs ? 'Reservar sesión' : 'Book a session'}
              </Link>
              <Link
                href={quoteUrl}
                className="inline-flex items-center justify-center rounded-full border border-hairline px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink hover:bg-ink hover:text-canvas transition-colors"
              >
                {isEs ? 'Solicitar presupuesto' : 'Request a quote'}
              </Link>
              <Link
                href={`/${locale}/portfolio?category=portrait`}
                className="inline-flex items-center justify-center rounded-full border border-hairline-soft px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink-muted hover:text-ink hover:border-hairline transition-colors"
              >
                {isEs ? 'Ver portafolio' : 'See portfolio'}
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
                {isEs ? 'Ver familia · Comercial y Branding' : 'See family · Commercial & Branding'}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Package grid — same shape as the family page so visitors recognise the
// card across the site. Direct-book uses the composite ?service=family__pkg
// disambiguation form (see project_package_slug_collisions memory).
function BizPackageGrid({
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
              ? `/${locale}/get-quote?family=${FAMILY_SLUG}&package=${p.slug}&from=business-portraits`
              : `/${locale}/book?service=${FAMILY_SLUG}__${p.slug}&from=business-portraits`
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
                      {p.popular_badge ? p.popular_badge.replace('_', ' ') : (p.featured ? (isEs ? 'Destacado' : 'Featured') : '')}
                    </span>
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {p.minimum_billable_hours
                        ? `${p.minimum_billable_hours}h ${isEs ? 'mín' : 'min'}`
                        : `${p.duration_min} min`}
                    </span>
                  </div>
                  <h3 className="font-display uppercase text-ink" style={{ fontSize: 'clamp(22px, 2.2vw, 30px)', lineHeight: '1.05' }}>
                    {name}
                  </h3>
                  {(() => {
                    const formatted = formatServicePrice(price, locale, dopRate)
                    return (
                      <div className="mt-5 mb-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-display text-ink" style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: '1.0' }}>
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
                      {quoteOnly ? (isEs ? 'Pedir cotización' : 'Get a quote') : (isEs ? 'Reservar' : 'Book now')}
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
