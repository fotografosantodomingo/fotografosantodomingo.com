-- Phase 1b: availability_rules, availability_overrides, and get_available_slots function
-- Supports multi-staff from day one; default schedule seeded for Michal Babula

BEGIN;

-- ─── availability_rules ──────────────────────────────────────────────────────
-- Weekly recurring schedule per staff member.
-- day_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday (matches JS Date.getDay())

CREATE TABLE IF NOT EXISTS public.availability_rules (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id     UUID    NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME    NOT NULL,
  end_time     TIME    NOT NULL,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT availability_rules_start_before_end CHECK (start_time < end_time),
  UNIQUE (staff_id, day_of_week)
);

-- ─── availability_overrides ───────────────────────────────────────────────────
-- Per-date overrides: block a day or set custom hours.
-- is_blocked=true overrides everything → no slots that date.
-- is_blocked=false + custom_start/end → use those hours instead of the rule.

CREATE TABLE IF NOT EXISTS public.availability_overrides (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id       UUID    NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  override_date  DATE    NOT NULL,
  is_blocked     BOOLEAN NOT NULL DEFAULT false,
  custom_start   TIME,
  custom_end     TIME,
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (staff_id, override_date)
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_availability_rules_staff_day
  ON public.availability_rules(staff_id, day_of_week)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_availability_overrides_staff_date
  ON public.availability_overrides(staff_id, override_date);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.availability_rules    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;

-- Public read (needed to render available dates/slots in booking wizard)
CREATE POLICY "availability_rules_public_read"
  ON public.availability_rules FOR SELECT USING (active = true);

CREATE POLICY "availability_overrides_public_read"
  ON public.availability_overrides FOR SELECT USING (true);

-- service_role full control
CREATE POLICY "availability_rules_service_role_all"
  ON public.availability_rules FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "availability_overrides_service_role_all"
  ON public.availability_overrides FOR ALL USING (auth.role() = 'service_role');

-- Authenticated admin full control
CREATE POLICY "availability_rules_admin_all"
  ON public.availability_rules FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "availability_overrides_admin_all"
  ON public.availability_overrides FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ─── get_available_slots function ────────────────────────────────────────────
-- Returns time slots open for booking for a given staff member, date, and
-- service duration. Slots are spaced at 60-minute intervals.
-- Logic:
--  1. Check for an override on that date:
--     - is_blocked=true → return empty
--     - custom hours provided → use those
--  2. Fall back to the availability_rule for that day_of_week
--  3. Subtract already-CONFIRMED/PENDING_PAYMENT bookings in that window

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

  -- 1. Check override for this date
  SELECT * INTO v_override
  FROM public.availability_overrides
  WHERE staff_id = p_staff_id
    AND override_date = p_date
  LIMIT 1;

  IF FOUND THEN
    IF v_override.is_blocked THEN
      RETURN; -- blocked day, no slots
    END IF;
    IF v_override.custom_start IS NOT NULL AND v_override.custom_end IS NOT NULL THEN
      v_start := v_override.custom_start;
      v_end   := v_override.custom_end;
    END IF;
  END IF;

  -- 2. Fall back to weekly rule if no override set the hours
  IF v_start IS NULL THEN
    SELECT start_time, end_time INTO v_rule
    FROM public.availability_rules
    WHERE staff_id = p_staff_id
      AND day_of_week = v_day_of_week
      AND active = true
    LIMIT 1;

    IF NOT FOUND THEN
      RETURN; -- no rule for this day
    END IF;

    v_start := v_rule.start_time;
    v_end   := v_rule.end_time;
  END IF;

  -- 3. Generate 60-min-spaced slots, filter out already-booked windows
  v_cursor := v_start;
  WHILE v_cursor + (p_duration_min * INTERVAL '1 minute') <= v_end LOOP
    v_slot_end := v_cursor + (p_duration_min * INTERVAL '1 minute');

    -- Check for overlapping confirmed/pending bookings
    IF NOT EXISTS (
      SELECT 1
      FROM public.bookings b
      WHERE b.staff_id = p_staff_id
        AND b.status IN ('PENDING_PAYMENT', 'CONFIRMED')
        AND b.starts_at < (p_date + v_slot_end)
        AND b.ends_at   > (p_date + v_cursor)
    ) THEN
      slot_time := v_cursor;
      RETURN NEXT;
    END IF;

    v_cursor := v_cursor + INTERVAL '60 minutes'; -- 60-minute slot interval
  END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── Seed: default availability for Michal Babula ────────────────────────────
-- Mon–Fri 09:00–19:00 (9am–7pm AST)
-- Saturday 10:00–17:00 (10am–5pm)
-- Sunday  11:00–16:00 (11am–4pm)

INSERT INTO public.availability_rules (staff_id, day_of_week, start_time, end_time)
SELECT
  sm.id,
  days.day,
  days.start_t::TIME,
  days.end_t::TIME
FROM
  public.staff_members sm,
  (VALUES
    (1, '09:00', '19:00'),  -- Monday
    (2, '09:00', '19:00'),  -- Tuesday
    (3, '09:00', '19:00'),  -- Wednesday
    (4, '09:00', '19:00'),  -- Thursday
    (5, '09:00', '19:00'),  -- Friday
    (6, '10:00', '17:00'),  -- Saturday
    (0, '11:00', '16:00')   -- Sunday
  ) AS days(day, start_t, end_t)
WHERE sm.name = 'Michal Babula'
ON CONFLICT (staff_id, day_of_week) DO NOTHING;

COMMIT;
