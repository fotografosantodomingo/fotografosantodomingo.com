BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'quote_status'
  ) THEN
    CREATE TYPE public.quote_status AS ENUM (
      'PENDING_REVIEW',
      'SENT_TO_CUSTOMER',
      'ACCEPTED',
      'REJECTED'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'quote_contact_method'
  ) THEN
    CREATE TYPE public.quote_contact_method AS ENUM (
      'EMAIL',
      'WHATSAPP',
      'PHONE_CALL'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- customer context
  locale TEXT NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'en')),
  service_type TEXT,
  event_date DATE,
  country TEXT,
  state TEXT,
  city TEXT,
  description TEXT,

  -- customer identity
  full_name TEXT,
  email TEXT,
  whatsapp_phone TEXT,

  -- contact preference
  preferred_contact_method public.quote_contact_method,
  callback_time_preference TEXT,

  -- workflow and pricing
  status public.quote_status NOT NULL DEFAULT 'PENDING_REVIEW',
  final_price_usd NUMERIC(10,2),
  admin_note_customer TEXT,
  admin_internal_notes TEXT,
  proposal_expires_at TIMESTAMPTZ,

  -- form progress tracking
  form_step_reached INT NOT NULL DEFAULT 1 CHECK (form_step_reached BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quotes_created_at_idx
  ON public.quotes (created_at DESC);

CREATE INDEX IF NOT EXISTS quotes_status_created_at_idx
  ON public.quotes (status, created_at DESC);

CREATE INDEX IF NOT EXISTS quotes_event_date_idx
  ON public.quotes (event_date);

CREATE INDEX IF NOT EXISTS quotes_email_idx
  ON public.quotes (email);

CREATE OR REPLACE FUNCTION public.set_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_quotes_updated_at ON public.quotes;
CREATE TRIGGER trg_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.set_quotes_updated_at();

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'quotes'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.quotes;', policy_record.policyname);
  END LOOP;
END $$;

-- Anonymous website users: insert only
CREATE POLICY "quotes_anon_insert"
  ON public.quotes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated admin users and server role: full management
CREATE POLICY "quotes_admin_select"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users a
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "quotes_service_role_select"
  ON public.quotes
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "quotes_admin_update"
  ON public.quotes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users a
      WHERE a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users a
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "quotes_service_role_update"
  ON public.quotes
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "quotes_admin_delete"
  ON public.quotes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users a
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "quotes_service_role_delete"
  ON public.quotes
  FOR DELETE
  TO service_role
  USING (true);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users;', policy_record.policyname);
  END LOOP;
END $$;

CREATE POLICY "admin_users_select_self_or_service_role"
  ON public.admin_users
  FOR SELECT
  TO authenticated, service_role
  USING (auth.uid() = user_id OR current_role = 'service_role');

CREATE POLICY "admin_users_service_role_insert"
  ON public.admin_users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "admin_users_service_role_update"
  ON public.admin_users
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;
