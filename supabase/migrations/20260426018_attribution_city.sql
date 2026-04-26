-- Migration 018 — attribution_city on bookings + quote_requests (STRUCTURAL, additive)
--
-- Captures which geo block on a family page drove a booking or quote.
-- Set via the `?city=<slug>` query param on geo-coverage CTAs (e.g.
-- /book?service=wedding-photography&city=punta-cana&cta=geo-block-punta-cana).
--
-- Strategy B: additive only. NULLable, no default backfill required.
-- Existing rows get NULL; new rows from the wizards may include the slug.
-- City slugs are unconstrained text (matches whatever the registry emits)
-- so adding a new geo never requires another migration.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS attribution_city TEXT NULL;

ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS attribution_city TEXT NULL;

-- Loose indexes — used by admin views to filter by attribution.
CREATE INDEX IF NOT EXISTS idx_bookings_attribution_city
  ON public.bookings(attribution_city)
  WHERE attribution_city IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quote_requests_attribution_city
  ON public.quote_requests(attribution_city)
  WHERE attribution_city IS NOT NULL;

COMMENT ON COLUMN public.bookings.attribution_city IS
  'Geo-coverage CTA city slug (e.g. punta-cana). NULL when booking did not originate from a geo block.';

COMMENT ON COLUMN public.quote_requests.attribution_city IS
  'Geo-coverage CTA city slug (e.g. punta-cana). NULL when quote did not originate from a geo block.';
