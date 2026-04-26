-- ============================================================================
-- Migration 015 — Service families + packages + quote_requests (STRUCTURAL)
-- ============================================================================
--
-- This migration is purely additive and SAFE TO APPLY anytime. It creates the
-- new normalized schema alongside the existing `booking_services` table without
-- touching it. No data migration happens here — that's reserved for migration
-- 016 (the cutover migration) which runs AFTER the canonical package matrix
-- has been seeded.
--
-- After applying 015 the production system continues to function exactly as
-- before:
--   * existing /book wizard reads from booking_services (unchanged)
--   * existing /admin/bookings reads from bookings (unchanged)
--   * existing 3 confirmed bookings are untouched
--   * new tables sit empty, ready for seed data
--
-- Reverting: every CREATE in this file has a corresponding DROP. To roll back
-- run the bottom-of-file reversal block (commented).
--
-- Reference: BOOKING_REBUILD_BLUEPRINT.md §3.1
-- Reference: docs/service-reconciliation.md (mapping plan)
-- ============================================================================

BEGIN;

-- ─── 1. service_families ─────────────────────────────────────────────────────
-- Parent entity. Each family corresponds to one /services/<slug> SEO page
-- (with a few new families that get fresh SEO URLs).

CREATE TABLE IF NOT EXISTS public.service_families (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        NOT NULL UNIQUE,
  title_es        TEXT        NOT NULL,
  title_en        TEXT        NOT NULL,
  tagline_es      TEXT,
  tagline_en      TEXT,
  icon            TEXT        NOT NULL DEFAULT '📷',
  -- The /services/<slug> SEO URL this family corresponds to.
  -- Defaults to /services/<slug> but can be overridden if needed.
  seo_parent_url  TEXT        NOT NULL,
  -- bookable=true  → at least one package can be booked online
  -- quoteable=true → custom quote requests are accepted
  bookable        BOOLEAN     NOT NULL DEFAULT true,
  quoteable       BOOLEAN     NOT NULL DEFAULT true,
  active          BOOLEAN     NOT NULL DEFAULT true,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER service_families_updated_at
  BEFORE UPDATE ON public.service_families
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE INDEX IF NOT EXISTS idx_service_families_active_sort
  ON public.service_families(active, sort_order);

-- ─── 2. service_packages ─────────────────────────────────────────────────────
-- Child SKUs. Every bookable unit lives here. One package belongs to exactly
-- one family.

CREATE TABLE IF NOT EXISTS public.service_packages (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id              UUID        NOT NULL REFERENCES public.service_families(id) ON DELETE RESTRICT,
  slug                   TEXT        NOT NULL,
  name_es                TEXT        NOT NULL,
  name_en                TEXT        NOT NULL,
  description_short_es   TEXT,
  description_short_en   TEXT,
  -- Localized inclusion arrays. ES and EN must be parallel (same length and
  -- semantically equivalent indexing) so the UI can pair items.
  inclusions_es          TEXT[]      NOT NULL DEFAULT '{}',
  inclusions_en          TEXT[]      NOT NULL DEFAULT '{}',
  duration_min           INTEGER     NOT NULL CHECK (duration_min > 0),
  starting_price_usd     NUMERIC(10,2) NOT NULL CHECK (starting_price_usd >= 0),
  deposit_percent        INTEGER     NOT NULL DEFAULT 50 CHECK (deposit_percent BETWEEN 0 AND 100),
  -- Optional: how many photos are delivered (used in compare card "X photos")
  photo_count            INTEGER     CHECK (photo_count IS NULL OR photo_count > 0),
  -- bookable_direct=true   → shows on /book wizard
  -- custom_quote_allowed=true → /get-quote can pre-select this package
  bookable_direct        BOOLEAN     NOT NULL DEFAULT true,
  custom_quote_allowed   BOOLEAN     NOT NULL DEFAULT true,
  -- Featured = elevated on compare grid (e.g. larger card)
  featured               BOOLEAN     NOT NULL DEFAULT false,
  -- Free-text badge: 'most_booked' | 'best_value' | NULL
  popular_badge          TEXT        CHECK (popular_badge IS NULL OR popular_badge IN ('most_booked', 'best_value')),
  active                 BOOLEAN     NOT NULL DEFAULT true,
  sort_order             INTEGER     NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Slug must be unique within a family (e.g. wedding-photography:essential
  -- and beach-photography:essential can both exist).
  UNIQUE (family_id, slug)
);

CREATE TRIGGER service_packages_updated_at
  BEFORE UPDATE ON public.service_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE INDEX IF NOT EXISTS idx_service_packages_family_active_sort
  ON public.service_packages(family_id, active, sort_order);

CREATE INDEX IF NOT EXISTS idx_service_packages_bookable
  ON public.service_packages(family_id, sort_order)
  WHERE active = true AND bookable_direct = true;

-- ─── 3. quote_requests ───────────────────────────────────────────────────────
-- Replaces the flat /get-quote submission target. Captures family + package
-- context so the customer's RFQ is preselected with what they were looking at.

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Family/package context — both nullable: the customer may submit a
  -- generic RFQ (no family) or a family-only RFQ (no specific package).
  family_id       UUID        REFERENCES public.service_families(id),
  package_id      UUID        REFERENCES public.service_packages(id),
  customer_name   TEXT        NOT NULL,
  customer_email  TEXT        NOT NULL,
  customer_phone  TEXT,
  locale          TEXT        NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'en')),
  -- The customer's free-text customization needs.
  details         TEXT        NOT NULL,
  -- Optional context fields
  event_date      DATE,
  budget_usd      NUMERIC(10,2) CHECK (budget_usd IS NULL OR budget_usd >= 0),
  -- Provenance for analytics + reporting
  source_page     TEXT,
  source_cta      TEXT,
  -- Status pipeline
  status          TEXT        NOT NULL DEFAULT 'NEW'
                              CHECK (status IN ('NEW', 'REVIEWING', 'QUOTED', 'WON', 'LOST')),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE INDEX IF NOT EXISTS idx_quote_requests_status_created
  ON public.quote_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quote_requests_family
  ON public.quote_requests(family_id)
  WHERE family_id IS NOT NULL;

