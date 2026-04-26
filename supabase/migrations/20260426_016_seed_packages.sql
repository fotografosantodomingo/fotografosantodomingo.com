-- ============================================================================
-- Migration 016 — Seed families/packages + cutover from booking_services table
-- ============================================================================
--
-- ⚠️  STATUS: SKELETON ONLY — DO NOT APPLY AS-IS.
--
-- This file documents the cutover plan but contains NO real seed data.
-- All INSERT statements are intentionally commented out and labeled TODO.
-- The actual rows will be filled in once the user provides the canonical
-- package matrix (XLS or structured paste).
--
-- This migration is the irreversible "flag day" of the rebuild:
--   1. Inserts the canonical service_families rows
--   2. Inserts the canonical service_packages rows
--   3. Backfills the existing 3 bookings with family_id, package_id, package_snapshot
--   4. Drops the FK from bookings.service_id to the old booking_services TABLE
--   5. Drops the old booking_services TABLE
--   6. Creates a backwards-compat booking_services VIEW with the same shape
--      (so any not-yet-rewritten code keeps working until Slice E)
--
-- Reference: BOOKING_REBUILD_BLUEPRINT.md §3.2 (migration of 3 live bookings)
-- Reference: docs/service-reconciliation.md (which existing service maps to which package)
-- ============================================================================

BEGIN;

-- ─── Pre-flight: assert dependencies are satisfied ───────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                 WHERE table_schema = 'public' AND table_name = 'service_families') THEN
    RAISE EXCEPTION 'Migration 015 has not been applied — service_families table is missing.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                 WHERE table_schema = 'public' AND table_name = 'service_packages') THEN
    RAISE EXCEPTION 'Migration 015 has not been applied — service_packages table is missing.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.service_families) THEN
    RAISE EXCEPTION 'service_families is not empty — migration 016 has likely already run.';
  END IF;
END $$;

-- ─── STEP 1 · Seed service_families ──────────────────────────────────────────
-- TODO(slice-a): replace with canonical inserts from XLS.
-- Each row corresponds to one /services/<slug> SEO URL (see service-reconciliation.md §1).

-- INSERT INTO public.service_families (slug, title_es, title_en, tagline_es, tagline_en, icon, seo_parent_url, sort_order, bookable, quoteable, active) VALUES
--   ('wedding-photography',                       'Bodas',          'Wedding Photography',     '...', '...', '💍', '/services/wedding-photography', 10, true, true, true),
--   ('portrait-photography',                      'Retratos',       'Portrait Sessions',       '...', '...', '🧑‍💼', '/services/portrait-photography', 20, true, true, true),
--   ('event-photography',                         'Eventos',        'Events & Celebrations',   '...', '...', '🎉', '/services/event-photography', 30, true, true, true),
--   ('family-photography',                        'Familia',        'Family / Maternity / Children', '...', '...', '👨‍👩‍👧‍👦', '/services/family-photography', 40, true, true, true),
--   ('commercial-photography',                    'Comercial',      'Commercial / Real Estate / Food', '...', '...', '🏢', '/services/commercial-photography', 50, true, true, true),
--   ('drone-services-photography-punta-cana',     'Drone Aéreo',    'Drone Services',          '...', '...', '🚁', '/services/drone-services-photography-punta-cana', 60, true, true, true),
--   ('proposal-photography',                      'Propuesta',      'Proposal Photography',    '...', '...', '🥷', '/services/proposal-photography', 70, true, true, true),
--   ('beach-photography',                         'Playa',          'Beach Sessions',          '...', '...', '🏖️', '/services/beach-photography', 80, true, true, true),
--   ('video-production',                          'Video',          'Video Production',        '...', '...', '🎬', '/services/video-production', 90, true, true, true),
--   ('snoot-optical-creative',                    'Snoot Óptico',   'Snoot Optical Creative',  '...', '...', '💡', '/services/snoot-optical-creative', 100, true, true, true),
--   ('custom-specialty',                          'Personalizado',  'Custom Specialty',        '...', '...', '✨', '/services/custom-specialty', 110, false, true, true);

-- ─── STEP 2 · Seed service_packages ──────────────────────────────────────────
-- TODO(slice-a): replace with canonical inserts from XLS.
-- Each row references a family by slug. Inclusions are bilingual arrays.
--
-- Pattern (DO NOT EXECUTE — illustrative only):
--
-- INSERT INTO public.service_packages (
--   family_id, slug, name_es, name_en, description_short_es, description_short_en,
--   inclusions_es, inclusions_en, duration_min, starting_price_usd, deposit_percent,
--   photo_count, bookable_direct, custom_quote_allowed, featured, popular_badge, sort_order, active
-- ) VALUES
-- (
--   (SELECT id FROM public.service_families WHERE slug = 'wedding-photography'),
--   'essential',
--   'Boda Esencial',
--   'Essential Wedding',
--   'Cobertura básica de 4 horas...',
--   'Basic 4-hour coverage...',
--   ARRAY['Cobertura de 4h', 'Sesión de compromiso', '...'],
--   ARRAY['4h coverage', 'Engagement session', '...'],
--   240,
--   1000.00,
--   50,
--   80,         -- photo_count
--   true,       -- bookable_direct
--   true,       -- custom_quote_allowed
--   false,      -- featured
--   NULL,       -- popular_badge
--   10,         -- sort_order
--   true        -- active
-- );

