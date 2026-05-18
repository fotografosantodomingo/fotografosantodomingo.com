import type { Metadata } from 'next'
import Link from 'next/link'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'

export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string }
}

type Video = {
  id: string
  title: { es: string; en: string }
  description: { es: string; en: string }
  badge: { es: string; en: string }
  highlight?: { es: string; en: string }
}

type VideoGroup = {
  groupId: string
  title: { es: string; en: string }
  intro: { es: string; en: string }
  videos: Video[]
}

const videoGroups: VideoGroup[] = [
  {
    groupId: 'drone-cinematography',
    title: {
      es: 'Cinematografía Aérea con Drone',
      en: 'Aerial Drone Cinematography',
    },
    intro: {
      es: 'Cobertura aérea filmada con DJI Mavic 3 en República Dominicana. Planos de establecimiento de alto impacto, ediciones rítmicas y 4K ultra nítido desde el aire. El drone puede alcanzar objetivos a 5 km de distancia fuera de zonas restringidas de aeropuerto.',
      en: 'Aerial coverage filmed with DJI Mavic 3 across the Dominican Republic. High-impact establishing shots, rhythmic edits, and ultra-sharp 4K from the air. The drone reaches targets up to 5 km away outside airport restricted zones.',
    },
    videos: [
      {
        id: 'Qh4C6YRPOFw',
        title: { es: 'Edición dinámica con drone Mavic 3 — República Dominicana', en: 'Fast-edit drone showcase — Mavic 3 in Dominican Republic' },
        description: {
          es: 'Showreel de edición rápida con todos los planos filmados desde drone DJI Mavic 3 en República Dominicana. Demuestra la variedad de ángulos, alturas y movimientos posibles en un solo día de rodaje.',
          en: 'Fast-edit showreel with all footage filmed from a DJI Mavic 3 drone across the Dominican Republic. Demonstrates the range of angles, altitudes, and movements achievable in a single shoot day.',
        },
        badge: { es: 'Drone · Mavic 3 · Edición rápida', en: 'Drone · Mavic 3 · Fast edit' },
      },
      {
        id: 'eKDJ51NFmRc',
        title: { es: 'Calidad de imagen 4K ultra nítido — Drone', en: '4K ultra-sharp image quality — Drone footage' },
        description: {
          es: 'Demostración de la nitidez de imagen 4K del drone en diferentes condiciones de luz y velocidad de movimiento en República Dominicana.',
          en: 'Demonstration of the 4K image sharpness of the drone across various lighting conditions and movement speeds in the Dominican Republic.',
        },
        badge: { es: 'Drone · 4K Ultra nítido', en: 'Drone · 4K Ultra-sharp' },
      },
      {
        id: 'PfN8WGgvDzQ',
        title: { es: 'Lente zoom — alcance de 5 km fuera de zonas de aeropuerto', en: 'Zoom lens — 5 km reach outside airport zones' },
        description: {
          es: 'Drone con lente zoom interior que alcanza hasta 5 km fuera de zonas de restricción aeroportuaria. Planos de alta compresión y aislamiento de sujetos imposibles de lograr con equipo terrestre.',
          en: 'Drone with built-in zoom lens reaching targets up to 5 km outside airport restriction zones. High-compression shots and subject isolation impossible to achieve with ground equipment.',
        },
        badge: { es: 'Drone · Zoom · 5 km de alcance', en: 'Drone · Zoom lens · 5 km reach' },
      },
      {
        id: 'SGuhBamVKGk',
        title: { es: 'Calidad de cámara drone durante el atardecer', en: 'Drone camera quality at sunset' },
        description: {
          es: 'Muestra de la calidad cinematográfica del drone durante la hora dorada y puesta de sol. Gestión de rango dinámico y transiciones de luz cálida en tiempo real.',
          en: 'Showcase of the cinematic drone camera quality during golden hour and sunset. Dynamic range management and warm light transitions captured in real time.',
        },
        badge: { es: 'Drone · Atardecer · Hora dorada', en: 'Drone · Sunset · Golden hour' },
      },
    ],
  },
  {
    groupId: '8k-ultra',
    title: {
      es: '8K Ultra HD — Resolución Máxima',
      en: '8K Ultra HD — Maximum Resolution',
    },
    intro: {
      es: 'Filmación en 8K disponible cuando el presupuesto del proyecto lo permite. A 400 metros de distancia con lente teleobjetivo sobre trípode, este video demuestra el nivel de detalle y margen de encuadre posible en post-producción con 8K nativo.',
      en: '8K filming is available when the project budget allows. From 400 meters away using a telephoto lens on a tripod, this video demonstrates the level of detail and reframing latitude available in post-production with native 8K.',
    },
    videos: [
      {
        id: '0dDqz-zJeuE',
        title: { es: '8K desde 400 metros con lente teleobjetivo — cámara en trípode', en: '8K from 400 meters with telephoto lens — camera on tripod' },
        description: {
          es: 'Grabación en 8K desde 400 metros de distancia con lente teleobjetivo, cámara sobre trípode. Resolución máxima disponible para campañas publicitarias, producciones cinematográficas y proyecciones de gran formato.',
          en: '8K recording from 400 meters distance using a telephoto lens with camera on tripod. Maximum resolution available for advertising campaigns, cinematic productions, and large-format projections.',
        },
        badge: { es: '8K · 400 metros · Lente tele', en: '8K · 400 meters · Telephoto lens' },
        highlight: { es: '8K Disponible', en: '8K Available' },
      },
    ],
  },
  {
    groupId: 'cinematic-ground',
    title: {
      es: 'Cámara Terrestre · Footage Cinematográfico · Carcasa Impermeable',
      en: 'Ground Camera · Cinematic Footage · Waterproof Housing',
    },
    intro: {
      es: 'Footage cinematográfico al nivel del suelo: atardeceres de alto contraste, filmación desde el agua con carcasa impermeable certificada y movimientos de cámara fluidos. Disponible para bodas en playa, eventos náuticos y sesiones en el mar.',
      en: 'Cinematic ground-level footage: high-contrast sunsets, filming from the water with certified waterproof housing, and smooth camera movements. Available for beach weddings, nautical events, and sea sessions.',
    },
    videos: [
      {
        id: '7iObqN_2Rfo',
        title: { es: 'Footage súper cinematográfico al atardecer — filmado desde el agua con carcasa impermeable', en: 'Super cinematic sunset footage — filmed from the water with waterproof housing' },
        description: {
          es: 'Grabación súper cinematográfica durante el atardecer filmada completamente desde el agua usando carcasa impermeable. Lo más importante de este video: la carcasa impermeable permite filmar desde dentro del agua en locaciones de playa o eventos náuticos.',
          en: 'Super cinematic footage captured during sunset filmed entirely from the water using a waterproof housing. Most important detail: the waterproof housing allows filming from inside the water at beach locations or nautical events.',
        },
        badge: { es: 'Carcasa impermeable · Filmación desde el agua', en: 'Waterproof housing · Filming from the water' },
        highlight: { es: 'Filmación Desde el Agua', en: 'Filming From the Water' },
      },
    ],
  },
  {
    groupId: 'adaptability',
    title: {
      es: 'Adaptabilidad en Tiempo Real',
      en: 'Real-Time Adaptability',
    },
    intro: {
      es: 'La capacidad de producir contenido cinematográfico sin preparación previa, en locaciones de alta exigencia y en coordinación con autoridades. Desde propuestas sorpresa frente a la Torre Eiffel hasta filmación con permiso oficial en aeropuertos internacionales.',
      en: 'The ability to produce cinematic content without prior preparation, in demanding locations, and in coordination with authorities. From surprise proposals in front of the Eiffel Tower to filming with official permits at international airports.',
    },
    videos: [
      {
        id: 't1tXTGSAIH4',
        title: { es: 'Propuesta de matrimonio sorpresa frente a la Torre Eiffel, París — sin preparación previa', en: 'Surprise marriage proposal in front of the Eiffel Tower, Paris — no prior preparation' },
        description: {
          es: 'Adaptación en tiempo real para capturar una propuesta de matrimonio frente a la Torre Eiffel en París sin preparación previa ni reconocimiento de locación. Demuestra la capacidad de reaccionar y producir contenido cinematográfico de manera espontánea en cualquier entorno.',
          en: 'Real-time adaptation to capture a marriage proposal in front of the Eiffel Tower in Paris with no prior preparation or location scouting. Demonstrates the ability to react and produce cinematic content spontaneously in any environment.',
        },
        badge: { es: 'Adaptabilidad · París · Sin preparación', en: 'Adaptability · Paris · No setup' },
      },
      {
        id: 'Z5atDdnjY0M',
        title: { es: 'Filmación en aeropuerto con permiso oficial de autoridades — lugares públicos exigentes', en: 'Airport filming with official authority permit — demanding public locations' },
        description: {
          es: 'Calidad de imagen y gestión de luz natural en lugares públicos de alta exigencia, incluyendo aeropuerto internacional con permiso oficial de autoridades. Dominio del entorno, rapidez de setup y capacidad de operar con restricciones logísticas reales.',
          en: 'Image quality and natural light management in demanding public locations, including international airport filming with official authority permit. Environmental mastery, fast setup, and ability to operate under real logistical restrictions.',
        },
        badge: { es: 'Aeropuerto · Permiso oficial · Lugares públicos', en: 'Airport · Official permit · Public locations' },
      },
    ],
  },
  {
    groupId: 'dynamic-editing',
    title: {
      es: 'Edición Dinámica · Combinación de Planos Cinematográficos',
      en: 'Dynamic Editing · Combined Cinematic Shots',
    },
    intro: {
      es: 'La habilidad de editar es tan importante como la habilidad de filmar. Esta pieza combina planos dinámicos y cinematográficos editados con ritmo, cortes precisos y coherencia visual — todo producido por un solo operador.',
      en: 'Editing skill is as important as filming skill. This piece combines dynamic and cinematic shots edited with rhythm, precise cuts, and visual coherence — all produced by a single operator.',
    },
    videos: [
      {
        id: 'TBk5fGcYNjM',
        title: { es: 'Combinación de planos dinámicos y cinematográficos — habilidades de edición rápida', en: 'Dynamic + cinematic shot combination — fast editing skills' },
        description: {
          es: 'Combinación de planos dinámicos y cinematográficos con habilidades de edición rápida. Ritmo, corte y coherencia visual completa entregada por un solo operador de cámara y editor.',
          en: 'Combination of dynamic and cinematic shots with fast editing skills. Rhythm, cuts, and complete visual coherence delivered by a single camera operator and editor.',
        },
        badge: { es: 'Dinámico · Cinematográfico · Edición rápida', en: 'Dynamic · Cinematic · Fast editing' },
      },
    ],
  },
]

