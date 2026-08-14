/**
 * Service-page rich SEO content types.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^) and re-shaped
 * for the canonical 9-family Bugatti page. Each family that wants the rich
 * SEO treatment exports a `ServiceContent` object from a sibling file, and
 * the family page renders the optional sections when they're present.
 *
 * All content fields are bilingual ES/EN by construction.
 */

export type Bilingual = {
  es: string
  en: string
}

export type BilingualList = {
  es: string[]
  en: string[]
}

/** Image with bilingual SEO metadata. Used by heroGallery / longFormGallery /
 *  mobileHeroImage when SEO matters more than convenience. */
export type RichImage = {
  src: string
  alt: Bilingual
  caption?: Bilingual
  width?: number
  height?: number
  /** When true, renders only on mobile (hidden on md+). */
  mobileOnly?: boolean
}

export type FaqItem = {
  question: Bilingual
  answer: Bilingual
}

export type LocationRecord = {
  venue: string
  area: string
  style: Bilingual
  bestLight: Bilingual
  detail: Bilingual
  href: string
}

export type Differentiator = {
  title: Bilingual
  proof: Bilingual
}

export type ProcessStep = {
  title: Bilingual
  description: Bilingual
}

export type Testimonial = {
  role: Bilingual
  quote: Bilingual
}

export type CaseStudy = {
  title: Bilingual
  challenge: Bilingual
  solution: Bilingual
  result: Bilingual
}

export type LongFormSection = {
  title: Bilingual
  paragraphs: BilingualList
  bullets?: BilingualList
}

export type TimelineRow = {
  phase: Bilingual
  timing: Bilingual
  notes: Bilingual
}

export type LongFormContent = {
  intro: Bilingual
  introImage?: string
  sections: LongFormSection[]
  timeline?: {
    title: Bilingual
    rows: TimelineRow[]
  }
}

export type Seasonality = {
  bestMonths: Bilingual
  cautionMonths: Bilingual
  daylightNote: Bilingual
}

export type InternalLink = {
  href: string
  label: Bilingual
  description: Bilingual
}

/**
 * Conversion-sniper metadata payload (title, description, keywords) for
 * the family page's <head>. When present, the family page's generateMetadata
 * uses these instead of the DB's default tagline. Each family rotates a
 * different title syntax so the set doesn't read as a programmatic template.
 */
export type ServiceSeo = {
  title: Bilingual
  description: Bilingual
  keywords: Bilingual
}

/**
 * One geo coverage block. Renders inside the family page as an H2 anchor
 * so URLs like `/services/wedding-photography#punta-cana` are linkable and
 * deep-linkable. Each block carries:
 *  - city slug → drives the #anchor + the `?city=<slug>` CTA attribution
 *  - cityName → H2 + link labels
 *  - intro → 120-180 word geo-specific paragraph (must NOT reuse family longForm.intro)
 *  - venues → 6+ named real venues with one-line context
 *  - miniFaq → 1-2 geo-specific Q&As (rolled into family FAQPage schema)
 *  - bestSeasonNote → optional climate/timing note
 *
 * Drives:
 *  - Visible "Where we shoot" section on the family page
 *  - Service JSON-LD `areaServed` array (each city becomes a Place node)
 *  - Per-geo CTA URLs that pre-fill the booking flow with the city
 */
export type GeoBlock = {
  citySlug: string
  cityName: Bilingual
  intro: Bilingual
  venues: BilingualList
  miniFaq?: FaqItem[]
  bestSeasonNote?: Bilingual
  /** Optional gallery rendered full-bleed ABOVE the intro on the dedicated
   *  geo URL ([locale]/[hub]/page.tsx). One entry per image — Cloudinary
   *  URLs preferred. Each renders edge-to-edge with no crop, stacked on
   *  both desktop and mobile. Leave empty/undefined to skip the section. */
  images?: string[]
  /** Optional single image rendered BELOW the intro paragraph (and above
   *  the venue list) on the family page's geo-coverage section
   *  ([locale]/services/[service]/page.tsx). Use RichImage for proper
   *  bilingual SEO alt text — required for image-search ranking. */
  image?: RichImage
}

/**
 * Full SEO content payload for one family. All sections are optional —
 * the page renders only what's present, so a family can ship with just
 * a couple of sections and grow over time.
 */
export type ServiceContent = {
  /** Title + description + keywords for the family page's <head>. */
  seo?: ServiceSeo
  /** Per-city geo coverage blocks rendered as H2-anchored sections. */
  geoCoverage?: GeoBlock[]
  /** Used for FAQPage + Service knowsAbout JSON-LD. */
  knowsAbout?: BilingualList
  /** Used as Service.additionalType in JSON-LD (e.g. https://schema.org/WeddingService). */
  schemaAdditionalType?: string
  /** Optional full-bleed hero gallery rendered on the family page just
   *  above the "Why us" / differentiators section. Edge-to-edge, no crop,
   *  same on desktop and mobile. Cloudinary URLs preferred. */
  heroGallery?: string[]
  /** Optional single image rendered immediately below the hero on MOBILE
   *  ONLY (`md:hidden`). Use when the hero photo is too horizontal for
   *  small screens and you want a vertical/square crop above the fold for
   *  phone visitors.
   *
   *  Pass a string for a quick generic alt; pass an object for proper SEO
   *  alt text per photo (preferred — the renderer will use it verbatim
   *  instead of the family-title fallback). */
  mobileHeroImage?: string | RichImage
  /** Optional gallery rendered between the package grids and the longForm
   *  intro paragraph. 2 columns on desktop full-bleed, 1 column full-width
   *  on mobile, matching the homepage "Nuestro trabajo" pattern.
   *
   *  Pass `string[]` for quick seeding (alt falls back to family title +
   *  index). Pass `RichImage[]` to give every photo bilingual alt and
   *  caption text — required for SEO image-search ranking. */
  longFormGallery?: string[] | RichImage[]
  /** Eyebrow + value-prop content above the long-form. */
  differentiators?: Differentiator[]
  /** Numbered process / how-it-works. */
  processSteps?: ProcessStep[]
  /** Locations served (curated venues with light + style notes). */
  locations?: LocationRecord[]
  /** Seasonality / weather / golden-hour notes. */
  seasonality?: Seasonality
  /** Trust signals (bio, authority, testimonials, case study). */
  trust?: {
    expertBio: Bilingual
    authoritySignals: BilingualList
    testimonials: Testimonial[]
    caseStudy?: CaseStudy
  }
  /** Long-form intro + section blocks + optional timeline. */
  longForm?: LongFormContent
  /** FAQ accordion items. */
  faqs?: FaqItem[]
  /** Internal navigation links to spoke / portfolio / quote pages. */
  internalLinks?: InternalLink[]
  /** Full-bleed photo strip rendered immediately before the Proceso /
   *  "Cómo trabajamos" section. Accepts RichImage[] for bilingual SEO
   *  metadata. Images with mobileOnly:true render only on small screens. */
  preProcessGallery?: RichImage[]
}