-- ─── STEP 3 · Backfill existing bookings with family_id, package_id, package_snapshot ───
-- TODO(slice-a): map each existing service_id to its corresponding package.
-- The 3 confirmed bookings in production must come out of this step with all
-- three new fields populated. If any booking row is left with NULL family_id
-- after this step, the migration MUST roll back.
--
-- Pattern (DO NOT EXECUTE — illustrative only):
--
-- UPDATE public.bookings b
-- SET
--   family_id = (SELECT id FROM public.service_families WHERE slug = 'wedding-photography'),
--   package_id = (SELECT p.id FROM public.service_packages p
--                 JOIN public.service_families f ON f.id = p.family_id
--                 WHERE f.slug = 'wedding-photography' AND p.slug = 'essential'),
--   package_snapshot = jsonb_build_object(
--     'family_slug',     'wedding-photography',
--     'package_slug',    'essential',
--     'name_es',         'Boda Esencial',
--     'name_en',         'Essential Wedding',
--     'price_usd',       1000.00,
--     'deposit_percent', 50,
--     'duration_min',    240,
--     'photo_count',     80,
--     'inclusions_es',   ARRAY['...']::TEXT[],
--     'inclusions_en',   ARRAY['...']::TEXT[],
--     'snapshotted_at',  NOW()
--   )
-- WHERE b.service_id = (SELECT id FROM public.booking_services WHERE slug = 'weddings');
--
-- ... repeat for each existing booking_services slug → package mapping.

-- ─── STEP 4 · Verify backfill — abort if any booking is missing context ──────
-- This guard MUST stay in the migration. It prevents a half-migrated state.

-- DO $$
-- DECLARE
--   missing_count INTEGER;
-- BEGIN
--   SELECT COUNT(*) INTO missing_count
--   FROM public.bookings
--   WHERE status IN ('CONFIRMED', 'PENDING_PAYMENT', 'COMPLETED')
--     AND (family_id IS NULL OR package_id IS NULL OR package_snapshot IS NULL);
--
--   IF missing_count > 0 THEN
--     RAISE EXCEPTION 'Migration 016 cannot complete: % active booking(s) lack family/package backfill', missing_count;
--   END IF;
-- END $$;

-- ─── STEP 5 · Drop the FK constraint from bookings to the old table ──────────
-- TODO(slice-a): determine the actual constraint name via:
--   SELECT conname FROM pg_constraint
--   WHERE conrelid = 'public.bookings'::regclass AND contype = 'f'
--     AND conname LIKE '%service_id%';
--
-- Then:
-- ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_service_id_fkey;

-- ─── STEP 6 · Drop the old booking_services TABLE ────────────────────────────
-- ⚠️ This is the destructive step. After this point, only service_packages exists.
-- The bookings.service_id column is preserved (orphaned NULLable) for historical
-- reference; remove it in a future migration once we're confident nothing reads it.

-- DROP TABLE IF EXISTS public.booking_services;

-- ─── STEP 7 · Create the backwards-compat booking_services VIEW ──────────────
-- After this view exists, all code that previously read from booking_services
-- (Sprint 1-4 code: /book wizard, /api/bookings/services, /admin/bookings, etc)
-- continues to work without modification.
--
-- The view exposes the same column names with the same types as the old table.
-- Categories map to family slugs; deposit/bookable map to per-package values.

-- CREATE OR REPLACE VIEW public.booking_services AS
--   SELECT
--     p.id                           AS id,
--     p.slug                         AS slug,
--     p.name_es                      AS name_es,
--     p.name_en                      AS name_en,
--     p.description_short_es         AS description_es,
--     p.description_short_en         AS description_en,
--     f.icon                         AS icon,
--     f.slug                         AS category,
--     p.duration_min                 AS duration_min,
--     p.starting_price_usd           AS price_usd,
--     p.deposit_percent              AS deposit_percent,
--     p.bookable_direct              AS bookable,
--     p.active AND f.active          AS active,
--     p.sort_order                   AS sort_order,
--     p.created_at                   AS created_at,
--     p.updated_at                   AS updated_at
--   FROM public.service_packages p
--   JOIN public.service_families f ON f.id = p.family_id;
--
-- -- View needs RLS disabled (PostgreSQL views inherit from underlying tables —
-- -- service_packages already has RLS, so the view respects it automatically).

-- ─── STEP 8 · Final assertion — view returns at least the original 18 rows ───
-- TODO(slice-a): adjust the count to match the actual seed.

-- DO $$
-- DECLARE
--   visible INTEGER;
-- BEGIN
--   SELECT COUNT(*) INTO visible FROM public.booking_services;
--   IF visible < 18 THEN
--     RAISE EXCEPTION 'booking_services view returns only % rows; expected at least 18 (original seed count)', visible;
--   END IF;
-- END $$;

COMMIT;

-- ============================================================================
-- POST-CUTOVER REVERSAL
-- ============================================================================
-- After STEP 6 runs, the old booking_services TABLE is gone. To revert this
-- migration you must:
--   1. Drop the booking_services VIEW
--   2. Recreate the booking_services TABLE from migration 011's CREATE TABLE
--   3. Re-seed it from migration 011's INSERT block
--   4. Restore bookings.service_id FK
-- This is non-trivial. For safety, BACK UP THE PRODUCTION DB IMMEDIATELY
-- BEFORE applying migration 016 (use `npm run backup:db` or supabase db dump).
-- ============================================================================