const allVideos = videoGroups.flatMap((g) => g.videos)

const capabilities = [
  {
    title: { es: 'El Cinematógrafo "One-Man Band"', en: 'The "One-Man Band" Cinematographer' },
    proof: {
      es: 'Eliminás la necesidad de un equipo masivo. Como unidad de producción autónoma, manejo iluminación, audio y movimiento de cámara simultáneamente. Alta eficiencia, setup rápido y calidad Hollywood sin el costo de una producción de 10 personas.',
      en: 'Eliminate the need for a massive crew. As a self-contained production unit, I handle lighting, audio, and camera movement simultaneously. High efficiency, fast setup, and Hollywood-grade quality without the cost of a 10-person production.',
    },
  },
  {
    title: { es: 'Maestro de Adaptabilidad Visual y Técnica', en: 'Master of Visual Adaptability and Technical Independence' },
    proof: {
      es: 'No dependo de un gaffer ni un grip. Domino el ecosistema completo del cine: iluminación con LED portátiles para looks corporativos o moodys, audio limpio con lavaliers y boom mientras encuadro el plano, y resolución de problemas ante clima cambiante o espacios reducidos.',
      en: 'No dependence on a dedicated gaffer or grip. I master the complete filmmaking ecosystem: shaping light with portable LED panels for corporate or moody looks, capturing clean audio with lavaliers and boom while framing the shot, and solving problems when weather shifts or locations are tight.',
    },
  },
  {
    title: { es: 'El Cineasta Híbrido — Dominio de Todo Tipo de Plano', en: 'The Hybrid Filmmaker — Every Shot Type Mastered' },
    proof: {
      es: 'Steadicam/Gimbal para tracking shots de acción dinámica. Handheld íntimo para emoción documental orgánica. Trípode de precisión para composiciones comerciales limpias. Drone aéreo para establecidos de alto valor de producción. Puedo cambiar de drone a gimbal en menos de dos minutos sin perder el momentum del rodaje.',
      en: 'Steadicam/Gimbal for dynamic action tracking shots. Intimate handheld for raw, organic documentary emotion. Precision tripod for clean commercial compositions. Aerial drone for high-production-value establishing shots. I can transition from drone to gimbal in under two minutes without losing shooting momentum.',
    },
  },
  {
    title: { es: 'Ingeniería del Cine en Cualquier Entorno', en: 'Engineering Cinema Across All Environments' },
    proof: {
      es: 'Conocimiento profundo de perfiles logarítmicos, ciencia del color, longitudes focales y sistemas de montaje rápido. Sé exactamente qué configuración de cámara, lente y códec usar para el mejor margen en post-producción de color. Desde underwater housing hasta filmación en aeropuerto con permiso oficial.',
      en: 'Deep understanding of log profiles, color science, focal lengths, and quick-rigging systems. I know exactly what camera settings, lenses, and codecs deliver the best post-production grading latitude. From underwater housing to airport filming with official authority permits.',
    },
  },
]

