BEGIN;

-- Drop the webp-only constraint so Drive images (jpg/heic/etc) can be stored
ALTER TABLE public.blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_cover_image_format_check;

-- Metadata blob for the pipeline: social captions, raw Claude output, image URLs
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS auto_draft_meta JSONB,
  ADD COLUMN IF NOT EXISTS source TEXT;

-- Dedup table: one row per Drive group key, prevents reprocessing
CREATE TABLE IF NOT EXISTS public.processed_drive_files (
  group_key   TEXT PRIMARY KEY,
  file_ids    TEXT[] NOT NULL DEFAULT '{}',
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'draft_pending'
    CHECK (status IN ('draft_pending', 'approved', 'rejected', 'failed')),
  error_msg   TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One row per platform per blog post
CREATE TABLE IF NOT EXISTS public.cross_post_jobs (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id     UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  platform         TEXT NOT NULL CHECK (platform IN ('fb', 'ig', 'li')),
  status           TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'posted', 'failed', 'skipped')),
  platform_post_id TEXT,
  error_msg        TEXT,
  attempted_at     TIMESTAMPTZ,
  UNIQUE (blog_post_id, platform)
);

-- RLS: service role bypasses these; anon/authenticated cannot touch pipeline tables
ALTER TABLE public.processed_drive_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_post_jobs ENABLE ROW LEVEL SECURITY;

COMMIT;
