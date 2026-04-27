/**
 * USD → DOP exchange rate fetcher with 24-hour Cloudflare cache.
 *
 * Source: open.er-api.com — free, no API key required, sources from
 * central banks (including the Dominican Republic). Updates daily.
 *
 * Fallback: hardcoded ~60 DOP/USD if the API is down or returns
 * something implausible (validated as 30 < rate < 200 to catch garbage).
 *
 * Stripe charges remain in USD — the rate is display-only for ES users.
 */

/** Updated quarterly. Last sanity-checked April 2026. */
const FALLBACK_USD_TO_DOP = 60.5

const RATE_API_URL = 'https://open.er-api.com/v6/latest/USD'

/** 24h cache so we never hit the API more than ~1×/day per CF region. */
const CACHE_TTL_SECONDS = 60 * 60 * 24

type RateApiResponse = {
  result?: string
  rates?: Record<string, number>
  time_last_update_utc?: string
}

export type ExchangeRate = {
  /** Number of DOP per 1 USD. */
  usdToDop: number
  /** Whether this came from the live API or the fallback constant. */
  source: 'api' | 'fallback'
  /** ISO timestamp of the rate (api response or current time for fallback). */
  asOf: string
}

/**
 * Fetch the USD→DOP rate, cached 24h via Next/Cloudflare. Never throws —
 * always returns a usable rate, falling back to a hardcoded constant if
 * the API is unreachable or returns garbage.
 */
export async function getUsdToDopRate(): Promise<ExchangeRate> {
  try {
    const res = await fetch(RATE_API_URL, {
      next: { revalidate: CACHE_TTL_SECONDS },
    })

    if (!res.ok) {
      console.warn(`[currency] rate API ${res.status} — using fallback`)
      return fallback()
    }

    const data = (await res.json()) as RateApiResponse
    const rate = data.rates?.DOP

    if (typeof rate !== 'number' || rate < 30 || rate > 200) {
      console.warn(`[currency] implausible DOP rate ${rate} — using fallback`)
      return fallback()
    }

    return {
      usdToDop: rate,
      source: 'api',
      asOf: data.time_last_update_utc ?? new Date().toISOString(),
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn(`[currency] rate fetch failed: ${msg} — using fallback`)
    return fallback()
  }
}

function fallback(): ExchangeRate {
  return {
    usdToDop: FALLBACK_USD_TO_DOP,
    source: 'fallback',
    asOf: new Date().toISOString(),
  }
}
