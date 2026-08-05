-- How many photos are included free in the client's package — the
-- foundation for the upcoming selection/overage-billing feature (client
-- picks favorites; anything past this count triggers a tiered surcharge).
-- Nullable so existing galleries and freestanding ones without a package
-- aren't broken; set at creation (or inherited from the booking's
-- package_snapshot.photo_count) and editable afterward.

BEGIN;

ALTER TABLE public.galleries
  ADD COLUMN IF NOT EXISTS included_photo_count INTEGER
    CHECK (included_photo_count IS NULL OR included_photo_count > 0);

COMMIT;
