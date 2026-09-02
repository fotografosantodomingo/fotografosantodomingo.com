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

export type SpokePricingTier = {
  labelEn: string
  labelEs: string
  priceUsd: string
  descriptionEn: string
  descriptionEs: string
  /** "<family_slug>__<package_slug>" — must be a real, active, bookable_direct
   *  row in service_packages so the CTA routes into the real /book flow. */
  bookingServiceSlug: string
}

export type SpokeVideo = {
  youtubeId: string
  titleEn: string
  titleEs: string
  descriptionEn: string
  descriptionEs: string
  /** Real publish date from YouTube's own watch-page metadata — never invented. */
  uploadDate: string
}

export type SpokeTestimonial = {
  /** Full name of the real client — never anonymous */
  clientName: string
  /** Two-word location/event label shown under the name e.g. "Zona Colonial Wedding" */
  eventLabel: string
  /** Quote text in English */
  quoteEn: string
  /** Quote text in Spanish */
  quoteEs: string
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
  /**
   * Optional deep-link into the real /book calendar+Stripe wizard, in
   * "<family_slug>__<package_slug>" form (matches /book's ?service= param).
   * When set, the page's "Book a date" CTA routes here instead of Setmore.
   */
  bookingServiceSlug?: string

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
  /** Optional real YouTube video(s) — used by spokes with a customGallery
   *  override that renders them (e.g. via TwoColumnGallery), and feeds a
   *  VideoObject JSON-LD block per video in buildSpokeSchemas. */
  videos?: SpokeVideo[]

  // ── Pricing (Section 4) ──────────────────────────────────────────────────────
  priceFromUsd: string
  /** Overrides the default "USD" suffix shown after priceFromUsd (e.g. '' when the currency symbol is already embedded, like "RD$16,000") */
  priceSuffix?: string
  pricingDescEn: string
  pricingDescEs: string
  /** Optional additional bookable tiers shown alongside the primary price
   *  card — each with its own real package (bookingServiceSlug) so it's
   *  directly bookable, not just descriptive text. */
  pricingTiers?: SpokePricingTier[]

  // ── Why us (Section 5) — 3–4 reasons ────────────────────────────────────────
  whyUs: SpokeCard[]

  // ── Client testimonial (Section 5b — after Why Us) ─────────────────────────
  /** One real named testimonial relevant to this service type / location */
  testimonial?: SpokeTestimonial

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
    // testimonial is optional — omit from draft so it doesn't force every spoke to fill it immediately
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPOKE PAGES — complete list (all 61 pages)
// ─────────────────────────────────────────────────────────────────────────────

export const SPOKE_PAGES: SpokePage[] = [

  // ── HUB 1: Wedding Photography ─────────────────────────────────────────────
  // ⚠️  weddings/punta-cana stays 'approved' (noindex) — placeholder images in gallery.
  //      Promote to 'published' only after real images are swapped in.
  {
    id: 'weddings-punta-cana',
    enSlug: 'weddings/punta-cana',
    esSlug: 'bodas/punta-cana',
    hubSlug: 'wedding-photography',
    status: 'approved',
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

    priceFromUsd: '$519',
    pricingDescEn: 'Punta Cana wedding photography starts at $519 for ceremony-only coverage and goes up to full day coverage including pre-ceremony, ceremony, cocktail hour, and reception. Every package includes edited high-resolution photos delivered to a private online gallery. Travel within the Punta Cana–Bávaro–Cap Cana corridor is included at no extra charge.',
    pricingDescEs: 'La fotografía de bodas en Punta Cana comienza en $519 para cobertura solo de ceremonia y llega hasta cobertura completa que incluye preparativos, ceremonia, cóctel y recepción. Cada paquete incluye fotos editadas en alta resolución entregadas en una galería privada en línea. El traslado dentro del corredor Punta Cana–Bávaro–Cap Cana está incluido sin costo adicional.',

    whyUs: [
      { icon: '🗺️', titleEn: 'Venue Access', titleEs: 'Acceso a Venues', bodyEn: 'Years of working with Punta Cana resorts means we understand their coordinator requirements, photography permits, and the unwritten rules that let us move freely on your wedding day.', bodyEs: 'Años trabajando con los resorts de Punta Cana significan que entendemos los requisitos de sus coordinadores, los permisos de fotografía y las reglas no escritas que nos permiten movernos libremente el día de tu boda.' },
      { icon: '🌤️', titleEn: 'Weather & Light Expertise', titleEs: 'Expertos en Clima y Luz', bodyEn: 'We know when Punta Cana rainy season is (May–October), which months give the softest light, and exactly how to adapt if clouds appear. Plan B is always ready.', bodyEs: 'Sabemos cuándo es la temporada de lluvias en Punta Cana (mayo–octubre), qué meses ofrecen la luz más suave y exactamente cómo adaptarnos si aparecen nubes. El plan B siempre está listo.' },
      { icon: '✈️', titleEn: 'Destination Specialists', titleEs: 'Especialistas en Destino', bodyEn: 'Over 80% of our couples fly in from the US, Canada, or Europe specifically for a DR destination wedding. We\'ve mastered the logistics: airport transfers, accommodation recommendations, vendor relationships.', bodyEs: 'Más del 80% de nuestros clientes viajan desde EE.UU., Canadá o Europa específicamente para una boda destino en RD. Hemos dominado la logística: traslados, recomendaciones de alojamiento, relaciones con proveedores.' },
      { icon: '⭐', titleEn: '4.9 Stars on Google', titleEs: '4.9 Estrellas en Google', bodyEn: '98+ Google reviews from real couples who celebrated in the Dominican Republic. Read their words — consistent, honest feedback from your exact situation.', bodyEs: '98+ reseñas de Google de parejas reales que celebraron en República Dominicana. Lee sus palabras — comentarios consistentes y honestos de personas en tu misma situación.' },
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
    ctaValuePropEn: 'Punta Cana dates fill up 6–12 months in advance. Check availability and hold your date today. · ⭐ 4.9 on Google (98+ reviews)',
    ctaValuePropEs: 'Las fechas en Punta Cana se agotan con 6–12 meses de anticipación. Verifica disponibilidad y reserva tu fecha hoy. · ⭐ 4.9 en Google (+98 reseñas)',

    waMessageEn: 'Hello! I\'m interested in wedding photography in Punta Cana. Can you check availability for my date?',
    waMessageEs: 'Hola! Me interesa fotografía de bodas en Punta Cana. ¿Pueden verificar disponibilidad para mi fecha?',
  },

  // ── Wedding spokes (draft) ──────────────────────────────────────────────────
  // ✅  weddings/zona-colonial-santo-domingo — status: 'published' — live + indexed
  {
    id: 'weddings-zona-colonial-santo-domingo',
    enSlug: 'weddings/zona-colonial-santo-domingo',
    esSlug: 'bodas/zona-colonial-santo-domingo',
    hubSlug: 'wedding-photography',
    status: 'published',
    tier: 1,
    geo: { latitude: 18.4731, longitude: -69.8837 },
    geoCity: 'Zona Colonial',
    geoRegion: 'Santo Domingo',

    titleEn: 'Wedding Photographer Zona Colonial Santo Domingo',
    titleEs: 'Fotógrafo de Bodas Zona Colonial Santo Domingo',
    descriptionEn: 'Intimate wedding photography in the UNESCO-listed Zona Colonial of Santo Domingo. Cobblestone streets, colonial courtyards, and golden afternoon light. Book your Zona Colonial wedding photographer today.',
    descriptionEs: 'Fotografía de bodas íntima en la Zona Colonial de Santo Domingo, Patrimonio de la Humanidad. Adoquines, patios coloniales y luz dorada de tarde. Reserva tu fotógrafo de bodas en la Zona Colonial hoy.',
    keywordsEn: 'wedding photographer zona colonial santo domingo, zona colonial wedding photography, historic district wedding photographer dominican republic, santo domingo colonial zone wedding, wedding photos ciudad colonial',
    keywordsEs: 'fotógrafo de bodas zona colonial santo domingo, fotografía de bodas zona colonial, fotógrafo boda ciudad colonial república dominicana, bodas zona colonial santo domingo, fotos boda patrimonio humanidad santo domingo',

    h1En: 'Wedding Photographer Zona Colonial Santo Domingo',
    h1Es: 'Fotógrafo de Bodas en la Zona Colonial de Santo Domingo',
    hookEn: 'The oldest European city in the Americas is your backdrop. Cobblestone streets, centuries-old courtyards, and the warm glow of Dominican golden hour — we know every corner of the Zona Colonial and how to make your wedding photos unforgettable.',
    hookEs: 'La ciudad europea más antigua de América es tu escenario. Adoquines, patios centenarios y la cálida luz del atardecer dominicano — conocemos cada rincón de la Zona Colonial y cómo hacer que tus fotos de boda sean inolvidables.',

    heroImagePublicId: 'v1776954735/wedding-photographer-zona-colonial-sunset_svubtx',
    heroImageAltEn: 'Wedding photographer Zona Colonial sunset Santo Domingo — Babula Shots',
    heroImageAltEs: 'Fotógrafo de bodas Zona Colonial atardecer Santo Domingo — Babula Shots',

    expectCards: [
      {
        icon: '🏛️',
        titleEn: 'UNESCO World Heritage Backdrop',
        titleEs: 'Escenario Patrimonio de la Humanidad',
        bodyEn: 'The Zona Colonial is the oldest continuously inhabited European settlement in the Americas. Every alley, fortified wall, and colonial mansion is a natural photo set. We know the best angles, the hidden courtyards, and the golden-hour spots that make every image feel cinematic.',
        bodyEs: 'La Zona Colonial es el asentamiento europeo habitado más antiguo de América. Cada callejón, muralla y mansión colonial es un escenario natural para fotografías. Conocemos los mejores ángulos, los patios escondidos y los puntos de hora dorada que hacen que cada imagen se sienta cinematográfica.',
      },
      {
        icon: '🌅',
        titleEn: 'Perfect Golden Hour Light',
        titleEs: 'Luz de Hora Dorada Perfecta',
        bodyEn: 'The Zona Colonial faces west over the Ozama River, giving you some of the most dramatic sunset light in Santo Domingo. We plan your portrait session around the 5:30–6:10 PM golden hour window so the warm light falls directly on the historic facades behind you.',
        bodyEs: 'La Zona Colonial mira al oeste sobre el río Ozama, ofreciéndote una de las luces de atardecer más dramáticas de Santo Domingo. Planificamos tu sesión de retratos alrededor de la ventana de hora dorada de 5:30–6:10 PM para que la cálida luz caiga directamente sobre las fachadas históricas detrás de ti.',
      },
      {
        icon: '📍',
        titleEn: 'Local Permit Knowledge',
        titleEs: 'Conocimiento de Permisos Locales',
        bodyEn: 'Some of the most photogenic locations in the Zona Colonial — the Alcázar de Colón, the Fortaleza Ozama, the Catedral Primada — require advance coordination. We handle all of that so you can focus on your wedding day.',
        bodyEs: 'Algunos de los lugares más fotogénicos de la Zona Colonial — el Alcázar de Colón, la Fortaleza Ozama, la Catedral Primada — requieren coordinación previa. Nos encargamos de todo eso para que puedas concentrarte en tu día de boda.',
      },
    ],

    gallery: [
      { publicId: 'v1776954732/cobertura-eventos-sociales-santo-domingo_a69wba', altEn: 'Wedding reception coverage Zona Colonial Santo Domingo — Babula Shots', altEs: 'Cobertura de recepción de boda Zona Colonial Santo Domingo — Babula Shots' },
      { publicId: 'v1776954733/fotografo-bodas-destino-dominican-republic_h6syhy', altEn: 'Destination wedding photographer Dominican Republic — Babula Shots', altEs: 'Fotógrafo de bodas destino República Dominicana — Babula Shots' },
      { publicId: 'v1776954733/fotografo_de_bodas_en_Republica_Dominicana_etbazw', altEn: 'Wedding photographer in Dominican Republic — Babula Shots', altEs: 'Fotógrafo de bodas en República Dominicana — Babula Shots' },
      { publicId: 'v1776954733/pre-wedding-session-zona-colonial-santo-domingo_ojo8j2', altEn: 'Pre-wedding session Zona Colonial Santo Domingo — Babula Shots', altEs: 'Sesión pre-boda Zona Colonial Santo Domingo — Babula Shots' },
      { publicId: 'v1776954735/wedding-photographer-zona-colonial-sunset_svubtx', altEn: 'Wedding photographer Zona Colonial sunset Santo Domingo — Babula Shots', altEs: 'Fotógrafo de bodas Zona Colonial atardecer Santo Domingo — Babula Shots' },
      { publicId: 'v1776954733/sesion-de-fotos-post-boda-punta-cana_zgplqf', altEn: 'Post-wedding photo session after ceremony — Babula Shots', altEs: 'Sesión de fotos post-boda — Babula Shots' },
    ],

    priceFromUsd: '$419',
    pricingDescEn: 'Zona Colonial wedding photography starts at $419 for ceremony-only coverage. Full-day packages include getting ready, ceremony, cocktail hour, and reception. Every package includes edited high-resolution photos delivered via a private online gallery. Travel within Santo Domingo is included at no extra charge.',
    pricingDescEs: 'La fotografía de bodas en la Zona Colonial comienza en $419 para cobertura solo de ceremonia. Los paquetes de día completo incluyen preparativos, ceremonia, cóctel y recepción. Cada paquete incluye fotos editadas en alta resolución entregadas en una galería privada en línea. El traslado dentro de Santo Domingo está incluido sin costo adicional.',

    whyUs: [
      { icon: '🗺️', titleEn: 'Deep Local Knowledge', titleEs: 'Conocimiento Local Profundo', bodyEn: 'We have been photographing in the Zona Colonial since 2015. We know every courtyard, every light angle, and every hidden passage that turns into the perfect backdrop.', bodyEs: 'Llevamos fotografiando en la Zona Colonial desde 2015. Conocemos cada patio, cada ángulo de luz y cada pasaje escondido que se convierte en el fondo perfecto.' },
      { icon: '🏛️', titleEn: 'UNESCO Venue Experience', titleEs: 'Experiencia en Venues UNESCO', bodyEn: 'From the Ozama Fortress to the Cathedral of Santa María la Menor, we have photographed in all the major landmarks and know how to work within each venue\'s rules and restrictions.', bodyEs: 'Desde la Fortaleza Ozama hasta la Catedral de Santa María la Menor, hemos fotografiado en todos los monumentos principales y sabemos cómo trabajar dentro de las reglas y restricciones de cada venue.' },
      { icon: '🌤️', titleEn: 'City Weather Strategy', titleEs: 'Estrategia Climática Urbana', bodyEn: 'Santo Domingo weather is predictable once you know the patterns. We plan your timeline with the dry season (November–April) in mind and always have an indoor backup plan for Caribbean showers.', bodyEs: 'El clima de Santo Domingo es predecible una vez que conoces los patrones. Planificamos tu cronograma con la temporada seca (noviembre–abril) en mente y siempre tenemos un plan de respaldo interior para los aguaceros caribeños.' },
      { icon: '⭐', titleEn: '4.9 Stars on Google', titleEs: '4.9 Estrellas en Google', bodyEn: '98+ Google reviews from real couples who celebrated in the Dominican Republic. Consistent, honest feedback from clients in your exact situation.', bodyEs: '+98 reseñas de Google de parejas reales que celebraron en República Dominicana. Comentarios consistentes y honestos de clientes en tu misma situación.' },
    ],

    faq: [
      {
        questionEn: 'What are the best locations in the Zona Colonial for wedding photos?',
        questionEs: '¿Cuáles son los mejores lugares de la Zona Colonial para fotos de boda?',
        answerEn: 'Our top spots are the Alcázar de Colón courtyard, the Fortaleza Ozama ramparts, Calle Las Damas at golden hour, the interior of Casa de Bastidas, and the seafront Paseo Presidente Billini along the Ozama River. We scout each location in advance and plan the route based on your ceremony time and sunset window.',
        answerEs: 'Nuestros mejores spots son el patio del Alcázar de Colón, las murallas de la Fortaleza Ozama, la Calle Las Damas en hora dorada, el interior de la Casa de Bastidas y el Paseo Presidente Billini frente al río Ozama. Hacemos un reconocimiento previo de cada lugar y planificamos la ruta según la hora de tu ceremonia y la ventana de atardecer.',
      },
      {
        questionEn: 'Do you need permits to photograph at the Alcázar de Colón or the Fortaleza?',
        questionEs: '¿Se necesitan permisos para fotografiar en el Alcázar de Colón o la Fortaleza?',
        answerEn: 'Yes — the Alcázar de Colón and Fortaleza Ozama are managed by the Ministry of Culture and require a photography permit for commercial or wedding sessions. We handle the permit coordination as part of your booking so you do not have to deal with the paperwork.',
        answerEs: 'Sí — el Alcázar de Colón y la Fortaleza Ozama son administrados por el Ministerio de Cultura y requieren un permiso fotográfico para sesiones comerciales o de boda. Nos encargamos de la coordinación del permiso como parte de tu reserva para que no tengas que lidiar con el papeleo.',
      },
      {
        questionEn: 'Is parking or logistics difficult for a wedding in the Zona Colonial?',
        questionEs: '¿Es difícil el estacionamiento o la logística para una boda en la Zona Colonial?',
        answerEn: 'Traffic and parking in the Zona Colonial can be challenging, especially on weekends. We handle our own logistics and always arrive early to secure the best angles before crowds build. We also coordinate with your venue and planner to synchronize arrival times.',
        answerEs: 'El tráfico y el estacionamiento en la Zona Colonial pueden ser complicados, especialmente los fines de semana. Nos encargamos de nuestra propia logística y siempre llegamos temprano para asegurar los mejores ángulos antes de que se aglomere el público. También coordinamos con tu venue y planificador para sincronizar los tiempos de llegada.',
      },
      {
        questionEn: 'Can you cover both a church ceremony and reception in the Zona Colonial in one package?',
        questionEs: '¿Pueden cubrir una ceremonia en iglesia y recepción en la Zona Colonial en un solo paquete?',
        answerEn: 'Yes — our full-day packages are designed for exactly this. The Zona Colonial has the Cathedral of Santa María la Menor (the first cathedral in the Americas), several historic churches, and numerous colonial mansion venues that host both ceremonies and receptions. We stay with you from getting-ready through the last dance.',
        answerEs: 'Sí — nuestros paquetes de día completo están diseñados exactamente para esto. La Zona Colonial cuenta con la Catedral de Santa María la Menor (la primera catedral de las Américas), varias iglesias históricas y numerosas mansiones coloniales que albergan tanto ceremonias como recepciones. Nos quedamos contigo desde los preparativos hasta el último baile.',
      },
      {
        questionEn: 'How far in advance should we book a Zona Colonial wedding photographer?',
        questionEs: '¿Con cuánta anticipación debemos reservar un fotógrafo de bodas para la Zona Colonial?',
        answerEn: 'We recommend booking 3–6 months in advance for Santo Domingo weddings. December through March is peak season and our most popular dates fill quickly. Securing your date with a deposit locks it in completely — we do not double-book.',
        answerEs: 'Recomendamos reservar con 3–6 meses de anticipación para bodas en Santo Domingo. Diciembre a marzo es temporada alta y nuestras fechas más populares se llenan rápidamente. Asegurar tu fecha con un depósito la bloquea completamente — no hacemos doble reservación.',
      },
    ],

    relatedSpokeIds: ['weddings-punta-cana', 'weddings-santo-domingo', 'weddings-cap-cana'],

    ctaHeadlineEn: 'Ready to book your Zona Colonial wedding photographer?',
    ctaHeadlineEs: '¿Listo para reservar tu fotógrafo de bodas en la Zona Colonial?',
    ctaValuePropEn: 'Santo Domingo dates fill up fast — especially for December–March peak season. Check availability and hold your date today. · ⭐ 4.9 on Google (98+ reviews)',
    ctaValuePropEs: 'Las fechas en Santo Domingo se agotan rápido — especialmente en la temporada alta de diciembre a marzo. Verifica disponibilidad y reserva tu fecha hoy. · ⭐ 4.9 en Google (+98 reseñas)',

    waMessageEn: 'Hello! I\'m interested in wedding photography in the Zona Colonial, Santo Domingo. Can you check availability for my date?',
    waMessageEs: 'Hola! Me interesa fotografía de bodas en la Zona Colonial, Santo Domingo. ¿Pueden verificar disponibilidad para mi fecha?',

    testimonial: {
      clientName: 'Ashley & Carlos Méndez',
      eventLabel: 'Zona Colonial Wedding, December 2025',
      quoteEn: 'Michal knew every corner of the Zona Colonial — he took us through an alley behind the Alcázar just before sunset and captured a shot that stopped every guest at our reception. The whole team was calm, organized, and never in the way. Best investment we made for our wedding day.',
      quoteEs: 'Michal conocía cada rincón de la Zona Colonial — nos llevó por un callejón detrás del Alcázar justo antes del atardecer y capturó una foto que dejó sin palabras a todos los invitados en nuestra recepción. Todo el equipo fue tranquilo, organizado y nunca estuvo en el camino. La mejor inversión que hicimos para nuestro día de boda.',
    },
  },

  draftSpoke('weddings-cap-cana',           'weddings/cap-cana',               'bodas/cap-cana',                     'wedding-photography',              1, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('weddings-santo-domingo',      'weddings/santo-domingo',          'bodas/santo-domingo',                'wedding-photography',              2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('weddings-casa-de-campo',      'weddings/casa-de-campo',          'bodas/casa-de-campo',                'wedding-photography',              2, { latitude: 18.4207, longitude: -68.9706 }, 'La Romana',     'La Romana'),
  draftSpoke('weddings-bavaro',             'weddings/bavaro',                 'bodas/bavaro',                       'wedding-photography',              2, { latitude: 18.6973, longitude: -68.4459 }, 'Bávaro',        'La Altagracia'),
  draftSpoke('weddings-destination-dr',     'weddings/destination-dominican-republic', 'bodas/destino-republica-dominicana', 'wedding-photography',        3, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),

  // ── Proposal spokes (moved/added to weddings hub — draft, images provided) ──
  {
    id: 'weddings-proposal-photographer-dominican-republic',
    enSlug: 'weddings/proposal-photographer-dominican-republic',
    esSlug: 'bodas/fotografo-propuesta-matrimonio-republica-dominicana',
    hubSlug: 'wedding-photography',
    status: 'published', // 2026-05-05: promoted from 'approved' to fix Search Console noindex flag
    tier: 1,
    geo: { latitude: 18.7357, longitude: -70.1627 },
    geoCity: 'Dominican Republic',
    geoRegion: 'Various',
    titleEn: 'Beach Proposal Photographer Dominican Republic | Babula Shots',
    titleEs: 'Fotógrafo de Propuesta en Playa República Dominicana | Babula Shots',
    descriptionEn: 'Beach proposal photography across Dominican Republic — hidden coverage from 50–80 m with telephoto lens. Punta Cana, Cap Cana, Playa Nueva Romana, Samaná, Bayahíbe, and all coastal regions.',
    descriptionEs: 'Fotografía de propuesta en playa en toda República Dominicana — cobertura oculta desde 50–80 m con teleobjetivo. Punta Cana, Cap Cana, Playa Nueva Romana, Samaná, Bayahíbe y toda la costa.',
    keywordsEn: 'beach proposal photographer dominican republic, surprise proposal photography dr beach, hidden photographer beach proposal dominican republic, proposal photographer samana playa nueva romana, secret proposal photography all dr beaches',
    keywordsEs: 'fotografo propuesta matrimonio playa republica dominicana, fotografo propuesta sorpresa playa rd, fotografo oculto propuesta playa dr, fotografo propuesta samana playa nueva romana, fotografia propuesta secreta playas republica dominicana',
    h1En: 'Beach Proposal Photography — All Dominican Republic',
    h1Es: 'Fotografía de Propuesta en Playa — Toda República Dominicana',
    hookEn: 'The best beach proposals happen from 50 to 80 meters away — and she never knows. We position ourselves hidden on the sand before you arrive, telephoto lens ready. Every beach across Dominican Republic covered: Punta Cana, Cap Cana, Playa Nueva Romana, Samaná, Bayahíbe, and beyond.',
    hookEs: 'Las mejores propuestas en playa ocurren desde 50 a 80 metros de distancia — y ella nunca lo sabe. Nos posicionamos ocultos en la arena antes de que llegues, teleobjetivo listo. Cubrimos todas las playas de República Dominicana: Punta Cana, Cap Cana, Playa Nueva Romana, Samaná, Bayahíbe y más allá.',
    heroImagePublicId: 'fotografo_para_propuesta_de_matrimonio_santo_domingo_punta_cana_playa_fh3htf',
    heroImageAltEn: 'Beach proposal photographer Dominican Republic — hidden coverage all coasts — Babula Shots',
    heroImageAltEs: 'Fotógrafo de propuesta en playa República Dominicana — cobertura oculta toda la costa — Babula Shots',
    expectCards: [
      {
        icon: '🏖️',
        titleEn: 'Every DR Beach Covered',
        titleEs: 'Todas las Playas de RD Cubiertas',
        bodyEn: 'We travel to any coastal region: Punta Cana, Cap Cana, Playa Nueva Romana, Samaná, Bayahíbe, Puerto Plata. Every beach on the island is within our coverage zone.',
        bodyEs: 'Viajamos a cualquier zona costera: Punta Cana, Cap Cana, Playa Nueva Romana, Samaná, Bayahíbe, Puerto Plata. Toda playa de la isla está dentro de nuestra zona de cobertura.',
      },
      {
        icon: '🥷',
        titleEn: 'Hidden from 50–80 Meters',
        titleEs: 'Ocultos desde 50–80 Metros',
        bodyEn: 'A 400–600 mm telephoto lens lets us capture from far enough away that she will never notice us — even on a public beach with other people around.',
        bodyEs: 'Un teleobjetivo de 400–600 mm nos permite capturar desde lejos suficiente como para que ella nunca nos note — incluso en una playa pública con otras personas alrededor.',
      },
      {
        icon: '🎁',
        titleEn: 'The Double Surprise',
        titleEs: 'La Doble Sorpresa',
        bodyEn: 'The next morning she wakes up to a full photo album of the moment she never knew was captured. Digital gallery overnight. Optional printed album delivered to your hotel or home.',
        bodyEs: 'A la mañana siguiente despierta con un álbum completo del momento que nunca supo que fue capturado. Galería digital overnight. Álbum impreso opcional entregado en tu hotel o residencia.',
      },
    ],
    gallery: [
      { publicId: 'fotografo_para_propuesta_de_matrimonio_santo_domingo_punta_cana_playa_fh3htf', altEn: 'Hidden proposal photographer Dominican Republic — any location, beach or city — Babula Shots', altEs: 'Fotógrafo de propuesta oculto República Dominicana — cualquier locación, playa o ciudad — Babula Shots' },
      { publicId: 'Session_de_fotos_fotografo_punta_cana_propuesta_de_matrimonio_sjrds4', altEn: 'On one knee during surprise proposal Dominican Republic — Babula Shots', altEs: 'De rodillas durante propuesta sorpresa República Dominicana — Babula Shots' },
      { publicId: 'fotografo_punta_cana_para_propuesta_de_matrimonio_r9wkan', altEn: 'Ring on finger — surprise proposal Dominican Republic — Babula Shots', altEs: 'Anillo en el dedo — propuesta sorpresa República Dominicana — Babula Shots' },
      { publicId: 'Propuesta_de_matrimonio_playa_privada_Punta_Cana_dz3wp2', altEn: 'Couple celebrating after surprise proposal Dominican Republic — Babula Shots', altEs: 'Pareja celebrando después de propuesta sorpresa República Dominicana — Babula Shots' },
    ],
    priceFromUsd: '250',
    pricingDescEn: 'Standard package starts at $270 USD + 18% ITBIS — full hidden coverage, preview gallery overnight. Custom packages available for distant beach locations requiring travel, multi-beach setups, second photographer, or printed album delivery to hotel. Contact us to quote your exact plan.',
    pricingDescEs: 'El paquete estándar comienza desde $270 USD + 18% ITBIS — cobertura oculta completa, galería de vista previa overnight. Paquetes personalizados disponibles para playas lejanas que requieren traslado, configuraciones en múltiples playas, segundo fotógrafo o entrega de álbum impreso en hotel. Contáctanos para cotizar tu plan.',
    whyUs: [
      { icon: '🌊', titleEn: 'Every DR Coastline — We Have Been There', titleEs: 'Toda la Costa de la RD — Ya Hemos Estado Ahí', bodyEn: 'We have covered beach proposals at Playa Juanillo (Cap Cana), Playa Nueva Romana, Playa Bonita (Samaná), Playa Rincón, Bayahíbe, and the entire Punta Cana corridor. If you are proposing at a beach in Dominican Republic, we have likely already scouted it.', bodyEs: 'Hemos cubierto propuestas en playa en Playa Juanillo (Cap Cana), Playa Nueva Romana, Playa Bonita (Samaná), Playa Rincón, Bayahíbe y todo el corredor de Punta Cana. Si vas a proponer en una playa de República Dominicana, probablemente ya la hemos reconocido.' },
      { icon: '📡', titleEn: '400–600 mm Telephoto — She Never Sees Us', titleEs: '400–600 mm Teleobjetivo — Ella Nunca Nos Ve', bodyEn: 'On open beaches we position at 50–80 meters and shoot with telephoto. Even on a crowded public beach we look like just another sunbather in the distance — until the ring comes out.', bodyEs: 'En playas abiertas nos posicionamos a 50–80 metros y disparamos con teleobjetivo. Incluso en una playa pública concurrida parecemos otro turista tomando el sol — hasta que aparece el anillo.' },
      { icon: '📞', titleEn: 'WhatsApp-Only Secret Coordination', titleEs: 'Coordinación Secreta Solo por WhatsApp', bodyEn: 'Everything is handled privately between you and us via WhatsApp. No shared email, no social media. Your partner never discovers the plan.', bodyEs: 'Todo se maneja privadamente entre tú y nosotros vía WhatsApp. Sin correo compartido, sin redes sociales. Tu pareja nunca descubre el plan.' },
      { icon: '🎁', titleEn: 'The Double Surprise', titleEs: 'La Doble Sorpresa', bodyEn: 'First she says yes. Then the next morning she wakes up to a full album of the moment. Most clients tell us the second surprise hits harder than the proposal itself.', bodyEs: 'Primero dice que sí. Luego a la mañana siguiente despierta con un álbum completo del momento. La mayoría de nuestros clientes nos dice que la segunda sorpresa impacta más que la propuesta misma.' },
    ],
    faq: [
      {
        questionEn: 'How do you stay hidden on a beach during a proposal?',
        questionEs: '¿Cómo se mantienen ocultos en una playa durante una propuesta?',
        answerEn: 'We arrive 45 minutes before you. We scout natural cover points — beach umbrellas, palm clusters, beach bars, lounge chairs — and set up with a 400–600 mm telephoto lens from 50 to 80 meters away. From that distance we look like any other beach guest. She never sees us arrive and never knows we are there until you choose to tell her.',
        answerEs: 'Llegamos 45 minutos antes que tú. Reconocemos puntos de cobertura naturales — sombrillas, grupos de palmas, bares de playa, tumbonas — y nos configuramos con un teleobjetivo de 400 a 600 mm desde 50 a 80 metros de distancia. A esa distancia parecemos cualquier otro turista en la playa. Ella nunca nos ve llegar y nunca sabe que estamos ahí hasta que tú eliges contárselo.',
      },
      {
        questionEn: 'Which beaches in Dominican Republic do you cover for proposals?',
        questionEs: '¿Qué playas de República Dominicana cubren para propuestas?',
        answerEn: 'We cover all major beaches across DR. Most popular for proposals: Playa Juanillo and Juanillo Beach at Cap Cana (pristine and photogenic), Playa Bávaro and Macao in Punta Cana, Playa Nueva Romana and beachfront villas in La Romana (most private and cinematic — no crowds), Playa Bonita and Playa Rincón in Samaná (dramatic jungle-to-sea backdrop), and Bayahíbe and Dominicus for reef-edge beach colour. We have scouted all of these personally.',
        answerEs: 'Cubrimos todas las playas principales de la RD. Las más populares para propuestas: Playa Juanillo y Juanillo Beach en Cap Cana (prístina y fotogénica), Playa Bávaro y Macao en Punta Cana, Playa Nueva Romana y villas frente al mar en La Romana (la más privada y cinematográfica — sin aglomeraciones), Playa Bonita y Playa Rincón en Samaná (fondo dramático de selva al mar) y Bayahíbe y Dominicus por el color del arrecife al borde del agua. Hemos reconocido todas estas playas personalmente.',
      },
      {
        questionEn: 'What if the beach is crowded with tourists?',
        questionEs: '¿Qué pasa si la playa está llena de turistas?',
        answerEn: 'Crowded beaches actually help us — we blend in more easily. With telephoto we shoot from 50–80 meters anyway, so nearby guests do not disrupt the frame. We always have a signal system set up: you message us when you are 5 minutes out, we confirm position. From that point we are focused and ready regardless of what is happening around us.',
        answerEs: 'Las playas concurridas en realidad nos ayudan — nos mezclamos más fácilmente. Con teleobjetivo disparamos desde 50–80 metros de todas formas, así que los turistas cercanos no interrumpen el encuadre. Siempre tenemos un sistema de señales configurado: tú nos escribes cuando estás a 5 minutos, nosotros confirmamos posición. A partir de ahí estamos enfocados y listos sin importar lo que pase a nuestro alrededor.',
      },
      {
        questionEn: 'What is the best time of day for a beach proposal in Dominican Republic?',
        questionEs: '¿Cuál es el mejor momento del día para una propuesta en playa en República Dominicana?',
        answerEn: 'Golden hour — 45 to 60 minutes before sunset — gives the warmest light and the most cinematic results. On DR beaches the sun sets between 6:30 and 7:00 PM depending on the season. We always time the shot so the light falls directly on her face when she turns around. Early morning (7–9 AM) is the second best option for soft light with fewer crowds.',
        answerEs: 'La hora dorada — 45 a 60 minutos antes del atardecer — da la luz más cálida y los resultados más cinematográficos. En las playas de RD el sol se pone entre las 6:30 y las 7:00 PM según la temporada. Siempre calculamos el disparo para que la luz caiga directamente en su cara cuando se voltea. Las primeras horas de la mañana (7–9 AM) son la segunda mejor opción para luz suave con menos aglomeración.',
      },
      {
        questionEn: 'When do we receive the beach proposal photos?',
        questionEs: '¿Cuándo recibimos las fotos de la propuesta en playa?',
        answerEn: 'You receive a preview gallery of 20–30 edited images the same night or early the next morning — so you can show her the double surprise over breakfast. The full edited gallery follows within 48 hours. A printed premium album can be delivered to your hotel or villa within 72 hours.',
        answerEs: 'Recibes una galería de vista previa de 20 a 30 imágenes editadas la misma noche o temprano a la mañana siguiente — para que puedas mostrarle la doble sorpresa en el desayuno. La galería completa editada llega dentro de 48 horas. Un álbum impreso premium puede entregarse en tu hotel o villa dentro de 72 horas.',
      },
    ],
    relatedSpokeIds: ['weddings-proposal-photographer-punta-cana', 'weddings-punta-cana', 'weddings-zona-colonial-santo-domingo'],
    ctaHeadlineEn: 'Ready to plan your beach proposal anywhere in Dominican Republic?',
    ctaHeadlineEs: '¿Listo para planear tu propuesta en playa en cualquier parte de República Dominicana?',
    ctaValuePropEn: 'Message us via WhatsApp only — never by email. We plan everything around your beach, your golden-hour time, and your signal system — anywhere on the island.',
    ctaValuePropEs: 'Escríbenos solo por WhatsApp — nunca por correo. Planificamos todo alrededor de tu playa, tu hora dorada y tu sistema de señales — en cualquier parte de la isla.',
    waMessageEn: 'Hello! I want to plan a secret beach proposal photography session in Dominican Republic. Can we coordinate privately?',
    waMessageEs: 'Hola! Quiero planear una sesión de fotografía de propuesta secreta en playa en República Dominicana. ¿Podemos coordinar en privado?',
  },

  {
    id: 'weddings-proposal-photographer-punta-cana',
    enSlug: 'weddings/proposal-photographer-punta-cana',
    esSlug: 'bodas/fotografo-propuesta-matrimonio-punta-cana',
    hubSlug: 'wedding-photography',
    status: 'published', // 2026-05-05: promoted from 'approved' to remove noindex (matches RD spoke)
    tier: 1,
    geo: { latitude: 18.5601, longitude: -68.3725 },
    geoCity: 'Punta Cana',
    geoRegion: 'La Altagracia',
    titleEn: 'Proposal Photographer Punta Cana | Babula Shots',
    titleEs: 'Fotógrafo de Propuesta de Matrimonio en Punta Cana | Babula Shots',
    descriptionEn: 'Proposal photography in Punta Cana — hidden coverage, all beaches and resorts. Content coming soon.',
    descriptionEs: 'Fotografía de propuesta en Punta Cana — cobertura oculta, todas las playas y resorts. Contenido próximamente.',
    keywordsEn: 'proposal photographer punta cana, secret proposal photography punta cana, hidden photographer beach proposal dominican republic, surprise proposal photos hard rock punta cana, cap cana proposal photographer',
    keywordsEs: 'fotografo propuesta matrimonio punta cana, fotografia propuesta sorpresa punta cana, fotografo oculto propuesta playa republica dominicana, fotos propuesta sorpresa hard rock punta cana',
    h1En: 'Proposal Photographer Punta Cana',
    h1Es: 'Fotógrafo de Propuesta de Matrimonio en Punta Cana',
    hookEn: 'You have one chance to capture the moment she says yes. We position ourselves hidden on the beach before you arrive — so when you get down on one knee, every reaction is captured naturally, without her ever knowing we were there.',
    hookEs: 'Tienes una sola oportunidad para capturar el momento en que dice sí. Nos posicionamos ocultos en la playa antes de que llegues — para que cuando te arrodilles, cada reacción quede capturada naturalmente, sin que ella sepa que estuvimos ahí.',
    heroImagePublicId: 'fotografo_para_propuesta_de_matrimonio_en_Punta_Cana_Republica_Dominicana_buhrh3',
    heroImageAltEn: 'Secret proposal photographer Punta Cana private beach Dominican Republic — Babula Shots',
    heroImageAltEs: 'Fotógrafo de propuesta sorpresa playa privada Punta Cana República Dominicana — Babula Shots',
    expectCards: [
      {
        icon: '🥷',
        titleEn: 'Complete Invisibility',
        titleEs: 'Invisibilidad Total',
        bodyEn: 'We arrive 45 minutes before you. By the time you walk onto the beach with her we are already positioned and invisible — telephoto lens ready, waiting for the moment.',
        bodyEs: 'Llegamos 45 minutos antes que tú. Para cuando caminas hacia la playa con ella ya estamos posicionados e invisibles — teleobjetivo listo, esperando el momento.',
      },
      {
        icon: '💍',
        titleEn: 'Every Second Captured',
        titleEs: 'Cada Segundo Capturado',
        bodyEn: 'The walk, the pause, the knee, the ring, the tears, the yes, the embrace. We capture the full sequence from multiple angles so nothing is missed.',
        bodyEs: 'El caminar, la pausa, la rodilla, el anillo, las lágrimas, el sí, el abrazo. Capturamos la secuencia completa desde múltiples ángulos para que no se pierda nada.',
      },
      {
        icon: '🎁',
        titleEn: 'The Double Surprise',
        titleEs: 'La Doble Sorpresa',
        bodyEn: 'The next morning she wakes up to a full photo album of the moment she never knew was captured. Digital gallery overnight. Optional printed album delivered to your hotel within 48-72 hours.',
        bodyEs: 'A la mañana siguiente despierta con un álbum completo del momento que nunca supo que fue capturado. Galería digital overnight. Álbum impreso opcional entregado en tu hotel en 48-72 horas.',
      },
    ],
    gallery: [],
    priceFromUsd: '250',
    pricingDescEn: 'Standard package starts at $270 USD + 18% ITBIS — includes full ninja mode coverage and private gallery in 24 h. Custom packages available for multi-location proposals, private resort access, or any surprise idea — contact us to quote.',
    pricingDescEs: 'El paquete estándar comienza desde $270 USD + 18% ITBIS — incluye cobertura completa en modo ninja y galería privada en 24 h. Paquetes personalizados disponibles para propuestas en múltiples locaciones, acceso a resorts privados o cualquier idea de sorpresa — contáctanos para cotizar.',
    whyUs: [
      { icon: '🥷', titleEn: '45 Minutes Early, Already Hidden', titleEs: '45 Minutos Antes, Ya Ocultos', bodyEn: 'We arrive at your beach before you do and identify the best natural cover. Umbrellas, palm trees, beach bars — we blend in completely. She never suspects a thing.', bodyEs: 'Llegamos a tu playa antes que tú e identificamos la mejor cobertura natural. Sombrillas, palmeras, bares de playa — nos mezclamos completamente. Ella nunca sospecha nada.' },
      { icon: '📡', titleEn: 'Signal System', titleEs: 'Sistema de Señales', bodyEn: 'You send us a WhatsApp message when you are 10 minutes away. We confirm position. From that point — complete radio silence until the moment is done.', bodyEs: 'Nos envías un mensaje de WhatsApp cuando estás a 10 minutos. Confirmamos posición. A partir de ese punto — silencio total hasta que el momento termine.' },
      { icon: '🏨', titleEn: 'All Punta Cana Hotels Covered', titleEs: 'Todos los Hoteles de Punta Cana Cubiertos', bodyEn: 'Hard Rock Punta Cana, Juanillo Beach Cap Cana, Bávaro Beach, Macao, Excellence El Carmen, Sanctuary Cap Cana — we work at every major resort and private villa beach.', bodyEs: 'Hard Rock Punta Cana, Playa Juanillo Cap Cana, Playa Bávaro, Macao, Excellence El Carmen, Sanctuary Cap Cana — trabajamos en todos los resorts principales y playas privadas de villas.' },
      { icon: '🎁', titleEn: 'Double Surprise Delivery', titleEs: 'Entrega de Doble Sorpresa', bodyEn: 'Overnight gallery delivered by morning. Premium printed album at your hotel door within 48-72 hours. She sees herself saying yes — for the very first time.', bodyEs: 'Galería overnight entregada por la mañana. Álbum impreso premium en la puerta de tu hotel en 48-72 horas. Ella se ve a sí misma diciendo sí — por primera vez.' },
    ],
    faq: [
      {
        questionEn: 'How do you stay hidden during the proposal?',
        questionEs: '¿Cómo te mantienes oculto durante la propuesta?',
        answerEn: 'We arrive at the location 30-45 minutes before you and your partner. We identify natural cover points — beach umbrellas, palm trees, beach bars, lounge areas — and position ourselves with a telephoto lens. Your partner never sees us arrive and never knows we are there until after the moment.',
        answerEs: 'Llegamos a la locación 30-45 minutos antes que tú y tu pareja. Identificamos puntos de cobertura naturales — sombrillas, palmeras, bares de playa, áreas de descanso — y nos posicionamos con teleobjetivo. Tu pareja nunca nos ve llegar y nunca sabe que estamos ahí hasta después del momento.',
      },
      {
        questionEn: 'Can she see the photos the next morning as a second surprise?',
        questionEs: '¿Puede ver las fotos a la mañana siguiente como segunda sorpresa?',
        answerEn: 'This is what we call the double surprise — and it is the most emotional part of the whole experience. After the proposal we edit a preview gallery of 20-30 photos overnight and deliver it to you privately by the next morning. You choose when and how to show her. She sees herself saying yes for the very first time.',
        answerEs: 'Esto es lo que llamamos la doble sorpresa — y es la parte más emotiva de toda la experiencia. Después de la propuesta editamos una galería de vista previa de 20-30 fotos durante la noche y te la entregamos privadamente a la mañana siguiente. Tú decides cuándo y cómo mostrársela. Ella se ve a sí misma diciendo sí por primera vez.',
      },
      {
        questionEn: 'Can I get a printed album delivered to my hotel in Punta Cana?',
        questionEs: '¿Puedo recibir un álbum impreso en mi hotel en Punta Cana?',
        answerEn: 'Yes — for an additional fee we produce a premium printed album and deliver it to your hotel or villa within 48-72 hours of the proposal. Available at hotels across Punta Cana, Cap Cana and Bávaro.',
        answerEs: 'Sí — por un costo adicional producimos un álbum impreso premium y lo entregamos en tu hotel o villa dentro de las 48-72 horas de la propuesta. Disponible en hoteles de Punta Cana, Cap Cana y Bávaro.',
      },
      {
        questionEn: 'Which beaches in Punta Cana do you work at?',
        questionEs: '¿En qué playas de Punta Cana trabajas?',
        answerEn: 'We cover all main Punta Cana beaches including Hard Rock Punta Cana, Juanillo Beach at Cap Cana, Bávaro Beach, Macao Beach, Excellence El Carmen, Sanctuary Cap Cana, and private villa beaches. If your resort is not listed just ask — we cover the full Punta Cana corridor.',
        answerEs: 'Cubrimos todas las playas principales de Punta Cana incluyendo Hard Rock Punta Cana, Playa Juanillo en Cap Cana, Playa Bávaro, Playa Macao, Excellence El Carmen, Sanctuary Cap Cana y playas privadas de villas.',
      },
      {
        questionEn: 'What happens after the proposal — do you stay for couple portraits?',
        questionEs: '¿Qué pasa después de la propuesta — se quedan para retratos de pareja?',
        answerEn: 'Yes — after the proposal moment is captured we reveal ourselves and spend 20-30 minutes doing relaxed couple portraits on the beach. This gives you romantic engagement photos in addition to the raw proposal moment.',
        answerEs: 'Sí — después de capturar el momento de la propuesta nos revelamos y pasamos 20-30 minutos haciendo retratos de pareja relajados en la playa. Esto te da fotos románticas de compromiso además del momento crudo de la propuesta.',
      },
    ],
    relatedSpokeIds: ['weddings-proposal-photographer-dominican-republic', 'weddings-punta-cana', 'weddings-zona-colonial-santo-domingo'],
    ctaHeadlineEn: 'Ready to plan the Punta Cana proposal?',
    ctaHeadlineEs: '¿Listo para planear la propuesta en Punta Cana?',
    ctaValuePropEn: 'Message us via WhatsApp only. We will coordinate every detail secretly — beach, time, signal, and the double surprise.',
    ctaValuePropEs: 'Escríbenos solo por WhatsApp. Coordinaremos cada detalle en secreto — playa, hora, señal y la doble sorpresa.',
    waMessageEn: 'Hello! I want to plan a secret proposal photography session in Punta Cana. Can we coordinate privately?',
    waMessageEs: 'Hola! Quiero planear una sesión de fotografía de propuesta secreta en Punta Cana. ¿Podemos coordinar en privado?',
  },

  {
    id: 'weddings-proposal-photographer-zona-colonial-santo-domingo',
    enSlug: 'weddings/proposal-photographer-zona-colonial-santo-domingo',
    esSlug: 'bodas/fotografo-propuesta-matrimonio-zona-colonial-santo-domingo',
    hubSlug: 'wedding-photography',
    status: 'published',
    tier: 1,
    geo: { latitude: 18.4731, longitude: -69.8837 },
    geoCity: 'Zona Colonial',
    geoRegion: 'Santo Domingo',

    titleEn: 'Proposal Photographer Zona Colonial Santo Domingo',
    titleEs: 'Fotógrafo de Propuesta Zona Colonial Santo Domingo',
    descriptionEn: "Surprise proposal photography in Santo Domingo's Zona Colonial. We help plan the walk, the spot, and the reveal. Book your Zona Colonial proposal today.",
    descriptionEs: 'Fotografía de propuesta sorpresa en la Zona Colonial de Santo Domingo. Te ayudamos a planear el recorrido, el lugar y la revelación. Reserva hoy.',
    keywordsEn: 'proposal photographer zona colonial santo domingo, surprise proposal photography colonial city, engagement photographer historic santo domingo, marriage proposal photos zona colonial, proposal planner photographer santo domingo',
    keywordsEs: 'fotografo propuesta zona colonial santo domingo, fotografia propuesta sorpresa ciudad colonial, fotografo compromiso zona colonial, fotos propuesta matrimonio zona colonial, organizador propuesta sorpresa santo domingo',

    h1En: 'Surprise Proposal Photographer — Zona Colonial, Santo Domingo',
    h1Es: 'Fotógrafo de Propuesta Sorpresa — Zona Colonial, Santo Domingo',
    hookEn: "This isn't hidden-camera mode — we help you plan the whole surprise. The walk, the archway, the exact spot to kneel, and the cover story that keeps her guessing. Five centuries of colonial backdrop, one unforgettable yes.",
    hookEs: 'Esto no es modo oculto — te ayudamos a planear toda la sorpresa. El recorrido, el arco, el lugar exacto para arrodillarte y la excusa perfecta para que ella no sospeche. Cinco siglos de fondo colonial, un sí inolvidable.',

    heroImagePublicId: 'v1786566174/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_4_cdwhj4',
    heroImageAltEn: 'Surprise proposal photographer Zona Colonial Santo Domingo — man kneeling in historic plaza — Babula Shots',
    heroImageAltEs: 'Fotógrafo de propuesta sorpresa Zona Colonial Santo Domingo — hombre arrodillado en plaza histórica — Babula Shots',

    expectCards: [
      {
        icon: '🗺️',
        titleEn: 'We Help You Plan It',
        titleEs: 'Te Ayudamos a Planificarla',
        bodyEn: "We're not just a camera behind you — we scout the route, pick the plaza or archway, and help you time it so the light and the crowd both work in your favor.",
        bodyEs: 'No solo llevamos la cámara — reconocemos el recorrido, elegimos la plaza o el arco y te ayudamos a calcular el momento para que la luz y la gente jueguen a tu favor.',
      },
      {
        icon: '🎭',
        titleEn: 'A Believable Cover Story',
        titleEs: 'Una Excusa Creíble',
        bodyEn: "We pose it as a normal couple's photo session, so she never suspects a thing until you're on one knee.",
        bodyEs: 'Lo planteamos como una sesión de fotos normal de pareja, para que ella no sospeche nada hasta que estés de rodillas.',
      },
      {
        icon: '🏛️',
        titleEn: 'Five Centuries of Backdrop',
        titleEs: 'Cinco Siglos de Escenario',
        bodyEn: 'Cobblestone streets, fortress walls, colonial plazas and balconies — the oldest city in the Americas gives every frame a cinematic weight no studio can fake.',
        bodyEs: 'Calles adoquinadas, murallas de fortaleza, plazas y balcones coloniales — la ciudad más antigua de América le da a cada foto un peso cinematográfico que ningún estudio puede imitar.',
      },
    ],

    gallery: [
      { publicId: 'v1786566174/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_4_cdwhj4', altEn: 'Marriage proposal in progress at a historic plaza, Zona Colonial Santo Domingo — Babula Shots', altEs: 'Propuesta de matrimonio en una plaza histórica, Zona Colonial Santo Domingo — Babula Shots' },
      { publicId: 'v1786566174/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_3_zo2nyj', altEn: 'Man on one knee proposing beside a colonial fortress wall, Zona Colonial — Babula Shots', altEs: 'Hombre de rodillas proponiendo junto a una muralla colonial, Zona Colonial — Babula Shots' },
      { publicId: 'v1786566174/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_5_jxymhz', altEn: 'Close-up of the ring box moment during a Zona Colonial marriage proposal — Babula Shots', altEs: 'Primer plano del anillo durante una propuesta de matrimonio en la Zona Colonial — Babula Shots' },
      { publicId: 'v1786566225/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_7_kzqtie', altEn: 'Bride-to-be laughing and showing her new ring in the Zona Colonial — Babula Shots', altEs: 'Futura novia riendo y mostrando su nuevo anillo en la Zona Colonial — Babula Shots' },
      { publicId: 'v1786566255/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_11_flashr', altEn: 'Couple embracing on a colonial balcony overlooking the Zona Colonial — Babula Shots', altEs: 'Pareja abrazada en un balcón colonial con vista a la Zona Colonial — Babula Shots' },
      { publicId: 'v1786566255/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_9_j1nkyh', altEn: 'Couple dancing under a stone archway in the Zona Colonial — Babula Shots', altEs: 'Pareja bailando bajo un arco de piedra en la Zona Colonial — Babula Shots' },
      { publicId: 'v1786566173/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_2_sifb58', altEn: 'Couple walking hand in hand through the streets of the Zona Colonial — Babula Shots', altEs: 'Pareja caminando de la mano por las calles de la Zona Colonial — Babula Shots' },
      { publicId: 'v1786566254/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_10_itjvis', altEn: 'Couple walking up historic stone steps in the Zona Colonial — Babula Shots', altEs: 'Pareja subiendo escalones históricos de piedra en la Zona Colonial — Babula Shots' },
    ],

    priceFromUsd: '270',
    pricingDescEn: 'Full-service surprise proposal photography in the Zona Colonial — package starts at $270 USD + 18% ITBIS. We help plan the location, the walk, and the exact spot for the reveal, then capture it candidly, as if we were just there for a regular photo session. Preview gallery within 24 hours.',
    pricingDescEs: 'Fotografía de propuesta sorpresa integral en la Zona Colonial — el paquete comienza en $270 USD + 18% ITBIS. Te ayudamos a planear el lugar, el recorrido y el punto exacto para la revelación, y lo capturamos de forma espontánea, como si fuera una sesión de fotos normal. Galería de vista previa en 24 horas.',

    whyUs: [
      { icon: '🗺️', titleEn: 'We Plan the Whole Route', titleEs: 'Planificamos Todo el Recorrido', bodyEn: 'We scout the Zona Colonial in advance and map out a walking route that ends exactly where the light and backdrop are best for the moment.', bodyEs: 'Reconocemos la Zona Colonial con anticipación y trazamos una ruta que termina exactamente donde la luz y el fondo son mejores para el momento.' },
      { icon: '🎭', titleEn: 'The Cover Story Works', titleEs: 'La Excusa Funciona', bodyEn: 'We show up as if we are shooting a normal couple session. No hiding behind a telephoto lens — we blend in as your photographer for the day.', bodyEs: 'Llegamos como si fuéramos a hacer una sesión de pareja normal. Sin escondernos con teleobjetivo — nos integramos como tu fotógrafo del día.' },
      { icon: '🏛️', titleEn: 'We Know Every Corner', titleEs: 'Conocemos Cada Rincón', bodyEn: 'Alcázar de Colón, Fortaleza Ozama, Plaza España, Calle Las Damas — we have photographed proposals across the historic district and know exactly which spot fits your story.', bodyEs: 'Alcázar de Colón, Fortaleza Ozama, Plaza España, Calle Las Damas — hemos fotografiado propuestas en toda la zona histórica y sabemos exactamente qué lugar se ajusta a tu historia.' },
      { icon: '⭐', titleEn: '4.9 Stars on Google', titleEs: '4.9 Estrellas en Google', bodyEn: '98+ Google reviews from real couples who celebrated in the Dominican Republic. Consistent, honest feedback from clients in your exact situation.', bodyEs: '+98 reseñas de Google de parejas reales que celebraron en República Dominicana. Comentarios consistentes y honestos de clientes en tu misma situación.' },
    ],

    faq: [
      {
        questionEn: 'Is this the same as the hidden ninja mode telephoto service?',
        questionEs: '¿Es lo mismo que el servicio oculto en modo ninja con teleobjetivo?',
        answerEn: 'No — ninja mode is for beach proposals where we shoot from 50 to 80 meters away, completely hidden. In the Zona Colonial we work up close, blending in as your regular photographer for the day. She sees us — she just never knows why we are really there.',
        answerEs: 'No — el modo ninja es para propuestas en playa donde disparamos desde 50 a 80 metros, completamente ocultos. En la Zona Colonial trabajamos de cerca, integrándonos como tu fotógrafo habitual del día. Ella nos ve — solo que nunca sabe por qué estamos ahí realmente.',
      },
      {
        questionEn: 'What is the best spot in the Zona Colonial to propose?',
        questionEs: '¿Cuál es el mejor lugar de la Zona Colonial para proponer matrimonio?',
        answerEn: 'Our favorites are the courtyard and plaza in front of the Alcázar de Colón, the archways at the Fortaleza Ozama, the balconies along Calle Las Damas, and the quiet stone stairways near the Ozama River. We choose based on your timeline and the golden-hour window.',
        answerEs: 'Nuestros favoritos son el patio y la plaza frente al Alcázar de Colón, los arcos de la Fortaleza Ozama, los balcones de la Calle Las Damas y las escaleras de piedra tranquilas cerca del río Ozama. Elegimos según tu horario y la ventana de hora dorada.',
      },
      {
        questionEn: 'Do we need a permit to propose at the Alcázar de Colón or the Fortaleza?',
        questionEs: '¿Necesitamos permiso para proponer en el Alcázar de Colón o la Fortaleza?',
        answerEn: 'For a quick, informal proposal moment, generally no. If you want a longer session or a staged setup with decor, we coordinate the Ministry of Culture permit for you as part of the booking.',
        answerEs: 'Para un momento de propuesta rápido e informal, generalmente no. Si quieres una sesión más larga o un montaje con decoración, coordinamos el permiso del Ministerio de Cultura como parte de tu reserva.',
      },
      {
        questionEn: 'How do you keep it a surprise while we are being photographed?',
        questionEs: '¿Cómo mantienen la sorpresa mientras nos están fotografiando?',
        answerEn: 'We frame the whole session as a normal couple photoshoot — walking, portraits, a few candid moments. Most partners have no idea a proposal is coming even while posing for us, right up until you get down on one knee.',
        answerEs: 'Presentamos toda la sesión como una sesión de pareja normal — caminando, retratos, algunos momentos espontáneos. La mayoría de las parejas no tiene idea de que viene una propuesta, incluso mientras posan para nosotros, hasta que te arrodillas.',
      },
      {
        questionEn: 'When do we receive the proposal photos?',
        questionEs: '¿Cuándo recibimos las fotos de la propuesta?',
        answerEn: 'You get a preview gallery the same day or early the next morning. The full edited gallery follows within 48 hours, delivered through a private online link.',
        answerEs: 'Recibes una galería de vista previa el mismo día o temprano a la mañana siguiente. La galería completa editada llega dentro de 48 horas, entregada a través de un enlace privado en línea.',
      },
    ],

    relatedSpokeIds: ['proposal-hidden-mode-ninja-photographer', 'weddings-zona-colonial-santo-domingo', 'weddings-proposal-photographer-dominican-republic'],

    ctaHeadlineEn: 'Ready to plan your Zona Colonial surprise proposal?',
    ctaHeadlineEs: '¿Listo para planear tu propuesta sorpresa en la Zona Colonial?',
    ctaValuePropEn: 'Message us on WhatsApp only. We help plan the route, the spot, and the cover story — she will not see it coming. · ⭐ 4.9 on Google (98+ reviews)',
    ctaValuePropEs: 'Escríbenos solo por WhatsApp. Te ayudamos a planear el recorrido, el lugar y la excusa perfecta — ella no lo verá venir. · ⭐ 4.9 en Google (+98 reseñas)',

    waMessageEn: 'Hello! I want to plan a surprise proposal photography session in the Zona Colonial, Santo Domingo. Can we coordinate?',
    waMessageEs: 'Hola! Quiero planear una sesión de fotografía de propuesta sorpresa en la Zona Colonial, Santo Domingo. ¿Podemos coordinar?',
  },

  // ── HUB 3: Proposal Photography (standalone hub) ───────────────────────────
  {
    id: 'proposal-hidden-mode-ninja-photographer',
    enSlug: 'proposal/proposal-hidden-mode-ninja-photographer',
    esSlug: 'propuesta/fotografo-propuesta-oculta-modo-ninja',
    hubSlug: 'proposal-photography',
    status: 'published',
    tier: 1,
    geo: { latitude: 18.6543, longitude: -68.9897 },
    geoCity: 'Dominican Republic',
    geoRegion: 'Various',
    titleEn: 'Hidden Mode Proposal Photographer Dominican Republic',
    titleEs: 'Fotógrafo de Propuesta Oculta Modo Ninja República Dominicana',
    h1En: 'Ninja Mode Proposal Photographer — She Never Knows',
    h1Es: 'Fotógrafo de Propuesta en Modo Ninja — Ella Nunca Lo Sabe',
    hookEn: 'We shoot from 400–600 mm telephoto lenses from 50–80 meters away. Fully hidden, completely invisible. You propose. We capture everything. She never finds out until the morning after.',
    hookEs: 'Disparamos con lentes de teleobjetivo de 400 a 600 mm desde 50 a 80 metros de distancia. Completamente ocultos, totalmente invisibles. Tú propones. Nosotros capturamos todo. Ella no se entera hasta la mañana siguiente.',
    descriptionEn: 'Specialist hidden mode proposal photographer in Dominican Republic. 400–600 mm telephoto lens technique, ninja positioning, available on every beach and location across DR — Punta Cana, Santo Domingo, Samaná, Casa de Campo, Cap Cana and more.',
    descriptionEs: 'Fotógrafo especialista en propuestas en modo oculto en República Dominicana. Técnica de teleobjetivo 400–600 mm, posicionamiento ninja, disponible en todas las playas y locaciones de RD — Punta Cana, Santo Domingo, Samaná, Casa de Campo, Cap Cana y más.',
    keywordsEn: 'hidden proposal photographer dominican republic, ninja mode proposal photography, secret proposal photographer punta cana, telephoto lens proposal photography, surprise proposal photographer DR',
    keywordsEs: 'fotografo propuesta oculta republica dominicana, fotografo propuesta modo ninja, fotografia propuesta secreta punta cana, teleobjetivo propuesta matrimonio, fotografo sorpresa propuesta RD',
    heroImagePublicId: 'fotografo_para_propuesta_de_matrimonio_santo_domingo_punta_cana_playa_fh3htf',
    heroImageAltEn: 'Hidden mode proposal photographer Dominican Republic — ninja mode telephoto lens capture — Babula Shots',
    heroImageAltEs: 'Fotógrafo de propuesta en modo oculto República Dominicana — captura con teleobjetivo modo ninja — Babula Shots',
    expectCards: [
      {
        icon: '🥷',
        titleEn: 'We Arrive 45 Min Early',
        titleEs: 'Llegamos 45 Min Antes',
        bodyEn: 'We scout the location, find the best natural cover, and set up the 400–600 mm telephoto lens before you arrive. Full concealment secured before she gets there.',
        bodyEs: 'Reconocemos la locación, encontramos la mejor cobertura natural y configuramos el teleobjetivo de 400 a 600 mm antes de que llegues. Ocultamiento completo asegurado antes de que ella llegue.',
      },
      {
        icon: '📡',
        titleEn: 'WhatsApp Signal System',
        titleEs: 'Sistema de Señales WhatsApp',
        bodyEn: 'Send us a WhatsApp when you are 10 minutes out. We confirm position. From that point — radio silence until the ring is on.',
        bodyEs: 'Envíanos un WhatsApp cuando estés a 10 minutos. Confirmamos posición. A partir de ese punto — silencio total hasta que el anillo esté puesto.',
      },
      {
        icon: '🎁',
        titleEn: 'The Double Surprise',
        titleEs: 'La Doble Sorpresa',
        bodyEn: 'First she says yes. Then the next morning she wakes up to a full gallery of the moment she never knew was captured. Most couples say the second surprise hits harder.',
        bodyEs: 'Primero dice que sí. Luego a la mañana siguiente despierta con una galería completa del momento que nunca supo que fue capturado. La mayoría de las parejas dice que la segunda sorpresa impacta más.',
      },
    ],
    gallery: [
      { publicId: 'fotografo_para_propuesta_de_matrimonio_santo_domingo_punta_cana_playa_fh3htf', altEn: 'Ninja mode — telephoto from far distance, couple has no idea — Babula Shots', altEs: 'Modo ninja — teleobjetivo desde larga distancia, la pareja no tiene idea — Babula Shots' },
      { publicId: 'Fotografo_para_pido_la_mano_propuesta_Republica_dominicana_playa_bavaro_punta_cana_ylwdgz', altEn: 'Getting perfect seaview angle for hidden proposal photography Dominican Republic — Babula Shots', altEs: 'Buscando ángulo perfecto con vista al mar para fotografía de propuesta oculta — Babula Shots' },
      { publicId: 'fotografo_en_la_playa_servicio_propuesta_pido_la_mano_j0lrts', altEn: 'Full ninja mode — hidden beach proposal photographer Dominican Republic — Babula Shots', altEs: 'Modo ninja completo — fotógrafo oculto en playa República Dominicana — Babula Shots' },
      { publicId: 'paquetes_de_propuesta_de_matrimonio_en_punta_cana_sqplka', altEn: 'In position, he is ready to propose — hidden photographer watching — Babula Shots', altEs: 'En posición, él está listo para proponer — fotógrafo oculto observando — Babula Shots' },
      { publicId: 'Session_de_fotos_fotografo_punta_cana_propuesta_de_matrimonio_sjrds4', altEn: 'On one knee — proposal moment captured secretly Dominican Republic — Babula Shots', altEs: 'De rodillas — momento de la propuesta capturado secretamente República Dominicana — Babula Shots' },
      { publicId: 'fotografo_punta_cana_para_propuesta_de_matrimonio_r9wkan', altEn: 'Ring on finger — caught with telephoto lens, she still has no idea — Babula Shots', altEs: 'Anillo en el dedo — capturado con teleobjetivo, ella aún no sabe — Babula Shots' },
      { publicId: 'Propuesta_de_matrimonio_playa_privada_Punta_Cana_dz3wp2', altEn: 'Hugs and kisses after surprise beach proposal captured invisibly — Babula Shots', altEs: 'Abrazos y besos después de propuesta sorpresa en playa capturada de forma invisible — Babula Shots' },
      { publicId: 'sorpresa_propuesta_de_matrimonio_en_la_playa_fotografo_en_republica_dominicana_punta_cana_jkyrry', altEn: 'Still hidden — couple sitting after proposal unaware of photographer — Babula Shots', altEs: 'Aún oculto — pareja sentada después de la propuesta sin saber del fotógrafo — Babula Shots' },
    ],
    priceFromUsd: '250',
    pricingDescEn: 'Standard package starts at $270 USD + 18% ITBIS — full ninja mode coverage, private gallery in 24 h. Custom packages available for multi-location proposals, private venues, second photographer, or luxury album delivery. Contact us to quote your exact plan.',
    pricingDescEs: 'El paquete estándar comienza desde $270 USD + 18% ITBIS — cobertura completa en modo ninja, galería privada en 24 h. Paquetes personalizados disponibles para propuestas en múltiples locaciones, lugares privados, segundo fotógrafo o entrega de álbum de lujo. Contáctanos para cotizar tu plan.',
    pricingTiers: [
      {
        labelEn: 'Personalized Surprise Proposal — 1 Hour',
        labelEs: 'Propuesta Sorpresa Personalizada — 1 Hora',
        priceUsd: '350',
        descriptionEn: 'Hidden proposal capture with telephoto lens, a couple session right after the yes, and drone footage of the couple and beach during that after-session. Add-ons available on request: discreet drone during the proposal moment itself (+$100), or a short highlight video (+$100).',
        descriptionEs: 'Cobertura oculta de la propuesta con teleobjetivo, sesión de pareja inmediatamente después del sí, y tomas con drone de la pareja y la playa durante esa sesión posterior. Add-ons disponibles: drone en modo oculto durante la propuesta (+$100), o video corto tipo highlight (+$100).',
        bookingServiceSlug: 'proposal-photography__personalized-hidden-proposal',
      },
    ],
    whyUs: [
      { icon: '📡', titleEn: '400–600 mm Telephoto — Total Invisibility', titleEs: '400–600 mm Teleobjetivo — Invisibilidad Total', bodyEn: 'We shoot from 50 to 80 meters away with professional telephoto lenses. The images look like we were right next to you. She never sees us — not once.', bodyEs: 'Disparamos desde 50 a 80 metros con lentes de teleobjetivo profesionales. Las imágenes parecen tomadas justo a tu lado. Ella nunca nos ve — ni una sola vez.' },
      { icon: '🗺️', titleEn: 'Island-Wide Coverage', titleEs: 'Cobertura en Toda la Isla', bodyEn: 'Punta Cana, Cap Cana, Bávaro, Santo Domingo, Samaná, Las Terrenas, Casa de Campo, Puerto Plata, Bayahíbe — we travel to every beach and venue across DR.', bodyEs: 'Punta Cana, Cap Cana, Bávaro, Santo Domingo, Samaná, Las Terrenas, Casa de Campo, Puerto Plata, Bayahíbe — viajamos a cada playa y locación en toda la RD.' },
      { icon: '🔒', titleEn: 'Fully Private Coordination', titleEs: 'Coordinación Completamente Privada', bodyEn: 'Everything organized via WhatsApp only. No paper trail, no shared accounts. Your partner never stumbles onto the plan.', bodyEs: 'Todo organizado solo por WhatsApp. Sin rastro de papel, sin cuentas compartidas. Tu pareja nunca se topa con el plan.' },
      { icon: '🎁', titleEn: 'Double Surprise Delivery', titleEs: 'Entrega de Doble Sorpresa', bodyEn: 'She says yes. Next morning she wakes up to the full gallery of the moment she thought was private. Most clients say this is the reaction they replay the most.', bodyEs: 'Dice que sí. A la mañana siguiente despierta con la galería completa del momento que pensaba que era privado. La mayoría de los clientes dice que esta es la reacción que más repiten.' },
    ],
    faq: [
      {
        questionEn: 'How far away do you actually shoot from?',
        questionEs: '¿Desde qué distancia disparan realmente?',
        answerEn: 'We set up between 50 and 80 meters from the proposal spot depending on the location. With a 400–600 mm telephoto lens that distance disappears completely — the images look like we were standing right there.',
        answerEs: 'Nos ubicamos entre 50 y 80 metros del lugar de la propuesta dependiendo de la locación. Con un teleobjetivo de 400 a 600 mm esa distancia desaparece completamente — las imágenes parecen tomadas justo ahí.',
      },
      {
        questionEn: 'Can she really not tell you are there?',
        questionEs: '¿Realmente ella no puede saber que están ahí?',
        answerEn: 'In all our sessions she has never noticed us. We use natural cover — umbrellas, palm trees, beach bars, boulders — and we never face her directly. The telephoto lets us be completely out of her field of vision.',
        answerEs: 'En todas nuestras sesiones ella nunca nos ha notado. Usamos cobertura natural — sombrillas, palmeras, bares de playa, rocas — y nunca le apuntamos de frente. El teleobjetivo nos permite estar completamente fuera de su campo de visión.',
      },
      {
        questionEn: 'What if the proposal spot changes last minute?',
        questionEs: '¿Qué pasa si la locación de la propuesta cambia a último momento?',
        answerEn: 'No problem. We stay on WhatsApp until the moment happens. If the spot changes just inform us and we relocate. We build extra time into every session for exactly this reason.',
        answerEs: 'Sin problema. Estamos en WhatsApp hasta que ocurre el momento. Si la locación cambia solo infórmanos y nos reubicamos. Incluimos tiempo extra en cada sesión por exactamente esta razón.',
      },
      {
        questionEn: 'Do you work at private resort beaches?',
        questionEs: '¿Trabajan en playas privadas de resorts?',
        answerEn: 'Yes — we have covered proposals at Hard Rock Punta Cana, Excellence El Carmen, Sanctuary Cap Cana, Zoëtry Agua, Secrets Royal Beach, and many other resort beaches. We blend in as hotel guests.',
        answerEs: 'Sí — hemos cubierto propuestas en Hard Rock Punta Cana, Excellence El Carmen, Sanctuary Cap Cana, Zoëtry Agua, Secrets Royal Beach y muchas otras playas de resorts. Nos mezclamos como huéspedes del hotel.',
      },
      {
        questionEn: 'When do we receive the photos?',
        questionEs: '¿Cuándo reciben las fotos?',
        answerEn: 'You receive a preview gallery the same night or the next morning. The full edited gallery follows within 48 hours. If you add a printed album it is delivered to your hotel within 72 hours.',
        answerEs: 'Recibes una galería de vista previa la misma noche o la mañana siguiente. La galería completa editada llega dentro de 48 horas. Si agregas un álbum impreso se entrega en tu hotel dentro de 72 horas.',
      },
    ],
    relatedSpokeIds: ['weddings-proposal-photographer-punta-cana', 'weddings-proposal-photographer-dominican-republic', 'weddings-punta-cana'],
    ctaHeadlineEn: 'Ready to plan the perfect hidden proposal?',
    ctaHeadlineEs: '¿Listo para planear la propuesta oculta perfecta?',
    ctaValuePropEn: 'Message us on WhatsApp only. We coordinate every detail in complete secrecy — location, timing, signal, and the double surprise gallery delivery.',
    ctaValuePropEs: 'Escríbenos solo por WhatsApp. Coordinamos cada detalle en completo secreto — locación, hora, señal, y la entrega de la galería de doble sorpresa.',
    waMessageEn: 'Hello! I want to plan a secret hidden mode proposal photography session. Can we coordinate privately via WhatsApp?',
    waMessageEs: 'Hola! Quiero planear una sesión de fotografía de propuesta en modo oculto. ¿Podemos coordinar en privado por WhatsApp?',
  },

  // ── HUB 2: Portrait Photography ────────────────────────────────────────────
  draftSpoke('portraits-couples-punta-cana',   'portraits/couples-punta-cana',              'retratos/parejas-punta-cana',                          'portrait-photography', 1, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('portraits-couples-cap-cana',     'portraits/couples-cap-cana',                'retratos/parejas-cap-cana',                            'portrait-photography', 2, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('portraits-couples-santo-domingo','portraits/couples-santo-domingo',           'retratos/parejas-santo-domingo',                       'portrait-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('portraits-honeymoon-punta-cana', 'portraits/honeymoon-photoshoot-punta-cana', 'retratos/sesion-luna-de-miel-punta-cana',               'portrait-photography', 2, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('portraits-honeymoon-cap-cana',   'portraits/honeymoon-photoshoot-cap-cana',   'retratos/sesion-luna-de-miel-cap-cana',                 'portrait-photography', 2, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('portraits-personal-branding',    'portraits/personal-branding-santo-domingo', 'retratos/personal-branding-santo-domingo',              'portrait-photography', 3, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),

  // ── HUB 3: Family Photography ──────────────────────────────────────────────
  // ✅  family/zona-colonial-santo-domingo — status: 'published' — live + indexed
  {
    id: 'family-zona-colonial-santo-domingo',
    enSlug: 'family/zona-colonial-santo-domingo',
    esSlug: 'familia/zona-colonial-santo-domingo',
    hubSlug: 'family-photography',
    status: 'published',
    tier: 1,
    bookingServiceSlug: 'family-beach-photography__essential',
    geo: { latitude: 18.4731, longitude: -69.8837 },
    geoCity: 'Zona Colonial',
    geoRegion: 'Santo Domingo',

    titleEn: 'Family Photographer Zona Colonial Santo Domingo',
    titleEs: 'Fotógrafo Familiar Zona Colonial Santo Domingo',
    descriptionEn: "Family photography in Santo Domingo's Zona Colonial — stone archways, the Catedral Primada, golden-hour steps. Paced for young kids. Book your family session today.",
    descriptionEs: 'Fotografía familiar en la Zona Colonial de Santo Domingo — arcos de piedra, la Catedral Primada, escalinatas al atardecer. Ritmo pensado para niños pequeños. Reserva tu sesión familiar hoy.',
    keywordsEn: 'family photographer zona colonial santo domingo, family photoshoot zona colonial, bilingual family photographer santo domingo, family portraits colonial zone dominican republic, multigenerational photo session santo domingo',
    keywordsEs: 'fotógrafo familiar zona colonial santo domingo, sesión de fotos familiar zona colonial, fotógrafo de familias santo domingo, fotos familiares al aire libre santo domingo, sesión familiar bilingüe santo domingo',

    h1En: 'Family Photographer in the Zona Colonial, Santo Domingo',
    h1Es: 'Fotógrafo Familiar en la Zona Colonial, Santo Domingo',
    hookEn: "Stone archways, the Catedral Primada's facade, granite steps at golden hour — the Zona Colonial gives your family session the same backdrop that's made our wedding and baptism work here stand out, without a beach trip. Sessions run bilingual (English/Spanish) and paced for young kids.",
    hookEs: 'Arcos de piedra, la fachada de la Catedral Primada, escalinatas en hora dorada — la Zona Colonial le da a tu sesión familiar el mismo escenario que ha distinguido nuestro trabajo de bodas y bautizos aquí, sin necesidad de ir a la playa. Sesiones bilingües (inglés/español) y a ritmo de niños pequeños.',

    heroImagePublicId: 'v1788218696/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_4_iunguk',
    heroImageAltEn: 'Family walking hand in hand in front of a grand colonial cathedral facade, Zona Colonial, Santo Domingo — Babula Shots family photographer',
    heroImageAltEs: 'Familia caminando de la mano frente a la fachada de una gran catedral colonial, Zona Colonial, Santo Domingo — fotógrafo familiar Babula Shots',

    expectCards: [
      {
        icon: '🏛️',
        titleEn: 'Colonial Architecture, Zero Travel',
        titleEs: 'Arquitectura Colonial, Sin Traslados',
        bodyEn: 'Stone archways, iron gates, cathedral facades, and granite steps — all within a short walk of each other. No beach trip, no long drive, no fighting traffic with a toddler in the car.',
        bodyEs: 'Arcos de piedra, rejas de hierro, fachadas de catedral y escalinatas de granito — todo a poca distancia caminando. Sin viaje a la playa, sin trayectos largos, sin pelear con el tráfico con un niño en el carro.',
      },
      {
        icon: '👶',
        titleEn: 'Paced for Young Kids',
        titleEs: 'A Ritmo de Niños Pequeños',
        bodyEn: "We plan a short route between two or three locations, not a marathon — enough variety for a real gallery without pushing a toddler's patience past its limit.",
        bodyEs: 'Planificamos una ruta corta entre dos o tres locaciones, no un maratón — suficiente variedad para una galería completa sin agotar la paciencia de un niño pequeño.',
      },
      {
        icon: '🗣️',
        titleEn: 'Bilingual Direction',
        titleEs: 'Dirección Bilingüe',
        bodyEn: 'Instructions and posing direction run smoothly in English and Spanish, so it works whether the whole family speaks Spanish, English, or a mix of both.',
        bodyEs: 'Las indicaciones y la dirección de poses fluyen en inglés y español, así que funciona sin importar si la familia habla español, inglés, o una mezcla de ambos.',
      },
    ],

    gallery: [
      { publicId: 'v1788218696/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_4_iunguk', altEn: 'Family walking hand in hand in front of a grand colonial cathedral facade, Santo Domingo — Babula Shots', altEs: 'Familia caminando de la mano frente a la fachada de una gran catedral colonial, Santo Domingo — Babula Shots' },
      { publicId: 'v1788218696/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_1_a69rq4', altEn: 'Family portrait under a stone archway with an iron gate, Zona Colonial, Santo Domingo — Babula Shots', altEs: 'Retrato familiar bajo un arco de piedra con reja de hierro, Zona Colonial, Santo Domingo — Babula Shots' },
      { publicId: 'v1788218695/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_2_vfgtsd', altEn: 'Family walking through a colonial colonnade, mother holding a newborn, Santo Domingo — Babula Shots', altEs: 'Familia caminando por un corredor colonial de columnas, madre con su bebé recién nacido, Santo Domingo — Babula Shots' },
      { publicId: 'v1788218701/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_10_jpu3ep', altEn: 'Two siblings running hand in hand toward the camera in front of a colonial stone archway, Santo Domingo — Babula Shots', altEs: 'Dos hermanos corriendo de la mano hacia la cámara frente a una portada de piedra colonial, Santo Domingo — Babula Shots' },
      { publicId: 'v1788218696/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_5_azyfeg', altEn: 'Pregnant mother in a pink dress with her two children on stone steps, Santo Domingo — Babula Shots', altEs: 'Madre embarazada en vestido rosa con sus dos hijos en una escalinata de piedra, Santo Domingo — Babula Shots' },
      { publicId: 'v1788218701/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_9_xdmfgg', altEn: 'Little girl sitting on stone steps at dusk with string lights and greenery, Santo Domingo — Babula Shots', altEs: 'Niña sentada en una escalinata de piedra al atardecer con luces cálidas y vegetación, Santo Domingo — Babula Shots' },
    ],

    priceFromUsd: '$370',
    pricingDescEn: 'Family sessions in the Zona Colonial start at $370 for up to 5 people, 1 hour, and 20 edited high-resolution photos. Larger families, multigenerational groups, or a combined studio-plus-outdoor session can be arranged as a custom quote. Every package includes a private online gallery, delivered within 7 days. A 50% deposit secures your date.',
    pricingDescEs: 'Las sesiones familiares en la Zona Colonial comienzan en $370 para hasta 5 personas, 1 hora, y 20 fotos editadas en alta resolución. Familias más grandes, reuniones multigeneracionales, o una sesión combinada de estudio y exterior se pueden coordinar como cotización personalizada. Cada paquete incluye galería online privada, entregada en 7 días. Un depósito del 50% asegura tu fecha.',

    whyUs: [
      { icon: '🏛️', titleEn: 'Same Location Expertise as Our Weddings', titleEs: 'La Misma Experiencia de Nuestras Bodas', bodyEn: "We've been photographing weddings and baptisms in the Zona Colonial's churches and streets since 2015 — the same location knowledge applies directly to a family session.", bodyEs: 'Llevamos fotografiando bodas y bautizos en las iglesias y calles de la Zona Colonial desde 2015 — el mismo conocimiento del lugar aplica directamente a una sesión familiar.' },
      { icon: '🌅', titleEn: 'Real Golden Hour Timing', titleEs: 'Hora Dorada Real', bodyEn: 'The Zona Colonial faces west, giving dramatic late-afternoon light — we plan family sessions around the 5:30–6:10 PM window for the same warm light seen in our wedding galleries.', bodyEs: 'La Zona Colonial mira al oeste, con una luz dramática al final de la tarde — planificamos las sesiones familiares alrededor de la ventana de 5:30–6:10 PM para la misma luz cálida que se ve en nuestras galerías de bodas.' },
      { icon: '👨‍👩‍👧‍👦', titleEn: 'Multigenerational Experience', titleEs: 'Experiencia con Grupos Multigeneracionales', bodyEn: 'From newborns to grandparents in the same frame, we know how to manage pacing and grouping so everyone — including the youngest and oldest — actually enjoys the session.', bodyEs: 'Desde recién nacidos hasta abuelos en la misma toma, sabemos manejar el ritmo y la agrupación para que todos — incluyendo a los más pequeños y los mayores — disfruten realmente la sesión.' },
      { icon: '⭐', titleEn: '4.9 Stars on Google', titleEs: '4.9 Estrellas en Google', bodyEn: '98+ Google reviews from real clients in the Dominican Republic.', bodyEs: '+98 reseñas de Google de clientes reales en República Dominicana.' },
    ],

    faq: [
      {
        questionEn: 'How much does a family photo session cost in the Zona Colonial?',
        questionEs: '¿Cuánto cuesta una sesión de fotos familiar en la Zona Colonial?',
        answerEn: 'Sessions start at $370 for up to 5 people, 1 hour, and 20 edited photos. Larger families or multigenerational groups are quoted individually since group size affects timing and locations.',
        answerEs: 'Las sesiones comienzan en $370 para hasta 5 personas, 1 hora, y 20 fotos editadas. Familias más grandes o grupos multigeneracionales se cotizan individualmente ya que el tamaño del grupo afecta el tiempo y las locaciones.',
      },
      {
        questionEn: 'What is the best time for a family photo session in the Zona Colonial?',
        questionEs: '¿Cuál es el mejor horario para una sesión familiar en la Zona Colonial?',
        answerEn: 'Late afternoon, around 5:30–6:10 PM, gives the warmest light and the streets thin out from midday tourist traffic. An early morning session is the alternative if nap schedules make a late-afternoon session hard.',
        answerEs: 'La tarde, alrededor de las 5:30–6:10 PM, da la luz más cálida y las calles se vacían del tráfico turístico del mediodía. Una sesión temprano en la mañana es la alternativa si los horarios de siesta hacen difícil una sesión al final de la tarde.',
      },
      {
        questionEn: 'Do we need a permit for family photos in the Zona Colonial?',
        questionEs: '¿Se necesita permiso para fotos familiares en la Zona Colonial?',
        answerEn: "A session on the public streets and plazas of the Zona Colonial doesn't require a permit. Specific landmark interiors — like the Alcázar de Colón or the Fortaleza Ozama — are managed separately and would need their own entrance/permit if you want those specifically included.",
        answerEs: 'Una sesión en las calles y plazas públicas de la Zona Colonial no requiere permiso. Interiores de monumentos específicos — como el Alcázar de Colón o la Fortaleza Ozama — se manejan aparte y necesitarían su propia entrada/permiso si quieres incluirlos específicamente.',
      },
      {
        questionEn: 'What should our family wear for the session?',
        questionEs: '¿Qué debería usar la familia para la sesión?',
        answerEn: 'Light, breathable fabrics in soft neutral or pastel tones photograph best against the stone and brick backdrops — the family in our own gallery here wore whites and blush tones for exactly that reason.',
        answerEs: 'Telas ligeras y frescas en tonos neutros o pasteles suaves se ven mejor contra los fondos de piedra y ladrillo — la familia de nuestra propia galería aquí usó blancos y tonos rosados justamente por esta razón.',
      },
      {
        questionEn: 'How soon do we receive the edited photos?',
        questionEs: '¿Cuánto tiempo después recibimos las fotos editadas?',
        answerEn: 'The private online gallery is delivered within 7 days of the session.',
        answerEs: 'La galería online privada se entrega dentro de los 7 días posteriores a la sesión.',
      },
    ],

    relatedSpokeIds: ['weddings-zona-colonial-santo-domingo', 'events-baptism-sd'],

    ctaHeadlineEn: 'Ready to book your Zona Colonial family session?',
    ctaHeadlineEs: '¿Listo para reservar tu sesión familiar en la Zona Colonial?',
    ctaValuePropEn: 'Sessions from $370 · bilingual, paced for young kids · Check availability and hold your date today. · ⭐ 4.9 on Google (98+ reviews)',
    ctaValuePropEs: 'Sesiones desde $370 · bilingüe, a ritmo de niños pequeños · Verifica disponibilidad y reserva tu fecha hoy. · ⭐ 4.9 en Google (+98 reseñas)',

    waMessageEn: "Hello! I'm interested in a family photo session in the Zona Colonial. Can you check availability for my date?",
    waMessageEs: 'Hola! Me interesa una sesión de fotos familiar en la Zona Colonial. ¿Pueden verificar disponibilidad para mi fecha?',
  },

  draftSpoke('family-punta-cana-beach',        'family/punta-cana-beach',                  'familia/playa-punta-cana',                              'family-photography', 1, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('family-cap-cana',                'family/cap-cana-family-photographer',      'familia/fotografo-familia-cap-cana',                    'family-photography', 3, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('family-santo-domingo',           'family/santo-domingo-family-photographer', 'familia/fotografo-familia-santo-domingo',               'family-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('family-vacation-dr',             'family/vacation-photoshoot-dominican-republic', 'familia/sesion-vacaciones-republica-dominicana',   'family-photography', 2, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),
  draftSpoke('family-maternity-santo-domingo', 'family/maternity-photographer-santo-domingo',   'familia/fotografo-embarazada-santo-domingo',       'family-photography', 1, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('family-maternity-punta-cana',    'family/maternity-photographer-punta-cana',      'familia/fotografo-embarazada-punta-cana',          'family-photography', 2, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('family-newborn-santo-domingo',   'family/newborn-photographer-santo-domingo',     'familia/fotografo-recien-nacido-santo-domingo',    'family-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),

  // ── HUB 4: Drone Services ──────────────────────────────────────────────────
  // ✅ drone/proyecto-haina-zona-industrial — status: 'published' — live
  {
    id: 'drone-haina-industrial-santo-domingo',
    enSlug: 'drone/haina-industrial-zone-drone-project',
    esSlug: 'drone/proyecto-drone-zona-industrial-haina',
    hubSlug: 'real-estate-drone-photography',
    status: 'published',
    tier: 1,
    geo: { latitude: 18.4167, longitude: -70.0333 },
    geoCity: 'Haina',
    geoRegion: 'San Cristóbal',
    titleEn: 'Industrial Drone Photographer Haina Santo Domingo | Traffic & Logistics Data',
    titleEs: 'Fotógrafo de Drone Industrial en Haina Santo Domingo | Datos de Tráfico y Logística',
    h1En: 'Industrial Drone Coverage in Haina — Aerial Data for Traffic Planning',
    h1Es: 'Drone Industrial en Haina — Datos Aéreos para Planificación de Tráfico',
    hookEn: 'A continuous 1-hour flight over the Haina industrial zone for a traffic-analytics and planning company — every bus arrival and departure documented in 4K, frame by frame.',
    hookEs: 'Vuelo continuo de 1 hora sobre la zona industrial de Haina para una empresa de análisis y planificación de tráfico — cada llegada y salida de autobuses documentada en 4K, cuadro por cuadro.',
    descriptionEn: 'Industrial drone coverage in Haina, Santo Domingo — 4K aerial data for traffic-analytics and logistics-planning companies. Full 1-hour continuous flight, bus arrivals and departures documented.',
    descriptionEs: 'Cobertura de drone industrial en Haina, Santo Domingo — datos aéreos en 4K para empresas de análisis de tráfico y planificación logística. Vuelo continuo de 1 hora, llegadas y salidas de autobuses documentadas.',
    keywordsEn: 'drone traffic analysis dominican republic, aerial video industrial zone haina, drone for logistics companies DR, industrial drone photographer santo domingo, drone data urban traffic planning',
    keywordsEs: 'dron para analisis de trafico republica dominicana, video aereo zona industrial haina, dron para empresas de logistica RD, fotografo drone industrial santo domingo, datos aereos planificacion de trafico',
    heroImagePublicId: '',
    heroImageAltEn: 'Industrial drone photographer Haina Santo Domingo — Babula Shots',
    heroImageAltEs: 'Fotógrafo de drone industrial Haina Santo Domingo — Babula Shots',
    videos: [
      {
        youtubeId: '-ezciXHZs3w',
        titleEn: 'Haina Santo Domingo Drone Service Dominican Republic',
        titleEs: 'Haina Santo Domingo Servicio con Drone República Dominicana',
        descriptionEn: 'High-resolution 4K drone footage covering the industrial area of Haina, Santo Domingo — a speed-up summary of a continuous 1-hour flight designed for urban traffic analytics and planning, capturing full bus arrivals and departures.',
        descriptionEs: 'Video en 4K de alta resolución sobre la zona industrial de Haina, Santo Domingo — resumen acelerado de un vuelo continuo de 1 hora diseñado para análisis y planificación de tráfico urbano, capturando llegadas y salidas completas de autobuses.',
        uploadDate: '2026-09-01T17:20:29-07:00',
      },
    ],
    expectCards: [
      {
        icon: '🚁',
        titleEn: 'Continuous 1-Hour Flight',
        titleEs: 'Vuelo Continuo de 1 Hora',
        bodyEn: 'No shortcuts — a full hour of uninterrupted aerial coverage over the zone, capturing every operational detail a traffic study needs, not just a highlight reel.',
        bodyEs: 'Sin atajos — una hora completa de cobertura aérea ininterrumpida sobre la zona, capturando cada detalle operativo que un estudio de tráfico necesita, no solo un resumen.',
      },
      {
        icon: '🚌',
        titleEn: 'Bus Arrivals & Departures Tracked',
        titleEs: 'Llegadas y Salidas de Autobuses Rastreadas',
        bodyEn: 'Positioned and timed specifically to document vehicle flow — arrivals, departures, and movement patterns — the exact data a planning company needs for traffic analysis.',
        bodyEs: 'Posicionado y cronometrado específicamente para documentar el flujo vehicular — llegadas, salidas y patrones de movimiento — exactamente el dato que una empresa de planificación necesita para análisis de tráfico.',
      },
      {
        icon: '📊',
        titleEn: 'Built for Analytics, Not Just Marketing',
        titleEs: 'Hecho para Análisis, No Solo Marketing',
        bodyEn: 'This project was commissioned for real urban-planning use — high-precision visual data a traffic-analytics team can actually work with, delivered in 4K.',
        bodyEs: 'Este proyecto fue encargado para uso real de planificación urbana — datos visuales de alta precisión con los que un equipo de análisis de tráfico realmente puede trabajar, entregados en 4K.',
      },
    ],
    gallery: [],
    priceFromUsd: '250',
    pricingDescEn: 'Industrial and commercial drone data projects are quoted based on flight duration, deliverable format, and analytics requirements. Standard aerial photography packages start at $250 USD — message us with your project scope for a custom quote.',
    pricingDescEs: 'Los proyectos de datos aéreos industriales y comerciales se cotizan según duración del vuelo, formato de entrega y requisitos de análisis. Los paquetes estándar de fotografía aérea comienzan en $250 USD — escríbenos con el alcance de tu proyecto para una cotización personalizada.',
    whyUs: [
      { icon: '🎯', titleEn: 'Real Commercial Project', titleEs: 'Proyecto Comercial Real', bodyEn: 'Commissioned by a traffic-analytics and urban-planning company — not a demo reel. Real operational data delivered for real decision-making.', bodyEs: 'Encargado por una empresa de análisis de tráfico y planificación urbana — no es un video de muestra. Datos operativos reales entregados para decisiones reales.' },
      { icon: '🚁', titleEn: 'FAA-Style Certified Piloting', titleEs: 'Pilotaje con Certificación Profesional', bodyEn: 'Licensed, insured drone piloting for industrial and commercial sites — safety and airspace compliance handled before every flight.', bodyEs: 'Pilotaje de drone licenciado y asegurado para sitios industriales y comerciales — seguridad y cumplimiento de espacio aéreo gestionados antes de cada vuelo.' },
      { icon: '📽️', titleEn: '4K Raw + Edited Delivery', titleEs: 'Entrega en 4K Raw + Editado', bodyEn: 'Full raw footage available alongside the edited summary — so analytics teams can work from source material, not just the highlight cut.', bodyEs: 'Metraje raw completo disponible junto al resumen editado — para que los equipos de análisis trabajen desde el material fuente, no solo del corte destacado.' },
    ],
    faq: [
      {
        questionEn: 'Can you do drone projects for data/analytics companies, not just real estate?',
        questionEs: '¿Hacen proyectos de drone para empresas de datos/análisis, no solo bienes raíces?',
        answerEn: 'Yes — the Haina project is a direct example. We work with companies that need aerial data for traffic studies, urban planning, logistics, and industrial documentation, not just property marketing.',
        answerEs: 'Sí — el proyecto de Haina es un ejemplo directo. Trabajamos con empresas que necesitan datos aéreos para estudios de tráfico, planificación urbana, logística y documentación industrial, no solo marketing de propiedades.',
      },
      {
        questionEn: 'How long can a single drone flight last?',
        questionEs: '¿Cuánto puede durar un solo vuelo de drone?',
        answerEn: 'The Haina project involved a continuous 1-hour flight. Flight duration depends on battery rotation and project scope — we plan this with you before the shoot based on what data you need.',
        answerEs: 'El proyecto de Haina implicó un vuelo continuo de 1 hora. La duración del vuelo depende de la rotación de baterías y el alcance del proyecto — lo planificamos contigo antes del rodaje según los datos que necesites.',
      },
      {
        questionEn: 'What format is the footage delivered in?',
        questionEs: '¿En qué formato se entrega el metraje?',
        answerEn: '4K raw footage plus an edited summary video. For analytics use, we can deliver full unedited footage so your team has every frame to work with.',
        answerEs: 'Metraje raw en 4K más un video resumen editado. Para uso de análisis, podemos entregar el metraje completo sin editar para que tu equipo tenga cada cuadro con el que trabajar.',
      },
    ],
    relatedSpokeIds: [],
    ctaHeadlineEn: 'Need aerial data for your industrial or logistics project?',
    ctaHeadlineEs: '¿Necesitas datos aéreos para tu proyecto industrial o logístico?',
    ctaValuePropEn: 'Message us with your project scope — flight duration, deliverable format, and analytics needs — and we\'ll put together a plan.',
    ctaValuePropEs: 'Escríbenos con el alcance de tu proyecto — duración del vuelo, formato de entrega y necesidades de análisis — y armamos un plan.',
    waMessageEn: 'Hello! I have an industrial/commercial drone project (similar to the Haina traffic-analytics project) I would like to discuss.',
    waMessageEs: 'Hola! Tengo un proyecto de drone industrial/comercial (similar al proyecto de análisis de tráfico en Haina) que me gustaría conversar.',
  },
  // ✅ drone/proyecto-puerto-manzanillo — status: 'published' — live
  {
    id: 'drone-puerto-manzanillo-monte-cristi',
    enSlug: 'drone/puerto-manzanillo-heavy-lift-drone-project',
    esSlug: 'drone/proyecto-drone-puerto-manzanillo-monte-cristi',
    hubSlug: 'real-estate-drone-photography',
    status: 'published',
    tier: 1,
    geo: { latitude: 19.7167, longitude: -71.6500 },
    geoCity: 'Manzanillo, Monte Cristi',
    geoRegion: 'Monte Cristi',
    titleEn: 'Port & Heavy-Lift Drone Photographer Manzanillo Monte Cristi | Babula Shots',
    titleEs: 'Fotógrafo de Drone Portuario e Industrial Manzanillo Monte Cristi | Babula Shots',
    h1En: 'Aerial Survey of Puerto de Manzanillo — Heavy-Lift & Port Operations',
    h1Es: 'Levantamiento Aéreo del Puerto de Manzanillo — Operaciones Portuarias e Izaje Pesado',
    hookEn: '4K aerial documentation of heavy-lift infrastructure and maritime logistics at Puerto de Manzanillo, Monte Cristi — port expansion, cargo handling, and structural layouts captured for engineering and planning use.',
    hookEs: 'Documentación aérea en 4K de infraestructura de izaje pesado y logística marítima en el Puerto de Manzanillo, Monte Cristi — expansión portuaria, manejo de carga y trazados estructurales capturados para uso de ingeniería y planificación.',
    descriptionEn: 'Port and heavy-lift industrial drone photography at Puerto de Manzanillo, Monte Cristi. 4K aerial survey for port engineering, logistics planning, and commercial presentation.',
    descriptionEs: 'Fotografía de drone industrial portuario y de izaje pesado en el Puerto de Manzanillo, Monte Cristi. Levantamiento aéreo en 4K para ingeniería portuaria, planificación logística y presentación comercial.',
    keywordsEn: 'drone photographer puerto manzanillo, aerial survey monte cristi port, heavy lift drone documentation dominican republic, industrial port drone photography DR, maritime logistics aerial video',
    keywordsEs: 'fotografo drone puerto manzanillo, levantamiento aereo puerto monte cristi, documentacion drone izaje pesado republica dominicana, fotografia drone portuaria industrial RD, video aereo logistica maritima',
    heroImagePublicId: 'Servicio_foto_video_drone_republica_dominicana_Babula_Shots_kmoxc1',
    heroImageAltEn: 'Aerial drone survey of Puerto de Manzanillo port and heavy-lift operations, Monte Cristi — Babula Shots',
    heroImageAltEs: 'Levantamiento aéreo con drone del Puerto de Manzanillo y operaciones de izaje pesado, Monte Cristi — Babula Shots',
    videos: [
      {
        youtubeId: 'lzl-clTPXfI',
        titleEn: 'Port Aerial Survey & Drone Footage — Babula Shots',
        titleEs: 'Levantamiento Aéreo Portuario y Video con Drone — Babula Shots',
        descriptionEn: 'High-resolution 4K aerial documentation of heavy industrial operations, heavy-lift infrastructure, and maritime logistics at Puerto de Manzanillo, Monte Cristi — port expansion, cargo handling, and structural layouts for engineering and planning.',
        descriptionEs: 'Documentación aérea en 4K de alta resolución de operaciones industriales pesadas, infraestructura de izaje y logística marítima en el Puerto de Manzanillo, Monte Cristi — expansión portuaria, manejo de carga y trazados estructurales para ingeniería y planificación.',
        uploadDate: '2026-09-01T17:27:31-07:00',
      },
    ],
    expectCards: [
      {
        icon: '⚓',
        titleEn: 'Full Port Documentation',
        titleEs: 'Documentación Portuaria Completa',
        bodyEn: 'Heavy-lift cranes, cargo handling zones, structural layouts, and vessel operations — captured from angles ground photography simply can\'t reach.',
        bodyEs: 'Grúas de izaje pesado, zonas de manejo de carga, trazados estructurales y operaciones de embarcaciones — capturados desde ángulos que la fotografía terrestre simplemente no puede alcanzar.',
      },
      {
        icon: '🏗️',
        titleEn: 'Built for Engineering Use',
        titleEs: 'Hecho para Uso de Ingeniería',
        bodyEn: 'Spatial data and structural detail captured with planning and engineering teams in mind — not just a promotional flyover.',
        bodyEs: 'Datos espaciales y detalle estructural capturados pensando en equipos de planificación e ingeniería — no solo un sobrevuelo promocional.',
      },
      {
        icon: '📍',
        titleEn: 'Remote-Location Coverage',
        titleEs: 'Cobertura en Locación Remota',
        bodyEn: 'Monte Cristi is far from our Santo Domingo base — we travel island-wide for industrial and commercial drone projects.',
        bodyEs: 'Monte Cristi está lejos de nuestra base en Santo Domingo — viajamos a toda la isla para proyectos de drone industrial y comercial.',
      },
    ],
    gallery: [
      { publicId: 'Servicio_foto_video_drone_republica_dominicana_Babula_Shots_kmoxc1', altEn: 'Aerial view of Puerto de Manzanillo port infrastructure, Monte Cristi — Babula Shots', altEs: 'Vista aérea de la infraestructura del Puerto de Manzanillo, Monte Cristi — Babula Shots' },
      { publicId: 'Servicio_foto_video_drone_republica_dominicana_Babula_Shots_-14_q8apfe', altEn: 'Heavy-lift crane operations at Puerto de Manzanillo — Babula Shots', altEs: 'Operaciones de grúa de izaje pesado en el Puerto de Manzanillo — Babula Shots' },
      { publicId: 'Servicio_foto_video_drone_republica_dominicana_Babula_Shots_-13_awhn6b', altEn: 'Aerial survey of cargo handling zones, Puerto de Manzanillo — Babula Shots', altEs: 'Levantamiento aéreo de zonas de manejo de carga, Puerto de Manzanillo — Babula Shots' },
      { publicId: 'Servicio_foto_video_drone_republica_dominicana_Babula_Shots_-12_c1a2g9', altEn: 'Port structural layout captured by drone, Monte Cristi — Babula Shots', altEs: 'Trazado estructural portuario capturado con drone, Monte Cristi — Babula Shots' },
      { publicId: 'Servicio_foto_video_drone_republica_dominicana_Babula_Shots_-11_otd2i9', altEn: 'Maritime logistics operations from above, Puerto de Manzanillo — Babula Shots', altEs: 'Operaciones de logística marítima desde el aire, Puerto de Manzanillo — Babula Shots' },
    ],
    priceFromUsd: '250',
    pricingDescEn: 'Port and industrial drone survey projects are quoted based on site size, flight duration, and deliverable requirements. Standard aerial photography packages start at $250 USD — message us with your project scope for a custom quote.',
    pricingDescEs: 'Los proyectos de levantamiento aéreo portuario e industrial se cotizan según tamaño del sitio, duración del vuelo y requisitos de entrega. Los paquetes estándar de fotografía aérea comienzan en $250 USD — escríbenos con el alcance de tu proyecto para una cotización personalizada.',
    whyUs: [
      { icon: '⚓', titleEn: 'Real Port & Industrial Experience', titleEs: 'Experiencia Real Portuaria e Industrial', bodyEn: 'The Puerto de Manzanillo project is real commissioned work, not a portfolio sample — heavy-lift and maritime logistics documented for actual operational use.', bodyEs: 'El proyecto del Puerto de Manzanillo es trabajo real encargado, no una muestra de portafolio — izaje pesado y logística marítima documentados para uso operativo real.' },
      { icon: '🚁', titleEn: 'Island-Wide Travel', titleEs: 'Viajamos a Toda la Isla', bodyEn: 'From Santo Domingo to Monte Cristi — we travel for industrial and commercial drone projects anywhere in the Dominican Republic.', bodyEs: 'De Santo Domingo a Monte Cristi — viajamos para proyectos de drone industrial y comercial a cualquier punto de República Dominicana.' },
      { icon: '📽️', titleEn: '4K Raw + Edited Delivery', titleEs: 'Entrega en 4K Raw + Editado', bodyEn: 'Full raw footage alongside an edited summary, so engineering and planning teams can work from source material.', bodyEs: 'Metraje raw completo junto a un resumen editado, para que los equipos de ingeniería y planificación trabajen desde el material fuente.' },
    ],
    faq: [
      {
        questionEn: 'Do you travel to Monte Cristi / the northwest for drone projects?',
        questionEs: '¿Viajan a Monte Cristi / el noroeste para proyectos de drone?',
        answerEn: 'Yes — the Puerto de Manzanillo project is a direct example. We travel island-wide for industrial and commercial drone work; travel cost is quoted based on distance from Santo Domingo.',
        answerEs: 'Sí — el proyecto del Puerto de Manzanillo es un ejemplo directo. Viajamos a toda la isla para trabajo de drone industrial y comercial; el costo de traslado se cotiza según la distancia desde Santo Domingo.',
      },
      {
        questionEn: 'Can you document heavy-lift and port operations specifically?',
        questionEs: '¿Pueden documentar específicamente operaciones de izaje pesado y portuarias?',
        answerEn: 'Yes — this is exactly what the Manzanillo project covers: heavy-lift cranes, cargo handling zones, and port structural layouts, captured for engineering and planning use.',
        answerEs: 'Sí — esto es exactamente lo que cubre el proyecto de Manzanillo: grúas de izaje pesado, zonas de manejo de carga y trazados estructurales portuarios, capturados para uso de ingeniería y planificación.',
      },
      {
        questionEn: 'What format is the footage delivered in?',
        questionEs: '¿En qué formato se entrega el metraje?',
        answerEn: '4K raw footage plus an edited summary video, along with high-resolution still photography of the site.',
        answerEs: 'Metraje raw en 4K más un video resumen editado, junto con fotografía fija en alta resolución del sitio.',
      },
    ],
    relatedSpokeIds: ['drone-haina-industrial-santo-domingo'],
    ctaHeadlineEn: 'Need aerial documentation for a port or industrial site?',
    ctaHeadlineEs: '¿Necesitas documentación aérea para un sitio portuario o industrial?',
    ctaValuePropEn: 'Message us with your site location and project scope — we travel island-wide for industrial and commercial drone work.',
    ctaValuePropEs: 'Escríbenos con la ubicación de tu sitio y el alcance del proyecto — viajamos a toda la isla para trabajo de drone industrial y comercial.',
    waMessageEn: 'Hello! I have a port/industrial drone project (similar to the Puerto de Manzanillo project) I would like to discuss.',
    waMessageEs: 'Hola! Tengo un proyecto de drone portuario/industrial (similar al proyecto del Puerto de Manzanillo) que me gustaría conversar.',
  },
  draftSpoke('drone-punta-cana',               'drone/punta-cana',                         'drone/punta-cana',                                     'drone-services-photography-punta-cana', 1, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('drone-cap-cana',                 'drone/cap-cana',                           'drone/cap-cana',                                       'drone-services-photography-punta-cana', 2, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('drone-santo-domingo',            'drone/santo-domingo',                      'drone/santo-domingo',                                  'drone-services-photography-punta-cana', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
  draftSpoke('drone-samana',                   'drone/samana',                             'drone/samana',                                         'drone-services-photography-punta-cana', 3, { latitude: 19.2000, longitude: -69.3400 }, 'Samaná',        'María Trinidad Sánchez'),
  draftSpoke('drone-saona-island',             'drone/saona-island',                       'drone/isla-saona',                                     'drone-services-photography-punta-cana', 2, { latitude: 18.1420, longitude: -68.7180 }, 'Isla Saona',    'La Altagracia'),
  draftSpoke('drone-wedding-dr',               'drone/wedding-drone-dominican-republic',   'drone/drone-bodas-republica-dominicana',                'drone-services-photography-punta-cana', 1, { latitude: 18.7357, longitude: -70.1627 }, 'Dominican Republic', 'Various'),
  draftSpoke('drone-real-estate',              'drone/real-estate-aerial-photography',     'drone/fotografia-aerea-inmobiliaria',                  'drone-services-photography-punta-cana', 2, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),

  // ── HUB 5: Birthday & Quinceañera ─────────────────────────────────────────
  // ✅ cumpleanos/sesion-fotos-jardin-botanico-primer-anito — status: 'published' — live
  {
    id: 'birthday-jardin-botanico-primer-anito',
    enSlug: 'birthday/first-birthday-photo-session-botanical-garden-santo-domingo',
    esSlug: 'cumpleanos/sesion-fotos-jardin-botanico-primer-anito-santo-domingo',
    hubSlug: 'birthday-photographer',
    status: 'published',
    tier: 1,
    geo: { latitude: 18.4844, longitude: -69.9394 },
    geoCity: 'Jardín Botánico Nacional',
    geoRegion: 'Santo Domingo',
    titleEn: 'First Birthday Photo Session Botanical Garden Santo Domingo | Babula Shots',
    titleEs: 'Sesión de Fotos Primer Añito Jardín Botánico Santo Domingo | Babula Shots',
    h1En: 'First Birthday Photo Session at the Santo Domingo Botanical Garden',
    h1Es: 'Sesión de Fotos de Primer Añito en el Jardín Botánico de Santo Domingo',
    hookEn: 'A full family session at the National Botanical Garden to celebrate the first year — golden light, green lawns by the pond, and the kind of candid family moments that make picking a final gallery genuinely hard.',
    hookEs: 'Una sesión familiar completa en el Jardín Botánico Nacional para celebrar el primer año — luz dorada, jardines verdes junto al estanque, y esos momentos familiares espontáneos que hacen que elegir la galería final sea genuinamente difícil.',
    descriptionEn: 'First birthday family photo session at the Santo Domingo Botanical Garden. Golden-hour portraits by the pond, candid family moments, real session from a 1-year-old\'s celebration.',
    descriptionEs: 'Sesión de fotos familiar de primer añito en el Jardín Botánico de Santo Domingo. Retratos en golden hour junto al estanque, momentos familiares espontáneos, sesión real de la celebración de 1 año.',
    keywordsEn: 'photo session jardin botanico, botanical garden photographer santo domingo, first birthday photographer santo domingo, family photo session botanical garden, one year old birthday photos DR',
    keywordsEs: 'sesion de fotos jardin botanico, fotografo jardin botanico santo domingo, fotografo primer anito santo domingo, sesion de fotos familiar jardin botanico, fotos cumpleanos 1 ano republica dominicana',
    heroImagePublicId: 'Fotografo_Jardin_Botanico_Santo_Domingo_Babula_Shots_t9vnsx',
    heroImageAltEn: 'Family celebrating a first birthday on a picnic blanket at the Santo Domingo Botanical Garden — Babula Shots',
    heroImageAltEs: 'Familia celebrando un primer añito en una manta de picnic en el Jardín Botánico de Santo Domingo — Babula Shots',
    expectCards: [
      {
        icon: '🌳',
        titleEn: 'The Japanese Garden Backdrop',
        titleEs: 'El Fondo del Jardín Japonés',
        bodyEn: 'Bonsai trees, a still pond, and a red wooden bridge — the botanical garden\'s Japanese section gives every shot a layered, cinematic backdrop no studio can match.',
        bodyEs: 'Árboles bonsái, un estanque tranquilo y un puente de madera rojo — la sección japonesa del jardín botánico le da a cada toma un fondo cinematográfico y con profundidad que ningún estudio puede igualar.',
      },
      {
        icon: '🧺',
        titleEn: 'Picnic-Style Family Setup',
        titleEs: 'Montaje Familiar Estilo Picnic',
        bodyEn: 'A blanket on the lawn, a birthday balloon, and room for a 1-year-old to actually move and play — the setup that gets genuine reactions, not posed stiffness.',
        bodyEs: 'Una manta en el césped, un globo de cumpleaños y espacio para que el bebé de 1 año realmente se mueva y juegue — el montaje que consigue reacciones genuinas, no poses forzadas.',
      },
      {
        icon: '📸',
        titleEn: 'So Many Good Ones, It\'s Hard to Choose',
        titleEs: 'Tantas Buenas, Que Es Difícil Elegir',
        bodyEn: 'This is the kind of session where almost every frame works — candid laughs, in-between moments, and posed family shots all in the same set.',
        bodyEs: 'Este es el tipo de sesión donde casi cada toma funciona — risas espontáneas, momentos intermedios y fotos familiares posadas, todo en el mismo set.',
      },
    ],
    gallery: [
      { publicId: 'Fotografo_Jardin_Botanico_Santo_Domingo_Babula_Shots_t9vnsx', altEn: 'Parents celebrating with their one-year-old on a picnic blanket at the Botanical Garden, Santo Domingo — Babula Shots', altEs: 'Padres celebrando con su bebé de un año en una manta de picnic en el Jardín Botánico, Santo Domingo — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-2_onpddb', altEn: 'Father helping his one-year-old celebrate next to a number-one balloon, Botanical Garden Santo Domingo — Babula Shots', altEs: 'Padre ayudando a su bebé de un año a celebrar junto a un globo número uno, Jardín Botánico Santo Domingo — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-3_nlulfb', altEn: 'Parents and baby sitting on a picnic blanket beside the Japanese garden pond, Santo Domingo — Babula Shots', altEs: 'Padres y bebé sentados en una manta de picnic junto al estanque del jardín japonés, Santo Domingo — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-4_gznlae', altEn: 'Candid family laughter during a first birthday session at the Botanical Garden — Babula Shots', altEs: 'Risas familiares espontáneas durante una sesión de primer añito en el Jardín Botánico — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-5_uv18uj', altEn: 'Family portrait beside the pond with a number-one balloon, Botanical Garden Santo Domingo — Babula Shots', altEs: 'Retrato familiar junto al estanque con globo número uno, Jardín Botánico Santo Domingo — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-6_wda92y', altEn: 'Father holding his one-year-old while mother looks on, Japanese garden pond backdrop — Babula Shots', altEs: 'Padre cargando a su bebé de un año mientras la madre observa, fondo del estanque del jardín japonés — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-7_mjjatw', altEn: 'Family portrait on the lawn with the Botanical Garden\'s green landscape in the background — Babula Shots', altEs: 'Retrato familiar en el césped con el paisaje verde del Jardín Botánico de fondo — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-8_v2swsz', altEn: 'Parents embracing their one-year-old on the picnic blanket, sunny day at the Botanical Garden — Babula Shots', altEs: 'Padres abrazando a su bebé de un año en la manta de picnic, día soleado en el Jardín Botánico — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-9_tjfjim', altEn: 'Family gathered together for a first birthday portrait, Botanical Garden Santo Domingo — Babula Shots', altEs: 'Familia reunida para un retrato de primer añito, Jardín Botánico Santo Domingo — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-10_pfpksq', altEn: 'Mother laughing while holding her one-year-old, natural light portrait at the Botanical Garden — Babula Shots', altEs: 'Madre riendo mientras carga a su bebé de un año, retrato con luz natural en el Jardín Botánico — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-11_ucdoao', altEn: 'Candid family moment mid-motion during a first birthday photo session — Babula Shots', altEs: 'Momento familiar espontáneo en movimiento durante una sesión de fotos de primer añito — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-12_ce3uw6', altEn: 'Family portrait beside the still pond, Japanese garden section of the Botanical Garden — Babula Shots', altEs: 'Retrato familiar junto al estanque tranquilo, sección japonesa del Jardín Botánico — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-13_s7mfqk', altEn: 'Family walking together on the Botanical Garden\'s red wooden bridge — Babula Shots', altEs: 'Familia caminando juntos sobre el puente de madera rojo del Jardín Botánico — Babula Shots' },
      { publicId: 'Session_de_fotos_santo_domingo_parque_botanico_fotografo_Babula_Shots_-14_byfiid', altEn: 'Family portrait on the red bridge over the Japanese garden pond, Santo Domingo — Babula Shots', altEs: 'Retrato familiar en el puente rojo sobre el estanque del jardín japonés, Santo Domingo — Babula Shots' },
    ],
    priceFromUsd: '250',
    priceSuffix: 'USD',
    pricingDescEn: 'First birthday family sessions at the Botanical Garden start at $250 USD for a 1-hour session with edited high-resolution gallery. Larger family groups or multi-location sessions (studio + garden) can be arranged as a custom quote.',
    pricingDescEs: 'Las sesiones familiares de primer añito en el Jardín Botánico comienzan en $250 USD por 1 hora de sesión con galería editada en alta resolución. Grupos familiares más grandes o sesiones multi-locación (estudio + jardín) se pueden coordinar como cotización personalizada.',
    whyUs: [
      { icon: '🌳', titleEn: 'We Know the Garden\'s Best Light', titleEs: 'Conocemos la Mejor Luz del Jardín', bodyEn: 'From the Japanese garden pond to the open lawns, we know exactly where and when to shoot for the softest, most flattering natural light.', bodyEs: 'Desde el estanque del jardín japonés hasta los céspedes abiertos, sabemos exactamente dónde y cuándo disparar para la luz natural más suave y favorecedora.' },
      { icon: '👶', titleEn: 'Paced for a One-Year-Old', titleEs: 'Ritmo Pensado para un Bebé de 1 Año', bodyEn: 'We work around nap schedules and short attention spans — capturing real moments instead of fighting for a forced smile.', bodyEs: 'Trabajamos alrededor de horarios de siesta y atención corta — capturando momentos reales en lugar de forzar una sonrisa.' },
      { icon: '📸', titleEn: 'Real Session, Real Results', titleEs: 'Sesión Real, Resultados Reales', bodyEn: 'Every photo on this page is from a real client\'s first birthday session — not a styled sample shoot.', bodyEs: 'Cada foto en esta página es de una sesión real de primer añito de un cliente — no un rodaje de muestra estilizado.' },
    ],
    faq: [
      {
        questionEn: 'Why the Botanical Garden instead of a studio?',
        questionEs: '¿Por qué el Jardín Botánico en lugar de un estudio?',
        answerEn: 'Natural light, green landscapes, and a real sense of space — the Botanical Garden gives a first birthday session a warmth and scale a studio backdrop can\'t replicate, especially with the Japanese garden\'s pond and bridge.',
        answerEs: 'Luz natural, paisajes verdes y una verdadera sensación de espacio — el Jardín Botánico le da a una sesión de primer añito una calidez y escala que un fondo de estudio no puede replicar, especialmente con el estanque y el puente del jardín japonés.',
      },
      {
        questionEn: 'Do I need a permit to shoot at the Botanical Garden?',
        questionEs: '¿Necesito un permiso para hacer fotos en el Jardín Botánico?',
        answerEn: 'We handle logistics and any required coordination with the garden — you just need to show up and enjoy the session.',
        answerEs: 'Nosotros manejamos la logística y cualquier coordinación necesaria con el jardín — tú solo necesitas llegar y disfrutar la sesión.',
      },
      {
        questionEn: 'Can we bring a birthday balloon or small decor?',
        questionEs: '¿Podemos llevar un globo de cumpleaños o decoración pequeña?',
        answerEn: 'Yes — a number balloon or small picnic setup works great here, as shown in this session. We\'ll guide you on what travels and photographs well.',
        answerEs: 'Sí — un globo con número o un pequeño montaje de picnic funciona muy bien aquí, como se ve en esta sesión. Te orientamos sobre qué es fácil de llevar y fotografía bien.',
      },
      {
        questionEn: 'How many edited photos do we get?',
        questionEs: '¿Cuántas fotos editadas recibimos?',
        answerEn: 'We deliver every frame worth keeping, fully edited — sessions like this one are exactly why: it\'s genuinely hard to narrow a great family session down to a fixed number.',
        answerEs: 'Entregamos cada toma que valga la pena, completamente editada — sesiones como esta son exactamente el porqué: es genuinamente difícil reducir una gran sesión familiar a un número fijo.',
      },
    ],
    relatedSpokeIds: [],
    ctaHeadlineEn: 'Ready to plan your first birthday session at the Botanical Garden?',
    ctaHeadlineEs: '¿Listo para planear tu sesión de primer añito en el Jardín Botánico?',
    ctaValuePropEn: 'Message us on WhatsApp to check availability and plan the details — timing, outfits, and any small decor you\'d like to bring.',
    ctaValuePropEs: 'Escríbenos por WhatsApp para revisar disponibilidad y planear los detalles — horario, outfits, y cualquier decoración pequeña que quieras llevar.',
    waMessageEn: 'Hello! I want to plan a first birthday family photo session at the Botanical Garden.',
    waMessageEs: 'Hola! Quiero planear una sesión de fotos familiar de primer añito en el Jardín Botánico.',
  },
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
  // ✅  events/baptism-photographer-santo-domingo — status: 'published' — live + indexed
  {
    id: 'events-baptism-sd',
    enSlug: 'events/baptism-photographer-santo-domingo',
    esSlug: 'eventos/fotografo-bautizo-santo-domingo',
    hubSlug: 'event-photography',
    status: 'published',
    tier: 2,
    bookingServiceSlug: 'birthday-event-photography__baptism',
    geo: { latitude: 18.4861, longitude: -69.9312 },
    geoCity: 'Santo Domingo',
    geoRegion: 'Distrito Nacional',

    titleEn: 'Baptism Photographer Santo Domingo, DR',
    titleEs: 'Fotógrafo de Bautizo en Santo Domingo',
    descriptionEn: "Baptism photography in Santo Domingo's colonial churches from RD$16,000 — available in every DR city. Book your baptism photographer today.",
    descriptionEs: 'Fotografía de bautizo en las iglesias coloniales de Santo Domingo desde RD$16,000 — disponible en toda República Dominicana. Reserva tu fotógrafo hoy.',
    keywordsEn: 'baptism photographer santo domingo, christening photographer dominican republic, baptism photography zona colonial, baptism photographer all dominican republic, catholic baptism photos santo domingo',
    keywordsEs: 'fotógrafo de bautizo santo domingo, fotógrafo bautizo república dominicana, fotografía de bautizo zona colonial, fotógrafo de bautizo toda república dominicana, fotos bautizo católico santo domingo',

    h1En: 'Baptism Photographer in Santo Domingo — All Dominican Republic',
    h1Es: 'Fotógrafo de Bautizo en Santo Domingo — Toda República Dominicana',
    hookEn: "Real, unposed coverage of your child's baptism in the historic stone churches of Santo Domingo's Zona Colonial — the blessing, the baptismal font, and the family portraits at the altar. RD$16,000 in Santo Domingo, RD$20,000 anywhere else in the Dominican Republic.",
    hookEs: 'Cobertura real y espontánea del bautizo de tu hijo en las iglesias históricas de piedra de la Zona Colonial de Santo Domingo — la bendición, la fuente bautismal y el retrato familiar frente al altar. RD$16,000 en Santo Domingo, RD$20,000 en cualquier otra ciudad de República Dominicana.',

    heroImagePublicId: 'v1787789555/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_4_cxhrje',
    heroImageAltEn: 'The baptism moment at the font inside a historic Zona Colonial church, Santo Domingo — Babula Shots baptism photographer',
    heroImageAltEs: 'El momento del bautizo en la fuente bautismal dentro de una iglesia histórica de la Zona Colonial, Santo Domingo — fotógrafo de bautizo Babula Shots',

    expectCards: [
      {
        icon: '⛪',
        titleEn: 'Zona Colonial Church Coverage',
        titleEs: 'Cobertura en Iglesias de la Zona Colonial',
        bodyEn: 'We regularly photograph baptisms inside the historic stone churches of the Zona Colonial — gilded Baroque altarpieces, stained glass, and centuries-old naves. We know where to stand during the rite so we never block the priest or the family\'s view.',
        bodyEs: 'Fotografiamos bautizos con regularidad dentro de las iglesias históricas de piedra de la Zona Colonial — retablos barrocos dorados, vitrales y naves centenarias. Sabemos dónde ubicarnos durante el rito para nunca obstruir al sacerdote ni la vista de la familia.',
      },
      {
        icon: '💧',
        titleEn: 'The Real Moment, Not Just Posed Portraits',
        titleEs: 'El Momento Real, No Solo Retratos Posados',
        bodyEn: "The water at the font, the priest's blessing, the baby's reaction — these seconds never repeat. We shoot documentary-style through the entire rite, then switch to portraits with the family and godparents once the ceremony ends.",
        bodyEs: 'El agua en la fuente, la bendición del sacerdote, la reacción del bebé — estos segundos no se repiten. Fotografiamos en estilo documental durante todo el rito, y luego pasamos a retratos con la familia y los padrinos al terminar la ceremonia.',
      },
      {
        icon: '🇩🇴',
        titleEn: 'Every City in the Dominican Republic',
        titleEs: 'Cualquier Ciudad de República Dominicana',
        bodyEn: 'Based in Santo Domingo, but we travel for baptisms nationwide — Santiago, Puerto Plata, La Romana, Punta Cana, and beyond. One flat travel rate covers any city outside the capital.',
        bodyEs: 'Con base en Santo Domingo, pero viajamos para bautizos a nivel nacional — Santiago, Puerto Plata, La Romana, Punta Cana y más. Una tarifa de traslado fija cubre cualquier ciudad fuera de la capital.',
      },
    ],

    gallery: [
      { publicId: 'v1787789555/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_4_cxhrje', altEn: 'The baptism moment at the font, colonial church Santo Domingo — Babula Shots', altEs: 'El momento del bautizo en la fuente bautismal, iglesia colonial de Santo Domingo — Babula Shots' },
      { publicId: 'v1787789564/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_14_hs1rlx', altEn: 'Extended family group portrait before the gilded altar after a baptism, Santo Domingo — Babula Shots', altEs: 'Retrato grupal de la familia extendida frente al altar dorado tras el bautizo, Santo Domingo — Babula Shots' },
      { publicId: 'v1787789558/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_7_a9djog', altEn: 'Priest blessing the family before the gilded Baroque altarpiece, Zona Colonial church — Babula Shots', altEs: 'Sacerdote bendiciendo a la familia frente al retablo barroco dorado, iglesia de la Zona Colonial — Babula Shots' },
      { publicId: 'v1787789560/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_9_tq0w0y', altEn: "Close-up of a priest's blessing gesture over a baby during a baptism, Santo Domingo — Babula Shots", altEs: 'Primer plano del gesto de bendición del sacerdote sobre un bebé durante el bautizo, Santo Domingo — Babula Shots' },
      { publicId: 'v1787789561/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_12_ic8dk0', altEn: 'Father and daughter arriving at a historic stone church doorway in the Zona Colonial — Babula Shots', altEs: 'Padre e hija llegando a la puerta de piedra de una iglesia histórica de la Zona Colonial — Babula Shots' },
      { publicId: 'v1787789554/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_2_hliana', altEn: 'Wide shot of a baptism ceremony inside a stone-arched colonial church nave, Santo Domingo — Babula Shots', altEs: 'Toma amplia de una ceremonia de bautizo dentro de la nave de piedra de una iglesia colonial, Santo Domingo — Babula Shots' },
      { publicId: 'v1787789555/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_5_af3w37', altEn: 'Baby at the baptismal font with holy oil, family gathered around the altar — Babula Shots', altEs: 'Bebé en la fuente bautismal con óleo sagrado, familia reunida junto al altar — Babula Shots' },
      { publicId: 'v1787789559/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_8_ez7hm7', altEn: 'Father holding his baby as the priest blesses them before the gilded altar — Babula Shots', altEs: 'Padre sosteniendo a su bebé mientras el sacerdote los bendice frente al altar dorado — Babula Shots' },
    ],

    priceFromUsd: 'RD$16,000',
    priceSuffix: '',
    pricingDescEn: 'Baptism photography in Santo Domingo starts at RD$16,000, covering the ceremony from arrival through the blessing at the font and closing family portraits at the altar. For baptisms anywhere else in the Dominican Republic — Santiago, Puerto Plata, La Romana, Punta Cana, and every other city — the rate is RD$20,000, travel included. A 50% deposit secures your date; the balance is due the day of the session. Every package includes edited high-resolution photos delivered to a private online gallery.',
    pricingDescEs: 'La fotografía de bautizo en Santo Domingo comienza en RD$16,000, cubriendo la ceremonia desde la llegada hasta la bendición en la fuente y los retratos familiares de cierre frente al altar. Para bautizos en cualquier otra ciudad de República Dominicana — Santiago, Puerto Plata, La Romana, Punta Cana y demás — la tarifa es de RD$20,000, traslado incluido. Un depósito del 50% asegura tu fecha; el saldo se paga el día de la sesión. Cada paquete incluye fotos editadas en alta resolución entregadas en una galería privada en línea.',

    whyUs: [
      { icon: '⛪', titleEn: 'Zona Colonial Specialists', titleEs: 'Especialistas en la Zona Colonial', bodyEn: 'Years photographing weddings and family events inside the Zona Colonial\'s historic churches means we already know the light, the layout, and the etiquette expected during a Catholic baptism.', bodyEs: 'Años fotografiando bodas y eventos familiares dentro de las iglesias históricas de la Zona Colonial significan que ya conocemos la luz, la disposición del espacio y la etiqueta que se espera durante un bautizo católico.' },
      { icon: '🕊️', titleEn: 'Respectful, Unobtrusive Presence', titleEs: 'Presencia Respetuosa y Discreta', bodyEn: 'We move quietly during the rite itself — no flash interrupting the priest, no stepping into the aisle. Ceremony photos are taken from a respectful distance with a long lens.', bodyEs: 'Nos movemos con discreción durante el rito — sin flash que interrumpa al sacerdote, sin invadir el pasillo. Las fotos de la ceremonia se toman a distancia respetuosa con un teleobjetivo.' },
      { icon: '🇩🇴', titleEn: 'One Flat Rate, Any DR City', titleEs: 'Una Tarifa Fija en Todo el País', bodyEn: 'RD$16,000 in Santo Domingo, RD$20,000 anywhere else in the country — no surprise travel quotes, no per-kilometer math. You know the total cost before you book.', bodyEs: 'RD$16,000 en Santo Domingo, RD$20,000 en cualquier otra ciudad del país — sin cotizaciones de traslado sorpresa, sin cálculos por kilómetro. Sabes el costo total antes de reservar.' },
      { icon: '⭐', titleEn: '4.9 Stars on Google', titleEs: '4.9 Estrellas en Google', bodyEn: '98+ Google reviews from real Dominican families. Consistent, honest feedback from clients in your exact situation.', bodyEs: '+98 reseñas de Google de familias dominicanas reales. Comentarios consistentes y honestos de clientes en tu misma situación.' },
    ],

    faq: [
      {
        questionEn: 'How much does a baptism photographer cost in Santo Domingo?',
        questionEs: '¿Cuánto cuesta un fotógrafo de bautizo en Santo Domingo?',
        answerEn: 'Baptism photography in Santo Domingo starts at RD$16,000. For baptisms in any other Dominican city — Santiago, Puerto Plata, La Romana, Punta Cana, and beyond — the rate is RD$20,000, travel included. A 50% deposit secures your date.',
        answerEs: 'La fotografía de bautizo en Santo Domingo comienza en RD$16,000. Para bautizos en cualquier otra ciudad de República Dominicana — Santiago, Puerto Plata, La Romana, Punta Cana y más — la tarifa es de RD$20,000, traslado incluido. Un depósito del 50% asegura tu fecha.',
      },
      {
        questionEn: 'Do you photograph baptisms outside Santo Domingo?',
        questionEs: '¿Fotografían bautizos fuera de Santo Domingo?',
        answerEn: "Yes — we travel to any city in the Dominican Republic for a flat RD$20,000 rate, travel included. We've covered baptisms in Santiago, Puerto Plata, La Romana, and Punta Cana, in addition to Santo Domingo.",
        answerEs: 'Sí — viajamos a cualquier ciudad de República Dominicana por una tarifa fija de RD$20,000, traslado incluido. Hemos cubierto bautizos en Santiago, Puerto Plata, La Romana y Punta Cana, además de Santo Domingo.',
      },
      {
        questionEn: 'Can you photograph inside the historic churches of the Zona Colonial?',
        questionEs: '¿Pueden fotografiar dentro de las iglesias históricas de la Zona Colonial?',
        answerEn: 'Yes. Most parish churches in the Zona Colonial allow photography during a baptism once the family has arranged it with the priest beforehand — which most families already do as part of scheduling the ceremony. We use a long lens and never use flash during the rite itself, so we stay unobtrusive throughout.',
        answerEs: 'Sí. La mayoría de las parroquias de la Zona Colonial permiten fotografía durante un bautizo una vez que la familia lo coordina previamente con el sacerdote — algo que la mayoría de las familias ya hace al agendar la ceremonia. Usamos teleobjetivo y nunca flash durante el rito, así que permanecemos discretos en todo momento.',
      },
      {
        questionEn: 'How long does baptism photography coverage last?',
        questionEs: '¿Cuánto dura la cobertura fotográfica de un bautizo?',
        answerEn: 'Standard coverage is 2 hours — enough for the arrival and family portraits beforehand, the full ceremony, and 20–30 minutes of portraits with the family and godparents at the altar once the rite is complete.',
        answerEs: 'La cobertura estándar es de 2 horas — suficiente para la llegada y retratos previos, la ceremonia completa, y 20–30 minutos de retratos con la familia y los padrinos frente al altar al terminar el rito.',
      },
      {
        questionEn: 'How soon after the baptism do we receive the photos?',
        questionEs: '¿Cuánto tiempo después del bautizo recibimos las fotos?',
        answerEn: 'You receive a quick preview gallery within 72 hours so you can share right away. The full edited gallery follows within the timeframe agreed in your booking.',
        answerEs: 'Recibes una mini galería de avance en 72 horas para que puedas compartir de inmediato. La galería completa y editada se entrega en el plazo acordado en tu reserva.',
      },
    ],

    relatedSpokeIds: ['weddings-zona-colonial-santo-domingo', 'weddings-proposal-photographer-zona-colonial-santo-domingo'],

    ctaHeadlineEn: 'Ready to book your baptism photographer?',
    ctaHeadlineEs: '¿Listo para reservar tu fotógrafo de bautizo?',
    ctaValuePropEn: 'RD$16,000 in Santo Domingo, RD$20,000 anywhere else in the Dominican Republic. Check availability and hold your date today. · ⭐ 4.9 on Google (98+ reviews)',
    ctaValuePropEs: 'RD$16,000 en Santo Domingo, RD$20,000 en cualquier otra ciudad de República Dominicana. Verifica disponibilidad y reserva tu fecha hoy. · ⭐ 4.9 en Google (+98 reseñas)',

    waMessageEn: "Hello! I'm interested in baptism photography. Can you check availability for my date?",
    waMessageEs: 'Hola! Me interesa fotografía de bautizo. ¿Pueden verificar disponibilidad para mi fecha?',
  },
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