const faqItems = {
  es: [
    {
      q: '¿Cuál es la calidad estándar de video que ofreces?',
      a: 'El estándar es 4K Ultra HD en todos los proyectos. Para presupuestos que lo permitan, puedo filmar en 8K con detalle extremo — ideal para campañas publicitarias de alto nivel, producciones cinematográficas y proyecciones en gran formato.',
    },
    {
      q: '¿Puedes filmar en 8K y cuándo tiene sentido?',
      a: 'Sí. El 8K está disponible cuando el presupuesto del proyecto lo permite. Tiene sentido para campañas publicitarias premium, producciones cinematográficas, contenido para grandes pantallas y proyectos donde la post-producción de color requiere el máximo margen de encuadre.',
    },
    {
      q: '¿Combinas drone y cámara terrestre en el mismo proyecto?',
      a: 'Sí. Mi especialidad es la combinación de planos aéreos (drone) y planos terrestres (gimbal, steadicam, trípode, handheld) en un solo flujo de producción. Puedo pasar de drone a gimbal en menos de dos minutos sin perder el momentum del rodaje.',
    },
    {
      q: '¿Puedes filmar desde el agua o en ambientes húmedos?',
      a: 'Sí. Tengo carcasa impermeable para filmación desde dentro del agua — ideal para bodas en playa, eventos en piscina, deportes acuáticos y sesiones en el mar. El video de la carcasa impermeable fue filmado completamente desde el agua durante un atardecer cinematográfico.',
    },
    {
      q: '¿Puedes filmar en aeropuertos o zonas de alta exigencia logística?',
      a: 'Sí, con los permisos correspondientes. Tengo experiencia coordinando con autoridades aeroportuarias para obtener acceso oficial. Fuera de las zonas de restricción del aeropuerto, el drone puede alcanzar objetivos a 5 km de distancia con lente zoom.',
    },
    {
      q: '¿Puedes adaptarte a situaciones sin preparación previa?',
      a: 'Sí. Como videógrafo autónomo con equipo compacto, puedo reaccionar en tiempo real. Filmé una propuesta de matrimonio sin aviso previo frente a la Torre Eiffel en París, produciendo contenido cinematográfico de manera espontánea sin reconocimiento de locación.',
    },
  ],
  en: [
    {
      q: 'What is your standard video quality?',
      a: 'The standard is 4K Ultra HD on all projects. For budgets that allow it, I can film in 8K with extreme detail — ideal for high-end advertising campaigns, cinematic productions, and large-format projections.',
    },
    {
      q: 'Can you film in 8K and when does it make sense?',
      a: 'Yes. 8K is available when the project budget allows. It makes sense for premium advertising campaigns, cinematic productions, large-screen content, and projects where color post-production requires the maximum reframing latitude.',
    },
    {
      q: 'Do you combine drone and ground camera in the same project?',
      a: 'Yes. My specialty is combining aerial shots (drone) and ground shots (gimbal, steadicam, tripod, handheld) in a single production flow. I can transition from drone to gimbal in under two minutes without losing shooting momentum.',
    },
    {
      q: 'Can you film from the water or in wet environments?',
      a: 'Yes. I have a waterproof housing for filming from inside the water — ideal for beach weddings, pool events, water sports, and sea sessions. The waterproof housing video was filmed entirely from the water during a cinematic sunset.',
    },
    {
      q: 'Can you film at airports or in logistically demanding locations?',
      a: 'Yes, with the appropriate permits. I have experience coordinating with airport authorities to obtain official access. Outside the airport restriction zones, the drone can reach targets up to 5 km away with the zoom lens.',
    },
    {
      q: 'Can you adapt to situations without prior preparation?',
      a: 'Yes. As a self-contained videographer with compact gear, I can react in real time. I filmed a marriage proposal with no prior notice in front of the Eiffel Tower in Paris, producing cinematic content spontaneously without any location scouting.',
    },
  ],
}

