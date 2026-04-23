/**
 * Hub & Spoke — Spoke Pages Data File
 *
 * STATUS RULES — enforced by the dynamic route:
 *   draft     = 404, not in sitemap, not in HubSpokeCTA
 *   approved  = live (renders), in HubSpokeCTA, NOT in sitemap
 *   published = live, in HubSpokeCTA, in sitemap — submit to GSC one by one
 *
 * CONTENT RULES:
 *   - Do NOT set status to 'approved' or 'published' until copywriter has filled
 *     all [CONTENT] fields and client has explicitly approved.
   *   - 'weddings/punta-cana' is the first published spoke (promoted from 'approved').
 *   - Cloudinary public IDs only — no external image URLs.
 *   - Every gallery array must have 6–8 entries.
 *   - Every faq array must have 4–5 entries.
 *
 * ADDITIONS:
 *   To add a new spoke page, append to SPOKE_PAGES and ensure enSlug + esSlug
 *   are unique. Do not reuse slugs that appear in any 301 redirect.
 */

export type SpokeStatus = 'draft' | 'approved' | 'published'

export type SpokeTier = 1 | 2 | 3

export type SpokeGalleryItem = {
  /** Cloudinary public_id — no full URL, no transformation params */
  publicId: string
  altEn: string
  altEs: string
}

export type SpokeFaqItem = {
  questionEn: string
  questionEs: string
  answerEn: string
  answerEs: string
}

export type SpokeCard = {
  icon: string
  titleEn: string
  titleEs: string
  bodyEn: string
  bodyEs: string
}

