-- Phase 2: Custom Quotation System
-- Adds DRAFT + DEPOSIT_PAID statuses, flexible line_items pricing,
-- payment mode / deposit tracking, WhatsApp intake fields, and proposal slug
-- for the admin quick-draft flow and /quotations/[slug] client page.

-- ─── ENUM ADDITIONS ──────────────────────────────────────────────────────────
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction and cannot be
-- rolled back. Run them as standalone auto-committed statements before the
-- main DDL transaction.

-- DRAFT: admin is gathering info via WhatsApp — no proposal link yet.
ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'DRAFT' BEFORE 'PENDING_REVIEW';

-- DEPOSIT_PAID: 50% reserve received — balance due at session day.
ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'DEPOSIT_PAID' AFTER 'SENT_TO_CUSTOMER';

-- ─── TABLE CHANGES ────────────────────────────────────────────────────────────
BEGIN;

ALTER TABLE public.quotes
  -- Flexible pricing rows: [{description: string, amount_usd: number}]
  ADD COLUMN IF NOT EXISTS line_items          JSONB,

  -- Which Stripe checkout to generate: full price or 50% deposit.
  ADD COLUMN IF NOT EXISTS payment_mode        TEXT
    NOT NULL
    DEFAULT 'FULL'
    CHECK (payment_mode IN ('FULL', 'DEPOSIT')),

  -- Cached deposit amount (= final_price_usd * 0.5, set at finalize time).
  ADD COLUMN IF NOT EXISTS deposit_amount_usd  NUMERIC(10,2),

  -- Raw WhatsApp conversation pasted by admin; fed to AI parser.
  ADD COLUMN IF NOT EXISTS whatsapp_raw_text   TEXT,

  -- Per-service checklist: [{id: string, label: string, checked: boolean}]
  -- All items must be checked before the proposal link can be generated.
  ADD COLUMN IF NOT EXISTS scoping_checklist   JSONB,

  -- URL-safe slug for /quotations/[slug], e.g. "maria-garcia-x9y8z7".
  -- Generated at proposal-link creation time; NULL until then.
  ADD COLUMN IF NOT EXISTS proposal_slug       TEXT,

  -- Timestamp of the client's first open (triggers the admin notification).
  ADD COLUMN IF NOT EXISTS first_viewed_at     TIMESTAMPTZ,

  -- Optional company / event name shown as "Prepared for: Name · Company".
  ADD COLUMN IF NOT EXISTS client_company      TEXT;

-- Fast O(1) lookup for the public proposal route without exposing the UUID.
CREATE UNIQUE INDEX IF NOT EXISTS quotes_proposal_slug_idx
  ON public.quotes (proposal_slug)
  WHERE proposal_slug IS NOT NULL;

COMMIT;
