-- Migration 032: Sync review_stats.review_count with real Google Maps count
--
-- Google Places API returned 98 reviews on 2026-05-15 for place_id
-- ChIJwTKDbC2Jr44R_OH44Jzl5-0 ("Fotografo en Santo Domingo").
-- The reviews table only holds manually imported entries (16 rows).
-- The view now reports the Google total; rating is still computed
-- from the curated reviews in the table.

CREATE OR REPLACE VIEW public.review_stats
WITH (security_invoker = true) AS
SELECT
  98                                       AS review_count,
  ROUND(AVG(rating)::numeric, 1)           AS rating_value,
  MIN(rating)                              AS min_rating,
  MAX(rating)                              AS max_rating
FROM public.reviews
WHERE verified = true;
