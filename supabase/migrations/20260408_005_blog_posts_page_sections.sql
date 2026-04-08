BEGIN;

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS intro_es TEXT,
  ADD COLUMN IF NOT EXISTS intro_en TEXT,
  ADD COLUMN IF NOT EXISTS location_section_es TEXT,
  ADD COLUMN IF NOT EXISTS location_section_en TEXT,
  ADD COLUMN IF NOT EXISTS faq_es JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faq_en JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reviews_es JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reviews_en JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS internal_links_es JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS internal_links_en JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS setmore_service_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_post_id TEXT;

COMMIT;