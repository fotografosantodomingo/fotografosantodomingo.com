// Site constants
export const SITE_CONFIG = {
  name: 'Fotografo Santo Domingo | Babula Shots',
  url: 'https://www.fotografosantodomingo.com',
  description: 'Fotografía profesional en Santo Domingo y República Dominicana',
  ogImage: 'https://www.fotografosantodomingo.com/api/og',
}

// Contact information
// NOTE: two distinct numbers.
//  - `phone` (809) 720-9547 → LOCAL line, CALLS ONLY (tel: links). No WhatsApp here.
//  - `whatsapp` 18097789547 → dedicated WhatsApp chatbot line (wa.me links + bot).
export const CONTACT_INFO = {
  phone: '+1 (809) 720-9547',
  whatsapp: '18097789547',
  whatsappDisplay: '+1 (809) 778-9547',
  whatsappMessage: 'Hola! Me interesa una sesión de fotos.',
  address: 'C. El Conde 142, Santo Domingo 11111',
  addressShort: 'Zona Colonial, Santo Domingo',
  hours: '24/7',
  photographerName: 'Michal Babula',
}

// Social media links
export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/babulashotsrd',
  facebook: 'https://facebook.com/babulashots',
  tiktok: 'https://www.tiktok.com/@babulashots',
  linkedin: 'https://www.linkedin.com/company/fotografo-santo-domingo',
  pinterest: 'https://www.pinterest.com/FotografoEnSantoDomingo',
  trustpilot: 'https://www.trustpilot.com/review/fotografosantodomingo.com',
  youtube: 'https://youtube.com/@babulashots',
  twitter: 'https://twitter.com/babulashots',
}

// Single source of truth for every schema.org `sameAs` array on the site
// (organization/localBusiness/person generators in JsonLd.ts, spoke-schema.ts).
// Each entry confirms the same real-world entity to Google's Knowledge Graph
// and AI answer engines — add a profile here once and every schema builder
// picks it up, instead of drifting per-generator.
export const SAME_AS_LINKS: string[] = [
  SOCIAL_LINKS.instagram,
  SOCIAL_LINKS.facebook,
  SOCIAL_LINKS.tiktok,
  SOCIAL_LINKS.linkedin,
  SOCIAL_LINKS.pinterest,
  SOCIAL_LINKS.youtube,
  SOCIAL_LINKS.twitter,
  SOCIAL_LINKS.trustpilot,
  'https://g.page/r/Cfzh-OCc5eftEAE/review', // Google Business Profile reviews
  'https://share.google/aJphPsrVL2VXH9EWH', // Google Business Profile share link
]

// Business rating — single source of truth used in schema builders and page copy.
// Update count here when Google review total changes; do NOT hardcode elsewhere.
export const BUSINESS_RATING = {
  value: '4.9',
  count: '91',
  platform: 'Google',
}

// Photographer identity — single source of truth for all schema builders.
// Import PHOTOGRAPHER instead of hardcoding names, URLs, or copyright strings.
export const PHOTOGRAPHER = {
  name: 'Michal Babula',
  brandName: 'Babula Shots',
  url: 'https://www.fotografosantodomingo.com',
  aboutUrl: 'https://www.fotografosantodomingo.com/en/about',
  phone: '+18097209547',
  address: {
    street: 'C. El Conde 142',
    locality: 'Santo Domingo',
    region: 'Distrito Nacional',
    postalCode: '10210',
    country: 'DO',
  },
  license: 'https://www.fotografosantodomingo.com/en/terms',
  acquireLicensePage: 'https://www.fotografosantodomingo.com/en/contact',
  creditText: 'Babula Shots — fotografosantodomingo.com',
  instagram: 'https://www.instagram.com/babulashots',
  facebook: 'https://www.facebook.com/babulashots',
}

// Booking links
export const BOOKING_LINKS = {
  setmore: 'https://babulashotsrd.setmore.com/reserva',
  calendly: 'https://babulashotsrd.setmore.com/reserva',
}