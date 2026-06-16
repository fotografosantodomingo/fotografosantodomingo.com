# Reviews sync — Google Business Profile + Trustpilot → /testimonials

The `/testimonials` page and the homepage rating both read from the Supabase
`reviews` table (verified rows) via `src/lib/reviews/reviews.ts` and the
`review_stats` view. `scripts/sync-reviews.cjs` keeps that table in sync with
your real Google and Trustpilot reviews. Once it runs on a schedule, the site
updates itself — no code changes when a new review comes in.

## How it degrades (so the page is never empty / never blocks launch)

`getReviews()` resolves in this order:
1. **Supabase `reviews` table** (verified) — populated by the sync job. ← goal state
2. **Google Places API** — live, but Google caps this at **5 reviews**. Works
   today with `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` + `GOOGLE_PLACE_ID` (already set).
3. **Curated fallback** — 3 hand-verified real reviews in `reviews.ts`.

So the page is live and correct **right now** on Places + curated. Wiring the
sync upgrades it to **all** reviews + auto-update.

## 1. Apply the migration

```
supabase db push      # applies 20260612036_reviews_sync_columns.sql
```

This adds `source`, `external_id`, `avatar_url`, `review_url`, `published_at`
to the existing `reviews` table (all nullable — existing rows untouched).

## 2. Google Business Profile API (all reviews)

This needs **owner OAuth**, not a service account, and Google must approve API
access for your Cloud project.

1. **Request access**: Google Cloud Console → enable **My Business Account
   Management API** + **My Business Business Information API**, then submit the
   [Business Profile API access request form](https://developers.google.com/my-business/content/prereqs).
   Approval can take a few days.
2. **OAuth client**: create an OAuth 2.0 *Desktop/Web* client. Run a one-time
   consent with scope `https://www.googleapis.com/auth/business.manage` as the
   account that **owns** the business, and capture the **refresh token**.
3. **Find IDs**: `GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts`
   → account id; then list locations → location id.
4. Put in `.env.local`:
   ```
   GOOGLE_BUSINESS_CLIENT_ID=...
   GOOGLE_BUSINESS_CLIENT_SECRET=...
   GOOGLE_BUSINESS_REFRESH_TOKEN=...
   GOOGLE_BUSINESS_ACCOUNT_ID=...
   GOOGLE_BUSINESS_LOCATION_ID=...
   ```

> Note: the project already has a Google OAuth setup for the Drive pipeline, but
> that refresh token has Drive scopes, **not** `business.manage`. You need a
> token minted with the business scope (can be the same OAuth client).

## 3. Trustpilot (paid Business plan)

1. Trustpilot Business → **Integrations / API** → create an **API key**.
2. Find your **Business Unit ID**: `GET https://api.trustpilot.com/v1/business-units/find?name=fotografosantodomingo.com&apikey=KEY`.
3. Put in `.env.local`:
   ```
   TRUSTPILOT_API_KEY=...
   TRUSTPILOT_BUSINESS_UNIT_ID=...
   ```

## 4. Run it

```
node scripts/sync-reviews.cjs --dry          # fetch + preview, no writes
node scripts/sync-reviews.cjs                 # sync both
node scripts/sync-reviews.cjs --google        # one provider
```

Each provider is **gated**: missing creds → that provider is skipped with a log,
never a crash. Upserts are idempotent on `(source, external_id)`.

## 5. Schedule it (auto-update)

Pick whichever matches your infra:

- **GitHub Actions** (`.github/workflows/`): a `schedule:` cron (e.g. daily
  `0 6 * * *`) that runs `node scripts/sync-reviews.cjs` with the secrets set as
  repo Actions secrets.
- **Supabase cron + Edge Function**, or any external scheduler hitting a small
  endpoint that runs the same fetch/upsert logic.

Daily is plenty — reviews don't arrive faster than the Places cache (1h)
refreshes the headline rating anyway.