export type SpokePage = {
  // ── Identity ────────────────────────────────────────────────────────────────
  /** Unique ID — matches enSlug with / replaced by - */
  id: string
  /**
   * EN path after /[locale]/ — e.g. "weddings/punta-cana"
   * The [hub] segment is the first part, [spoke] the second.
   */
  enSlug: string
  /**
   * ES path after /[locale]/ — e.g. "bodas/punta-cana"
   * May differ from enSlug (hub names are translated).
   */
  esSlug: string
  /** Must match a key in the service catalog, e.g. 'wedding-photography' */
  hubSlug: string
  status: SpokeStatus
  /** Sitemap priority tier; 1=0.8, 2=0.75, 3=0.7 */
  tier: SpokeTier

  // ── Geo — use coordinates for the SPOKE location, not Santo Domingo ─────────
  geo: { latitude: number; longitude: number }
  geoCity: string
  geoRegion: string

  // ── Meta ─────────────────────────────────────────────────────────────────────
  /** Max 60 chars */
  titleEn: string
  titleEs: string
  /** Max 160 chars, include CTA phrase */
  descriptionEn: string
  descriptionEs: string
  /** 4–6 comma-separated long-tail keyword phrases */
  keywordsEn: string
  keywordsEs: string

  // ── Page copy ────────────────────────────────────────────────────────────────
  /** H1 — must contain primary keyword + location */
  h1En: string
  h1Es: string
  /** 2 sentences directly answering search intent */
  hookEn: string
  hookEs: string

  // ── Hero image ───────────────────────────────────────────────────────────────
  heroImagePublicId: string
  heroImageAltEn: string
  heroImageAltEs: string

  // ── What to expect (Section 2) — 3 cards ────────────────────────────────────
  expectCards: [SpokeCard, SpokeCard, SpokeCard]

  // ── Gallery (Section 3) — 6–8 real images ───────────────────────────────────
  gallery: SpokeGalleryItem[]

  // ── Pricing (Section 4) ──────────────────────────────────────────────────────
  priceFromUsd: string
  pricingDescEn: string
  pricingDescEs: string

  // ── Why us (Section 5) — 3–4 reasons ────────────────────────────────────────
  whyUs: SpokeCard[]

  // ── FAQ (Section 6) — 4–5 location-specific questions ───────────────────────
  faq: SpokeFaqItem[]

  // ── Related spoke EN slugs (Section 7) — 2–3 sibling spokes ─────────────────
  relatedSpokeIds: string[]

  // ── Final CTA (Section 8) ────────────────────────────────────────────────────
  ctaHeadlineEn: string
  ctaHeadlineEs: string
  ctaValuePropEn: string
  ctaValuePropEs: string

  // ── WhatsApp pre-fill ────────────────────────────────────────────────────────
  waMessageEn: string
  waMessageEs: string
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const C = '[CONTENT — Sprint 2]' // placeholder for all unfilled content fields

function draftSpoke(
  id: string,
  enSlug: string,
  esSlug: string,
  hubSlug: string,
  tier: SpokeTier,
  geo: SpokePage['geo'],
  geoCity: string,
  geoRegion: string,
): SpokePage {
  const blankCard: SpokeCard = { icon: '📸', titleEn: C, titleEs: C, bodyEn: C, bodyEs: C }
  const blankFaq: SpokeFaqItem = { questionEn: C, questionEs: C, answerEn: C, answerEs: C }
  return {
    id, enSlug, esSlug, hubSlug, status: 'draft', tier,
    geo, geoCity, geoRegion,
    titleEn: C, titleEs: C, descriptionEn: C, descriptionEs: C,
    keywordsEn: C, keywordsEs: C,
    h1En: C, h1Es: C, hookEn: C, hookEs: C,
    heroImagePublicId: C, heroImageAltEn: C, heroImageAltEs: C,
    expectCards: [blankCard, blankCard, blankCard],
    gallery: Array(6).fill({ publicId: C, altEn: C, altEs: C }),
    priceFromUsd: C, pricingDescEn: C, pricingDescEs: C,
    whyUs: [blankCard, blankCard, blankCard],
    faq: Array(4).fill(blankFaq),
    relatedSpokeIds: [],
    ctaHeadlineEn: C, ctaHeadlineEs: C, ctaValuePropEn: C, ctaValuePropEs: C,
    waMessageEn: C, waMessageEs: C,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPOKE PAGES — complete list (all 61 pages)
// ─────────────────────────────────────────────────────────────────────────────

export const SPOKE_PAGES: SpokePage[] = [

  // ── HUB 1: Wedding Photography ─────────────────────────────────────────────
  // ✅  weddings/punta-cana promoted to 'published' — fully indexed and in sitemap.
  //      All other wedding spokes stay 'draft'.
  {
    id: 'weddings-punta-cana',
    enSlug: 'weddings/punta-cana',
    esSlug: 'bodas/punta-cana',
    hubSlug: 'wedding-photography',
    status: 'published',
    tier: 1,
    geo: { latitude: 18.5601, longitude: -68.3725 },
    geoCity: 'Punta Cana',
    geoRegion: 'La Altagracia',

    // Do NOT add '| Babula Shots' here — layout title.template appends it automatically.
    titleEn: 'Wedding Photographer Punta Cana',
    titleEs: 'Fotógrafo de Bodas en Punta Cana',
    descriptionEn: 'Luxury wedding photography in Punta Cana. Hard Rock, Sanctuary, Macao Beach — we know every light angle. Book your Punta Cana wedding photographer today.',
    descriptionEs: 'Fotografía de bodas en Punta Cana con dirección artística en Hard Rock, Sanctuary y Macao Beach. Tu fecha reservada con un depósito. Consulta disponibilidad.',
    keywordsEn: 'wedding photographer punta cana, punta cana wedding photography, destination wedding photographer dominican republic, punta cana wedding photos, hard rock punta cana wedding photographer',
    keywordsEs: 'fotógrafo de bodas punta cana, fotografía de bodas punta cana, fotógrafo boda destino república dominicana, fotos boda hard rock punta cana, bodas en la playa punta cana',

    h1En: 'Wedding Photographer Punta Cana',
    h1Es: 'Fotógrafo de Bodas en Punta Cana',
    hookEn: 'You chose Punta Cana for its turquoise water, endless white sand, and world-class resorts. We deliver wedding photos as epic as your venue — cinematic, editorial, and completely yours.',
    hookEs: 'Elegiste Punta Cana por sus aguas turquesas, playas infinitas y resorts de lujo. Te entregamos fotos de boda tan épicas como tu venue — cinematográficas, editoriales y completamente tuyas.',

    heroImagePublicId: '[CONTENT — add Cloudinary public_id of a Punta Cana wedding hero image]',
    heroImageAltEn: 'Wedding couple on Punta Cana beach at golden hour — Babula Shots wedding photographer',
    heroImageAltEs: 'Pareja en boda en la playa de Punta Cana al atardecer — Babula Shots fotógrafo de bodas',

    expectCards: [
      {
        icon: '🏨',
        titleEn: 'Resort Knowledge',
        titleEs: 'Conocimiento de los Resorts',
        bodyEn: 'We photograph regularly at Hard Rock Punta Cana, Sanctuary Cap Cana, Excellence El Carmen, and Barceló Bávaro. We know exactly where the light falls, which corners to avoid, and which paths lead to the most stunning frames.',
        bodyEs: 'Fotografiamos regularmente en Hard Rock Punta Cana, Sanctuary Cap Cana, Excellence El Carmen y Barceló Bávaro. Sabemos exactamente dónde cae la luz, qué rincones evitar y qué caminos llevan a los mejores encuadres.',
      },
      {
        icon: '🌅',
        titleEn: 'Golden Hour at 5:40 PM',
        titleEs: 'Hora Dorada a las 5:40 PM',
        bodyEn: 'Punta Cana golden hour averages 5:40–6:20 PM year-round. We schedule your ceremony portraits and beach shots around this window so every image has the warm, cinematic light you see in our portfolio.',
        bodyEs: 'La hora dorada en Punta Cana es alrededor de las 5:40–6:20 PM durante todo el año. Coordinamos tus retratos de ceremonia y tus fotos en la playa alrededor de esta ventana para que cada imagen tenga esa luz cálida y cinematográfica.',
      },
      {
        icon: '📸',
        titleEn: 'Cinematic Editorial Style',
        titleEs: 'Estilo Editorial Cinematográfico',
        bodyEn: 'We direct you naturally — not stiff posed shots. Our style is candid-editorial: real moments, real emotion, with intentional composition. The result feels like a magazine spread, not a snapshot.',
        bodyEs: 'Te dirigimos con naturalidad — sin poses rígidas. Nuestro estilo es reportístico-editorial: momentos reales, emoción real, con composición intencionada. El resultado se siente como una editorial de revista, no como una foto de turista.',
      },
    ],

    gallery: [
      { publicId: '[CONTENT — Cloudinary public_id: Punta Cana wedding beach ceremony]', altEn: 'Beach wedding ceremony at Punta Cana resort with ocean backdrop', altEs: 'Ceremonia de boda en la playa del resort de Punta Cana con vista al océano' },
      { publicId: '[CONTENT — Cloudinary public_id: Punta Cana couple portrait sunset]', altEn: 'Wedding couple portrait during Punta Cana golden hour sunset', altEs: 'Retrato de pareja durante la hora dorada en Punta Cana' },
      { publicId: '[CONTENT — Cloudinary public_id: Punta Cana first dance reception]', altEn: 'Bride and groom first dance at luxury Punta Cana resort reception', altEs: 'Primer baile de novios en recepción de resort de lujo en Punta Cana' },
      { publicId: '[CONTENT — Cloudinary public_id: Punta Cana bride getting ready detail]', altEn: 'Bride getting ready detail shot — wedding rings and bouquet, Punta Cana', altEs: 'Detalle de preparativos de la novia — anillos y ramo, Punta Cana' },
      { publicId: '[CONTENT — Cloudinary public_id: Punta Cana ceremony aisle shot]', altEn: 'Wedding aisle procession at beachfront Punta Cana ceremony', altEs: 'Procesión por el pasillo en ceremonia frente al mar en Punta Cana' },
      { publicId: '[CONTENT — Cloudinary public_id: Punta Cana couple in water]', altEn: 'Wedding couple walking in shallow ocean water at Punta Cana beach', altEs: 'Pareja de novios caminando en el agua de la playa de Punta Cana' },
    ],

    priceFromUsd: '$499',
    pricingDescEn: 'Punta Cana wedding photography starts at $499 for ceremony-only coverage and goes up to full day coverage including pre-ceremony, ceremony, cocktail hour, and reception. Every package includes edited high-resolution photos delivered to a private online gallery. Travel within the Punta Cana–Bávaro–Cap Cana corridor is included at no extra charge.',
    pricingDescEs: 'La fotografía de bodas en Punta Cana comienza en $499 para cobertura solo de ceremonia y llega hasta cobertura completa que incluye preparativos, ceremonia, cóctel y recepción. Cada paquete incluye fotos editadas en alta resolución entregadas en una galería privada en línea. El traslado dentro del corredor Punta Cana–Bávaro–Cap Cana está incluido sin costo adicional.',

    whyUs: [
      { icon: '🗺️', titleEn: 'Venue Access', titleEs: 'Acceso a Venues', bodyEn: 'Years of working with Punta Cana resorts means we understand their coordinator requirements, photography permits, and the unwritten rules that let us move freely on your wedding day.', bodyEs: 'Años trabajando con los resorts de Punta Cana significan que entendemos los requisitos de sus coordinadores, los permisos de fotografía y las reglas no escritas que nos permiten movernos libremente el día de tu boda.' },
      { icon: '🌤️', titleEn: 'Weather & Light Expertise', titleEs: 'Expertos en Clima y Luz', bodyEn: 'We know when Punta Cana rainy season is (May–October), which months give the softest light, and exactly how to adapt if clouds appear. Plan B is always ready.', bodyEs: 'Sabemos cuándo es la temporada de lluvias en Punta Cana (mayo–octubre), qué meses ofrecen la luz más suave y exactamente cómo adaptarnos si aparecen nubes. El plan B siempre está listo.' },
      { icon: '✈️', titleEn: 'Destination Specialists', titleEs: 'Especialistas en Destino', bodyEn: 'Over 80% of our couples fly in from the US, Canada, or Europe specifically for a DR destination wedding. We\'ve mastered the logistics: airport transfers, accommodation recommendations, vendor relationships.', bodyEs: 'Más del 80% de nuestros clientes viajan desde EE.UU., Canadá o Europa específicamente para una boda destino en RD. Hemos dominado la logística: traslados, recomendaciones de alojamiento, relaciones con proveedores.' },
      { icon: '⭐', titleEn: '4.9 Stars on Google', titleEs: '4.9 Estrellas en Google', bodyEn: '91+ Google reviews from real couples who celebrated in the Dominican Republic. Read their words — consistent, honest feedback from your exact situation.', bodyEs: '91+ reseñas de Google de parejas reales que celebraron en República Dominicana. Lee sus palabras — comentarios consistentes y honestos de personas en tu misma situación.' },
    ],

    faq: [
      {
        questionEn: 'Can you photograph at Hard Rock Punta Cana?',
        questionEs: '¿Puedes fotografiar en el Hard Rock Punta Cana?',
        answerEn: 'Yes. We work at Hard Rock Punta Cana regularly and are familiar with their photo permits, coordinator requirements, and the best spots on the property — including Starfish Beach, the main pool, and the Fiesta Americana chapel.',
        answerEs: 'Sí. Trabajamos en el Hard Rock Punta Cana con regularidad y conocemos bien sus permisos fotográficos, requisitos de coordinación y los mejores spots del resort, incluyendo Starfish Beach, la piscina principal y la capilla Fiesta Americana.',
      },
      {
        questionEn: 'What is the best time of year for a beach wedding in Punta Cana?',
        questionEs: '¿Cuál es la mejor época del año para una boda en la playa en Punta Cana?',
        answerEn: 'November through April is the dry season and gives consistently soft, golden light. December through March is peak season with minimal rain risk. May to October is rainy season — weddings still happen and can be beautiful, but we always prepare a weather contingency.',
        answerEs: 'Noviembre a abril es la temporada seca y ofrece una luz consistentemente suave y dorada. Diciembre a marzo es temporada alta con mínimo riesgo de lluvia. Mayo a octubre es temporada de lluvias — las bodas siguen celebrándose y pueden ser hermosas, pero siempre preparamos un plan de contingencia climática.',
      },
      {
        questionEn: 'Do you travel to Bávaro or Cap Cana as well?',
        questionEs: '¿También viajan a Bávaro o Cap Cana?',
        answerEn: 'Yes — the Punta Cana, Bávaro, and Cap Cana corridor is our primary Punta Cana zone. Travel within this area is included in your package. We also cover Macao Beach, El Cortecito, and resorts along the Coconut Coast at no extra charge.',
        answerEs: 'Sí — el corredor Punta Cana, Bávaro y Cap Cana es nuestra zona principal en el oriente. El traslado dentro de esta área está incluido en tu paquete. También cubrimos Macao Beach, El Cortecito y resorts a lo largo de la Costa del Coco sin costo adicional.',
      },
      {
        questionEn: 'How long after the wedding do we receive the photos?',
        questionEs: '¿Cuánto tiempo después de la boda recibimos las fotos?',
        answerEn: 'You receive a quick preview gallery (20–30 selects) within 72 hours so you can share right away. The full edited gallery is delivered within the timeframe agreed in your contract, depending on coverage length. Rush delivery is available for an additional fee.',
        answerEs: 'Recibes una mini galería de avance (20–30 selecciones) en 72 horas para que puedas compartir de inmediato. La galería completa y editada se entrega en el plazo acordado en contrato, dependiendo de la duración de la cobertura. La entrega exprés está disponible con costo adicional.',
      },
      {
        questionEn: 'Is a deposit required to hold our wedding date in Punta Cana?',
        questionEs: '¿Se requiere un depósito para reservar nuestra fecha de boda en Punta Cana?',
        answerEn: 'Yes — we require a deposit to formally hold your date. This removes the date from availability and is non-refundable if the booking is cancelled. The remaining balance is due according to the payment schedule in your contract.',
        answerEs: 'Sí — requerimos un depósito para reservar formalmente tu fecha. Esto la retira de disponibilidad y no es reembolsable en caso de cancelación. El saldo restante se paga según el calendario de pagos en tu contrato.',
      },
    ],

    relatedSpokeIds: ['weddings-cap-cana', 'weddings-santo-domingo', 'weddings-destination-dr'],

    ctaHeadlineEn: 'Ready to book your Punta Cana wedding photographer?',
    ctaHeadlineEs: '¿Listo para reservar tu fotógrafo de bodas en Punta Cana?',
    ctaValuePropEn: 'Punta Cana dates fill up 6–12 months in advance. Check availability and hold your date today. · ⭐ 4.9 on Google (91+ reviews)',
    ctaValuePropEs: 'Las fechas en Punta Cana se agotan con 6–12 meses de anticipación. Verifica disponibilidad y reserva tu fecha hoy. · ⭐ 4.9 en Google (+91 reseñas)',

    waMessageEn: 'Hello! I\'m interested in wedding photography in Punta Cana. Can you check availability for my date?',
    waMessageEs: 'Hola! Me interesa fotografía de bodas en Punta Cana. ¿Pueden verificar disponibilidad para mi fecha?',
  },

  // ── Wedding spokes (draft) ──────────────────────────────────────────────────
  draftSpoke('weddings-cap-cana',           'weddings/cap-cana',               'bodas/cap-cana',                     'wedding-photography',              1, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('weddings-santo-domingo',      'weddings/santo-domingo',          'bodas/santo-domingo',                'wedding-photography',              2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('weddings-casa-de-campo',      'weddings/casa-de-campo',          'bodas/casa-de-campo',                'wedding-photography',              2, { latitude: 18.4207, longitude: -68.9706 }, 'La Romana',     'La Romana'),
  draftSpoke('weddings-bavaro',             'weddings/bavaro',                 'bodas/bavaro',                       'wedding-photography',              2, { latitude: 18.6973, longitude: -68.4459 }, 'Bávaro',        'La Altagracia'),
  draftSpoke('weddings-destination-dr',     'weddings/destination-dominican-republic', 'bodas/destino-republica-dominicana', 'wedding-photography',        3, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),

  // ── HUB 2: Portrait Photography ────────────────────────────────────────────
  draftSpoke('portraits-couples-punta-cana',   'portraits/couples-punta-cana',              'retratos/parejas-punta-cana',                          'portrait-photography', 1, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('portraits-couples-cap-cana',     'portraits/couples-cap-cana',                'retratos/parejas-cap-cana',                            'portrait-photography', 2, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('portraits-couples-santo-domingo','portraits/couples-santo-domingo',           'retratos/parejas-santo-domingo',                       'portrait-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('portraits-proposal-dr',          'portraits/proposal-photographer-dominican-republic', 'retratos/fotografo-propuesta-matrimonio-republica-dominicana', 'portrait-photography', 1, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),
  draftSpoke('portraits-honeymoon-punta-cana', 'portraits/honeymoon-photoshoot-punta-cana', 'retratos/sesion-luna-de-miel-punta-cana',               'portrait-photography', 2, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('portraits-honeymoon-cap-cana',   'portraits/honeymoon-photoshoot-cap-cana',   'retratos/sesion-luna-de-miel-cap-cana',                 'portrait-photography', 2, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('portraits-personal-branding',    'portraits/personal-branding-santo-domingo', 'retratos/personal-branding-santo-domingo',              'portrait-photography', 3, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),

  // ── HUB 3: Family Photography ──────────────────────────────────────────────
  draftSpoke('family-punta-cana-beach',        'family/punta-cana-beach',                  'familia/playa-punta-cana',                              'family-photography', 1, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('family-cap-cana',                'family/cap-cana-family-photographer',      'familia/fotografo-familia-cap-cana',                    'family-photography', 3, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('family-santo-domingo',           'family/santo-domingo-family-photographer', 'familia/fotografo-familia-santo-domingo',               'family-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('family-vacation-dr',             'family/vacation-photoshoot-dominican-republic', 'familia/sesion-vacaciones-republica-dominicana',   'family-photography', 2, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),
  draftSpoke('family-maternity-santo-domingo', 'family/maternity-photographer-santo-domingo',   'familia/fotografo-embarazada-santo-domingo',       'family-photography', 1, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('family-maternity-punta-cana',    'family/maternity-photographer-punta-cana',      'familia/fotografo-embarazada-punta-cana',          'family-photography', 2, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('family-newborn-santo-domingo',   'family/newborn-photographer-santo-domingo',     'familia/fotografo-recien-nacido-santo-domingo',    'family-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),

  // ── HUB 4: Drone Services ──────────────────────────────────────────────────
  draftSpoke('drone-punta-cana',               'drone/punta-cana',                         'drone/punta-cana',                                     'drone-services-photography-punta-cana', 1, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('drone-cap-cana',                 'drone/cap-cana',                           'drone/cap-cana',                                       'drone-services-photography-punta-cana', 2, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('drone-santo-domingo',            'drone/santo-domingo',                      'drone/santo-domingo',                                  'drone-services-photography-punta-cana', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('drone-samana',                   'drone/samana',                             'drone/samana',                                         'drone-services-photography-punta-cana', 3, { latitude: 19.2000, longitude: -69.3400 }, 'Samaná',        'María Trinidad Sánchez'),
  draftSpoke('drone-saona-island',             'drone/saona-island',                       'drone/isla-saona',                                     'drone-services-photography-punta-cana', 2, { latitude: 18.1420, longitude: -68.7180 }, 'Isla Saona',    'La Altagracia'),
  draftSpoke('drone-wedding-dr',               'drone/wedding-drone-dominican-republic',   'drone/drone-bodas-republica-dominicana',                'drone-services-photography-punta-cana', 1, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),
  draftSpoke('drone-real-estate',              'drone/real-estate-aerial-photography',     'drone/fotografia-aerea-inmobiliaria',                  'drone-services-photography-punta-cana', 2, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),

  // ── HUB 5: Birthday & Quinceañera ─────────────────────────────────────────
  draftSpoke('birthday-quinceanera-santo-domingo', 'birthday/quinceanera-photographer-santo-domingo', 'cumpleanos/fotografo-quinceanera-santo-domingo', 'birthday-photographer', 1, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('birthday-quinceanera-punta-cana',    'birthday/quinceanera-photographer-punta-cana',    'cumpleanos/fotografo-quinceanera-punta-cana',    'birthday-photographer', 2, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('birthday-sweet-16-dr',               'birthday/sweet-16-photographer-dominican-republic', 'cumpleanos/sweet-16-republica-dominicana',     'birthday-photographer', 2, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),
  draftSpoke('birthday-kids-santo-domingo',         'birthday/kids-birthday-photographer-santo-domingo', 'cumpleanos/fotografo-cumpleanos-ninos-santo-domingo', 'birthday-photographer', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),

  // ── HUB 6: Commercial Photography ─────────────────────────────────────────
  draftSpoke('commercial-restaurant-sd',    'commercial/restaurant-photographer-santo-domingo',  'comercial/fotografo-restaurantes-santo-domingo',      'commercial-photography', 1, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('commercial-hotel-dr',         'commercial/hotel-photography-dominican-republic',    'comercial/fotografia-hoteles-republica-dominicana',   'commercial-photography', 1, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),
  draftSpoke('commercial-product-sd',       'commercial/product-photographer-santo-domingo',       'comercial/fotografia-producto-santo-domingo',         'commercial-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('commercial-headshots-sd',     'commercial/corporate-headshots-santo-domingo',        'comercial/fotos-corporativas-santo-domingo',          'commercial-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('commercial-airbnb-dr',        'commercial/airbnb-photography-dominican-republic',    'comercial/fotografia-airbnb-republica-dominicana',    'commercial-photography', 3, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),
  draftSpoke('commercial-fashion-sd',       'commercial/fashion-photography-santo-domingo',        'comercial/fotografia-moda-santo-domingo',             'commercial-photography', 3, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),

  // ── HUB 7: Event Photography ───────────────────────────────────────────────
  draftSpoke('events-corporate-sd',         'events/corporate-events-santo-domingo',               'eventos/eventos-corporativos-santo-domingo',          'event-photography', 1, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('events-private-party-sd',     'events/private-party-photographer-santo-domingo',     'eventos/fotografo-fiestas-privadas-santo-domingo',    'event-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('events-baptism-sd',           'events/baptism-photographer-santo-domingo',           'eventos/fotografo-bautizo-santo-domingo',             'event-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('events-graduation-sd',        'events/graduation-photographer-santo-domingo',        'eventos/fotografo-graduacion-santo-domingo',          'event-photography', 3, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('events-conference-sd',        'events/conference-photographer-santo-domingo',        'eventos/fotografo-congresos-santo-domingo',           'event-photography', 3, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),

  // ── HUB 8: Studio Photography (new hub) ───────────────────────────────────
  draftSpoke('studio-portrait-sd',          'studio/portrait-session-santo-domingo',               'estudio/sesion-retratos-santo-domingo',               'studio-photography', 1, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('studio-maternity-sd',         'studio/maternity-studio-santo-domingo',               'estudio/maternidad-estudio-santo-domingo',            'studio-photography', 1, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('studio-newborn-sd',           'studio/newborn-studio-santo-domingo',                 'estudio/recien-nacido-estudio-santo-domingo',         'studio-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('studio-fashion-editorial-sd', 'studio/fashion-editorial-santo-domingo',              'estudio/moda-editorial-santo-domingo',                'studio-photography', 3, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('studio-headshots-sd',         'studio/headshots-santo-domingo',                      'estudio/headshots-santo-domingo',                     'studio-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),

  // ── HUB 9: Travel Photography (new hub) ───────────────────────────────────
  draftSpoke('travel-punta-cana',           'travel/punta-cana',                                   'viaje/punta-cana',                                   'travel-photography', 1, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('travel-cap-cana',             'travel/cap-cana',                                     'viaje/cap-cana',                                     'travel-photography', 1, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('travel-saona-island',         'travel/saona-island',                                 'viaje/isla-saona',                                   'travel-photography', 1, { latitude: 18.1420, longitude: -68.7180 }, 'Isla Saona',    'La Altagracia'),
  draftSpoke('travel-samana',               'travel/samana',                                       'viaje/samana',                                       'travel-photography', 2, { latitude: 19.2000, longitude: -69.3400 }, 'Samaná',        'María Trinidad Sánchez'),
  draftSpoke('travel-la-romana',            'travel/la-romana',                                    'viaje/la-romana',                                    'travel-photography', 2, { latitude: 18.4207, longitude: -68.9706 }, 'La Romana',     'La Romana'),
  draftSpoke('travel-jarabacoa',            'travel/jarabacoa',                                    'viaje/jarabacoa',                                    'travel-photography', 3, { latitude: 19.1316, longitude: -70.6400 }, 'Jarabacoa',     'La Vega'),
  draftSpoke('travel-las-terrenas',         'travel/las-terrenas',                                 'viaje/las-terrenas',                                 'travel-photography', 3, { latitude: 19.3101, longitude: -69.5383 }, 'Las Terrenas',  'Samaná'),
  draftSpoke('travel-bavaro',               'travel/bavaro',                                       'viaje/bavaro',                                       'travel-photography', 2, { latitude: 18.6973, longitude: -68.4459 }, 'Bávaro',        'La Altagracia'),

  // ── HUB 10: Additional Services ───────────────────────────────────────────
  draftSpoke('additional-retouching',       'additional/photo-retouching-santo-domingo',            'adicional/retoque-fotografico-santo-domingo',         'additional', 3, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('additional-wedding-album',    'additional/wedding-album-dominican-republic',          'adicional/album-boda-republica-dominicana',           'additional', 2, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),
  draftSpoke('additional-express-delivery', 'additional/express-photo-delivery',                   'adicional/entrega-express-fotos',                    'additional', 3, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
]

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Find a spoke by locale + dynamic route params [hub]/[spoke] */
export function findSpokeByRoute(locale: string, hub: string, spoke: string): SpokePage | undefined {
  const path = `${hub}/${spoke}`
  return SPOKE_PAGES.find((p) =>
    locale === 'es' ? p.esSlug === path : p.enSlug === path
  )
}

/** Get all spokes for a given hub (by hubSlug) that are not draft */
export function getSpokesByHub(hubSlug: string, includeStatuses: SpokeStatus[] = ['approved', 'published']): SpokePage[] {
  return SPOKE_PAGES.filter(
    (p) => p.hubSlug === hubSlug && includeStatuses.includes(p.status)
  )
}

/** Get all published spokes (for sitemap) */
export function getPublishedSpokes(): SpokePage[] {
  return SPOKE_PAGES.filter((p) => p.status === 'published')
}

/** Get all approved + published spokes (for generateStaticParams) */
export function getLiveSpokes(): SpokePage[] {
  return SPOKE_PAGES.filter((p) => p.status === 'approved' || p.status === 'published')
}

/** Map spoke tier to sitemap priority */
export function spokeTierToPriority(tier: SpokeTier): number {
  return tier === 1 ? 0.8 : tier === 2 ? 0.75 : 0.7
}

/** Get a label for the spoke (short display name for hub CTA cards) */
export function getSpokeDisplayLabel(spoke: SpokePage, locale: string): string {
  const path = locale === 'es' ? spoke.esSlug : spoke.enSlug
  const spokePart = path.split('/')[1] || path
  return spokePart
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
