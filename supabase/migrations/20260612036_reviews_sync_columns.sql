-- Reviews sync: extend the existing `reviews` table so the Google Business
-- Profile + Trustpilot sync job (scripts/sync-reviews.cjs) can upsert reviews
-- without losing the existing single-language model.
--
-- All columns are nullable / defaulted, so existing rows and existing inserts
-- (e.g. manual reviews with verified=true) keep working unchanged. The
-- review_stats view (WHERE verified = true) is unaffected.

ALTER TABLE reviews
  -- 'google' | 'trustpilot' | 'manual'
  ADD COLUMN IF NOT EXISTS source       TEXT NOT NULL DEFAULT 'manual',
  -- Stable per-platform id used for idempotent upserts (dedupe on re-sync).
  ADD COLUMN IF NOT EXISTS external_id  TEXT,
  -- Reviewer profile photo (Google supplies one; Trustpilot may not).
  ADD COLUMN IF NOT EXISTS avatar_url   TEXT,
  -- Deep link back to the review / profile on its platform.
  ADD COLUMN IF NOT EXISTS review_url   TEXT,
  -- Original publish time from the platform (distinct from created_at = ingest time).
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- One row per platform review: re-running the sync updates in place.
CREATE UNIQUE INDEX IF NOT EXISTS reviews_source_external_id_uniq
  ON reviews (source, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS reviews_verified_created_idx
  ON reviews (verified, created_at DESC);
