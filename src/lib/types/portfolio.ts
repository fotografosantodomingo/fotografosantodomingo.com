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
  // AI generation tracking — added by migration 003
  ai_generated?: boolean
  ai_generated_at?: string | null
  seo_keywords?: string
}

export interface ReviewStats {
  review_count: number
  rating_value: number
}

/** Resolve all locale-specific text fields at once. Call once per image per render.
 *
 * If a non-default locale (currently only EN) is missing data on a given
 * field, fall back to the ES value rather than rendering blank text. This
 * prevents the "/en/portfolio shows nothing" failure mode when the
 * portfolio_images table has incomplete EN translations.
 */
export function resolveLocale(img: PortfolioImage, locale: string) {
  const isEs = locale === 'es'
  const pickEn = (en: string | null | undefined, es: string) =>
    en && en.trim().length > 0 ? en : es
  return {
    alt:         isEs ? img.alt_es         : pickEn(img.alt_en,         img.alt_es),
    title:       isEs ? img.title_es       : pickEn(img.title_en,       img.title_es),
    caption:     isEs ? img.caption_es     : pickEn(img.caption_en,     img.caption_es),
    description: isEs ? img.description_es : pickEn(img.description_en, img.description_es),
  }
}
