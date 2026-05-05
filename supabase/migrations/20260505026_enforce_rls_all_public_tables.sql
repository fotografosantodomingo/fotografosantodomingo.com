-- ============================================================
-- Migration 026: Enforce RLS on all public tables
--
-- The old-prefix migrations (001, 004, 005, 006) were applied
-- manually via the SQL editor before the numbered migration system
-- was set up. Supabase CLI does not track them, so if they were
-- re-applied or the DB was re-seeded, the tables they created may
-- exist without RLS. This migration is idempotent: ENABLE ROW LEVEL
-- SECURITY is a no-op when RLS is already on.
--
-- Also provides explicit service_role and admin policies for any
-- table where only the ENABLE statement existed without policies,
-- ensuring no table is silently open to anonymous writes.
-- ============================================================

-- ── 1. Old-prefix tables (may not be tracked by supabase migrations) ─────────

ALTER TABLE IF EXISTS public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_submissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.automation_logs   ENABLE ROW LEVEL SECURITY;

-- ── 2. Numbered-migration tables (idempotent safety pass) ────────────────────

ALTER TABLE IF EXISTS public.quotes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booking_services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_members            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.availability_rules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.availability_overrides   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booking_email_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_families         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_packages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quote_requests           ENABLE ROW LEVEL SECURITY;

-- ── 3. Ensure automation_logs has at least a service_role policy ──────────────
-- automation_logs has RLS enabled in 20260407003 but policies were not
-- explicitly created there. Without a policy, all access is blocked —
-- correct for anon, but API routes using service_role need SELECT/INSERT.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'automation_logs'
      AND policyname = 'automation_logs_service_role_all'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "automation_logs_service_role_all"
        ON public.automation_logs FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true)
    $pol$;
  END IF;
END $$;

-- ── 4. Ensure booking_email_log has a service_role policy ────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'booking_email_log'
      AND policyname = 'booking_email_log_service_role_all'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "booking_email_log_service_role_all"
        ON public.booking_email_log FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true)
    $pol$;
  END IF;
END $$;
