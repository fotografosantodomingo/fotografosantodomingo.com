/**
 * Portfolio types and pure helpers — safe to import from client AND server components.
 * No next/headers or other server-only APIs here.
 */

export interface PortfolioImage {
  id: string
  public_id: string
  // Localized SEO fields — edit freely in Supabase dashboard
  alt_es: string
  alt_en: string
  caption_es: string
  caption_en: string
  title_es: string   // display title AND HTML title attribute (ES)
  title_en: string   // display title AND HTML title attribute (EN)
  description_es: string
  description_en: string
  category: string
  location: string
  featured: boolean
  sort_order: number
  width: number
  height: number
}

export interface ReviewStats {
  review_count: number
  rating_value: number
}

/** Resolve all locale-specific text fields at once. Call once per image per render. */
export function resolveLocale(img: PortfolioImage, locale: string) {
  const isEs = locale === 'es'
  return {
    alt:         isEs ? img.alt_es         : img.alt_en,
    title:       isEs ? img.title_es       : img.title_en,
    caption:     isEs ? img.caption_es     : img.caption_en,
    description: isEs ? img.description_es : img.description_en,
  }
}
