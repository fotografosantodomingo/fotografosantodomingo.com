-- ============================================================
-- Migration 027: Fix review_stats view — security_invoker
--
-- Supabase lint flags public.review_stats because PostgreSQL
-- views default to SECURITY DEFINER semantics: they run with
-- the view-owner's privileges, not the querying role's, which
-- can bypass RLS expectations.
--
-- Fix: set security_invoker = true so the view executes in the
-- context of the caller. Because reviews already has a public
-- SELECT policy (verified = true), anon and authenticated
-- users retain the same read access they had before.
--
-- Requires Postgres 15+ — Supabase projects run 15+ by default.
-- ============================================================

ALTER VIEW public.review_stats SET (security_invoker = true);
