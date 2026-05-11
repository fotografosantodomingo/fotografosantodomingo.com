-- Add optional event time (HH:MM text) to quotes.
-- The existing event_date column stores only the date; this stores the time
-- of day as a human-readable string so admins can capture "10:00 AM" etc.

BEGIN;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS event_time TEXT;

COMMIT;
