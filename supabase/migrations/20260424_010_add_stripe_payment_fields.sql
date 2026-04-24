BEGIN;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;

CREATE INDEX IF NOT EXISTS quotes_stripe_session_idx
  ON public.quotes (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

COMMIT;
