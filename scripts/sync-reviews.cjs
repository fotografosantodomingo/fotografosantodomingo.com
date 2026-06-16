#!/usr/bin/env node
/**
 * Review sync — pulls reviews from Google Business Profile + Trustpilot and
 * upserts them into the Supabase `reviews` table. The /testimonials page and
 * the `review_stats` view read from that table, so the site updates itself.
 *
 *   node scripts/sync-reviews.cjs            # sync both (whatever has creds)
 *   node scripts/sync-reviews.cjs --google   # only Google
 *   node scripts/sync-reviews.cjs --trustpilot
 *   node scripts/sync-reviews.cjs --dry      # fetch + print, do not write
 *
 * Idempotent: rows are upserted on (source, external_id), so re-running just
 * refreshes. New reviews appear; edited reviews update; nothing duplicates.
 *
 * Each provider is GATED on its credentials. If they're missing, that provider
 * is skipped with a clear message — the script never crashes for lack of keys.
 *
 * Required env in .env.local
 * ──────────────────────────
 * Supabase (always):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Google Business Profile (all reviews):
 *   GOOGLE_BUSINESS_CLIENT_ID
 *   GOOGLE_BUSINESS_CLIENT_SECRET
 *   GOOGLE_BUSINESS_REFRESH_TOKEN     # OAuth refresh token for the owner account
 *   GOOGLE_BUSINESS_ACCOUNT_ID        # numeric account id
 *   GOOGLE_BUSINESS_LOCATION_ID       # numeric location id
 *   (scope needed when minting the token: https://www.googleapis.com/auth/business.manage)
 *
 * Trustpilot Business (requires a paid plan API key):
 *   TRUSTPILOT_API_KEY
 *   TRUSTPILOT_BUSINESS_UNIT_ID
 *
 * See docs/reviews-sync.md for the full setup + cron instructions.
 */

const fs = require('node:fs')
const path = require('node:path')

const ARGS = process.argv.slice(2)
const DRY = ARGS.includes('--dry')
const ONLY_GOOGLE = ARGS.includes('--google')
const ONLY_TP = ARGS.includes('--trustpilot')
const wantGoogle = !ONLY_TP
const wantTrustpilot = !ONLY_GOOGLE

// ─── Load .env.local ────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return {}
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split('\n')
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => {
        const i = l.indexOf('=')
        let v = l.slice(i + 1).trim()
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        return [l.slice(0, i).trim(), v]
      }),
  )
}
const env = { ...loadEnv(), ...process.env }

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

const STAR_WORDS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }

// ─── Google Business Profile ────────────────────────────────────────────────
async function fetchGoogleReviews() {
  const need = ['GOOGLE_BUSINESS_CLIENT_ID', 'GOOGLE_BUSINESS_CLIENT_SECRET', 'GOOGLE_BUSINESS_REFRESH_TOKEN', 'GOOGLE_BUSINESS_ACCOUNT_ID', 'GOOGLE_BUSINESS_LOCATION_ID']
  const missing = need.filter(k => !env[k])
  if (missing.length) {
    console.log(`⏭  Google: skipped (missing ${missing.join(', ')})`)
    return []
  }

  // 1. Refresh access token.
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_BUSINESS_CLIENT_ID,
      client_secret: env.GOOGLE_BUSINESS_CLIENT_SECRET,
      refresh_token: env.GOOGLE_BUSINESS_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  if (!tokenRes.ok) {
    console.error(`✗ Google token refresh failed: ${tokenRes.status} ${await tokenRes.text()}`)
    return []
  }
  const { access_token } = await tokenRes.json()

  // 2. Page through reviews.
  const base = `https://mybusiness.googleapis.com/v4/accounts/${env.GOOGLE_BUSINESS_ACCOUNT_ID}/locations/${env.GOOGLE_BUSINESS_LOCATION_ID}/reviews`
  const out = []
  let pageToken
  do {
    const url = base + (pageToken ? `?pageToken=${pageToken}` : '')
    const res = await fetch(url, { headers: { Authorization: `Bearer ${access_token}` } })
    if (!res.ok) {
      console.error(`✗ Google reviews fetch failed: ${res.status} ${await res.text()}`)
      break
    }
    const data = await res.json()
    for (const r of data.reviews || []) {
      const text = (r.comment || '').trim()
      if (!text) continue // skip star-only ratings
      out.push({
        source: 'google',
        external_id: r.reviewId,
        reviewer_name: r.reviewer?.displayName || 'Google user',
        reviewer_location: '',
        avatar_url: r.reviewer?.profilePhotoUrl || null,
        rating: STAR_WORDS[r.starRating] || 5,
        review_text: text,
        review_url: env.GOOGLE_BUSINESS_REVIEWS_URL || null,
        published_at: r.createTime || null,
        locale: 'es',
        service_type: 'general',
        verified: true,
      })
    }
    pageToken = data.nextPageToken
  } while (pageToken)

  console.log(`✓ Google: ${out.length} reviews with text`)
  return out
}