const PAGE_SLUG = 'video-cinematography'

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Cinematógrafo y Videógrafo en República Dominicana — 4K Estándar, 8K Disponible | Babula Shots'
    : 'Cinematographer & Videographer in Dominican Republic — 4K Standard, 8K Available | Babula Shots'
  const description = isEs
    ? 'Producción de video 4K estándar y 8K disponible. Combinación de drone Mavic 3 y cámara terrestre, carcasa impermeable, operador único. Director de fotografía multidisciplinario en Santo Domingo, Punta Cana y toda República Dominicana.'
    : 'Video production with 4K standard and 8K available. Combination of Mavic 3 drone and ground camera, waterproof housing, single operator. Multidisciplinary director of photography in Santo Domingo, Punta Cana, and all of the Dominican Republic.'

  return {
    title,
    description,
    keywords: isEs
      ? 'videografo santo domingo, cinematografo republica dominicana, video 4k punta cana, video drone republica dominicana, filmacion 8k, videografo drone wedding, video cinematografico santo domingo, produccion audiovisual rd'
      : 'videographer santo domingo, cinematographer dominican republic, 4k video punta cana, drone video dominican republic, 8k filming, drone wedding videographer, cinematic video santo domingo, audiovisual production dr',
    alternates: {
      canonical: `${BASE_URL}/${locale}/services/${PAGE_SLUG}`,
      languages: {
        es: `${BASE_URL}/es/services/${PAGE_SLUG}`,
        en: `${BASE_URL}/en/services/${PAGE_SLUG}`,
        'x-default': `${BASE_URL}/es/services/${PAGE_SLUG}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs
        ? 'Cinematógrafo y Videógrafo — 4K Estándar, 8K Disponible'
        : 'Cinematographer & Videographer — 4K Standard, 8K Available',
      description,
      url: `${BASE_URL}/${locale}/services/${PAGE_SLUG}`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=${isEs ? 'Cinemato%CC%81grafo+%26+Videogra%CC%81fo' : 'Cinematographer+%26+Videographer'}&subtitle=${isEs ? 'Santo+Domingo+%C2%B7+Drone+%C2%B7+4K%2F8K' : 'Santo+Domingo+%C2%B7+Drone+%C2%B7+4K%2F8K'}`,
        width: 1200,
        height: 630,
        alt: isEs
          ? 'Cinematógrafo y Videógrafo en República Dominicana — 4K y 8K'
          : 'Cinematographer and Videographer in Dominican Republic — 4K and 8K',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Cinematógrafo · 4K Estándar · 8K Disponible' : 'Cinematographer · 4K Standard · 8K Available',
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
  }
}

export default function VideoCinematographyPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const pageUrl = `${BASE_URL}/${locale}/services/${PAGE_SLUG}`

  // ── STRUCTURED DATA ──────────────────────────────────────────────────────
  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Servicios' : 'Services', url: `${BASE_URL}/${locale}/services` },
    {
      name: isEs ? 'Cinematógrafo y Videógrafo' : 'Cinematographer & Videographer',
      url: pageUrl,
    },
  ])

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${pageUrl}#service`,
    serviceType: isEs ? 'Producción de Video Cinematográfico' : 'Cinematic Video Production',
    name: isEs
      ? 'Cinematógrafo y Videógrafo — 4K Estándar, 8K Disponible'
      : 'Cinematographer & Videographer — 4K Standard, 8K Available',
    description: isEs
      ? 'Producción de video 4K estándar y 8K disponible con combinación de drone y cámara terrestre. Operador único, carcasa impermeable, adaptabilidad en tiempo real.'
      : '4K standard and 8K available video production combining drone and ground camera. Single operator, waterproof housing, real-time adaptability.',
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#business`,
      name: 'Fotografo Santo Domingo | Babula Shots',
      url: BASE_URL,
    },
    areaServed: [
      { '@type': 'Country', name: 'Dominican Republic' },
      { '@type': 'City', name: 'Santo Domingo', containedInPlace: { '@type': 'Country', name: 'Dominican Republic' } },
      { '@type': 'City', name: 'Punta Cana', containedInPlace: { '@type': 'Country', name: 'Dominican Republic' } },
      { '@type': 'City', name: 'Cap Cana', containedInPlace: { '@type': 'Country', name: 'Dominican Republic' } },
      { '@type': 'City', name: 'La Romana', containedInPlace: { '@type': 'Country', name: 'Dominican Republic' } },
      { '@type': 'City', name: 'Santiago', containedInPlace: { '@type': 'Country', name: 'Dominican Republic' } },
    ],
    url: pageUrl,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isEs ? 'Servicios de Video Cinematográfico' : 'Cinematic Video Services',
      itemListElement: [
        {
          '@type': 'Offer',
          name: isEs ? 'Video 4K — Estándar' : '4K Video — Standard',
          description: isEs
            ? 'Filmación estándar en 4K Ultra HD con drone y/o cámara terrestre.'
            : 'Standard 4K Ultra HD filming with drone and/or ground camera.',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'USD',
        },
        {
          '@type': 'Offer',
          name: isEs ? 'Video 8K — Premium' : '8K Video — Premium',
          description: isEs
            ? 'Filmación premium en 8K para proyectos de alto nivel de producción.'
            : 'Premium 8K filming for high-production-level projects.',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'USD',
        },
      ],
    },
  }

  // VideoObject schema for each YouTube video.
  // NOTE: Add `uploadDate` (ISO 8601) to each entry below for Video Rich Result eligibility.
  // Without uploadDate Google will still crawl and index, but won't show video rich results.
  const videoSchemas = allVideos.map((v) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `https://www.youtube.com/watch?v=${v.id}`,
    name: isEs ? v.title.es : v.title.en,
    description: isEs ? v.description.es : v.description.en,
    thumbnailUrl: `https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`,
    contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
    // uploadDate: 'YYYY-MM-DD', // ← add actual upload date per video for Video Rich Results
    publisher: {
      '@type': 'Organization',
      name: 'Fotografo Santo Domingo | Babula Shots',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
        width: 200,
        height: 60,
      },
    },
    inLanguage: isEs ? 'es' : 'en',
    isPartOf: { '@type': 'WebPage', '@id': pageUrl },
  }))

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (isEs ? faqItems.es : faqItems.en).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(serviceSchema)} />
      {videoSchemas.map((vs) => (
        <script
          key={vs['@id']}
          type="application/ld+json"
          dangerouslySetInnerHTML={generateJsonLd(vs)}
        />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(faqSchema)} />

      <main className="min-h-screen bg-canvas text-ink">

        {/* ── HERO ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24 lg:py-28">
          <div className="container mx-auto px-4">
            <nav>
              <Link
                href={`/${locale}/services`}
                className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
              >
                ← {isEs ? 'Todos los servicios' : 'All services'}
              </Link>
            </nav>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mt-10 mb-6">
              {isEs
                ? 'Servicio · Video · Drone + Cámara · Operador único'
                : 'Service · Video · Drone + Camera · Single operator'}
            </p>
            <h1
              className="font-display uppercase text-ink max-w-5xl"
              style={{ fontSize: 'clamp(36px, 7vw, 112px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}
            >
              {isEs ? 'Cinematógrafo & Videógrafo' : 'Cinematographer & Videographer'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-3xl mt-8 leading-relaxed">
              {isEs
                ? 'Producción de video cinematográfico con 4K como estándar y 8K disponible para proyectos premium. Combinación de drone DJI Mavic 3 y cámara terrestre — gimbal, steadicam, trípode y handheld — operados por un solo director de fotografía. Carcasa impermeable para filmación desde el agua. Cobertura en Santo Domingo, Punta Cana y toda República Dominicana.'
                : 'Cinematic video production with 4K as standard and 8K available for premium projects. Combination of DJI Mavic 3 drone and ground camera — gimbal, steadicam, tripod, and handheld — all operated by a single director of photography. Waterproof housing for filming from the water. Coverage across Santo Domingo, Punta Cana, and all of the Dominican Republic.'}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/${locale}/get-quote?family=video-cinematography&cta=video-hero`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
              >
                {isEs ? 'Solicitar presupuesto' : 'Request quote'}
              </Link>
              <Link
                href={`/${locale}/portfolio?category=video`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline-soft text-ink-muted hover:text-ink hover:border-hairline transition-colors duration-200"
              >
                {isEs ? 'Ver portafolio' : 'View portfolio'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="border-b border-hairline-soft">
          <ul className="grid grid-cols-2 lg:grid-cols-4 border-l border-hairline-soft">
            {([
              { stat: '4K', label: { es: 'Resolución estándar', en: 'Standard resolution' } },
              { stat: '8K', label: { es: 'Disponible bajo presupuesto', en: 'Available on budget' } },
              {
                stat: isEs ? 'Drone + Cámara' : 'Drone + Camera',
                label: { es: 'En el mismo proyecto', en: 'In the same project' },
              },
              {
                stat: isEs ? '1 Operador' : '1 Operator',
                label: { es: 'Producción autónoma completa', en: 'Full self-contained production' },
              },
            ] as { stat: string; label: { es: string; en: string } }[]).map((item, i) => (
              <li key={i} className="border-r border-b border-hairline-soft px-7 py-8 md:py-10">
                <p
                  className="font-display uppercase text-ink"
                  style={{ fontSize: 'clamp(24px, 3vw, 40px)', lineHeight: '1.0' }}
                >
                  {item.stat}
                </p>
                <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mt-3">
                  {isEs ? item.label.es : item.label.en}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── VIDEO GROUPS ── */}
        {videoGroups.map((group, gIdx) => (
          <section key={group.groupId} className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                {String(gIdx + 1).padStart(2, '0')}
              </span>
              <h2
                className="font-display uppercase text-ink mt-3 mb-4"
                style={{ fontSize: 'clamp(26px, 3.5vw, 52px)', lineHeight: '1.0' }}
              >
                {isEs ? group.title.es : group.title.en}
              </h2>
              <p className="text-ink-muted text-base md:text-lg max-w-3xl mb-10 leading-relaxed">
                {isEs ? group.intro.es : group.intro.en}
              </p>

              <div className={`grid gap-4 md:gap-6 ${group.videos.length === 1 ? 'grid-cols-1 max-w-3xl' : 'grid-cols-1 md:grid-cols-2'}`}>
                {group.videos.map((video) => (
                  <article key={video.id}>
                    {video.highlight && (
                      <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
                        ★ {isEs ? video.highlight.es : video.highlight.en}
                      </p>
                    )}
                    {/* Responsive 16:9 YouTube embed */}
                    <div className="relative w-full overflow-hidden bg-ink/5" style={{ aspectRatio: '16/9' }}>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1`}
                        title={isEs ? video.title.es : video.title.en}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        className="absolute inset-0 w-full h-full border-0"
                      />
                    </div>
                    <div className="mt-3">
                      <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                        {isEs ? video.badge.es : video.badge.en}
                      </span>
                      <h3
                        className="font-display uppercase text-ink mt-2"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 22px)', lineHeight: '1.15' }}
                      >
                        {isEs ? video.title.es : video.title.en}
                      </h3>
                      <p className="text-ink-muted text-sm leading-relaxed mt-2 max-w-xl">
                        {isEs ? video.description.es : video.description.en}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ── CAPABILITIES GRID ── */}
        <section className="border-b border-hairline-soft py-16 md:py-20">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Capacidades' : 'Capabilities'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-6"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Director de Fotografía Multidisciplinario' : 'Multidisciplinary Director of Photography'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg max-w-3xl mb-12 leading-relaxed">
              {isEs
                ? 'No solo opero la cámara — manejo el departamento visual completo. Iluminación, audio, movimiento, color y edición en una sola mente y un solo par de manos.'
                : "I don't just operate the camera — I run the entire visual department. Lighting, audio, movement, color, and editing in one mind and one pair of hands."}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-hairline-soft">
              {capabilities.map((cap, i) => (
                <li key={i} className="border-r border-b border-hairline-soft p-7 md:p-8">
                  <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className="font-display uppercase text-ink mt-3"
                    style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: '1.1' }}
                  >
                    {isEs ? cap.title.es : cap.title.en}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed mt-4">
                    {isEs ? cap.proof.es : cap.proof.en}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── TECHNICAL SPECS ── */}
        <section className="border-b border-hairline-soft py-16 md:py-20">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Especificaciones Técnicas' : 'Technical Specifications'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-12"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Equipo y Configuraciones' : 'Gear & Configurations'}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-hairline-soft">
              {[
                {
                  label: { es: 'Resolución de Video', en: 'Video Resolution' },
                  value: { es: '4K Ultra HD estándar · 8K disponible bajo presupuesto premium', en: '4K Ultra HD standard · 8K available on premium budget' },
                },
                {
                  label: { es: 'Drone Aéreo', en: 'Aerial Drone' },
                  value: { es: 'DJI Mavic 3 · Lente zoom · Alcance 5 km fuera de zonas restringidas · Log perfil para grading', en: 'DJI Mavic 3 · Zoom lens · 5 km reach outside restricted zones · Log profile for grading' },
                },
                {
                  label: { es: 'Cámara Terrestre', en: 'Ground Camera' },
                  value: { es: 'Gimbal · Steadicam · Trípode · Handheld · Carcasa impermeable para filmación desde el agua', en: 'Gimbal · Steadicam · Tripod · Handheld · Waterproof housing for filming from the water' },
                },
                {
                  label: { es: 'Perfiles Logarítmicos', en: 'Log Profiles' },
                  value: { es: 'Conocimiento profundo de S-Log, LOG-C, D-Log. Máximo margen para color grading en post.', en: 'Deep knowledge of S-Log, LOG-C, D-Log. Maximum latitude for color grading in post.' },
                },
                {
                  label: { es: 'Iluminación', en: 'Lighting' },
                  value: { es: 'Paneles LED portátiles para looks corporativos o cinematográficos. Setup en minutos, no horas.', en: 'Portable LED panels for corporate or cinematic looks. Setup in minutes, not hours.' },
                },
                {
                  label: { es: 'Audio', en: 'Audio' },
                  value: { es: 'Lavaliers inalámbricos + boom mientras encuadro el plano. Audio limpio sin técnico de sonido dedicado.', en: 'Wireless lavaliers + boom while framing the shot. Clean audio without a dedicated sound tech.' },
                },
              ].map((spec, i) => (
                <li key={i} className="border-r border-b border-hairline-soft p-6 md:p-7">
                  <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-3">
                    {isEs ? spec.label.es : spec.label.en}
                  </p>
                  <p className="text-ink text-sm md:text-base leading-relaxed">
                    {isEs ? spec.value.es : spec.value.en}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ ── drives FAQPage rich result via JSON-LD above */}
        <section className="border-b border-hairline-soft py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                FAQ
              </p>
              <h2
                className="font-display uppercase text-ink mb-12"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs ? 'Preguntas frecuentes' : 'Frequently asked'}
              </h2>
              <ul className="border-t border-hairline-soft">
                {(isEs ? faqItems.es : faqItems.en).map((item, i) => (
                  <li key={item.q} className="border-b border-hairline-soft py-6 md:py-7">
                    <div className="flex items-start gap-4 md:gap-6">
                      <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 w-8 mt-1">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-ink text-base md:text-lg leading-snug font-medium">
                          {item.q}
                        </h3>
                        <p className="text-ink-muted text-sm md:text-base leading-relaxed mt-3">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Presupuesto' : 'Quote'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '1.0' }}
              >
                {isEs ? '¿Listo para filmar?' : 'Ready to film?'}
              </h2>
              <p className="text-ink-muted text-base md:text-lg mb-10 leading-relaxed max-w-xl">
                {isEs
                  ? 'Cuéntanos tu proyecto — locación, tipo de evento, resolución deseada y fecha — y te enviamos un presupuesto a medida en menos de 24 horas.'
                  : "Tell us your project — location, event type, desired resolution, and date — and we'll send a tailored quote in under 24 hours."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/${locale}/get-quote?family=video-cinematography&cta=video-bottom`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                >
                  {isEs ? 'Solicitar presupuesto' : 'Request a quote'}
                </Link>
                <Link
                  href={`/${locale}/services`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline-soft text-ink-muted hover:text-ink hover:border-hairline transition-colors duration-200"
                >
                  {isEs ? 'Ver todos los servicios' : 'View all services'}
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