-- ─── 4. bookings — additive columns ──────────────────────────────────────────
-- All new columns are NULLable. Existing rows remain valid. The migration
-- 016 will backfill them for the current 3 confirmed bookings.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS family_id        UUID REFERENCES public.service_families(id),
  ADD COLUMN IF NOT EXISTS package_id       UUID REFERENCES public.service_packages(id),
  -- Frozen audit trail: { family_slug, package_slug, name_es, name_en, price_usd,
  -- deposit_percent, duration_min, photo_count, inclusions_es, inclusions_en,
  -- snapshotted_at }. See BOOKING_REBUILD_BLUEPRINT.md §2.4 for full schema.
  ADD COLUMN IF NOT EXISTS package_snapshot JSONB,
  -- Provenance
  ADD COLUMN IF NOT EXISTS source_page      TEXT,
  ADD COLUMN IF NOT EXISTS source_locale    TEXT CHECK (source_locale IS NULL OR source_locale IN ('es', 'en')),
  ADD COLUMN IF NOT EXISTS source_cta       TEXT;

-- Indexes for the new FK columns (helps admin filtering by family/package)
CREATE INDEX IF NOT EXISTS idx_bookings_family
  ON public.bookings(family_id, starts_at)
  WHERE family_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_package
  ON public.bookings(package_id, starts_at)
  WHERE package_id IS NOT NULL;

-- ─── 5. RLS policies on the new tables ──────────────────────────────────────

ALTER TABLE public.service_families  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests    ENABLE ROW LEVEL SECURITY;

-- Public read: only active rows (mirrors the booking_services pattern).
CREATE POLICY "service_families_public_read"
  ON public.service_families FOR SELECT
  USING (active = true);

CREATE POLICY "service_packages_public_read"
  ON public.service_packages FOR SELECT
  USING (active = true);

-- service_role full access (used by all API routes via createServiceClient()).
CREATE POLICY "service_families_service_role_all"
  ON public.service_families FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_packages_service_role_all"
  ON public.service_packages FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "quote_requests_service_role_all"
  ON public.quote_requests FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated admin full access (mirrors existing /admin/* surfaces).
CREATE POLICY "service_families_admin_all"
  ON public.service_families FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "service_packages_admin_all"
  ON public.service_packages FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "quote_requests_admin_all"
  ON public.quote_requests FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Anon INSERT on quote_requests (the public /get-quote form).
-- Anon does NOT get SELECT — public lookup uses service_role via API route.
CREATE POLICY "quote_requests_anon_insert"
  ON public.quote_requests FOR INSERT
  TO anon
  WITH CHECK (true);

COMMIT;

-- ============================================================================
-- REVERSAL BLOCK (do not run unless rolling back). Run as a single block.
-- ============================================================================
--
-- BEGIN;
--   DROP INDEX IF EXISTS public.idx_bookings_package;
--   DROP INDEX IF EXISTS public.idx_bookings_family;
--   ALTER TABLE public.bookings
--     DROP COLUMN IF EXISTS source_cta,
--     DROP COLUMN IF EXISTS source_locale,
--     DROP COLUMN IF EXISTS source_page,
--     DROP COLUMN IF EXISTS package_snapshot,
--     DROP COLUMN IF EXISTS package_id,
--     DROP COLUMN IF EXISTS family_id;
--   DROP TABLE IF EXISTS public.quote_requests;
--   DROP TABLE IF EXISTS public.service_packages;
--   DROP TABLE IF EXISTS public.service_families;
-- COMMIT;
-- ============================================================================
