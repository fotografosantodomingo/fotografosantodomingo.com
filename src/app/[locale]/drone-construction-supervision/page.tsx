import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { getUsdToDopRate } from '@/lib/currency/exchange-rate'
import { formatServicePrice } from '@/lib/currency/format'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const FAMILY_SLUG = 'real-estate-drone-photography'

// Reuses existing drone-shot Cloudinary assets so the page ships without
// new uploads. Hero is the wide aerial; secondary slot is the closer
// drone-on-site shot. Both already have alt metadata in portfolio_images
// from prior migrations.
const CL = 'https://res.cloudinary.com/dwewurxla/image/upload'
const HERO_PHOTO = {
  src:    `${CL}/w_828,f_auto,q_auto/v1777428637/Foto%CC%81grafo_Inmobiliario_en_Punta_Cana_Drone_xdv4io.webp`,
  srcLg:  `${CL}/w_1600,f_auto,q_auto/v1777428637/Foto%CC%81grafo_Inmobiliario_en_Punta_Cana_Drone_xdv4io.webp`,
  alt: {
    es: 'Inspección aérea de obra con drone profesional en República Dominicana',
    en: 'Professional drone aerial construction inspection in the Dominican Republic',
  },
}
const MID_PHOTO = {
  src:    `${CL}/w_828,f_auto,q_auto/v1777428995/Babula_Shots_Rd_s9lkak.webp`,
  srcLg:  `${CL}/w_1600,f_auto,q_auto/v1777428995/Babula_Shots_Rd_s9lkak.webp`,
  alt: {
    es: 'Documentación aérea del avance de obra — supervisión técnica con drone',
    en: 'Aerial construction progress documentation — drone technical supervision',
  },
}

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

