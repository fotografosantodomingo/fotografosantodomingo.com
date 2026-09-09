import type { Metadata } from 'next'
import Link from 'next/link'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'
import { CONTACT_INFO } from '@/lib/utils/constants'

export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const PAGE_SLUG = 'proposal/mirador-de-paraiso-surprise-proposal'

type Props = {
  params: { locale: string }
}

// ─── Real photos from this shoot — Mirador de Paraíso, Barahona–Pedernales coastal route ───
// Do not compress, resize, or add srcset transforms to these — served at native resolution.
const ARRIVAL_IMAGES = [
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788899907/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_2_af74n7.webp',
    w: 3276,
    h: 2185,
    alt: {
      es: 'Pareja tomada de las manos con las frentes juntas, momentos antes de una propuesta sorpresa, con la costa turquesa cerca de Paraíso, Barahona de fondo',
      en: 'Couple holding hands with foreheads touching moments before a surprise proposal, overlooking the turquoise coastline near Paraíso, Barahona',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788899907/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_1_iogtuy.webp',
    w: 3118,
    h: 2080,
    alt: {
      es: 'Vista amplia de una pareja abrazada en un mirador costero sobre el Mar Caribe, ruta Barahona–Pedernales, República Dominicana',
      en: 'Wide view of a couple embracing at a coastal mirador above the Caribbean Sea, Barahona–Pedernales route, Dominican Republic',
    },
  },
]

