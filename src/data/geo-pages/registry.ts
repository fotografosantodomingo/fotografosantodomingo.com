/**
 * Tier-1 geo URL registry — 7 unique combos × 2 locales = 14 SEO landing pages.
 *
 * Coverage chosen for highest revenue intent (weddings + real estate are
 * the best-paying photography categories on the site). Each combo's
 * geo content is sourced from the matching `geoCoverage[citySlug]` block
 * in src/data/service-content/<family>.ts — no content duplication.
 *
 * Adding a new combo:
 *   1. Verify the citySlug exists in the family's geoCoverage array
 *   2. Append to GEO_PAGES below
 *   3. Re-run build — generateStaticParams() picks it up automatically
 */

import type { GeoPage } from './types'

export const GEO_PAGES: GeoPage[] = [
  // ── WEDDING (5: 4 cities + 1 country) ─────────────────────────────────
  {
    enSlug: 'punta-cana-wedding-photographer',
    esSlug: 'fotografo-de-bodas-en-punta-cana',
    familySlug: 'wedding-photography',
    citySlug: 'punta-cana',
    cityName: { es: 'Punta Cana', en: 'Punta Cana' },
    h1Override: {
      es: 'Fotógrafo de Bodas en Punta Cana',
      en: 'Wedding Photographer in Punta Cana',
    },
    sitemapPriority: 0.9,
  },
  {
    enSlug: 'santo-domingo-wedding-photographer',
    esSlug: 'fotografo-de-bodas-en-santo-domingo',
    familySlug: 'wedding-photography',
    citySlug: 'santo-domingo',
    cityName: { es: 'Santo Domingo', en: 'Santo Domingo' },
    h1Override: {
      es: 'Fotógrafo de Bodas en Santo Domingo',
      en: 'Wedding Photographer in Santo Domingo',
    },
    sitemapPriority: 0.9,
  },
  {
    enSlug: 'cap-cana-wedding-photographer',
    esSlug: 'fotografo-de-bodas-en-cap-cana',
    familySlug: 'wedding-photography',
    citySlug: 'cap-cana',
    cityName: { es: 'Cap Cana', en: 'Cap Cana' },
    h1Override: {
      es: 'Fotógrafo de Bodas en Cap Cana',
      en: 'Wedding Photographer in Cap Cana',
    },
    sitemapPriority: 0.9,
  },
  {
    enSlug: 'casa-de-campo-wedding-photographer',
    esSlug: 'fotografo-de-bodas-en-casa-de-campo',
    familySlug: 'wedding-photography',
    citySlug: 'casa-de-campo',
    cityName: { es: 'Casa de Campo', en: 'Casa de Campo' },
    h1Override: {
      es: 'Fotógrafo de Bodas en Casa de Campo',
      en: 'Wedding Photographer in Casa de Campo',
    },
    sitemapPriority: 0.9,
  },
  {
    enSlug: 'dominican-republic-destination-wedding-photographer',
    esSlug: 'fotografo-de-bodas-destino-republica-dominicana',
    familySlug: 'wedding-photography',
    citySlug: null, // country-level aggregate
    cityName: { es: 'República Dominicana', en: 'Dominican Republic' },
    h1Override: {
      es: 'Fotógrafo de Bodas Destino en República Dominicana',
      en: 'Dominican Republic Destination Wedding Photographer',
    },
    countryContent: {
      intro: {
        es: 'República Dominicana se ha consolidado como uno de los destinos de boda más buscados del Caribe — playas blancas en Punta Cana, arquitectura colonial de quinientos años en Santo Domingo, exclusividad gated y Juanillo Beach en Cap Cana, y el pueblo mediterráneo de Altos de Chavón en Casa de Campo. Como fotógrafo basado en RD desde 2015, cubrimos bodas destino para parejas de Estados Unidos, Canadá, Europa y América Latina con coordinación bilingüe ES/EN, acreditación en los principales resorts, y entrega rápida pensada para invitados internacionales que regresan a casa al día siguiente.',
        en: 'The Dominican Republic has established itself as one of the most-searched wedding destinations in the Caribbean — white-sand beaches in Punta Cana, 500-year-old colonial architecture in Santo Domingo, gated exclusivity and Juanillo Beach in Cap Cana, and the hand-carved Mediterranean village of Altos de Chavón in Casa de Campo. As a Dominican-Republic-based photographer since 2015, we cover destination weddings for couples from the US, Canada, Europe, and Latin America with bilingual ES/EN coordination, accreditation at major resorts, and fast delivery built for international guests flying home the next day.',
      },
      cityHighlights: {
        es: [
          'Punta Cana — Resorts all-inclusive (Hard Rock, Iberostar, Excellence, Paradisus); ceremonias de playa al atardecer; mayor volumen de bodas destino del país',
          'Santo Domingo — Bodas religiosas en la Catedral Primada (la primera de América); recepciones boutique en Zona Colonial; sesión post-ceremonia en Plaza España',
          'Cap Cana — Comunidad cerrada premium; Juanillo Beach (rankeada entre las mejores del Caribe); Sanctuary, Eden Roc, Secrets, Hyatt; máxima privacidad',
          'Casa de Campo (La Romana) — Iglesia de San Estanislao consagrada por Juan Pablo II; recepción en el anfiteatro de Altos de Chavón; villas privadas con servicio de mayordomo',
        ],
        en: [
          'Punta Cana — All-inclusive resorts (Hard Rock, Iberostar, Excellence, Paradisus); sunset beach ceremonies; the country\'s largest destination-wedding volume',
          'Santo Domingo — Religious weddings at the Primada Cathedral (the Americas\' first); boutique receptions in the Colonial Zone; post-ceremony session at Plaza España',
          'Cap Cana — Premium gated community; Juanillo Beach (ranked among the Caribbean\'s best); Sanctuary, Eden Roc, Secrets, Hyatt; maximum privacy',
          'Casa de Campo (La Romana) — St. Stanislaus Church consecrated by Pope John Paul II; reception at the Altos de Chavón amphitheater; private villas with butler service',
        ],
      },
      faqs: [
        {
          question: { es: '¿Necesito visa para casarme en República Dominicana?', en: 'Do I need a visa to get married in the Dominican Republic?' },
          answer: {
            es: 'La mayoría de visitantes extranjeros (US, Canadá, UE, UK) pueden ingresar a RD sin visa por hasta 30 días con el formulario E-Ticket. Para boda civil necesitas el acta de nacimiento apostillada y traducida; para boda religiosa el resort o iglesia coordina el papeleo. Como fotógrafos no manejamos el papeleo legal — colaboramos con wedding planners de hotel que sí lo hacen.',
            en: 'Most foreign visitors (US, Canada, EU, UK) can enter DR without a visa for up to 30 days via the E-Ticket form. For a civil wedding you need an apostilled and translated birth certificate; for a religious wedding the resort or church coordinates the paperwork. As photographers we don\'t handle legal paperwork — we partner with hotel wedding planners who do.',
          },
        },
        {
          question: { es: '¿Cuál es la mejor temporada para casarse en RD?', en: 'What\'s the best season for a DR wedding?' },
          answer: {
            es: 'Diciembre a abril ofrece clima estable, baja probabilidad de lluvia y temperaturas agradables (24-29°C). Mayo a octubre es temporada de huracanes — las bodas en estos meses requieren plan B cubierto y seguro de cancelación por clima. La mejor luz fotográfica es siempre la primera y última hora del día, sin importar la temporada.',
            en: 'December–April offers stable weather, low rain probability, and comfortable temperatures (75-84°F). May–October is hurricane season — weddings in these months require a covered backup plan and weather-cancellation insurance. The best photographic light is always the first and last hour of the day, regardless of season.',
          },
        },
        {
          question: { es: '¿Pueden viajar a múltiples ciudades para una boda multi-día?', en: 'Can you travel to multiple cities for a multi-day wedding?' },
          answer: {
            es: 'Sí. Cubrimos bodas destino que combinan ciudades — por ejemplo, welcome dinner en Cap Cana viernes, ceremonia en Casa de Campo sábado, brunch despedida en Punta Cana domingo. Incluimos gastos de transporte y hospedaje en la cotización cuando aplica.',
            en: 'Yes. We cover destination weddings combining cities — e.g., welcome dinner in Cap Cana Friday, ceremony at Casa de Campo Saturday, farewell brunch in Punta Cana Sunday. We include transport and lodging in the quote when applicable.',
          },
        },
        {
          question: { es: '¿Entregan fotos rápido para que los invitados las tengan antes de volver a casa?', en: 'Can you deliver photos quickly so guests have them before flying home?' },
          answer: {
            es: 'Sí. Para bodas destino entregamos un teaser de 20-30 fotos editadas en 24 horas para que la pareja y familia puedan compartir antes del vuelo de regreso. La galería completa se entrega en 2-4 semanas según paquete.',
            en: 'Yes. For destination weddings we deliver a 20-30 photo teaser within 24 hours so the couple and family can share before flying home. The full gallery is delivered in 2-4 weeks depending on package.',
          },
        },
      ],
    },
    sitemapPriority: 0.95, // highest — captures destination wedding intl traffic
  },

  // ── REAL ESTATE (2 cities) ────────────────────────────────────────────
  {
    enSlug: 'punta-cana-real-estate-photographer',
    esSlug: 'fotografo-inmobiliario-en-punta-cana',
    familySlug: 'real-estate-drone-photography',
    citySlug: 'punta-cana',
    cityName: { es: 'Punta Cana', en: 'Punta Cana' },
    h1Override: {
      es: 'Fotógrafo Inmobiliario en Punta Cana',
      en: 'Real Estate Photographer in Punta Cana',
    },
    sitemapPriority: 0.85,
  },
  {
    enSlug: 'cap-cana-real-estate-photographer',
    esSlug: 'fotografo-inmobiliario-en-cap-cana',
    familySlug: 'real-estate-drone-photography',
    citySlug: 'cap-cana',
    cityName: { es: 'Cap Cana', en: 'Cap Cana' },
    h1Override: {
      es: 'Fotógrafo Inmobiliario en Cap Cana',
      en: 'Real Estate Photographer in Cap Cana',
    },
    sitemapPriority: 0.85,
  },
]

/** Reserved top-level slugs that cannot be used as geo slugs. */
const RESERVED_SLUGS = new Set([
  'about', 'admin', 'api', 'blog', 'book', 'contact', 'cotizaciones',
  'get-quote', 'portfolio', 'prices', 'privacy', 'proposal', 'services',
  'terms', 'sitemap.xml', 'robots.txt', 'hreflang-sitemap.xml',
  'image-sitemap.xml', '_next',
])

/** Build-time check: no geo slug clashes with a reserved top-level route. */
for (const g of GEO_PAGES) {
  if (RESERVED_SLUGS.has(g.enSlug) || RESERVED_SLUGS.has(g.esSlug)) {
    throw new Error(
      `[geo-pages] Slug clash with reserved route: ${g.enSlug} / ${g.esSlug}.`
    )
  }
}
