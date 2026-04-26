BEGIN;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS participants_count INT,
  ADD COLUMN IF NOT EXISTS add_drone BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.quotes
  DROP CONSTRAINT IF EXISTS quotes_form_step_reached_check;

ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_form_step_reached_check
  CHECK (form_step_reached BETWEEN 1 AND 6);

COMMIT;