const QUESTION_IMAGES = [
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788900013/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_1_pcbo5v.webp',
    w: 3276,
    h: 2185,
    alt: {
      es: 'Hombre arrodillado proponiendo matrimonio con la caja del anillo abierta en un mirador junto al Mar Caribe en República Dominicana',
      en: 'Man kneeling to propose with an open ring box at a cliffside viewpoint overlooking the Caribbean Sea in the Dominican Republic',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788900016/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_5_jgj9yg.webp',
    w: 3276,
    h: 2185,
    alt: {
      es: 'Perfil cercano del momento de la propuesta sorpresa, ambos sonriendo mientras él presenta el anillo de compromiso',
      en: 'Close profile of the surprise proposal moment, both smiling as he presents the engagement ring',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788900014/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_4_di6rfy.webp',
    w: 3276,
    h: 2185,
    alt: {
      es: 'Su reacción de sorpresa genuina segundos después de la pregunta, con las manos en el pecho',
      en: 'Her genuine surprised reaction seconds after the proposal question, hands raised to her chest',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788900013/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_3_fd10dv.webp',
    w: 3276,
    h: 2185,
    alt: {
      es: 'Ella se cubre el rostro riendo y llorando de alegría justo después de decir que sí',
      en: 'She covers her face laughing and crying with joy immediately after saying yes',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788900021/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_6_da2caw.webp',
    w: 3276,
    h: 2185,
    alt: {
      es: 'Pareja recién comprometida en un abrazo tierno, con su mano y el nuevo anillo apoyados en el hombro de él',
      en: 'Newly engaged couple in a tender embrace, her hand and new ring resting on his shoulder',
    },
  },
]

const REVEAL_IMAGE = {
  src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788900161/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_1_f0ypls.webp',
  w: 3276,
  h: 2185,
  alt: {
    es: 'Pareja recién comprometida señalando juntos el anillo de compromiso, riendo con la costa de Barahona de fondo',
    en: 'Newly engaged couple both pointing at the engagement ring, laughing with the coastline of Barahona in the background',
  },
}

const ENGAGED_IMAGES = [
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788900161/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_3_kxdlfl.webp',
    w: 3276,
    h: 2185,
    alt: {
      es: 'Retrato íntimo de la pareja recién comprometida, con su barbilla apoyada en el hombro de él y el anillo de compromiso a la vista',
      en: 'Intimate portrait of the newly engaged couple, her chin resting on his shoulder with the engagement ring in view',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788900161/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_4_adux36.webp',
    w: 1596,
    h: 896,
    alt: {
      es: 'Retrato de compromiso con la pareja sonriendo y extendiendo la mano para mostrar el anillo, con el mirador costero de fondo',
      en: 'Engagement portrait with the couple smiling and extending her hand to show the ring, coastal viewpoint in the background',
    },
  },
  {
    src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788900161/Propuesta_de_matrimonio_fotografo_republica_dominicana_babula_2_nhjayh.webp',
    w: 3276,
    h: 2185,
    alt: {
      es: 'Vista trasera de la pareja recién comprometida con la mano de ella en alto mostrando el anillo, frente al mar y las hojas de palma',
      en: 'Back view of the newly engaged couple with her hand raised to show the ring against the ocean and palm leaves',
    },
  },
]

const ALL_GALLERY_IMAGES = [
  ...ARRIVAL_IMAGES,
  ...QUESTION_IMAGES,
  REVEAL_IMAGE,
  ...ENGAGED_IMAGES,
]

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Una Propuesta Secreta en el Mirador de Paraíso, República Dominicana | Babula Shots'
    : 'A Secret Proposal at Mirador de Paraíso, Dominican Republic | Babula Shots'
  const description = isEs
    ? 'Una propuesta de matrimonio sorpresa real, documentada discretamente desde tierra y aire en el Mirador de Paraíso, ruta Barahona–Pedernales, República Dominicana.'
    : 'A real surprise proposal captured discreetly from the ground and air at Mirador de Paraíso, on the Barahona–Pedernales coastal route, Dominican Republic.'

  return {
    title,
    description,
    keywords: isEs
      ? 'propuesta sorpresa republica dominicana, fotografo propuesta barahona, propuesta matrimonio pedernales, fotografia de propuesta republica dominicana, fotografo oculto propuesta, fotografo sorpresa compromiso'
      : 'surprise proposal dominican republic, proposal photographer barahona, marriage proposal pedernales, proposal photography dominican republic, hidden photographer proposal, surprise engagement photographer',
    alternates: {
      canonical: `${BASE_URL}/${locale}/${PAGE_SLUG}`,
      languages: {
        es: `${BASE_URL}/es/${PAGE_SLUG}`,
        en: `${BASE_URL}/en/${PAGE_SLUG}`,
        'x-default': `${BASE_URL}/es/${PAGE_SLUG}`,
      },
    },
    openGraph: {
      type: 'article',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title,
      description,
      url: `${BASE_URL}/${locale}/${PAGE_SLUG}`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: REVEAL_IMAGE.src,
        width: REVEAL_IMAGE.w,
        height: REVEAL_IMAGE.h,
        alt: isEs ? REVEAL_IMAGE.alt.es : REVEAL_IMAGE.alt.en,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title,
      description,
      images: [REVEAL_IMAGE.src],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export default function MiradorDeParaisoProposalPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const pageUrl = `${BASE_URL}/${locale}/${PAGE_SLUG}`
  const proposalHubUrl = `${BASE_URL}/${locale}/proposal`

  const waMessage = isEs
    ? 'Hola! Vi la historia de la propuesta en el Mirador de Paraíso y quiero planear la mía.'
    : 'Hello! I saw the Mirador de Paraíso proposal story and I want to plan my own.'
  const waHref = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(waMessage)}`

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Fotografía de Propuesta' : 'Proposal Photography', url: proposalHubUrl },
    { name: isEs ? 'Mirador de Paraíso' : 'Mirador de Paraíso', url: pageUrl },
  ])

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: isEs ? 'Fotografía de Propuesta Sorpresa — Modo Oculto' : 'Surprise Proposal Photography — Hidden Mode',
    serviceType: isEs ? 'Fotografía de Propuesta de Matrimonio' : 'Proposal Photography',
    description: isEs
      ? 'Fotografía de propuesta de matrimonio sorpresa, discreta y sin interrumpir el momento, documentada desde tierra y aire.'
      : 'Discreet surprise proposal photography designed to capture genuine reactions without interrupting the moment, documented from the ground and air.',
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#business`,
      name: 'Babula Shots',
      url: BASE_URL,
      telephone: CONTACT_INFO.phone,
    },
    areaServed: {
      '@type': 'Place',
      name: isEs
        ? 'Mirador de Paraíso, Barahona, República Dominicana'
        : 'Mirador de Paraíso, Barahona, Dominican Republic',
      geo: { '@type': 'GeoCoordinates', latitude: 17.9958, longitude: -71.3628 },
    },
    url: pageUrl,
  }

  const imageGallerySchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: isEs
      ? 'Galería de la propuesta sorpresa en el Mirador de Paraíso'
      : 'Surprise proposal gallery at Mirador de Paraíso',
    image: ALL_GALLERY_IMAGES.map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.src,
      url: img.src,
      name: isEs ? img.alt.es : img.alt.en,
      creator: { '@type': 'Person', name: 'Michal Babula' },
      author: { '@type': 'Person', name: 'Michal Babula' },
      copyrightNotice: '© Babula Shots',
      license: `${BASE_URL}/${locale}/terms`,
      acquireLicensePage: `${BASE_URL}/${locale}/get-quote`,
    })),
  }

  const storyBeats = [
    {
      num: '01',
      titleEs: 'Llegada Silenciosa',
      titleEn: 'A Quiet Arrival',
      bodyEs: 'Antes de la propuesta, un momento de oración y anticipación — el cliente respira hondo mientras el equipo termina de posicionarse en silencio, a distancia, sin que ella note nada fuera de lo normal.',
      bodyEn: 'Before the proposal, a moment of prayer and quiet anticipation — the client takes a breath while the team finishes getting into position at a distance, with nothing out of the ordinary for her to notice.',
      images: ARRIVAL_IMAGES,
    },
    {
      num: '02',
      titleEs: 'La Pregunta',
      titleEn: 'The Question',
      bodyEs: 'La secuencia completa de la propuesta — la rodilla en el suelo, la caja abriéndose, y la reacción genuina de ella al darse cuenta de lo que está pasando.',
      bodyEn: 'The full proposal sequence — the knee on the ground, the box opening, and her genuine reaction as she realizes what is happening.',
      images: QUESTION_IMAGES,
    },
    {
      num: '03',
      titleEs: 'La Sorpresa Revelada',
      titleEn: 'The Surprise Reveal',
      bodyEs: 'Ella descubre que cada segundo fue documentado en secreto — la sorpresa dentro de la sorpresa: un fotógrafo que estuvo ahí todo el tiempo sin que lo supiera.',
      bodyEn: 'She discovers that every second was secretly documented — the surprise within the surprise: a photographer who was there the entire time without her knowing.',
      images: [REVEAL_IMAGE],
    },
    {
      num: '04',
      titleEs: 'Recién Comprometidos',
      titleEn: 'Just Engaged',
      bodyEs: 'Retratos de la pareja recién comprometida alrededor del mirador, con la costa de Barahona–Pedernales de fondo — el primer respiro después del sí.',
      bodyEn: 'Portraits of the newly engaged couple around the mirador, with the Barahona–Pedernales coastline behind them — the first breath after the yes.',
      images: ENGAGED_IMAGES,
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(imageGallerySchema)} />

      <main className="min-h-screen bg-canvas text-ink">

        {/* ── HEADER ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24 lg:py-28">
          <div className="container mx-auto px-4">
            <nav>
              <Link
                href={`/${locale}/proposal`}
                className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
              >
                ← {isEs ? 'Fotografía de Propuesta' : 'Proposal Photography'}
              </Link>
            </nav>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mt-10 mb-6">
              {isEs ? 'Caso real · Mirador de Paraíso · Barahona–Pedernales' : 'Real case · Mirador de Paraíso · Barahona–Pedernales'}
            </p>
            <h1
              className="font-display uppercase text-ink max-w-5xl"
              style={{ fontSize: 'clamp(32px, 6vw, 88px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}
            >
              {isEs
                ? 'Una Propuesta Secreta en el Mirador de Paraíso'
                : 'A Secret Proposal at Mirador de Paraíso'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-3xl mt-8 leading-relaxed">
              {isEs
                ? 'Una propuesta de matrimonio sorpresa real, documentada discretamente desde tierra y aire.'
                : 'A real surprise proposal captured discreetly from the ground and air.'}
            </p>
            <p className="text-ink-muted text-sm mt-4">
              📍 {isEs
                ? 'Mirador cerca de Paraíso · Ruta Costera Barahona–Pedernales · República Dominicana'
                : 'Mirador near Paraíso · Barahona–Pedernales Coastal Route · Dominican Republic'}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
              >
                {isEs ? 'Planea Tu Propuesta Secreta' : 'Plan Your Secret Proposal'}
              </a>
              <Link
                href={`/${locale}/proposal`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
              >
                {isEs ? 'Ver Todos los Paquetes' : 'See All Packages'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── HERO IMAGE — the reveal ── */}
        <section className="w-full bg-gray-950" aria-label={isEs ? REVEAL_IMAGE.alt.es : REVEAL_IMAGE.alt.en}>
          <figure className="w-full max-h-[70vh] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={REVEAL_IMAGE.src}
              alt={isEs ? REVEAL_IMAGE.alt.es : REVEAL_IMAGE.alt.en}
              className="w-full h-full object-cover object-center"
              loading="eager"
              fetchPriority="high"
              width={REVEAL_IMAGE.w}
              height={REVEAL_IMAGE.h}
            />
          </figure>
        </section>

        {/* ── THE MISSION / BEHIND THE SCENES ── */}
        <section className="border-b border-hairline-soft py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl space-y-16 md:space-y-20">
              <div>
                <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
                  {isEs ? 'La Misión' : 'The Mission'}
                </p>
                <p className="text-ink text-lg md:text-xl leading-relaxed">
                  {isEs
                    ? 'El cliente quería proponerle matrimonio a su pareja en uno de los miradores más espectaculares de la costa suroeste de República Dominicana — sin que ella sospechara nada. El objetivo: documentar cada segundo de la sorpresa, desde la llegada hasta la reacción genuina al ver el anillo, sin interrumpir el momento ni delatar nuestra presencia.'
                    : 'Our client wanted to propose to his partner at one of the most spectacular viewpoints along the southwestern coast of the Dominican Republic — without her suspecting a thing. The goal: document every second of the surprise, from arrival to her genuine reaction to the ring, without interrupting the moment or giving away our presence.'}
                </p>
              </div>

              <div>
                <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
                  {isEs ? 'Detrás de Cámaras' : 'Behind the Scenes'}
                </p>
                <p className="text-ink text-lg md:text-xl leading-relaxed">
                  {isEs
                    ? 'Llegamos 45 minutos antes para reconocer el terreno del mirador, identificar la mejor cobertura natural y decidir el ángulo de la propuesta según la luz de la tarde. Mientras el drone capturaba la escena desde el aire, yo permanecí oculto y enfocado en documentar la propuesta desde el suelo — con un teleobjetivo de largo alcance para no delatar mi posición. Coordinación total por WhatsApp, silencio hasta la señal, y una sola oportunidad para capturar la reacción real.'
                    : 'We arrived 45 minutes early to scout the mirador, find natural cover, and choose the best proposal angle for the afternoon light. While the drone captured the scene from above, I remained hidden and focused on documenting the proposal from the ground — using a long telephoto lens to stay out of sight. Coordination ran entirely through WhatsApp, silence until the signal, and just one chance to capture the real reaction.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE STORY UNFOLDS ── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'La Historia' : 'The Story'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-16 md:mb-20"
              style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'La Historia Se Revela' : 'The Story Unfolds'}
            </h2>

            <div className="space-y-20 md:space-y-28">
              {storyBeats.map((beat) => (
                <div key={beat.num}>
                  <div className="max-w-3xl mb-8">
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">{beat.num}</span>
                    <h3
                      className="font-display uppercase text-ink mt-3 mb-5"
                      style={{ fontSize: 'clamp(22px, 3vw, 34px)', lineHeight: '1.05' }}
                    >
                      {isEs ? beat.titleEs : beat.titleEn}
                    </h3>
                    <p className="text-ink-muted text-base md:text-lg leading-relaxed">
                      {isEs ? beat.bodyEs : beat.bodyEn}
                    </p>
                  </div>
                  <div
                    className={`relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid gap-0 ${
                      beat.images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                    }`}
                  >
                    {beat.images.map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img.src + beat.num + i}
                        src={img.src}
                        alt={isEs ? img.alt.es : img.alt.en}
                        width={img.w}
                        height={img.h}
                        sizes={beat.images.length === 1 ? '100vw' : '(min-width: 768px) 50vw, 100vw'}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover block"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 md:py-24 border-t border-hairline-soft">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Reserva' : 'Booking'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '1.0' }}
              >
                {isEs
                  ? '¿Planeando una Propuesta Sorpresa en República Dominicana?'
                  : 'Planning a Surprise Proposal in the Dominican Republic?'}
              </h2>
              <p className="text-ink-muted text-base md:text-lg mb-10 leading-relaxed max-w-xl">
                {isEs
                  ? 'Te ayudamos a capturar el momento exactamente como sucede — de forma natural, discreta y sin arruinar la sorpresa.'
                  : "Let's help you capture the moment exactly as it happens — naturally, discreetly, and without interrupting the surprise."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                >
                  {isEs ? 'Planea Tu Propuesta Secreta' : 'Plan Your Secret Proposal'}
                </a>
                <Link
                  href={`/${locale}/proposal`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
                >
                  {isEs ? 'Ver Servicio Completo' : 'See Full Service'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
