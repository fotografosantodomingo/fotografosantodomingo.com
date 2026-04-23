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

    priceFromUsd: '$399',
    pricingDescEn: 'Zona Colonial wedding photography starts at $399 for ceremony-only coverage. Full-day packages include getting ready, ceremony, cocktail hour, and reception. Every package includes edited high-resolution photos delivered via a private online gallery. Travel within Santo Domingo is included at no extra charge.',
    pricingDescEs: 'La fotografía de bodas en la Zona Colonial comienza en $399 para cobertura solo de ceremonia. Los paquetes de día completo incluyen preparativos, ceremonia, cóctel y recepción. Cada paquete incluye fotos editadas en alta resolución entregadas en una galería privada en línea. El traslado dentro de Santo Domingo está incluido sin costo adicional.',

    whyUs: [
      { icon: '🗺️', titleEn: 'Deep Local Knowledge', titleEs: 'Conocimiento Local Profundo', bodyEn: 'We have been photographing in the Zona Colonial since 2015. We know every courtyard, every light angle, and every hidden passage that turns into the perfect backdrop.', bodyEs: 'Llevamos fotografiando en la Zona Colonial desde 2015. Conocemos cada patio, cada ángulo de luz y cada pasaje escondido que se convierte en el fondo perfecto.' },
      { icon: '🏛️', titleEn: 'UNESCO Venue Experience', titleEs: 'Experiencia en Venues UNESCO', bodyEn: 'From the Ozama Fortress to the Cathedral of Santa María la Menor, we have photographed in all the major landmarks and know how to work within each venue\'s rules and restrictions.', bodyEs: 'Desde la Fortaleza Ozama hasta la Catedral de Santa María la Menor, hemos fotografiado en todos los monumentos principales y sabemos cómo trabajar dentro de las reglas y restricciones de cada venue.' },
      { icon: '🌤️', titleEn: 'City Weather Strategy', titleEs: 'Estrategia Climática Urbana', bodyEn: 'Santo Domingo weather is predictable once you know the patterns. We plan your timeline with the dry season (November–April) in mind and always have an indoor backup plan for Caribbean showers.', bodyEs: 'El clima de Santo Domingo es predecible una vez que conoces los patrones. Planificamos tu cronograma con la temporada seca (noviembre–abril) en mente y siempre tenemos un plan de respaldo interior para los aguaceros caribeños.' },
      { icon: '⭐', titleEn: '4.9 Stars on Google', titleEs: '4.9 Estrellas en Google', bodyEn: '91+ Google reviews from real couples who celebrated in the Dominican Republic. Consistent, honest feedback from clients in your exact situation.', bodyEs: '+91 reseñas de Google de parejas reales que celebraron en República Dominicana. Comentarios consistentes y honestos de clientes en tu misma situación.' },
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
    ctaValuePropEn: 'Santo Domingo dates fill up fast — especially for December–March peak season. Check availability and hold your date today. · ⭐ 4.9 on Google (91+ reviews)',
    ctaValuePropEs: 'Las fechas en Santo Domingo se agotan rápido — especialmente en la temporada alta de diciembre a marzo. Verifica disponibilidad y reserva tu fecha hoy. · ⭐ 4.9 en Google (+91 reseñas)',

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
    status: 'published',
    tier: 1,
    geo: { latitude: 18.7357, longitude: -70.1627 },
    geoCity: 'Dominican Republic',
    geoRegion: 'Various',
    titleEn: 'Proposal Photographer Dominican Republic | Babula Shots',
    titleEs: 'Fotógrafo de Propuesta de Matrimonio República Dominicana | Babula Shots',
    descriptionEn: 'Hidden proposal photographer across Dominican Republic. She never knows. Surprise photo album next morning. All beaches. Printed album to your hotel.',
    descriptionEs: 'Fotógrafo oculto para propuestas en República Dominicana. Ella nunca sabe. Álbum sorpresa a la mañana siguiente. Todas las playas. Álbum impreso en tu hotel.',
    keywordsEn: 'proposal photographer dominican republic, hidden proposal photographer, secret proposal photography dominican republic, surprise proposal photos punta cana, ninja proposal photographer caribbean',
    keywordsEs: 'fotografo propuesta matrimonio republica dominicana, fotografo oculto propuesta, fotografia propuesta sorpresa republica dominicana, fotos propuesta sorpresa punta cana',
    h1En: 'Secret Proposal Photographer Dominican Republic',
    h1Es: 'Fotógrafo de Propuesta Secreta República Dominicana',
    hookEn: 'She has no idea we exist. You propose. She says yes. And the next morning — she wakes up to a full photo album of the moment she never knew was being captured. Two surprises. One day apart.',
    hookEs: 'Ella no tiene idea de que existimos. Propones. Dice que sí. Y a la mañana siguiente — despierta con un álbum completo del momento que nunca supo que estaba siendo capturado. Dos sorpresas. Un día de diferencia.',
    heroImagePublicId: 'fotografo_para_propuesta_de_matrimonio_santo_domingo_punta_cana_playa_fh3htf',
    heroImageAltEn: 'Hidden proposal photographer captures surprise moment on Dominican Republic beach — Babula Shots',
    heroImageAltEs: 'Fotógrafo oculto captura momento sorpresa en playa de República Dominicana — Babula Shots',
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
        bodyEn: 'The next morning she wakes up to a full photo album of the moment she never knew was captured. Digital gallery overnight. Optional premium printed album delivered to your hotel within 48-72 hours.',
        bodyEs: 'A la mañana siguiente despierta con un álbum completo del momento que nunca supo que fue capturado. Galería digital overnight. Álbum impreso premium opcional entregado en tu hotel en 48-72 horas.',
      },
    ],
    gallery: [
      { publicId: 'fotografo_para_propuesta_de_matrimonio_santo_domingo_punta_cana_playa_fh3htf',   altEn: 'Ninja mode — photographer invisible with telephoto lens, couple has no idea — Babula Shots',                        altEs: 'Modo ninja — fotógrafo invisible con teleobjetivo, la pareja no tiene idea — Babula Shots' },
      { publicId: 'Fotografo_para_pido_la_mano_propuesta_Republica_dominicana_playa_bavaro_punta_cana_ylwdgz', altEn: 'Getting perfect position and seaview angle for hidden proposal photography — Babula Shots',                    altEs: 'Buscando posición perfecta y ángulo con vista al mar para fotografía de propuesta oculta — Babula Shots' },
      { publicId: 'fotografo_en_la_playa_servicio_propuesta_pido_la_mano_j0lrts',                  altEn: 'Full ninja mode — hidden beach photographer Dominican Republic waiting for proposal moment — Babula Shots',       altEs: 'Modo ninja completo — fotógrafo oculto en playa República Dominicana esperando el momento de la propuesta — Babula Shots' },
      { publicId: 'paquetes_de_propuesta_de_matrimonio_en_punta_cana_sqplka',                       altEn: 'Getting into position — people walking naturally in background, he is ready to propose — Babula Shots',          altEs: 'Tomando posición — personas caminando naturalmente al fondo, él está listo para proponer — Babula Shots' },
      { publicId: 'Session_de_fotos_fotografo_punta_cana_propuesta_de_matrimonio_sjrds4',           altEn: 'On one knee asking the big question — surprise proposal Punta Cana beach — Babula Shots',                       altEs: 'De rodillas haciendo la gran pregunta — propuesta sorpresa playa Punta Cana — Babula Shots' },
      { publicId: 'fotografo_punta_cana_para_propuesta_de_matrimonio_r9wkan',                       altEn: 'Ring on finger — captured secretly during beach proposal Dominican Republic — Babula Shots',                     altEs: 'Anillo en el dedo — capturado secretamente durante propuesta en playa República Dominicana — Babula Shots' },
      { publicId: 'Propuesta_de_matrimonio_playa_privada_Punta_Cana_dz3wp2',                        altEn: 'Hugs and kisses after beach proposal Punta Cana — Babula Shots',                                               altEs: 'Abrazos y besos después de la propuesta en playa Punta Cana — Babula Shots' },
      { publicId: 'sorpresa_propuesta_de_matrimonio_en_la_playa_fotografo_en_republica_dominicana_punta_cana_jkyrry', altEn: 'Still hidden — couple sitting on beach after proposal, unaware of photographer — Babula Shots', altEs: 'Aún oculto — pareja sentada en la playa después de la propuesta, sin saber del fotógrafo — Babula Shots' },
    ],
    priceFromUsd: '250',
    pricingDescEn: 'Secret proposal photography starts at $250 USD anywhere in Dominican Republic. Overnight preview gallery included. Premium printed album delivered to your hotel available as add-on. Travel to locations outside Santo Domingo and Punta Cana quoted separately.',
    pricingDescEs: 'Fotografía de propuesta secreta desde $250 USD en cualquier lugar de República Dominicana. Galería de vista previa overnight incluida. Álbum impreso premium entregado en tu hotel disponible como complemento. Traslado a locaciones fuera de Santo Domingo y Punta Cana se cotiza por separado.',
    whyUs: [
      { icon: '🥷', titleEn: '10 Years of Ninja Mode', titleEs: '10 Años en Modo Ninja', bodyEn: 'We have been doing hidden proposal photography for over 10 years across Dominican Republic. Our concealment technique has a near-perfect success record — she never sees us coming.', bodyEs: 'Llevamos más de 10 años haciendo fotografía de propuesta oculta en toda República Dominicana. Nuestra técnica de ocultamiento tiene un historial de éxito casi perfecto — ella nunca nos ve venir.' },
      { icon: '📞', titleEn: 'WhatsApp-Only Secret Coordination', titleEs: 'Coordinación Secreta Solo por WhatsApp', bodyEn: 'Everything is handled privately between you and us via WhatsApp. No shared email, no social media. Your partner never discovers the plan.', bodyEs: 'Todo se maneja privadamente entre tú y nosotros vía WhatsApp. Sin correo compartido, sin redes sociales. Tu pareja nunca descubre el plan.' },
      { icon: '🎁', titleEn: 'The Double Surprise', titleEs: 'La Doble Sorpresa', bodyEn: 'First she says yes. Then the next morning she wakes up to a full album of the moment she never knew was captured. Most clients tell us the second surprise hits harder than the proposal.', bodyEs: 'Primero dice que sí. Luego a la mañana siguiente despierta con un álbum completo del momento que nunca supo que fue capturado. La mayoría de nuestros clientes nos dice que la segunda sorpresa impacta más que la propuesta.' },
      { icon: '🏝️', titleEn: 'Island-Wide Coverage', titleEs: 'Cobertura en Toda la Isla', bodyEn: 'Punta Cana, Cap Cana, Bávaro, Isla Saona, Santo Domingo Malecón, Zona Colonial, Las Terrenas, Samaná, Casa de Campo — we travel to every beach and location across DR.', bodyEs: 'Punta Cana, Cap Cana, Bávaro, Isla Saona, Malecón Santo Domingo, Zona Colonial, Las Terrenas, Samaná, Casa de Campo — viajamos a cada playa y locación en toda la RD.' },
    ],
    faq: [
      {
        questionEn: 'How does the ninja mode process work exactly?',
        questionEs: '¿Cómo funciona exactamente el proceso en modo ninja?',
        answerEn: 'You contact us privately via WhatsApp — never by email or social media. We agree on the exact beach, date, time and a signal — usually a specific message you send when you are 10 minutes away. We arrive 45 minutes early, identify our hidden position using natural cover, and set up with a telephoto lens. When you arrive with your partner we are already invisible. You propose. We capture everything. After the moment we walk over and introduce ourselves — which is usually a second surprise for her.',
        answerEs: 'Nos contactas privadamente vía WhatsApp — nunca por correo ni redes sociales. Acordamos la playa exacta, fecha, hora y una señal — generalmente un mensaje específico que envías cuando estás a 10 minutos. Llegamos 45 minutos antes, identificamos nuestra posición oculta usando cobertura natural y nos preparamos con teleobjetivo. Cuando llegas con tu pareja ya somos invisibles. Propones. Capturamos todo. Después del momento nos acercamos y nos presentamos — lo cual suele ser una segunda sorpresa para ella.',
      },
      {
        questionEn: 'What is the double surprise?',
        questionEs: '¿Qué es la doble sorpresa?',
        answerEn: 'After the proposal we edit a preview gallery of 20-30 photos overnight and deliver it privately to you by the next morning. You choose how to show her — over breakfast, at the beach, or as a printed album waiting on the hotel pillow. She sees herself saying yes for the very first time. The reaction is always extraordinary. This is the double surprise — and most clients tell us it hits harder than the proposal itself.',
        answerEs: 'Después de la propuesta editamos una galería de vista previa de 20-30 fotos durante la noche y te la entregamos privadamente a la mañana siguiente. Tú decides cómo mostrársela — en el desayuno, en la playa o como un álbum impreso esperando en la almohada del hotel. Ella se ve a sí misma diciendo sí por primera vez. La reacción siempre es extraordinaria. Esta es la doble sorpresa — y la mayoría de nuestros clientes nos dicen que impacta más que la propuesta misma.',
      },
      {
        questionEn: 'Can I get a printed album delivered to my hotel?',
        questionEs: '¿Puedo recibir un álbum impreso en mi hotel?',
        answerEn: 'Yes — for an additional fee we produce a premium printed album and deliver it to your hotel or villa within 48-72 hours of the proposal. Available island-wide across Punta Cana, Cap Cana, Bávaro, Santo Domingo and Casa de Campo.',
        answerEs: 'Sí — por un costo adicional producimos un álbum impreso premium y lo entregamos en tu hotel o villa dentro de las 48-72 horas de la propuesta. Disponible en toda la isla: Punta Cana, Cap Cana, Bávaro, Santo Domingo y Casa de Campo.',
      },
      {
        questionEn: 'Which locations across Dominican Republic do you cover?',
        questionEs: '¿Qué locaciones en República Dominicana cubres?',
        answerEn: 'We cover every major beach and location in Dominican Republic — Punta Cana, Cap Cana, Bávaro, Isla Saona, Macao Beach, the Santo Domingo Malecón, Zona Colonial, Las Terrenas, Samaná, Casa de Campo Minitas Beach, and private villa beaches. If you have a specific location in mind contact us — we travel island-wide.',
        answerEs: 'Cubrimos todas las playas y locaciones principales de República Dominicana — Punta Cana, Cap Cana, Bávaro, Isla Saona, Playa Macao, el Malecón de Santo Domingo, Zona Colonial, Las Terrenas, Samaná, Playa Minitas en Casa de Campo y playas privadas de villas.',
      },
      {
        questionEn: 'What if my partner spots you before the proposal?',
        questionEs: '¿Qué pasa si mi pareja te ve antes de la propuesta?',
        answerEn: 'It has happened exactly once in 10 years. If she notices someone with a camera we blend in as a tourist or photographer shooting the sunset — completely normal on any Dominican beach. We never break cover unless the proposal has already happened.',
        answerEs: 'Ha pasado exactamente una vez en 10 años. Si ella nota a alguien con cámara nos mezclamos como turista o fotógrafo captando el atardecer — completamente normal en cualquier playa dominicana. Nunca rompemos la cobertura a menos que la propuesta ya haya ocurrido.',
      },
      {
        questionEn: 'How do we coordinate secretly without my partner finding out?',
        questionEs: '¿Cómo coordinamos en secreto sin que mi pareja se entere?',
        answerEn: 'Everything is handled via WhatsApp directly with you — never through shared email, social media, or any platform she might have access to. All messages are between you and us only.',
        answerEs: 'Todo se maneja vía WhatsApp directamente contigo — nunca por correo compartido, redes sociales ni ninguna plataforma a la que ella pueda tener acceso. Todos los mensajes son entre tú y nosotros únicamente.',
      },
    ],
    relatedSpokeIds: ['weddings-proposal-photographer-punta-cana', 'weddings-punta-cana', 'weddings-zona-colonial-santo-domingo'],
    ctaHeadlineEn: 'Ready to plan the secret proposal?',
    ctaHeadlineEs: '¿Listo para planear la propuesta secreta?',
    ctaValuePropEn: 'Message us via WhatsApp only — never by email. We will plan everything around your timeline, location, and the double surprise reveal.',
    ctaValuePropEs: 'Escríbenos solo por WhatsApp — nunca por correo. Planearemos todo alrededor de tu horario, locación y la doble sorpresa.',
    waMessageEn: 'Hello! I want to plan a secret proposal photography session in Dominican Republic. Can we coordinate privately?',
    waMessageEs: 'Hola! Quiero planear una sesión de fotografía de propuesta secreta en República Dominicana. ¿Podemos coordinar en privado?',
  },

  {
    id: 'weddings-proposal-photographer-punta-cana',
    enSlug: 'weddings/proposal-photographer-punta-cana',
    esSlug: 'bodas/fotografo-propuesta-matrimonio-punta-cana',
    hubSlug: 'wedding-photography',
    status: 'published',
    tier: 1,
    geo: { latitude: 18.5601, longitude: -68.3725 },
    geoCity: 'Punta Cana',
    geoRegion: 'La Altagracia',
    titleEn: 'Proposal Photographer Punta Cana | Babula Shots',
    titleEs: 'Fotógrafo de Propuesta de Matrimonio en Punta Cana | Babula Shots',
    descriptionEn: 'Secret proposal photographer in Punta Cana. Hidden coverage, surprise photo album next morning. Hard Rock, Cap Cana, Bávaro and all beaches.',
    descriptionEs: 'Fotógrafo de propuesta sorpresa en Punta Cana. Cobertura oculta, álbum sorpresa a la mañana siguiente. Hard Rock, Cap Cana, Bávaro y todas las playas.',
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
    gallery: [
      { publicId: 'fotografo_para_propuesta_de_matrimonio_en_Punta_Cana_Republica_Dominicana_buhrh3', altEn: 'Proposal photographer Punta Cana beach Dominican Republic — Babula Shots',                                   altEs: 'Fotógrafo de propuesta playa Punta Cana República Dominicana — Babula Shots' },
      { publicId: 'fotografo_en_la_playa_servicio_propuesta_pido_la_mano_j0lrts',                    altEn: 'Full ninja mode — hidden beach photographer waiting for the proposal moment Punta Cana — Babula Shots',     altEs: 'Modo ninja completo — fotógrafo oculto en playa esperando el momento de la propuesta Punta Cana — Babula Shots' },
      { publicId: 'propuersta_de_matrimonio_punta_cana_fofotgrafo_paparazzi_modo_ngunow',             altEn: 'Hidden proposal photographer ninja mode Punta Cana beach — Babula Shots',                                  altEs: 'Fotógrafo de propuesta oculto modo ninja playa Punta Cana — Babula Shots' },
      { publicId: 'paquetes_de_propuesta_de_matrimonio_en_punta_cana_sqplka',                         altEn: 'Getting into position — naturally blending with beach background, waiting for the moment — Babula Shots',    altEs: 'Tomando posición — mezclándose naturalmente con el fondo de la playa, esperando el momento — Babula Shots' },
      { publicId: 'Session_de_fotos_fotografo_punta_cana_propuesta_de_matrimonio_sjrds4',             altEn: 'On one knee asking the big question — surprise proposal Punta Cana beach — Babula Shots',                   altEs: 'De rodillas haciendo la gran pregunta — propuesta sorpresa playa Punta Cana — Babula Shots' },
      { publicId: 'fotografo_punta_cana_para_propuesta_de_matrimonio_r9wkan',                         altEn: 'Putting the ring on her finger — captured secretly during beach proposal Punta Cana — Babula Shots',        altEs: 'Poniendo el anillo en su dedo — capturado secretamente durante propuesta en playa Punta Cana — Babula Shots' },
      { publicId: 'Propuesta_de_matrimonio_playa_privada_Punta_Cana_dz3wp2',                          altEn: 'Hugs and kisses after surprise beach proposal Punta Cana private beach — Babula Shots',                     altEs: 'Abrazos y besos después de propuesta sorpresa playa privada Punta Cana — Babula Shots' },
      { publicId: 'sorpresa_propuesta_de_matrimonio_en_la_playa_fotografo_en_republica_dominicana_punta_cana_jkyrry', altEn: 'Still in ninja mode — couple sitting after proposal unaware of hidden photographer — Babula Shots', altEs: 'Aún en modo ninja — pareja sentada después de la propuesta sin saber del fotógrafo oculto — Babula Shots' },
    ],
    priceFromUsd: '250',
    pricingDescEn: 'Proposal photography in Punta Cana starts at $250 USD. Includes hidden positioning and full coverage. Overnight preview gallery included. Printed album add-on available.',
    pricingDescEs: 'Fotografía de propuesta en Punta Cana desde $250 USD. Incluye posicionamiento oculto y cobertura completa. Galería de vista previa overnight incluida. Álbum impreso disponible como complemento.',
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

  // ── HUB 2: Portrait Photography ────────────────────────────────────────────
  draftSpoke('portraits-couples-punta-cana',   'portraits/couples-punta-cana',              'retratos/parejas-punta-cana',                          'portrait-photography', 1, { latitude: 18.5601, longitude: -68.3725 }, 'Punta Cana',    'La Altagracia'),
  draftSpoke('portraits-couples-cap-cana',     'portraits/couples-cap-cana',                'retratos/parejas-cap-cana',                            'portrait-photography', 2, { latitude: 18.4732, longitude: -68.4228 }, 'Cap Cana',      'La Altagracia'),
  draftSpoke('portraits-couples-santo-domingo','portraits/couples-santo-domingo',           'retratos/parejas-santo-domingo',                       'portrait-photography', 2, { latitude: 18.4861, longitude: -69.9312 }, 'Santo Domingo', 'Distrito Nacional'),
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
