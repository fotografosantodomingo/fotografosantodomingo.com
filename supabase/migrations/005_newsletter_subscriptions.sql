-- ============================================================
-- Newsletter Subscriptions Table
-- Stores email subscribers with status management
-- ============================================================

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL UNIQUE,
  name                TEXT,
  locale              TEXT NOT NULL DEFAULT 'es',
  status              TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  interests           TEXT[],
  source              TEXT,
  ip_address          TEXT,
  user_agent          TEXT,
  referrer            TEXT,
  subscribed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at     TIMESTAMPTZ,
  unsubscribe_reason  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS newsletter_subscriptions_email_idx
  ON newsletter_subscriptions (email);

CREATE INDEX IF NOT EXISTS newsletter_subscriptions_status_idx
  ON newsletter_subscriptions (status);

-- Reuse existing update_updated_at trigger function (created in migration 001)
DROP TRIGGER IF EXISTS newsletter_subscriptions_updated_at ON newsletter_subscriptions;
CREATE TRIGGER newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Anyone can subscribe, only service_role can read/update
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "newsletter_insert"
  ON newsletter_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "newsletter_service_role_all"
  ON newsletter_subscriptions FOR ALL
  TO service_role
  USING (true);