async function loadDronePackages(): Promise<PackageRow[]> {
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
    ? 'Supervisión de Obras con Drone · Inspección Aérea Técnica RD | Babula Shots'
    : 'Drone Construction Supervision · Technical Aerial Inspection DR | Babula Shots'
  const description = isEs
    ? 'Supervisión técnica de obras y documentación aérea con drone profesional en República Dominicana. Reportes de avance, inspección remota objetiva y evidencia visual para constructoras y desarrolladores. Desde $200 USD.'
    : 'Drone-based technical construction supervision and aerial documentation in the Dominican Republic. Progress reports, remote objective inspection, and visual evidence for builders and developers. From $200 USD.'
  const keywords = isEs
    ? 'supervision de obras con drone republica dominicana, inspeccion aerea construccion rd, documentacion avance obra drone, fotografia tecnica obras santo domingo, drone construccion punta cana, reportes aereos obra dr'
    : 'drone construction supervision dominican republic, aerial construction inspection dr, drone construction progress documentation, technical construction photography santo domingo, drone construction punta cana, aerial site reports dr'

  return {
    title: { absolute: titleAbsolute },
    description,
    keywords,
    alternates: {
      canonical: `${BASE_URL}/${locale}/drone-construction-supervision`,
      languages: {
        es: `${BASE_URL}/es/drone-construction-supervision`,
        en: `${BASE_URL}/en/drone-construction-supervision`,
        'x-default': `${BASE_URL}/es/drone-construction-supervision`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${BASE_URL}/${locale}/drone-construction-supervision`,
      title: titleAbsolute,
      description,
      siteName: 'Babula Shots',
      images: [{ url: HERO_PHOTO.srcLg, width: 1600, height: 900, alt: HERO_PHOTO.alt[isEs ? 'es' : 'en'] }],
      locale: isEs ? 'es_DO' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleAbsolute,
      description,
      images: [HERO_PHOTO.srcLg],
    },
  }
}

export default async function DroneConstructionSupervisionPage({ params: { locale } }: Props) {
  if (locale !== 'es' && locale !== 'en') notFound()
  const isEs = locale === 'es'

  const [packages, dopRate] = await Promise.all([
    loadDronePackages(),
    getUsdToDopRate(),
  ])
  const directPackages = packages.filter((p) => p.bookable_direct)
  const quoteOnlyPackages = packages.filter((p) => !p.bookable_direct)

  const familyUrl = `/${locale}/services/${FAMILY_SLUG}`
  const quoteUrl = `/${locale}/get-quote?family=${FAMILY_SLUG}&from=construction-supervision`
  const bookUrl = `/${locale}/services/${FAMILY_SLUG}`

  const lowestPrice = directPackages[0]?.starting_price_usd ?? 200
  const highestPrice = directPackages.length
    ? Math.max(...directPackages.map((p) => Number(p.starting_price_usd)))
    : 600

  const pageUrl = `${BASE_URL}/${locale}/drone-construction-supervision`

  // Three numbered services (re-authored from the user-supplied source)
  const SERVICES = isEs
    ? [
        { num: '01', title: 'Supervisión técnica de obra', body: 'Inspección presencial con criterio de ingeniería civil. Verificamos avance contra cronograma, calidad de ejecución y conformidad con planos. Te entregamos un reporte ejecutivo con observaciones, fotos georreferenciadas y recomendaciones priorizadas.' },
        { num: '02', title: 'Inspección aérea con drone', body: 'Vuelos programados sobre tu obra para captar el sitio completo desde múltiples ángulos. Ideal para clientes remotos o para presentar el avance en juntas semanales. Cumplimos con las restricciones IDAC y zonas de altitud limitada (PUJ, Las Américas).' },
        { num: '03', title: 'Documentación de avance', body: 'Galería visual mensual o quincenal del progreso de la obra. Cada vuelo se hace desde los mismos waypoints para que las fotos sean comparables en el tiempo — útil para reportes a inversionistas, juntas de propietarios y archivo del proyecto.' },
      ]
    : [
        { num: '01', title: 'Technical site supervision', body: 'On-site inspection with civil-engineering criteria. We verify progress against schedule, execution quality, and plan compliance. You receive an executive report with observations, geo-tagged photos, and prioritized recommendations.' },
        { num: '02', title: 'Aerial drone inspection', body: 'Scheduled flights over your project capturing the whole site from multiple angles. Ideal for remote stakeholders or for presenting progress at weekly meetings. We comply with IDAC airspace rules and altitude-limited zones (PUJ, Las Américas).' },
        { num: '03', title: 'Progress documentation', body: 'Monthly or bi-weekly visual gallery of the project. Each flight is performed from the same waypoints so the images are comparable over time — useful for investor reports, ownership meetings, and project archives.' },
      ]

  // Three differentiators
  const DIFFS = isEs
    ? [
        { num: '01', title: 'Criterio de ingeniería', body: 'Cada vuelo está dirigido por criterio técnico — no es sólo cobertura visual. Sabemos qué se debe ver y desde dónde para que el reporte tenga peso en una mesa de obra.' },
        { num: '02', title: 'Drones profesionales', body: 'Equipos con cámara de alta resolución, gimbal estabilizado y modos de inspección. Operación bajo permisos IDAC con piloto certificado y seguro de responsabilidad civil.' },
        { num: '03', title: 'Reportes con respaldo visual', body: 'Cada observación viene acompañada de la foto exacta y, cuando aplica, su coordenada GPS. El cliente puede verificar todo en su pantalla, sin tener que estar en obra.' },
      ]
    : [
        { num: '01', title: 'Engineering criterion', body: 'Every flight is directed by technical judgement — not just visual coverage. We know what must be seen and from where, so the report carries weight in a site meeting.' },
        { num: '02', title: 'Professional drones', body: 'High-resolution cameras, stabilized gimbals, inspection modes. Operations under IDAC permits with a certified pilot and liability insurance.' },
        { num: '03', title: 'Reports with visual evidence', body: 'Every observation is paired with the exact photo and, when applicable, its GPS coordinate. The client verifies everything on screen, without having to be on-site.' },
      ]

  // FAQ — long-tail SEO + rich-result eligibility
  const FAQS: { q: string; a: string }[] = isEs
    ? [
        { q: '¿Cuánto cuesta una inspección aérea de obra con drone?', a: 'Tres paquetes a precio fijo: $200 USD para una inspección puntual de hasta 1.5h sobre la obra (similar al Listado Esencial), $400 USD para cobertura completa con vuelos múltiples y reporte (Propiedad Premium · 3h), y $600 USD para proyectos grandes con jornada completa de 4h (Finca de Lujo). Para contratos mensuales/quincenales con cobertura recurrente cotizamos por proyecto.' },
        { q: '¿Pueden volar drones sobre obras cerca del aeropuerto de Punta Cana?', a: 'Sí, con restricciones según la zona. El área inmediata al PUJ es zona restringida (sin vuelo). Bávaro central, Los Manantiales, Cabo Engaño y Punta Cana Village quedan en zona de altitud limitada — volamos a baja altura con coordinación. Cabeza de Toro, Cap Cana y Macao quedan fuera de las restricciones del aeropuerto. Para casos formales coordinamos con el IDAC (Instituto Dominicano de Aviación Civil).' },
        { q: '¿Qué incluye un reporte técnico de obra?', a: 'Reporte ejecutivo en PDF con: portada del proyecto, resumen del avance vs cronograma, sección por área (cimentación / estructura / instalaciones / acabados según etapa), foto georreferenciada por observación, comparación con vuelo anterior cuando hay histórico, y lista de recomendaciones priorizadas. Entregamos también las fotos en alta resolución para tu archivo.' },
        { q: '¿Hacen contratos de cobertura mensual?', a: 'Sí. Los proyectos grandes suelen contratar inspección quincenal o mensual fija — el mismo equipo, mismos waypoints, mismo formato de reporte. Eso permite comparar en línea de tiempo y dar trazabilidad al avance. Cotizamos por contrato anual con descuento sobre el precio puntual.' },
        { q: '¿Qué tipo de obras supervisan?', a: 'Construcción residencial (villas, apartamentos, urbanizaciones), comercial (hoteles, plazas, oficinas), industrial (plantas, almacenes), e infraestructura (vías de acceso, plataformas). El criterio aplica también para remodelaciones grandes y obras de jardinería paisajística.' },
        { q: '¿Cuándo entregan el reporte después del vuelo?', a: 'Reporte ejecutivo en PDF: 5–7 días hábiles. Galería de fotos editadas: 48 horas. Si necesitas turnaround más rápido (24h) hay un recargo del 50% sobre el paquete base.' },
        { q: '¿Vienen equipados con seguro de responsabilidad civil?', a: 'Sí. Operamos bajo permisos IDAC con piloto certificado y póliza de responsabilidad civil para operaciones aéreas. Te facilitamos copia del certificado al iniciar el proyecto.' },
        { q: '¿Cómo funciona el depósito y cancelación?', a: '50% de depósito vía Stripe (tarjeta, Apple Pay o Google Pay) para confirmar la fecha. El saldo se paga al entregar el reporte. Cancelación por clima severo (lluvia fuerte, vientos > 25 km/h) se reagenda sin penalidad. Cancelación con menos de 7 días pierde el 50% del depósito.' },
      ]
    : [
        { q: 'How much does a drone construction inspection cost?', a: 'Three flat-rate packages: $200 USD for a one-off inspection of up to 1.5h over the site (similar to Essential Listing), $400 USD for full coverage with multiple flights + report (Premium Property · 3h), and $600 USD for large projects with a full 4h day (Luxury Estate). For monthly / bi-weekly retainer contracts we quote per project.' },
        { q: 'Can you fly drones over construction sites near Punta Cana airport?', a: 'Yes, with restrictions depending on the zone. The area immediately around PUJ is a no-fly Restricted Zone. Central Bávaro, Los Manantiales, Cabo Engaño, and Punta Cana Village fall in an Altitude-Limited Zone — we fly low with coordination. Cabeza de Toro, Cap Cana, and Macao are outside airport restrictions. For formal cases we coordinate with IDAC (Dominican Civil Aviation Institute).' },
        { q: 'What does a technical construction report include?', a: 'Executive PDF report with: project cover, progress-vs-schedule summary, section per area (foundation / structure / MEP / finishes per phase), geo-tagged photo per observation, comparison with previous flight when historical exists, and prioritized recommendations. We also deliver the high-resolution photos for your archive.' },
        { q: 'Do you offer monthly retainer contracts?', a: 'Yes. Large projects typically contract bi-weekly or monthly fixed inspection — same team, same waypoints, same report format. That enables timeline comparison and traceability of progress. We quote on annual contract with a discount over the per-job price.' },
        { q: 'What types of construction do you supervise?', a: 'Residential (villas, apartments, subdivisions), commercial (hotels, plazas, offices), industrial (plants, warehouses), and infrastructure (access roads, platforms). The criterion also applies to major remodels and large landscaping projects.' },
        { q: 'When do you deliver the report after the flight?', a: 'Executive PDF report: 5–7 business days. Edited photo gallery: 48 hours. If you need faster turnaround (24h) there is a 50% surcharge over the base package.' },
        { q: 'Are you covered by liability insurance?', a: 'Yes. We operate under IDAC permits with a certified pilot and a liability insurance policy for aerial operations. We share a copy of the certificate at project kickoff.' },
        { q: 'How do deposits and cancellations work?', a: '50% deposit via Stripe (card, Apple Pay, or Google Pay) to confirm the date. Balance is paid when the report is delivered. Severe weather cancellations (heavy rain, winds > 25 km/h) are rescheduled with no penalty. Cancellations less than 7 days out forfeit 50% of the deposit.' },
      ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: isEs ? 'Servicios' : 'Services', item: `${BASE_URL}/${locale}/services` },
          { '@type': 'ListItem', position: 3, name: isEs ? 'Real Estate y Drone' : 'Real Estate & Drone', item: `${BASE_URL}/${locale}/services/${FAMILY_SLUG}` },
          { '@type': 'ListItem', position: 4, name: isEs ? 'Supervisión de Obras con Drone' : 'Drone Construction Supervision' },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: isEs ? 'Supervisión de Obras con Drone — República Dominicana' : 'Drone Construction Supervision — Dominican Republic',
        serviceType: 'ConstructionSupervisionService',
        additionalType: 'https://schema.org/ProfessionalService',
        provider: { '@id': `${BASE_URL}/#business` },
        areaServed: [
          { '@type': 'Country', name: 'Dominican Republic' },
          { '@type': 'City', name: 'Santo Domingo' },
          { '@type': 'City', name: 'Punta Cana' },
          { '@type': 'City', name: 'Cap Cana' },
          { '@type': 'City', name: 'La Romana' },
        ],
        description: isEs
          ? 'Supervisión técnica de obras con criterio de ingeniería civil + inspección aérea con drones profesionales. Reportes de avance, evidencia visual georreferenciada y documentación recurrente para constructoras y desarrolladores en República Dominicana.'
          : 'Technical construction supervision with civil-engineering criterion + aerial inspection with professional drones. Progress reports, geo-tagged visual evidence, and recurring documentation for builders and developers in the Dominican Republic.',
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
          name: isEs ? 'Paquetes de inspección aérea' : 'Aerial inspection packages',
          itemListElement: directPackages.map((p) => ({
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: Number(p.starting_price_usd).toFixed(2),
            url: `${BASE_URL}/${locale}/book?service=${FAMILY_SLUG}__${p.slug}`,
            availability: 'https://schema.org/InStock',
            category: 'Construction Aerial Inspection',
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
              <Link href={familyUrl} className="hover:text-ink">{isEs ? 'Real Estate y Drone' : 'Real Estate & Drone'}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-ink">{isEs ? 'Supervisión de Obras' : 'Construction Supervision'}</span>
            </nav>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Inspección aérea técnica · República Dominicana' : 'Technical aerial inspection · Dominican Republic'}
            </p>
            <h1
              className="font-display uppercase text-ink"
              style={{ fontSize: 'clamp(36px, 7.5vw, 120px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}
            >
              {isEs ? 'Supervisión de obras con drone' : 'Drone construction supervision'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-6 leading-relaxed">
              {isEs
                ? 'El avance de tu proyecto, claro y documentado, estés donde estés. Reportes técnicos respaldados con inspección aérea para constructoras, desarrolladores y juntas de propietarios — con criterio de ingeniería civil, no sólo cobertura visual.'
                : 'Your project progress, clear and documented, wherever you are. Technical reports backed by aerial inspection for builders, developers, and ownership boards — with civil-engineering criterion, not just visual coverage.'}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={bookUrl}
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-canvas hover:opacity-80 transition-opacity"
              >
                {isEs ? 'Solicitar supervisión' : 'Request supervision'}
              </Link>
              <Link
                href={quoteUrl}
                className="inline-flex items-center justify-center rounded-full border border-hairline px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink hover:bg-ink hover:text-canvas transition-colors"
              >
                {isEs ? 'Cotizar contrato mensual' : 'Quote monthly retainer'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── HERO IMAGE — full bleed */}
        <section className="border-b border-hairline-soft bg-canvas">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_PHOTO.src}
            srcSet={`${HERO_PHOTO.src} 828w, ${HERO_PHOTO.srcLg} 1600w`}
            sizes="100vw"
            width={1600}
            height={900}
            alt={HERO_PHOTO.alt[isEs ? 'es' : 'en']}
            className="block h-auto w-full"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </section>

        {/* ── WHO WE ARE ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Quiénes somos' : 'Who we are'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Ingeniería + drones para una supervisión más precisa' : 'Engineering + drones for sharper supervision'}
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl">
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Hacemos supervisión técnica de obras combinando inspección presencial con vuelos de drone profesional. La diferencia está en el criterio: cada vuelo se planifica con objetivo de ingeniería civil — qué se debe verificar, desde qué ángulo y con qué frecuencia — para que el reporte sirva en una mesa de toma de decisiones, no sólo de archivo.'
                  : 'We deliver technical construction supervision by combining on-site inspection with professional drone flights. The difference is criterion: every flight is planned with a civil-engineering objective — what to verify, from which angle, and how often — so the report carries weight in a decision-making meeting, not just an archive.'}
              </p>
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Trabajamos con constructoras, desarrolladores y juntas de propietarios en proyectos residenciales, comerciales, industriales e infraestructura — desde una villa de 200 m² hasta hoteles de cientos de unidades. Operación bajo permisos IDAC, piloto certificado y póliza de responsabilidad civil.'
                  : 'We work with builders, developers, and ownership boards on residential, commercial, industrial, and infrastructure projects — from a 200 m² villa to hotels with hundreds of units. Operations under IDAC permits, certified pilot, and liability insurance.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── 3 SERVICES ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Servicios' : 'Services'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Soluciones para tu obra' : 'Solutions for your project'}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-hairline-soft">
              {SERVICES.map((s) => (
                <li key={s.num} className="border-r border-b border-hairline-soft p-7 md:p-8">
                  <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">{s.num}</span>
                  <h3 className="font-display uppercase text-ink mt-3" style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: '1.1' }}>
                    {s.title}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed mt-3">{s.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── MID IMAGE — full bleed ── */}
        <section className="border-b border-hairline-soft bg-canvas">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MID_PHOTO.src}
            srcSet={`${MID_PHOTO.src} 828w, ${MID_PHOTO.srcLg} 1600w`}
            sizes="100vw"
            width={1600}
            height={900}
            alt={MID_PHOTO.alt[isEs ? 'es' : 'en']}
            className="block h-auto w-full"
            loading="lazy"
            decoding="async"
          />
        </section>

        {/* ── DIFFERENTIATORS ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Nuestra diferencia' : 'Our difference'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Ingeniería aplicada con respaldo visual' : 'Applied engineering with visual evidence'}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-hairline-soft">
              {DIFFS.map((d) => (
                <li key={d.num} className="border-r border-b border-hairline-soft p-7 md:p-8">
                  <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">{d.num}</span>
                  <h3 className="font-display uppercase text-ink mt-3" style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: '1.1' }}>
                    {d.title}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed mt-3">{d.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── PACKAGES ── */}
        {directPackages.length > 0 && (
          <DronePackageGrid
            heading={isEs ? 'Paquetes para reservar online' : 'Packages bookable online'}
            packages={directPackages}
            locale={locale}
            isEs={isEs}
            dopRate={dopRate.usdToDop}
          />
        )}
        {quoteOnlyPackages.length > 0 && (
          <DronePackageGrid
            heading={isEs ? 'Solo por cotización personalizada' : 'Custom quote only'}
            packages={quoteOnlyPackages}
            locale={locale}
            isEs={isEs}
            quoteOnly
            dopRate={dopRate.usdToDop}
          />
        )}

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
              {isEs ? 'Antes de contratar' : 'Before you contract'}
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
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Contáctanos hoy' : 'Get in touch'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-6"
              style={{ fontSize: 'clamp(28px, 5vw, 72px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Supervisa tu proyecto con nosotros' : 'Supervise your project with us'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mx-auto mb-10">
              {isEs
                ? 'Agenda una consulta técnica y evalúa el estado real de tu obra. Volvemos con plan de vuelo, alcance del reporte y cotización en menos de 24 horas.'
                : 'Schedule a technical consultation and assess the real state of your project. We come back with a flight plan, report scope, and quote in under 24 hours.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={bookUrl}
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-canvas hover:opacity-80 transition-opacity"
              >
                {isEs ? 'Solicitar inspección' : 'Request inspection'}
              </Link>
              <Link
                href={quoteUrl}
                className="inline-flex items-center justify-center rounded-full border border-hairline px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink hover:bg-ink hover:text-canvas transition-colors"
              >
                {isEs ? 'Solicitar presupuesto' : 'Request a quote'}
              </Link>
              <a
                href="https://wa.me/18097789547"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-hairline-soft px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink-muted hover:text-ink hover:border-hairline transition-colors"
              >
                WhatsApp →
              </a>
            </div>
            <p className="mt-10 text-ink-muted text-sm">
              <Link href={familyUrl} className="underline hover:text-ink">
                {isEs ? 'Ver familia · Real Estate y Drone' : 'See family · Real Estate & Drone'}
              </Link>
              {' · '}
              <Link href={`/${locale}/contact`} className="underline hover:text-ink">
                {isEs ? 'Contactar' : 'Contact'}
              </Link>
              {' · '}
              <Link href={`/${locale}/portfolio?category=drone`} className="underline hover:text-ink">
                {isEs ? 'Ver portafolio drone' : 'See drone portfolio'}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Mirrors the family-page card grid. Composite ?service=family__pkg form
// keeps the wizard pre-select correct (see project_package_slug_collisions).
function DronePackageGrid({
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
              ? `/${locale}/get-quote?family=${FAMILY_SLUG}&package=${p.slug}&from=construction-supervision`
              : `/${locale}/book?service=${FAMILY_SLUG}__${p.slug}&from=construction-supervision`
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
