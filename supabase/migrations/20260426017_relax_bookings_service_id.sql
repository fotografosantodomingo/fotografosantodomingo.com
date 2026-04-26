-- 20260426017 — Slice A · Step A4: relax bookings.service_id NOT NULL
--
-- Strategy B is still in force: legacy booking_services stays untouched as
-- a BASE TABLE, the FK from bookings.service_id → booking_services.id is
-- preserved, no rename, no view, no destructive cutover.
--
-- Why this migration exists:
--   New bookings written by the canonical funnel (Slice A · Step A4) write
--   package_id + family_id + package_snapshot, but a canonical-only package
--   (one with no entries in legacy_aliases pointing at a real
--   booking_services row) cannot satisfy the legacy FK. Rather than forcing
--   a synthetic legacy row to be inserted just to keep the constraint
--   happy, we relax NOT NULL on bookings.service_id. The FK still applies
--   when the column is non-null — Postgres does not enforce FKs against
--   NULL. So:
--
--   * Old bookings keep service_id populated and pass FK as before.
--   * New bookings populated by canonical code may set service_id (when a
--     legacy_aliases mapping resolves) OR leave it NULL.
--   * The destructive cutover (drop FK + drop column) is still deferred to
--     a future migration after the legacy /admin/booking-services UI is
--     fully removed.
--
-- This is a non-destructive constraint relaxation, idempotent and safe
-- under live traffic. No row data is mutated.

ALTER TABLE public.bookings
  ALTER COLUMN service_id DROP NOT NULL;
