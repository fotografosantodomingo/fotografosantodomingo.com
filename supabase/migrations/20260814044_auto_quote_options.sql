-- ============================================================================
-- Migration 044 — Auto dual-quote options for /get-quote leads
-- ============================================================================
--
-- Extends `quotes` (the existing hosted-proposal / Stripe-checkout table, so
-- far only reachable from the WhatsApp-bot manual flow) so it can also hold
-- system-generated quote options tied back to a `quote_requests` row, and so
-- an approved auto-quote can hold a real slot on the booking calendar.
--
-- Additive only — no enum changes, no data migration, existing rows unaffected.

BEGIN;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS quote_request_id UUID REFERENCES public.quote_requests(id),
  ADD COLUMN IF NOT EXISTS option_label      TEXT CHECK (option_label IN ('cheaper', 'premium')),
  ADD COLUMN IF NOT EXISTS auto_generated    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS family_id         UUID REFERENCES public.service_families(id),
  ADD COLUMN IF NOT EXISTS package_id        UUID REFERENCES public.service_packages(id),
  ADD COLUMN IF NOT EXISTS booking_id        UUID REFERENCES public.bookings(id);

CREATE INDEX IF NOT EXISTS quotes_quote_request_id_idx
  ON public.quotes (quote_request_id) WHERE quote_request_id IS NOT NULL;

COMMENT ON COLUMN public.quotes.quote_request_id IS 'Links an auto-generated quote option back to the /get-quote lead it was drafted from. Null for manually-drafted (WhatsApp-bot) quotes.';
COMMENT ON COLUMN public.quotes.option_label IS 'cheaper | premium — which of the two auto-generated tiers this row is. Null for manually-drafted quotes.';
COMMENT ON COLUMN public.quotes.auto_generated IS 'true when this row was system-drafted from a quote_requests lead (vs. manually drafted via the WhatsApp bot / admin panel).';
COMMENT ON COLUMN public.quotes.booking_id IS 'Set at admin-approve time once a bookings row is inserted to hold the slot. Null for manually-drafted quotes (pre-existing gap, out of scope here).';

COMMIT;
