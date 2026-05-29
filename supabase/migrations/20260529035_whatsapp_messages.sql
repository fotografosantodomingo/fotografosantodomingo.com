-- WhatsApp inbound message store.
-- Each row is one message from a client conversation.
-- When a phone number accumulates 5+ messages with no quote generated,
-- the webhook handler fires Claude to extract quote details and creates
-- a PENDING_REVIEW draft in public.quotes.

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  phone_number    TEXT        NOT NULL,
  display_name    TEXT,
  wa_message_id   TEXT        UNIQUE,          -- Meta message ID (dedup)
  direction       TEXT        NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body            TEXT,
  media_type      TEXT,                        -- 'text' | 'image' | 'audio' | etc.
  wa_timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  quote_generated BOOLEAN     NOT NULL DEFAULT FALSE,
  quote_id        UUID        REFERENCES public.quotes(id)
);

CREATE INDEX IF NOT EXISTS whatsapp_messages_phone_created_idx
  ON public.whatsapp_messages (phone_number, created_at DESC);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_service_role_all"
  ON public.whatsapp_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
