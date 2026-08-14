-- ============================================================================
-- Migration 045 — Email-open tracking for auto-generated final quote emails
-- ============================================================================
--
-- Separate signal from the existing `first_viewed_at` (which only fires once
-- the customer clicks through to the hosted /quotations/[slug] page). This
-- tracks the email itself being opened, via a 1x1 pixel — see
-- src/app/api/quotations/[slug]/email-open/route.ts.

BEGIN;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ;

COMMENT ON COLUMN public.quotes.email_opened_at IS 'Set the first time the customer''s email client loads the tracking pixel in sendCustomerFinalQuoteEmail. Null if never opened (or images blocked).';

COMMIT;
