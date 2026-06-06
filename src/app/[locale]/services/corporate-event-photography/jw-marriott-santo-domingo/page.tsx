import type { Metadata } from 'next'
import Link from 'next/link'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'

export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string }
}

const galleryImages = [
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585511/Retratos_profesionales_para_ejecutivos_RD_knwunq.webp',
    alt: {
      es: 'Retratos profesionales para ejecutivos en República Dominicana — JW Marriott Santo Domingo',
      en: 'Professional executive portraits in the Dominican Republic — JW Marriott Santo Domingo',
    },
    title: {
      es: 'Retratos ejecutivos · JW Marriott Santo Domingo',
      en: 'Executive portraits · JW Marriott Santo Domingo',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585510/Fotos_para_eventos_corporativos_RD_tg8aqq.webp',
    alt: {
      es: 'Fotografía para eventos corporativos en República Dominicana — hotel JW Marriott',
      en: 'Photography for corporate events in the Dominican Republic — JW Marriott hotel',
    },
    title: {
      es: 'Eventos corporativos · JW Marriott RD',
      en: 'Corporate events · JW Marriott DR',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585508/Foto%CC%81grafo_para_ferias_comerciales_Santo_Domingo_uupbdj.webp',
    alt: {
      es: 'Fotógrafo para ferias comerciales en Santo Domingo — cobertura profesional de empresa',
      en: 'Photographer for trade fairs in Santo Domingo — professional corporate coverage',
    },
    title: {
      es: 'Ferias comerciales · Santo Domingo',
      en: 'Trade fairs · Santo Domingo',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585507/Foto%CC%81grafo_para_eventos_B2B_Santo_Domingo_wkindd.webp',
    alt: {
      es: 'Fotógrafo para eventos B2B en Santo Domingo — presentaciones y networking empresarial',
      en: 'Photographer for B2B events in Santo Domingo — business presentations and networking',
    },
    title: {
      es: 'Eventos B2B · Santo Domingo',
      en: 'B2B events · Santo Domingo',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585505/Foto%CC%81grafo_de_lanzamientos_de_marca_mr7sxf.webp',
    alt: {
      es: 'Fotógrafo de lanzamientos de marca en Santo Domingo — presentación de producto en hotel de lujo',
      en: 'Brand launch photographer in Santo Domingo — product presentation at luxury hotel',
    },
    title: {
      es: 'Lanzamientos de marca · Santo Domingo',
      en: 'Brand launches · Santo Domingo',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585505/fotografo_de_eventos_santo_domingo_negocioas_networking_republica_dominicana_qydjaq.webp',
    alt: {
      es: 'Fotógrafo de eventos de negocios y networking en Santo Domingo, República Dominicana',
      en: 'Business and networking event photographer in Santo Domingo, Dominican Republic',
    },
    title: {
      es: 'Networking · Santo Domingo RD',
      en: 'Networking · Santo Domingo DR',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585502/Foto%CC%81grafo_de_cenas_bene%CC%81ficas_y_galas_SD_assaw9.webp',
    alt: {
      es: 'Fotógrafo de cenas benéficas y galas empresariales en Santo Domingo — JW Marriott',
      en: 'Photographer for charity dinners and corporate galas in Santo Domingo — JW Marriott',
    },
    title: {
      es: 'Cenas benéficas y galas · SD',
      en: 'Charity dinners and galas · SD',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585501/Fotografi%CC%81a_para_empresas_en_Santo_Domingo_fyxoea.webp',
    alt: {
      es: 'Fotografía para empresas en Santo Domingo — cobertura corporativa en JW Marriott',
      en: 'Photography for companies in Santo Domingo — corporate coverage at JW Marriott',
    },
    title: {
      es: 'Fotografía para empresas · SD',
      en: 'Company photography · SD',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585501/Fotografi%CC%81a_de_networking_Repu%CC%81blica_Dominicana_hurl5p.webp',
    alt: {
      es: 'Fotografía de networking en República Dominicana — eventos de contactos empresariales',
      en: 'Networking photography in Dominican Republic — business contact events',
    },
    title: {
      es: 'Fotografía de networking · RD',
      en: 'Networking photography · DR',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585498/Fotografi%CC%81a_corporativa_Santo_Domingo_y9nbwq.webp',
    alt: {
      es: 'Fotografía corporativa en Santo Domingo — hotel JW Marriott Piantini',
      en: 'Corporate photography in Santo Domingo — JW Marriott Piantini hotel',
    },
    title: {
      es: 'Fotografía corporativa · JW Marriott',
      en: 'Corporate photography · JW Marriott',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585498/Cobertura_fotogra%CC%81fica_de_eventos_de_negocios_d4ng3d.webp',
    alt: {
      es: 'Cobertura fotográfica de eventos de negocios en Santo Domingo, República Dominicana',
      en: 'Photographic coverage of business events in Santo Domingo, Dominican Republic',
    },
    title: {
      es: 'Eventos de negocios · Santo Domingo',
      en: 'Business events · Santo Domingo',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1780585498/Cobertura_fotogra%CC%81fica_de_convenciones_Santo_Domingo_lwlx35.webp',
    alt: {
      es: 'Cobertura fotográfica de convenciones en Santo Domingo — JW Marriott República Dominicana',
      en: 'Photographic coverage of conventions in Santo Domingo — JW Marriott Dominican Republic',
    },
    title: {
      es: 'Convenciones · JW Marriott SD',
      en: 'Conventions · JW Marriott SD',
    },
  },
]

const faqItems = {
  es: [
    {
      q: '¿Cubren presentaciones de producto en el JW Marriott Santo Domingo?',
      a: 'Sí. El JW Marriott Piantini es uno de nuestros venues de referencia para eventos corporativos. Conocemos sus salones, flujos de iluminación y protocolo, lo que nos permite integrar la cobertura desde el primer momento sin curva de aprendizaje.',
    },
    {
      q: '¿Qué incluye la cobertura de un evento de networking?',
      a: 'Documentamos llegada de invitados, intercambio de contactos, momentos de conversación editorial y ambiente de sala. Priorizamos fotos que comunican conexión y profesionalismo para uso en comunicaciones internas, redes sociales y prensa de marca.',
    },
    {
      q: '¿Pueden entregar fotos express para redes sociales durante el evento?',
      a: 'Sí. Para eventos en el JW Marriott y otros venues del área metropolitana de Santo Domingo, configuramos flujo de selección rápida que permite al equipo de marketing publicar en tiempo real mientras el evento está en marcha.',
    },
    {
      q: '¿Trabajan con el equipo de eventos del JW Marriott?',
      a: 'Sí. Coordinamos con el personal del venue antes y durante el evento para respetar protocolos de seguridad y acceso, integrarnos con el equipo de producción del cliente y garantizar cobertura completa sin disrupciones.',
    },
    {
      q: '¿Cuánto cuesta un fotógrafo para eventos empresariales en el JW Marriott?',
      a: 'El precio depende de horas de cobertura, número de fotógrafos y entregables. Recomendamos pedir cotización personalizada con los detalles del evento para recibir una propuesta ajustada a la producción específica.',
    },
  ],
  en: [
    {
      q: 'Do you cover product presentations at JW Marriott Santo Domingo?',
      a: 'Yes. JW Marriott Piantini is one of our reference venues for corporate events. We know its ballrooms, lighting flows, and protocol, which allows us to integrate coverage from the first moment without any learning curve.',
    },
    {
      q: 'What does networking event coverage include?',
      a: 'We document guest arrivals, contact exchanges, editorial conversation moments, and room atmosphere. We prioritize photos that communicate connection and professionalism for use in internal communications, social media, and brand press.',
    },
    {
      q: 'Can you deliver express photos for social media during the event?',
      a: 'Yes. For events at JW Marriott and other venues in the Santo Domingo metro area, we set up a rapid-select workflow that allows the marketing team to publish in real time while the event is still running.',
    },
    {
      q: 'Do you work with the JW Marriott events team?',
      a: 'Yes. We coordinate with venue staff before and during the event to respect security and access protocols, integrate with the client\'s production team, and ensure complete coverage without disruptions.',
    },
    {
      q: 'How much does a corporate event photographer at JW Marriott cost?',
      a: 'The price depends on coverage hours, number of photographers, and deliverables. We recommend requesting a custom quote with the event details to receive a proposal tailored to the specific production.',
    },
  ],
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Fotógrafo de Eventos Empresariales en JW Marriott Santo Domingo | Presentaciones y Networking | Babula Shots'
    : 'Corporate Event Photographer at JW Marriott Santo Domingo | Presentations & Networking | Babula Shots'
  const description = isEs
    ? 'Cobertura fotográfica profesional de presentaciones de producto, eventos de networking y eventos B2B en el JW Marriott Santo Domingo, República Dominicana. Entrega express para redes y prensa.'
    : 'Professional photographic coverage of product presentations, networking events and B2B corporate events at JW Marriott Santo Domingo, Dominican Republic. Express delivery for social and press.'

  return {
    title,
    description,
    keywords: isEs
      ? 'fotografo eventos empresariales JW Marriott Santo Domingo, fotografo presentacion producto santo domingo, fotografo networking republica dominicana, fotografia corporativa JW Marriott, cobertura eventos B2B Santo Domingo'
      : 'corporate event photographer JW Marriott Santo Domingo, product presentation photographer santo domingo, networking photographer dominican republic, corporate photography JW Marriott, B2B event coverage Santo Domingo',
    alternates: {
      canonical: `${BASE_URL}/${locale}/services/corporate-event-photography/jw-marriott-santo-domingo`,
      languages: {
        es: `${BASE_URL}/es/services/corporate-event-photography/jw-marriott-santo-domingo`,
        en: `${BASE_URL}/en/services/corporate-event-photography/jw-marriott-santo-domingo`,
        'x-default': `${BASE_URL}/es/services/corporate-event-photography/jw-marriott-santo-domingo`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs
        ? 'Fotógrafo de Eventos Empresariales en JW Marriott Santo Domingo'
        : 'Corporate Event Photographer at JW Marriott Santo Domingo',
      description,
      url: `${BASE_URL}/${locale}/services/corporate-event-photography/jw-marriott-santo-domingo`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=${isEs ? 'Eventos+Empresariales' : 'Corporate+Events'}&subtitle=JW+Marriott+Santo+Domingo`,
        width: 1200,
        height: 630,
        alt: isEs
          ? 'Fotógrafo de eventos empresariales en JW Marriott Santo Domingo'
          : 'Corporate event photographer at JW Marriott Santo Domingo',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs
        ? 'Fotógrafo de Eventos en JW Marriott Santo Domingo'
        : 'Corporate Event Photographer JW Marriott Santo Domingo',
      description,
      images: [`${BASE_URL}/api/og?title=${isEs ? 'JW+Marriott+Eventos' : 'JW+Marriott+Events'}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export default function JwMarriottCorporateEventsPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Servicios' : 'Services', url: `${BASE_URL}/${locale}/services` },
    {
      name: isEs ? 'Fotografía de Eventos Corporativos' : 'Corporate Event Photography',
      url: `${BASE_URL}/${locale}/services/corporate-event-photography`,
    },
    {
      name: isEs ? 'JW Marriott Santo Domingo' : 'JW Marriott Santo Domingo',
      url: `${BASE_URL}/${locale}/services/corporate-event-photography/jw-marriott-santo-domingo`,
    },
  ])

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (isEs ? faqItems.es : faqItems.en).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const imageGallerySchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: isEs
      ? 'Galería de eventos corporativos en JW Marriott Santo Domingo'
      : 'Corporate events gallery at JW Marriott Santo Domingo',
    image: galleryImages.map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.src,
      url: img.src,
      name: isEs ? img.alt.es : img.alt.en,
      caption: isEs ? img.title.es : img.title.en,
      creator: { '@type': 'Person', name: 'Michal Babula' },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(faqSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(imageGallerySchema)} />
      <main className="min-h-screen bg-canvas text-ink">

        {/* ── HEADER ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24 lg:py-28">
          <div className="container mx-auto px-4">
            <nav>
              <Link
                href={`/${locale}/services/corporate-event-photography`}
                className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
              >
                ← {isEs ? 'Fotografía de eventos corporativos' : 'Corporate event photography'}
              </Link>
            </nav>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mt-10 mb-6">
              {isEs
                ? 'Venue destacado · JW Marriott · Santo Domingo'
                : 'Featured venue · JW Marriott · Santo Domingo'}
            </p>
            <h1
              className="font-display uppercase text-ink max-w-5xl"
              style={{
                fontSize: 'clamp(32px, 6vw, 96px)',
                lineHeight: '0.95',
                letterSpacing: '-0.01em',
              }}
            >
              {isEs
                ? 'Eventos empresariales en JW Marriott Santo Domingo'
                : 'Corporate events at JW Marriott Santo Domingo'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-3xl mt-8 leading-relaxed">
              {isEs
                ? 'Cobertura fotográfica de presentaciones de producto, eventos de networking, reuniones B2B y galas corporativas en el JW Marriott Piantini, Santo Domingo, República Dominicana. Entrega express para prensa y redes el mismo día.'
                : 'Photographic coverage of product presentations, networking events, B2B meetings, and corporate galas at JW Marriott Piantini, Santo Domingo, Dominican Republic. Same-day express delivery for press and social.'}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/${locale}/get-quote?family=corporate-event-photography&venue=jw-marriott-santo-domingo&cta=jw-marriott-header`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
              >
                {isEs ? 'Solicitar cotización' : 'Request a quote'}
              </Link>
              <Link
                href={`/${locale}/services/corporate-event-photography`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
              >
                {isEs ? 'Ver todos los paquetes' : 'See all packages'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── GALLERY ── full-bleed 2-col grid, same layout as the longFormGallery
             in the parent corporate-event-photography family page. All 12 images
             from the JW Marriott Santo Domingo shoot. */}
        <section className="border-b border-hairline-soft bg-canvas">
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid grid-cols-1 md:grid-cols-2 gap-0">
            {galleryImages.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.src}
                src={img.src}
                alt={isEs ? img.alt.es : img.alt.en}
                title={isEs ? img.title.es : img.title.en}
                width={1600}
                height={1067}
                sizes="(min-width: 768px) 50vw, 100vw"
                loading={i < 2 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
                className="w-full h-auto object-contain block"
              />
            ))}
          </div>
        </section>

        {/* ── VENUE CONTEXT ── editorial copy about JW Marriott + event types */}
        <section className="border-b border-hairline-soft py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
                {isEs ? 'El venue' : 'The venue'}
              </p>
              <p className="text-ink text-lg md:text-xl leading-relaxed">
                {isEs
                  ? 'El JW Marriott Santo Domingo, ubicado en Piantini, es el venue de referencia para eventos corporativos de alto nivel en la capital. Sus salones combinan iluminación controlada, tecnología de proyección y ambientación premium que favorecen tanto la fotografía de escenario como los retratos editoriales durante networking.'
                  : 'JW Marriott Santo Domingo, located in Piantini, is the reference venue for high-level corporate events in the capital. Its ballrooms combine controlled lighting, projection technology, and premium ambiance that favors both stage photography and editorial portraits during networking.'}
              </p>
            </div>

            <div className="max-w-3xl mt-16 md:mt-20 space-y-16 md:space-y-20">
              <div>
                <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">01</span>
                <h2
                  className="font-display uppercase text-ink mt-4 mb-6"
                  style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.05' }}
                >
                  {isEs
                    ? 'Presentaciones de producto y lanzamientos de marca'
                    : 'Product presentations and brand launches'}
                </h2>
                <div className="space-y-5 text-ink leading-relaxed">
                  <p className="text-base md:text-lg">
                    {isEs
                      ? 'Los lanzamientos de producto en el JW Marriott requieren cubrir el escenario principal, los momentos de interacción con el producto, las reacciones de la audiencia y los detalles de marca instalados en el venue. Trabajamos con el run-of-show del evento y priorizamos los momentos no negociables: primer descubrimiento del producto, speaker principal y fotografías con invitados VIP.'
                      : 'Product launches at JW Marriott require covering the main stage, product interaction moments, audience reactions, and brand details installed in the venue. We work with the event run-of-show and prioritize non-negotiable moments: first product reveal, main speaker, and VIP guest photos.'}
                  </p>
                  <p className="text-base md:text-lg">
                    {isEs
                      ? 'Para lanzamientos con cobertura de prensa, configuramos flujo express que entrega imágenes seleccionadas en 2-4 horas para comunicados y redes sociales mientras el evento aún genera conversación.'
                      : 'For launches with press coverage, we set up an express workflow that delivers selected images within 2-4 hours for press releases and social media while the event is still generating conversation.'}
                  </p>
                </div>
                <ul className="mt-7 space-y-3">
                  {(isEs
                    ? [
                        'Cobertura de escenario: speakers, producto y señalética de marca',
                        'Retratos de ejecutivos e invitados VIP durante el evento',
                        'Selección express para prensa y comunicación digital',
                      ]
                    : [
                        'Stage coverage: speakers, product, and brand signage',
                        'Executive and VIP guest portraits during the event',
                        'Express selection for press and digital communication',
                      ]
                  ).map((b, j) => (
                    <li key={j} className="flex items-start gap-3 text-ink/85 text-base">
                      <span className="mt-2.5 inline-block w-2 h-px bg-ink/60 shrink-0" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">02</span>
                <h2
                  className="font-display uppercase text-ink mt-4 mb-6"
                  style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.05' }}
                >
                  {isEs
                    ? 'Networking y eventos B2B'
                    : 'Networking and B2B events'}
                </h2>
                <div className="space-y-5 text-ink leading-relaxed">
                  <p className="text-base md:text-lg">
                    {isEs
                      ? 'Los eventos de networking y B2B en el JW Marriott presentan un reto fotográfico específico: capturar conversaciones auténticas y momentos de conexión en espacios de coctel o recepción sin interrumpir el flujo natural del evento. Nuestra cobertura documental preserva la energía del networking y produce imágenes que comunican presencia, profesionalismo y conexión real entre ejecutivos.'
                      : 'Networking and B2B events at JW Marriott present a specific photographic challenge: capturing authentic conversations and connection moments in cocktail or reception spaces without disrupting the natural event flow. Our documentary coverage preserves networking energy and produces images that communicate presence, professionalism, and real connection between executives.'}
                  </p>
                  <p className="text-base md:text-lg">
                    {isEs
                      ? 'Estas imágenes son valiosas para comunicaciones internas, publicaciones en LinkedIn, memoria institucional del evento y materiales para la siguiente edición.'
                      : 'These images are valuable for internal communications, LinkedIn publications, institutional event records, and materials for the next edition.'}
                  </p>
                </div>
                <ul className="mt-7 space-y-3">
                  {(isEs
                    ? [
                        'Fotografía documental de conversaciones y presentaciones entre asistentes',
                        'Cobertura de área de coctel, lounge y recepción',
                        'Imágenes optimizadas para LinkedIn y comunicación institucional',
                      ]
                    : [
                        'Documentary photography of conversations and introductions between attendees',
                        'Coverage of cocktail area, lounge, and reception',
                        'Images optimized for LinkedIn and institutional communication',
                      ]
                  ).map((b, j) => (
                    <li key={j} className="flex items-start gap-3 text-ink/85 text-base">
                      <span className="mt-2.5 inline-block w-2 h-px bg-ink/60 shrink-0" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">03</span>
                <h2
                  className="font-display uppercase text-ink mt-4 mb-6"
                  style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.05' }}
                >
                  {isEs
                    ? 'Galas, cenas de premiación y convenciones'
                    : 'Galas, awards dinners, and conventions'}
                </h2>
                <div className="space-y-5 text-ink leading-relaxed">
                  <p className="text-base md:text-lg">
                    {isEs
                      ? 'El JW Marriott es uno de los principales venues para galas de premiación, cenas benéficas y convenciones empresariales en Santo Domingo. Su iluminación de escenario y ambientación de salón de banquetes permite fotografía de alta calidad sin flash agresivo, preservando la atmósfera premium del evento y produciendo imágenes que refuerzan el valor de la marca organizadora.'
                      : 'JW Marriott is one of the main venues for awards galas, charity dinners, and business conventions in Santo Domingo. Its stage lighting and banquet hall ambiance allows high-quality photography without aggressive flash, preserving the premium event atmosphere and producing images that reinforce the value of the organizing brand.'}
                  </p>
                </div>
                <ul className="mt-7 space-y-3">
                  {(isEs
                    ? [
                        'Cobertura de ceremonia de premiación: entrega de galardones y discursos',
                        'Fotografía de mesas y momentos de cena en ambiente formal',
                        'Galería estructurada por bloques: llegada, cena, ceremonia y cierre',
                      ]
                    : [
                        'Awards ceremony coverage: prize presentations and speeches',
                        'Table and dinner moment photography in formal atmosphere',
                        'Gallery structured by blocks: arrival, dinner, ceremony, and close',
                      ]
                  ).map((b, j) => (
                    <li key={j} className="flex items-start gap-3 text-ink/85 text-base">
                      <span className="mt-2.5 inline-block w-2 h-px bg-ink/60 shrink-0" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
                {isEs ? 'Reserva' : 'Booking'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '1.0' }}
              >
                {isEs ? '¿Evento en JW Marriott?' : 'Event at JW Marriott?'}
              </h2>
              <p className="text-ink-muted text-base md:text-lg mb-10 leading-relaxed max-w-xl">
                {isEs
                  ? 'Cuéntanos la fecha, tipo de evento y número de horas. Te enviamos propuesta con entregables y precio en menos de 24 horas.'
                  : 'Tell us the date, event type, and number of hours. We send you a proposal with deliverables and price in under 24 hours.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/${locale}/get-quote?family=corporate-event-photography&venue=jw-marriott-santo-domingo&cta=jw-marriott-bottom`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                >
                  {isEs ? 'Solicitar cotización' : 'Request a quote'}
                </Link>
                <Link
                  href={`/${locale}/services/corporate-event-photography`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
                >
                  {isEs ? 'Ver servicio completo' : 'See full service'}
                </Link>
                <Link
                  href={`/${locale}/portfolio?category=event`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline-soft text-ink-muted hover:text-ink hover:border-hairline transition-colors duration-200"
                >
                  {isEs ? 'Portafolio' : 'Portfolio'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
