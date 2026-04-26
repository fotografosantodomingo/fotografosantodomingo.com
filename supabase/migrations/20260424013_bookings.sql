-- Phase 1c: bookings table + booking_email_log table + enums + RLS + indexes
-- 50% deposit model. Stripe always charged in USD. DOP is display-only.

BEGIN;

-- ─── Enums ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE public.booking_status AS ENUM (
      'PENDING_PAYMENT',  -- slot reserved, awaiting Stripe payment
      'CONFIRMED',        -- payment received, appointment confirmed
      'CANCELLED',        -- cancelled by customer or admin
      'COMPLETED',        -- session has taken place
      'NO_SHOW'           -- customer did not show up
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_email_type') THEN
    CREATE TYPE public.booking_email_type AS ENUM (
      'CONFIRMATION',         -- sent immediately after deposit payment
      'REMINDER_24H',         -- sent 24h before starts_at
      'REMINDER_SAME_DAY',    -- sent morning of starts_at
      'POST_SESSION',         -- sent ~2h after ends_at, includes review links
      'ADMIN_ALERT',          -- sent to admin on new booking
      'CANCELLATION'          -- sent to customer on cancellation
    );
  END IF;
END $$;

-- ─── bookings table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bookings (
  id                        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

  -- service + staff
  service_id                UUID            NOT NULL REFERENCES public.booking_services(id),
  staff_id                  UUID            NOT NULL REFERENCES public.staff_members(id),

  -- customer
  customer_name             TEXT            NOT NULL,
  customer_email            TEXT            NOT NULL,
  customer_phone            TEXT,
  locale                    TEXT            NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'en')),

  -- scheduling (stored in UTC, displayed in AST = UTC-4)
  starts_at                 TIMESTAMPTZ     NOT NULL,
  ends_at                   TIMESTAMPTZ     NOT NULL,
  CONSTRAINT bookings_start_before_end CHECK (starts_at < ends_at),

  -- lifecycle
  status                    public.booking_status NOT NULL DEFAULT 'PENDING_PAYMENT',

  -- payment — Stripe charge is ALWAYS in USD; DOP is for display only
  stripe_payment_intent_id  TEXT            UNIQUE,
  stripe_charge_id          TEXT,
  stripe_amount_usd         NUMERIC(10,2),      -- FULL service price in USD
  deposit_amount_usd        NUMERIC(10,2),      -- 50% deposited via Stripe
  currency_display          TEXT            NOT NULL DEFAULT 'USD' CHECK (currency_display IN ('USD', 'DOP')),
  dop_rate                  NUMERIC(12,4),      -- exchange rate snapshot at booking time (for display only)

  -- policy acceptance
  terms_accepted            BOOLEAN         NOT NULL DEFAULT false,
  terms_accepted_at         TIMESTAMPTZ,

  -- automated email flags (set by cron jobs to prevent duplicates)
  reminder_24h_sent         BOOLEAN         NOT NULL DEFAULT false,
  reminder_same_day_sent    BOOLEAN         NOT NULL DEFAULT false,
  post_session_sent         BOOLEAN         NOT NULL DEFAULT false,

  -- admin fields
  admin_notes               TEXT,
  cancellation_reason       TEXT,
  cancelled_at              TIMESTAMPTZ,
  refund_amount_usd         NUMERIC(10,2),

  created_at                TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─── booking_email_log ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.booking_email_log (
  id              UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID                      NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  email_type      public.booking_email_type NOT NULL,
  recipient_email TEXT                      NOT NULL,
  locale          TEXT                      NOT NULL DEFAULT 'es',
  resend_id       TEXT,   -- Resend message ID for tracking
  sent_at         TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  error           TEXT    -- populated if send failed
);

-- ─── updated_at trigger ──────────────────────────────────────────────────────

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ─── Indexes ─────────────────────────────────────────────────────────────────

-- Admin list views
CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON public.bookings(status);

CREATE INDEX IF NOT EXISTS idx_bookings_starts_at
  ON public.bookings(starts_at);

CREATE INDEX IF NOT EXISTS idx_bookings_staff_starts
  ON public.bookings(staff_id, starts_at)
  WHERE status IN ('PENDING_PAYMENT', 'CONFIRMED');

-- Stripe webhook lookup
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_pi
  ON public.bookings(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Cron job: find bookings needing reminder emails
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_24h
  ON public.bookings(starts_at, reminder_24h_sent)
  WHERE status = 'CONFIRMED' AND reminder_24h_sent = false;

CREATE INDEX IF NOT EXISTS idx_bookings_reminder_same_day
  ON public.bookings(starts_at, reminder_same_day_sent)
  WHERE status = 'CONFIRMED' AND reminder_same_day_sent = false;

CREATE INDEX IF NOT EXISTS idx_bookings_post_session
  ON public.bookings(ends_at, post_session_sent)
  WHERE status = 'CONFIRMED' AND post_session_sent = false;

-- Email log lookup
CREATE INDEX IF NOT EXISTS idx_booking_email_log_booking
  ON public.booking_email_log(booking_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_email_log ENABLE ROW LEVEL SECURITY;

-- Anon: can INSERT a new booking (wizard submission)
-- No anon SELECT: public lookup uses service_role via API route (bypasses RLS)
CREATE POLICY "bookings_anon_insert"
  ON public.bookings FOR INSERT
  TO anon
  WITH CHECK (true);

-- service_role: full control (used by all API routes)
CREATE POLICY "bookings_service_role_all"
  ON public.bookings FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "booking_email_log_service_role_all"
  ON public.booking_email_log FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated admin: full control
CREATE POLICY "bookings_admin_all"
  ON public.bookings FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "booking_email_log_admin_all"
  ON public.booking_email_log FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

COMMIT;
