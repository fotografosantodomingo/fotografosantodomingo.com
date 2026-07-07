import type { Metadata } from 'next'
import Link from 'next/link'
import { CONTACT_INFO, BOOKING_LINKS } from '@/lib/utils/constants'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'

export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const PAGE_SLUG = 'services/real-estate-drone-photography/360-simulacion-vistas'
const PARENT_SLUG = 'services/real-estate-drone-photography'
const IMAGE_URL = `${BASE_URL}/images/imagenes-360-drone-simulacion-vistas.webp`

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Imágenes 360° con Dron para Simulación de Vistas — Santo Domingo | Babula Shots'
    : 'Drone 360° Images for View Simulation — Santo Domingo | Babula Shots'
  const description = isEs
    ? 'Fotografía aérea 360° con dron para simular las vistas reales de proyectos inmobiliarios antes de construirlos. Preventa, tours virtuales interactivos y renders 3D en República Dominicana. Desde $370 USD.'
    : 'Aerial 360° drone photography to simulate real views of real estate projects before construction. Pre-sale, interactive virtual tours, and 3D render backplates in the Dominican Republic. From $370 USD.'
  return {
    title,
    description,
    keywords: isEs
      ? 'imágenes 360 dron simulación vistas, fotografía aérea 360 grados inmobiliaria, drone 360 preventa proyectos, tour virtual aéreo república dominicana, simulación vistas piso dron, 360 panorámica inmobiliaria santo domingo'
      : '360 drone images view simulation, aerial 360 real estate photography, drone 360 presale projects, virtual aerial tour dominican republic, floor view simulation drone, 360 panoramic real estate santo domingo',
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
      images: [{ url: IMAGE_URL, width: 1600, height: 900, alt: isEs ? 'Imágenes 360° con dron para simulación de vistas inmobiliarias — República Dominicana' : '360° drone images for real estate view simulation — Dominican Republic' }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title,
      description,
      images: [IMAGE_URL],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

const faqEs = [
  {
    q: '¿Cómo se garantiza la altura exacta de cada piso en la simulación?',
    a: 'Utilizamos drones con sistemas de posicionamiento GPS dual y sensores barométricos calibrados en tiempo real. Esto nos permite fijar el dron a la altura exacta en metros solicitada por los arquitectos, con un margen de variación menor a 10 centímetros.',
  },
  {
    q: '¿Las imágenes son compatibles con software de renderizado 3D?',
    a: 'Sí. Entregamos imágenes en formato equirectangular de hasta 12K en TIFF o JPG HDR de rango dinámico completo, listos para usarse como fondos (backplates) o entornos de iluminación en Lumion, V-Ray, 3ds Max y Blender.',
  },
  {
    q: '¿Qué es el cosido profesional (stitching) y por qué es importante?',
    a: 'El stitching une múltiples tomas individuales en una sola imagen equirectangular perfecta. Nuestro proceso elimina completamente el dron del nadir (punto inferior), corrige aberraciones cromáticas y asegura transiciones de color uniformes entre cada captura.',
  },
  {
    q: '¿Puedo usar las imágenes 360° en mi sitio web o presentaciones de ventas?',
    a: 'Sí. Entregamos los archivos optimizados para plataformas de visualización web como Kuula, 3DVista, CloudPano y Matterport. También proporcionamos versiones estáticas en alta resolución para PDF, presentaciones y renders arquitectónicos.',
  },
  {
    q: '¿Cuántos pisos o alturas puedo incluir en un mismo proyecto?',
    a: 'Depende del plan elegido: el Plan Básico cubre hasta 3 alturas, el Plan Desarrollador Pro hasta 10 alturas, y el Plan Corporativo/Torre hasta 25 alturas fijas. Para proyectos con más de 25 niveles, cotizamos a medida.',
  },
  {
    q: '¿Qué incluye el Tour Virtual Interactivo?',
    a: 'El tour virtual permite al usuario final cambiar de piso con un solo clic, girar 360° en cada nivel, y visualizar puntos de interés cercanos como playas, avenidas y parques. Se entrega como enlace web compartible optimizado para móvil y escritorio.',
  },
]

const faqEn = [
  {
    q: 'How is the exact floor height guaranteed in the simulation?',
    a: 'We use drones equipped with dual GPS positioning systems and real-time calibrated barometric sensors. This allows us to lock the drone at the exact altitude in meters requested by architects, with a variation margin of less than 10 centimeters.',
  },
  {
    q: 'Are the images compatible with 3D rendering software?',
    a: 'Yes. We deliver images in equirectangular format up to 12K in TIFF or full dynamic range HDR JPG, ready for use as backplates or lighting environments in Lumion, V-Ray, 3ds Max, and Blender.',
  },
  {
    q: 'What is professional stitching and why does it matter?',
    a: 'Stitching joins multiple individual shots into one perfect equirectangular image. Our process completely removes the drone from the nadir (bottom point), corrects chromatic aberrations, and ensures uniform color transitions between each capture.',
  },
  {
    q: 'Can I use the 360° images on my website or sales presentations?',
    a: 'Yes. We deliver files optimized for web visualization platforms like Kuula, 3DVista, CloudPano, and Matterport. We also provide high-resolution static versions for PDFs, presentations, and architectural renders.',
  },
  {
    q: 'How many floors or heights can I include in one project?',
    a: 'It depends on the selected plan: the Basic Plan covers up to 3 heights, the Developer Pro Plan up to 10, and the Corporate/Tower Plan up to 25 fixed heights. For projects with more than 25 levels, we provide a custom quote.',
  },
  {
    q: 'What does the Interactive Virtual Tour include?',
    a: 'The virtual tour allows end users to switch floors with a single click, rotate 360° at each level, and view nearby points of interest like beaches, avenues, and parks. It is delivered as a shareable web link optimized for mobile and desktop.',
  },
]

const plans = [
  {
    slug: 'basico',
    nameEs: 'Plan Básico Comercial',
    nameEn: 'Basic Commercial Plan',
    heights: { es: 'Hasta 3 alturas fijas', en: 'Up to 3 fixed heights' },
    resolution: '8K HDR',
    deliverablesEs: '3 panorámicas 360° cosidas + enlace interactivo web (válido 6 meses)',
    deliverablesEn: '3 stitched 360° panoramas + interactive web link (valid 6 months)',
    price: 350,
    popular: false,
    featuresEs: [
      '3 alturas/pisos con precisión GPS',
      'Resolución 8K HDR',
      'Cosido profesional — nadir limpio',
      'Enlace web interactivo (6 meses)',
      'JPG / TIFF procesados',
      'Entrega en 5 días hábiles',
    ],
    featuresEn: [
      '3 GPS-precise heights/floors',
      '8K HDR resolution',
      'Professional stitching — clean nadir',
      'Interactive web link (6 months)',
      'Processed JPG / TIFF',
      'Delivery in 5 business days',
    ],
  },
  {
    slug: 'desarrollador-pro',
    nameEs: 'Plan Desarrollador Pro',
    nameEn: 'Developer Pro Plan',
    heights: { es: 'Hasta 10 alturas fijas', en: 'Up to 10 fixed heights' },
    resolution: '12K HDR',
    deliverablesEs: '10 panorámicas 360° + archivos RAW/DNG para renders + tour virtual personalizado',
    deliverablesEn: '10 360° panoramas + RAW/DNG files for renders + custom virtual tour',
    price: 850,
    popular: true,
    featuresEs: [
      '10 alturas/pisos con precisión GPS <10 cm',
      'Resolución máxima 12K HDR',
      'Archivos RAW / DNG para renders 3D',
      'Tour virtual interactivo personalizado',
      'Cosido profesional — nadir limpio',
      'Compatible Lumion, V-Ray, 3ds Max, Blender',
      'Entrega en 7 días hábiles',
    ],
    featuresEn: [
      '10 GPS-precise heights/floors <10 cm',
      'Maximum 12K HDR resolution',
      'RAW / DNG files for 3D renders',
      'Custom interactive virtual tour',
      'Professional stitching — clean nadir',
      'Compatible with Lumion, V-Ray, 3ds Max, Blender',
      'Delivery in 7 business days',
    ],
  },
  {
    slug: 'corporativo-torre',
    nameEs: 'Plan Corporativo / Torre',
    nameEn: 'Corporate / Tower Plan',
    heights: { es: 'Hasta 25 alturas fijas', en: 'Up to 25 fixed heights' },
    resolution: '12K HDR + nadir limpio',
    deliverablesEs: 'Todo lo anterior + video 360° + hotspots interactivos de la zona',
    deliverablesEn: 'Everything above + 360° video + interactive area hotspots',
    price: 1800,
    popular: false,
    featuresEs: [
      '25 alturas/pisos con precisión GPS <10 cm',
      'Resolución 12K HDR + nadir completamente limpio',
      'Video 360° de la propiedad',
      'Hotspots interactivos de puntos de interés',
      'Archivos RAW/DNG para renders',
      'Tour virtual multi-piso completo',
      'Compatible Unreal Engine, Matterport, Kuula',
      'Entrega en 10 días hábiles',
    ],
    featuresEn: [
      '25 GPS-precise heights/floors <10 cm',
      '12K HDR resolution + completely clean nadir',
      '360° property video',
      'Interactive points of interest hotspots',
      'RAW/DNG files for renders',
      'Full multi-floor virtual tour',
      'Compatible with Unreal Engine, Matterport, Kuula',
      'Delivery in 10 business days',
    ],
  },
]

export default function Drone360Page({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const faq = isEs ? faqEs : faqEn
  const pageUrl = `${BASE_URL}/${locale}/${PAGE_SLUG}`
  const parentUrl = `${BASE_URL}/${locale}/${PARENT_SLUG}`

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Servicios' : 'Services', url: `${BASE_URL}/${locale}/services` },
    { name: isEs ? 'Drone Inmobiliario' : 'Real Estate Drone', url: parentUrl },
    { name: isEs ? 'Imágenes 360° Simulación de Vistas' : '360° View Simulation', url: pageUrl },
  ])

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: isEs ? 'Imágenes 360° con Dron para Simulación de Vistas' : 'Drone 360° Images for View Simulation',
        serviceType: isEs ? 'Fotografía Aérea Inmobiliaria 360°' : 'Aerial Real Estate Photography 360°',
        description: isEs
          ? 'Servicio profesional de fotografía aérea 360° con dron para simular las vistas reales de edificios y proyectos arquitectónicos antes de ser construidos. Resolución hasta 12K HDR, compatible con software de renderizado 3D y plataformas de tour virtual.'
          : 'Professional aerial 360° drone photography service to simulate real views of buildings and architectural projects before construction. Up to 12K HDR resolution, compatible with 3D rendering software and virtual tour platforms.',
        provider: {
          '@type': 'LocalBusiness',
          '@id': `${BASE_URL}/#business`,
          name: 'Babula Shots',
          image: IMAGE_URL,
          url: BASE_URL,
          telephone: CONTACT_INFO.phone,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'C. El Conde 142',
            addressLocality: 'Santo Domingo',
            addressCountry: 'DO',
          },
          priceRange: '$$$',
        },
        areaServed: { '@type': 'Country', name: isEs ? 'República Dominicana' : 'Dominican Republic' },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: '350',
          highPrice: '1800',
          offerCount: '3',
          offers: plans.map((p) => ({
            '@type': 'Offer',
            name: isEs ? p.nameEs : p.nameEn,
            price: p.price,
            priceCurrency: 'USD',
            description: isEs ? p.deliverablesEs : p.deliverablesEn,
          })),
        },
        image: {
          '@type': 'ImageObject',
          '@id': `${pageUrl}#hero-image`,
          contentUrl: IMAGE_URL,
          url: IMAGE_URL,
          name: isEs ? 'Imágenes 360° con dron para simulación de vistas inmobiliarias — República Dominicana' : '360° drone images for real estate view simulation — Dominican Republic',
          description: isEs
            ? 'Fotografía aérea 360° de alta resolución capturada con dron DJI Mavic 3 Pro para simular las vistas exactas de proyectos inmobiliarios en República Dominicana.'
            : 'High-resolution aerial 360° photography captured with DJI Mavic 3 Pro drone to simulate exact views of real estate projects in the Dominican Republic.',
          caption: isEs ? 'Babula Shots — Imágenes 360° con Dron · República Dominicana' : 'Babula Shots — 360° Drone Images · Dominican Republic',
          creator: { '@type': 'Person', name: 'Michal Babula', url: `${BASE_URL}/${locale}/about` },
          width: { '@type': 'QuantitativeValue', value: 1600 },
          height: { '@type': 'QuantitativeValue', value: 900 },
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <main className="min-h-screen bg-canvas text-ink">

        {/* ── Hero ── */}
        <section className="relative bg-canvas py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />
          <div className="relative container mx-auto px-4">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                <li><Link href={`/${locale}`} className="hover:text-ink transition-colors">{isEs ? 'Inicio' : 'Home'}</Link></li>
                <li aria-hidden="true" className="text-ink-muted/50">›</li>
                <li><Link href={`/${locale}/services`} className="hover:text-ink transition-colors">{isEs ? 'Servicios' : 'Services'}</Link></li>
                <li aria-hidden="true" className="text-ink-muted/50">›</li>
                <li><Link href={`/${locale}/${PARENT_SLUG}`} className="hover:text-ink transition-colors">{isEs ? 'Drone Inmobiliario' : 'Real Estate Drone'}</Link></li>
                <li aria-hidden="true" className="text-ink-muted/50">›</li>
                <li className="text-ink" aria-current="page">{isEs ? 'Imágenes 360°' : '360° Images'}</li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <span className="inline-block font-mono uppercase tracking-widest text-[11px] text-sky-400 mb-4">
                {isEs ? 'Drone · Fotografía Aérea Inmobiliaria' : 'Drone · Aerial Real Estate Photography'}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {isEs
                  ? 'Imágenes 360° con Dron para Simulación de Vistas de Altura'
                  : 'Drone 360° Images for Height View Simulation'}
              </h1>
              <p className="text-xl text-ink-muted mb-8 max-w-3xl leading-relaxed">
                {isEs
                  ? 'Visualiza las vistas reales de tus proyectos inmobiliarios antes de construirlos. Capturamos la perspectiva exacta, metro a metro, de cada futuro piso o terraza.'
                  : 'Visualize the real views of your real estate projects before building them. We capture the exact perspective, meter by meter, of every future floor or terrace.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={BOOKING_LINKS.setmore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  {isEs ? 'Reservar Consulta' : 'Book a Consultation'}
                </a>
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(isEs ? 'Hola, me interesa el servicio de imágenes 360° con dron para simulación de vistas.' : 'Hi, I am interested in the 360° drone image view simulation service.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Hero image ── */}
        <section className="w-full bg-gray-950" aria-label={isEs ? 'Imágenes 360° con dron para simulación de vistas' : '360° drone images for view simulation'}>
          <figure className="w-full max-h-[65vh] overflow-hidden">
            <img
              src="/images/imagenes-360-drone-simulacion-vistas.webp"
              alt={isEs
                ? 'Imágenes 360° capturadas con dron DJI Mavic 3 Pro para simulación de vistas de proyectos inmobiliarios en República Dominicana — Babula Shots'
                : '360° images captured with DJI Mavic 3 Pro drone for real estate view simulation in the Dominican Republic — Babula Shots'}
              title={isEs
                ? 'Imágenes 360° con Dron para Simulación de Vistas Inmobiliarias | Babula Shots'
                : 'Drone 360° Images for Real Estate View Simulation | Babula Shots'}
              className="w-full h-full object-cover object-center"
              loading="eager"
              width={1600}
              height={900}
            />
            <figcaption className="sr-only">
              {isEs
                ? 'Fotografía aérea 360° de alta resolución capturada con dron DJI Mavic 3 Pro. Servicio especializado en simulación de vistas para proyectos inmobiliarios en preventa en República Dominicana, con resolución hasta 12K HDR y tours virtuales interactivos.'
                : 'High-resolution aerial 360° photography captured with DJI Mavic 3 Pro drone. Specialized view simulation service for pre-sale real estate projects in the Dominican Republic, with up to 12K HDR resolution and interactive virtual tours.'}
            </figcaption>
          </figure>
        </section>

        {/* ── Why this service ── */}
        <section className="py-20 bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {isEs
                  ? 'Visualiza las vistas reales de tus proyectos inmobiliarios antes de construirlos'
                  : 'Visualize the real views of your real estate projects before building them'}
              </h2>
              <p className="text-lg text-ink-muted leading-relaxed">
                {isEs
                  ? 'Optimiza la comercialización de tus proyectos en preventa con fotografía aérea 360° de alta resolución. Ofrecemos a tus inversionistas y compradores una experiencia inmersiva hiperrealista que acelera la toma de decisiones y aporta total certeza visual.'
                  : 'Optimize the pre-sale marketing of your projects with high-resolution aerial 360° photography. Offer your investors and buyers a hyperrealistic immersive experience that accelerates decision-making and delivers complete visual certainty.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎯',
                  titleEs: 'Precisión GPS Centimétrica',
                  titleEn: 'Centimeter-Precise GPS',
                  descEs: 'Margen de error menor a 10 cm en altura. Cada piso capturado exactamente donde estará.',
                  descEn: 'Margin of error under 10 cm in altitude. Every floor captured exactly where it will be.',
                },
                {
                  icon: '🏗️',
                  titleEs: 'Compatible con Renders 3D',
                  titleEn: 'Compatible with 3D Renders',
                  descEs: 'Archivos RAW/DNG optimizados para Lumion, V-Ray, 3ds Max, Blender y Unreal Engine.',
                  descEn: 'RAW/DNG files optimized for Lumion, V-Ray, 3ds Max, Blender, and Unreal Engine.',
                },
                {
                  icon: '🌐',
                  titleEs: 'Tours Virtuales Interactivos',
                  titleEn: 'Interactive Virtual Tours',
                  descEs: 'El cliente cambia de piso con un clic, gira 360° y ve puntos de interés cercanos.',
                  descEn: 'Clients switch floors with a click, rotate 360°, and see nearby points of interest.',
                },
                {
                  icon: '📐',
                  titleEs: 'Resolución hasta 12K HDR',
                  titleEn: 'Up to 12K HDR Resolution',
                  descEs: 'Imágenes equirectangulares de 11,520 × 5,760 px. Zoom sin pérdida de detalle.',
                  descEn: 'Equirectangular images of 11,520 × 5,760 px. Zoom without loss of detail.',
                },
                {
                  icon: '🌅',
                  titleEs: 'HDR Bracketed — Luz Natural',
                  titleEn: 'HDR Bracketed — Natural Light',
                  descEs: 'Capturas de 3 a 5 exposiciones para balancear cielos y sombras de forma natural.',
                  descEn: '3 to 5 exposure brackets to naturally balance skies and shadows.',
                },
                {
                  icon: '✂️',
                  titleEs: 'Nadir Completamente Limpio',
                  titleEn: 'Completely Clean Nadir',
                  descEs: 'Eliminación total del dron en el punto inferior. Panorámica sin interrupciones.',
                  descEn: 'Complete drone removal at the bottom point. Uninterrupted panorama.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-900 rounded-xl p-6 border border-hairline-soft">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{isEs ? item.titleEs : item.titleEn}</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">{isEs ? item.descEs : item.descEn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Technical Specs ── */}
        <section className="py-20 bg-canvas">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isEs ? 'Especificaciones Técnicas del Servicio de Dron 360°' : 'Technical Specifications of the 360° Drone Service'}
              </h2>
              <p className="text-ink-muted mb-10 text-lg">
                {isEs
                  ? 'Para garantizar integraciones arquitectónicas perfectas y visualizaciones nítidas, trabajamos bajo los más estrictos estándares de la industria.'
                  : 'To guarantee perfect architectural integrations and sharp visualizations, we work under the strictest industry standards.'}
              </p>
              <div className="space-y-4">
                {[
                  {
                    labelEs: 'Resolución de Captura',
                    labelEn: 'Capture Resolution',
                    valueEs: 'Imágenes equirectangulares de hasta 12K (11,520 × 5,760 px) para zoom sin pérdida de detalle',
                    valueEn: 'Equirectangular images up to 12K (11,520 × 5,760 px) for lossless detail zoom',
                  },
                  {
                    labelEs: 'Precisión Altométrica',
                    labelEn: 'Altimetric Precision',
                    valueEs: 'Bloqueo de altura por GPS y sensores barométricos con margen de error menor a 10 centímetros',
                    valueEn: 'GPS and barometric sensor altitude lock with a margin of error under 10 centimeters',
                  },
                  {
                    labelEs: 'Formato de Entrega',
                    labelEn: 'Delivery Format',
                    valueEs: 'Archivos fuente RAW / DNG (máximo rango dinámico) + procesados en JPG / TIFF',
                    valueEn: 'Source files RAW / DNG (maximum dynamic range) + processed JPG / TIFF',
                  },
                  {
                    labelEs: 'Cosido Profesional',
                    labelEn: 'Professional Stitching',
                    valueEs: 'Eliminación completa del dron (nadir plano) + corrección de aberraciones cromáticas',
                    valueEn: 'Complete drone removal (clean nadir) + chromatic aberration correction',
                  },
                  {
                    labelEs: 'Consistencia Lumínica',
                    labelEn: 'Luminic Consistency',
                    valueEs: 'Bracketed HDR de 3 a 5 exposiciones para balancear cielos y sombras naturalmente',
                    valueEn: 'Bracketed HDR 3 to 5 exposures to naturally balance skies and shadows',
                  },
                  {
                    labelEs: 'Software de Renderizado',
                    labelEn: 'Rendering Software',
                    valueEs: 'Lumion · V-Ray · 3ds Max · Blender · Unreal Engine',
                    valueEn: 'Lumion · V-Ray · 3ds Max · Blender · Unreal Engine',
                  },
                  {
                    labelEs: 'Plataformas de Tour Virtual',
                    labelEn: 'Virtual Tour Platforms',
                    valueEs: 'Kuula · 3DVista · CloudPano · Matterport · WebVR nativo',
                    valueEn: 'Kuula · 3DVista · CloudPano · Matterport · Native WebVR',
                  },
                ].map((spec, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 py-4 border-b border-hairline-soft">
                    <dt className="font-semibold text-white sm:w-56 flex-shrink-0">{isEs ? spec.labelEs : spec.labelEn}</dt>
                    <dd className="text-ink-muted">{isEs ? spec.valueEs : spec.valueEn}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="py-20 bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isEs ? 'Servicios Especializados' : 'Specialized Services'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: '🏢',
                  titleEs: 'Simulación de Vistas por Piso (Preventa)',
                  titleEn: 'Floor View Simulation (Pre-sale)',
                  descEs: 'Elevamos el dron a las alturas exactas de cada nivel proyectado (ej. Piso 5 a 15 m, Piso 10 a 30 m). Obtenemos la panorámica exacta que tendrá el cliente desde su futuro balcón o ventana.',
                  descEn: 'We fly the drone to the exact height of each planned level (e.g., Floor 5 at 15 m, Floor 10 at 30 m). We capture the exact panorama the client will have from their future balcony or window.',
                },
                {
                  icon: '🖥️',
                  titleEs: 'Integración Render Backplate (Fotocomposición)',
                  titleEn: 'Render Backplate Integration (Photocomposition)',
                  descEs: 'Entregamos el entorno real 360° optimizado lumínicamente para que tu equipo de arquitectura inserte el modelo 3D del edificio de forma idéntica a la realidad.',
                  descEn: 'We deliver the real 360° environment with optimized lighting so your architecture team can insert the 3D building model identically to reality.',
                },
                {
                  icon: '🌐',
                  titleEs: 'Tours Virtuales Aéreos Interactivos',
                  titleEn: 'Interactive Aerial Virtual Tours',
                  descEs: 'Plataforma web interactiva donde el usuario cambia de piso con un clic, gira 360° y visualiza puntos de interés cercanos como playas, avenidas y parques.',
                  descEn: 'Interactive web platform where users switch floors with a click, rotate 360°, and view nearby points of interest like beaches, avenues, and parks.',
                },
              ].map((svc, i) => (
                <div key={i} className="bg-gray-900 rounded-2xl p-8 border border-hairline-soft flex flex-col gap-4">
                  <div className="text-4xl">{svc.icon}</div>
                  <h3 className="text-xl font-bold text-white">{isEs ? svc.titleEs : svc.titleEn}</h3>
                  <p className="text-ink-muted leading-relaxed">{isEs ? svc.descEs : svc.descEn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="py-20 bg-canvas" id="precios">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isEs ? 'Tarifas y Planes del Servicio' : 'Service Plans & Pricing'}
              </h2>
              <p className="text-ink-muted text-lg">
                {isEs ? 'Desde $370 USD · Cotización personalizada disponible' : 'From $370 USD · Custom quotes available'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.slug}
                  className={`relative rounded-2xl p-8 flex flex-col gap-6 border ${plan.popular ? 'bg-sky-950 border-sky-500 shadow-lg shadow-sky-500/10' : 'bg-gray-900 border-hairline-soft'}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white font-mono text-[10px] uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
                      {isEs ? 'Más Popular' : 'Most Popular'}
                    </span>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{isEs ? plan.nameEs : plan.nameEn}</h3>
                    <p className="text-ink-muted text-sm">{isEs ? plan.heights.es : plan.heights.en}</p>
                  </div>
                  <div>
                    <span className="text-4xl font-bold text-white">${plan.price.toLocaleString()}</span>
                    <span className="text-ink-muted ml-2">USD</span>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {(isEs ? plan.featuresEs : plan.featuresEn).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                        <span className="text-sky-400 mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(isEs ? `Hola, me interesa el ${plan.nameEs} de imágenes 360° con dron ($${plan.price} USD).` : `Hi, I am interested in the ${plan.nameEn} for 360° drone images ($${plan.price} USD).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full text-center py-3 rounded-lg font-semibold text-sm transition-colors ${plan.popular ? 'bg-sky-500 hover:bg-sky-400 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white border border-hairline'}`}
                  >
                    {isEs ? 'Solicitar este plan' : 'Request this plan'}
                  </a>
                </div>
              ))}
            </div>

            <p className="text-center text-ink-muted text-sm mt-8">
              {isEs
                ? 'Proyectos con más de 25 niveles o requerimientos especiales — cotización personalizada sin costo.'
                : 'Projects with more than 25 levels or special requirements — free custom quote.'}
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 bg-gray-950" id="faq">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
              </h2>
              <dl className="space-y-6">
                {faq.map((item, i) => (
                  <div key={i} className="bg-gray-900 rounded-xl p-6 border border-hairline-soft">
                    <dt className="font-semibold text-white mb-3 text-lg">{item.q}</dt>
                    <dd className="text-ink-muted leading-relaxed">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ── Back to drone + CTA ── */}
        <section className="py-20 bg-canvas border-t border-hairline-soft">
          <div className="container mx-auto px-4 text-center">
            <Link
              href={`/${locale}/${PARENT_SLUG}`}
              className="inline-flex items-center gap-2 font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-colors mb-12"
            >
              ← {isEs ? 'Ver todos los servicios de drone inmobiliario' : 'See all real estate drone services'}
            </Link>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {isEs ? '¿Listo para mostrar tus proyectos como nunca antes?' : 'Ready to showcase your projects like never before?'}
            </h2>
            <p className="text-xl text-ink-muted mb-8 max-w-2xl mx-auto">
              {isEs
                ? 'Conversemos sobre tu proyecto inmobiliario y diseñemos la simulación de vistas perfecta.'
                : "Let's talk about your real estate project and design the perfect view simulation."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={BOOKING_LINKS.setmore}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-600 hover:bg-sky-700 px-8 py-4 rounded-lg font-semibold text-white transition-colors"
              >
                📅 {isEs ? 'Reservar Consulta' : 'Book a Consultation'}
              </a>
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(isEs ? 'Hola, me interesa el servicio de imágenes 360° con dron para simulación de vistas.' : 'Hi, I am interested in the 360° drone image view simulation service.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold text-white transition-colors"
              >
                WhatsApp: {CONTACT_INFO.phone}
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
