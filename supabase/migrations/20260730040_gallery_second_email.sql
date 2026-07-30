-- Optional second recipient for a gallery (e.g. both members of a couple) —
-- ready/reminder emails go to both when set. Nullable; most galleries only
-- ever have one.

BEGIN;

ALTER TABLE public.galleries
  ADD COLUMN IF NOT EXISTS client_email_2 TEXT;

COMMIT;
