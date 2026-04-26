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
 * Full SEO content payload for one family. All sections are optional —
 * the page renders only what's present, so a family can ship with just
 * a couple of sections and grow over time.
 */
export type ServiceContent = {
  /** Title + description + keywords for the family page's <head>. */
  seo?: ServiceSeo
  /** Used for FAQPage + Service knowsAbout JSON-LD. */
  knowsAbout?: BilingualList
  /** Used as Service.additionalType in JSON-LD (e.g. https://schema.org/WeddingService). */
  schemaAdditionalType?: string
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
}