// ─── Trustpilot ─────────────────────────────────────────────────────────────
async function fetchTrustpilotReviews() {
  const need = ['TRUSTPILOT_API_KEY', 'TRUSTPILOT_BUSINESS_UNIT_ID']
  const missing = need.filter(k => !env[k])
  if (missing.length) {
    console.log(`⏭  Trustpilot: skipped (missing ${missing.join(', ')})`)
    return []
  }

  const out = []
  let page = 1
  const perPage = 100
  // Public Business Unit reviews endpoint (apikey auth).
  for (;;) {
    const url = `https://api.trustpilot.com/v1/business-units/${env.TRUSTPILOT_BUSINESS_UNIT_ID}/reviews?apikey=${env.TRUSTPILOT_API_KEY}&perPage=${perPage}&page=${page}`
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`✗ Trustpilot fetch failed: ${res.status} ${await res.text()}`)
      break
    }
    const data = await res.json()
    const reviews = data.reviews || []
    for (const r of reviews) {
      const text = (r.text || r.title || '').trim()
      if (!text) continue
      out.push({
        source: 'trustpilot',
        external_id: r.id,
        reviewer_name: r.consumer?.displayName || 'Trustpilot user',
        reviewer_location: r.consumer?.countryCode || '',
        avatar_url: null,
        rating: r.stars || 5,
        review_text: text,
        review_url: `https://www.trustpilot.com/reviews/${r.id}`,
        published_at: r.createdAt || null,
        locale: (r.language === 'en' ? 'en' : 'es'),
        service_type: 'general',
        verified: true,
      })
    }
    if (reviews.length < perPage) break
    page++
  }

  console.log(`✓ Trustpilot: ${out.length} reviews with text`)
  return out
}

// ─── Upsert into Supabase (PostgREST) ───────────────────────────────────────
async function upsert(rows) {
  if (rows.length === 0) return
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — cannot write')
    process.exit(1)
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?on_conflict=source,external_id`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    console.error(`✗ Supabase upsert failed: ${res.status} ${await res.text()}`)
    process.exit(1)
  }
  console.log(`✓ Upserted ${rows.length} reviews into Supabase`)
}

// ─── Run ────────────────────────────────────────────────────────────────────
;(async () => {
  console.log(`▶ Review sync${DRY ? ' (dry run)' : ''}`)
  const rows = []
  if (wantGoogle) rows.push(...await fetchGoogleReviews())
  if (wantTrustpilot) rows.push(...await fetchTrustpilotReviews())

  if (rows.length === 0) {
    console.log('No reviews fetched (no provider creds configured). Nothing to do.')
    return
  }
  if (DRY) {
    console.log(JSON.stringify(rows.slice(0, 5), null, 2))
    console.log(`… ${rows.length} total (dry run, not written)`)
    return
  }
  await upsert(rows)
})().catch(e => { console.error(e); process.exit(1) })
