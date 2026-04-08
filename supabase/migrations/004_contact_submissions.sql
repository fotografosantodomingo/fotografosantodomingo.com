-- ============================================================
-- Contact Submissions Table
-- Stores all contact form entries from the website
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  service         TEXT,
  message         TEXT NOT NULL,
  event_date      TEXT,
  location        TEXT,
  locale          TEXT NOT NULL DEFAULT 'es',
  ip_address      TEXT,
  user_agent      TEXT,
  referrer        TEXT,
  read            BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin panel queries
CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx
  ON contact_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS contact_submissions_read_idx
  ON contact_submissions (read);

-- RLS: Anyone can submit, only service_role can read
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_submissions_insert"
  ON contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "contact_submissions_service_role_select"
  ON contact_submissions FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "contact_submissions_service_role_update"
  ON contact_submissions FOR UPDATE
  TO service_role
  USING (true);
