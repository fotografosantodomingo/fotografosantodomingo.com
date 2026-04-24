BEGIN;

-- Add proposal token hash for magic-link security
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS proposal_token_hash TEXT;

-- Index for fast token lookup when client loads the proposal page
CREATE UNIQUE INDEX IF NOT EXISTS quotes_proposal_token_hash_idx
  ON public.quotes (proposal_token_hash)
  WHERE proposal_token_hash IS NOT NULL;

COMMIT;
