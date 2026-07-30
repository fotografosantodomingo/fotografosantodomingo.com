-- "Topic" — a short label for the shoot (e.g. "Boda García", "Sesión
-- Familiar Playa"). Used as the downloaded ZIP filename and in the
-- ready/reminder emails. Nullable so existing rows aren't broken; callers
-- fall back to client_name where a topic isn't set.

BEGIN;

ALTER TABLE public.galleries
  ADD COLUMN IF NOT EXISTS topic TEXT;

COMMIT;
