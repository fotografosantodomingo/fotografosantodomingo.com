-- Fix timezone bug in get_available_slots() found during Sprint 4 QA.
--
-- Bug: the original conflict check compared (p_date + v_cursor) — a naive
-- TIMESTAMP WITHOUT TIME ZONE that PostgreSQL implicitly casts to TIMESTAMPTZ
-- assuming UTC — against bookings.starts_at which is correctly stored as UTC.
-- Since slot_time / v_cursor represent AST clock times, the comparison was
-- offset by 4 hours, causing the wrong slot to be excluded.
--
-- Repro: book a slot at 14:00 AST (= 18:00 UTC). The SQL function would
-- detect the overlap at slot 18:00 AST (because it computed
-- p_date + 18:00 = '2026-04-27 18:00' interpreted as UTC, matching the
-- booking's stored UTC time) and incorrectly leave 14:00 AST as available.
--
-- Fix: anchor the (p_date + slot_time) calculation to the AST timezone
-- before comparing against TIMESTAMPTZ. `AT TIME ZONE 'America/Santo_Domingo'`
-- says "interpret this naive timestamp as AST, then convert to UTC for
-- the comparison".

BEGIN;

CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_staff_id    UUID,
  p_date        DATE,
  p_duration_min INTEGER
)
RETURNS TABLE(slot_time TIME) AS $$
DECLARE
  v_start       TIME;
  v_end         TIME;
  v_override    RECORD;
  v_rule        RECORD;
  v_cursor      TIME;
  v_slot_end    TIME;
  v_day_of_week INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date)::INTEGER;

  SELECT * INTO v_override
  FROM public.availability_overrides
  WHERE staff_id = p_staff_id
    AND override_date = p_date
  LIMIT 1;

  IF FOUND THEN
    IF v_override.is_blocked THEN
      RETURN;
    END IF;
    IF v_override.custom_start IS NOT NULL AND v_override.custom_end IS NOT NULL THEN
      v_start := v_override.custom_start;
      v_end   := v_override.custom_end;
    END IF;
  END IF;

  IF v_start IS NULL THEN
    SELECT start_time, end_time INTO v_rule
    FROM public.availability_rules
    WHERE staff_id = p_staff_id
      AND day_of_week = v_day_of_week
      AND active = true
    LIMIT 1;

    IF NOT FOUND THEN
      RETURN;
    END IF;

    v_start := v_rule.start_time;
    v_end   := v_rule.end_time;
  END IF;

  v_cursor := v_start;
  WHILE v_cursor + (p_duration_min * INTERVAL '1 minute') <= v_end LOOP
    v_slot_end := v_cursor + (p_duration_min * INTERVAL '1 minute');

    -- Conflict check — TIMEZONE-CORRECT version.
    -- (p_date + v_cursor) is a naive timestamp; AT TIME ZONE 'America/Santo_Domingo'
    -- says "this is AST", which PostgreSQL converts to UTC to compare against
    -- the TIMESTAMPTZ booking columns.
    IF NOT EXISTS (
      SELECT 1
      FROM public.bookings b
      WHERE b.staff_id = p_staff_id
        AND b.status IN ('PENDING_PAYMENT', 'CONFIRMED')
        AND b.starts_at < ((p_date + v_slot_end) AT TIME ZONE 'America/Santo_Domingo')
        AND b.ends_at   > ((p_date + v_cursor)   AT TIME ZONE 'America/Santo_Domingo')
    ) THEN
      slot_time := v_cursor;
      RETURN NEXT;
    END IF;

    v_cursor := v_cursor + INTERVAL '60 minutes';
  END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

COMMIT;
