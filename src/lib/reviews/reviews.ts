import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Reviews data layer for the /testimonials page.
 *
 * Resolution order (first non-empty wins):
 *   1. Supabase `reviews` table (verified rows) — the canonical store the sync
 *      job writes to. ALL Google Business Profile + Trustpilot reviews land here
 *      once `scripts/sync-reviews.cjs` runs on a schedule. See docs/reviews-sync.md.
 *      This is the same table the `review_stats` view already aggregates, so the
 *      rating/count on the homepage updates automatically too.
 *   2. Google Places API (v1) — live, but Google only returns up to 5 reviews.
 *      Works today with NEXT_PUBLIC_GOOGLE_MAPS_API_KEY + GOOGLE_PLACE_ID.
 *   3. CURATED_REVIEWS — hand-verified fallback so the page is never empty.
 *
 * Real platform reviews are single-language (we show them as written), matching
 * the existing `reviews.review_text` + `reviews.locale` columns.
 */

export type ReviewSource = 'google' | 'trustpilot'

export interface Review {
  id: string
  author: string
  location?: string
  /** Avatar/profile photo URL (Google supplies one). */
  avatarUrl?: string
  rating: number
  /** The review text, in its original language. */
  text: string
  source: ReviewSource
  /** ISO date string when available. */
  date?: string
  /** Link back to the review/profile on its platform. */
  url?: string
}

const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID ?? 'ChIJwTKDbC2Jr44R_OH44Jzl5-0'
const TRUSTPILOT_URL = 'https://www.trustpilot.com/review/fotografosantodomingo.com'
const GOOGLE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`

/**
 * Hand-verified reviews (REAL, also shown on the About page). Guaranteed
 * fallback so the page degrades gracefully if both the table and the Places
 * API are empty.
 */
export const CURATED_REVIEWS: Review[] = [
  {
    id: 'curated-kasia-sosenko',
    author: 'Kasia Sosenko',
    rating: 5,
    text: 'Great eye, and always positive energy. European sense of photography with the Latin temper.',
    source: 'google',
    url: GOOGLE_REVIEWS_URL,
  },
  {
    id: 'curated-alessio-dattola',
    author: 'Alessio Dattola',
    rating: 5,
    text: 'The best professional photographer you can find in Santo Domingo. His unique perspective and attention to detail are unmatched.',
    source: 'google',
    url: GOOGLE_REVIEWS_URL,
  },
  {
    id: 'curated-net-z',
    author: 'NET Z',
    rating: 5,
    text: 'Babula Shots is very professional and punctual. Works efficiently in every project and is communicative from start to finish.',
    source: 'google',
    url: GOOGLE_REVIEWS_URL,
  },
]

function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } },
  )
}

// Existing `reviews` columns + columns added by 002_reviews_sync.sql (nullable).
type DbReview = {
  id: string
  reviewer_name: string | null
  reviewer_location: string | null
  rating: number | null
  review_text: string | null
  source: string | null
  avatar_url: string | null
  review_url: string | null
  published_at: string | null
  created_at: string | null
}

function fromDb(rows: DbReview[]): Review[] {
  return rows
    .filter((r) => r.review_text && typeof r.rating === 'number')
    .map((r) => ({
      id: r.id,
      author: r.reviewer_name ?? 'Anonymous',
      location: r.reviewer_location || undefined,
      avatarUrl: r.avatar_url ?? undefined,
      rating: r.rating as number,
      text: r.review_text as string,
      source: (r.source === 'trustpilot' ? 'trustpilot' : 'google') as ReviewSource,
      date: r.published_at ?? r.created_at ?? undefined,
      url: r.review_url ?? (r.source === 'trustpilot' ? TRUSTPILOT_URL : GOOGLE_REVIEWS_URL),
    }))
}

// --- Google Places API (v1) — up to 5 reviews with text -----------------------

type PlacesReview = {
  rating?: number
  publishTime?: string
  text?: { text?: string }
  originalText?: { text?: string }
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string }
}

async function fetchPlacesReviews(): Promise<Review[]> {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!mapsKey) return []
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}?fields=reviews`,
      { headers: { 'X-Goog-Api-Key': mapsKey }, next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const data = (await res.json()) as { reviews?: PlacesReview[] }
    if (!Array.isArray(data.reviews)) return []
    return data.reviews
      .filter((r) => (r.text?.text || r.originalText?.text) && typeof r.rating === 'number')
      .map((r, i) => ({
        id: `places-${i}-${r.authorAttribution?.displayName ?? 'anon'}`,
        author: r.authorAttribution?.displayName ?? 'Google user',
        avatarUrl: r.authorAttribution?.photoUri,
        rating: r.rating as number,
        text: r.text?.text ?? r.originalText?.text ?? '',
        source: 'google' as ReviewSource,
        date: r.publishTime,
        url: r.authorAttribution?.uri ?? GOOGLE_REVIEWS_URL,
      }))
  } catch {
    return []
  }
}

/**
 * Returns reviews for display, best source first. Always returns at least the
 * curated set so the page is never empty.
 */
export async function getReviews(): Promise<Review[]> {
  // 1. Canonical synced store (Google Business Profile API + Trustpilot land here).
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('id, reviewer_name, reviewer_location, rating, review_text, source, avatar_url, review_url, published_at, created_at')
      .eq('verified', true)
      .order('published_at', { ascending: false, nullsFirst: false })

    if (!error && data && data.length > 0) {
      return fromDb(data as DbReview[])
    }
  } catch {
    /* columns/table may not be migrated yet — fall through */
  }

  // 2. Live Google Places (max 5).
  const places = await fetchPlacesReviews()
  if (places.length > 0) return places

  // 3. Guaranteed fallback.
  return CURATED_REVIEWS
}

export const REVIEW_PLATFORM_LINKS = {
  google: GOOGLE_REVIEWS_URL,
  trustpilot: TRUSTPILOT_URL,
}
