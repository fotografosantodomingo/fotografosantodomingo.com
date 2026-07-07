-- 2026-07-07 — Across-the-board price increase of $20 per package.
-- Applies only to real, priced SKUs; custom/quote-only packages (starting_price_usd = 0,
-- bookable_direct = false) are left untouched.
--
-- NOTE: this was also applied directly to the live DB on 2026-07-07 via the service-role
-- REST API. Migration tracking prevents a double-apply on the live instance; it exists so a
-- fresh rebuild from migrations (seed prices + this bump) lands on the correct current prices.

UPDATE public.service_packages
SET    starting_price_usd = starting_price_usd + 20
WHERE  starting_price_usd > 0;
