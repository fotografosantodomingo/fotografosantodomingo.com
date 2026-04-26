BEGIN;

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS instagram_post_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_post_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_post_url TEXT,
  ADD COLUMN IF NOT EXISTS pinterest_post_url TEXT,
  ADD COLUMN IF NOT EXISTS blogger_post_url TEXT;

COMMIT;
