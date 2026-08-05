-- Client photo selection ("proofing") phase, ahead of final delivery.
-- Flow: admin uploads proofs -> 'ready for selection' -> client swipes
-- through gallery_photos marking .selected -> submits -> if selected count
-- exceeds included_photo_count, a tiered overage charge (based on multiples
-- of the included count: 2x=+25%, 3x=+50%, 4x=+75%, extrapolated beyond)
-- is billed against session_price_usd via Stripe Checkout -> admin uploads
-- final edited photos for just the selected ones -> existing 'ready'/Mark
-- ready flow, unchanged.

BEGIN;

ALTER TYPE public.gallery_status ADD VALUE IF NOT EXISTS 'selecting' AFTER 'uploading';
ALTER TYPE public.gallery_status ADD VALUE IF NOT EXISTS 'selected' AFTER 'selecting';

COMMIT;

BEGIN;

ALTER TABLE public.galleries
  -- Full session price — the basis for the overage percentage. Auto-filled
  -- from the booking's stripe_amount_usd when auto-created; admin sets it
  -- manually for freestanding galleries.
  ADD COLUMN IF NOT EXISTS session_price_usd NUMERIC(10,2) CHECK (session_price_usd IS NULL OR session_price_usd >= 0),

  ADD COLUMN IF NOT EXISTS selection_ready_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS selection_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS selection_overage_tier INTEGER NOT NULL DEFAULT 0, -- percent: 0/25/50/75/100…
  ADD COLUMN IF NOT EXISTS selection_overage_amount_usd NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS selection_payment_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (selection_payment_status IN ('not_required', 'pending', 'paid')),
  ADD COLUMN IF NOT EXISTS stripe_overage_session_id TEXT;

ALTER TABLE public.gallery_photos
  ADD COLUMN IF NOT EXISTS selected BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_gallery_photos_selected ON public.gallery_photos(gallery_id, selected);

COMMIT;
