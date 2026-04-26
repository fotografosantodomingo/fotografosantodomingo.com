BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug_es TEXT,
  slug_en TEXT,
  title_es TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  content_es TEXT NOT NULL DEFAULT '',
  content_en TEXT NOT NULL DEFAULT '',
  excerpt_es TEXT DEFAULT '',
  excerpt_en TEXT DEFAULT '',
  meta_description_es TEXT,
  meta_description_en TEXT,
  og_title_es TEXT,
  og_title_en TEXT,
  primary_keyword_es TEXT,
  primary_keyword_en TEXT,
  cover_image_url TEXT,
  cover_image_thumbnail_url TEXT,
  cover_image_placeholder_url TEXT,
  cover_image_alt_es TEXT,
  cover_image_alt_en TEXT,
  cover_image_format TEXT NOT NULL DEFAULT 'webp',
  cover_image_public_id TEXT,
  schema_service_type TEXT,
  geo_city TEXT,
  geo_country TEXT NOT NULL DEFAULT 'Dominican Republic',
  service_type TEXT,
  location TEXT,
  cloudinary_folder TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Compatibility fields for the current app while the routes/pages are migrated.
  slug TEXT,
  title TEXT NOT NULL DEFAULT '',
  title_es_legacy TEXT,
  excerpt TEXT NOT NULL DEFAULT '',
  excerpt_es_legacy TEXT,
  content TEXT NOT NULL DEFAULT '',
  content_es_legacy TEXT,
  author TEXT NOT NULL DEFAULT 'Babula Shots',
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  image TEXT NOT NULL DEFAULT '',
  reading_time INTEGER NOT NULL DEFAULT 5,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_title_es TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  seo_description_es TEXT NOT NULL DEFAULT '',
  seo_keywords TEXT[] NOT NULL DEFAULT '{}',
  seo_keywords_es TEXT[] NOT NULL DEFAULT '{}',

  CONSTRAINT blog_posts_status_check CHECK (status IN ('published', 'draft', 'archived')),
  CONSTRAINT blog_posts_cover_image_format_check CHECK (cover_image_format = 'webp')
);

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS slug_es TEXT,
  ADD COLUMN IF NOT EXISTS slug_en TEXT,
  ADD COLUMN IF NOT EXISTS title_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS content_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS excerpt_en TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_description_es TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_en TEXT,
  ADD COLUMN IF NOT EXISTS og_title_es TEXT,
  ADD COLUMN IF NOT EXISTS og_title_en TEXT,
  ADD COLUMN IF NOT EXISTS primary_keyword_es TEXT,
  ADD COLUMN IF NOT EXISTS primary_keyword_en TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_placeholder_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_alt_es TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_alt_en TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_format TEXT NOT NULL DEFAULT 'webp',
  ADD COLUMN IF NOT EXISTS cover_image_public_id TEXT,
  ADD COLUMN IF NOT EXISTS schema_service_type TEXT,
  ADD COLUMN IF NOT EXISTS geo_city TEXT,
  ADD COLUMN IF NOT EXISTS geo_country TEXT NOT NULL DEFAULT 'Dominican Republic',
  ADD COLUMN IF NOT EXISTS service_type TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS cloudinary_folder TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

ALTER TABLE public.blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_status_check;

ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_status_check CHECK (status IN ('published', 'draft', 'archived'));

ALTER TABLE public.blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_cover_image_format_check;

ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_cover_image_format_check CHECK (cover_image_format = 'webp');

UPDATE public.blog_posts
SET
  slug_es = COALESCE(NULLIF(slug_es, ''), NULLIF(slug, '')),
  slug_en = COALESCE(NULLIF(slug_en, ''), NULLIF(slug, '')),
  title_en = COALESCE(NULLIF(title_en, ''), NULLIF(title, '')),
  excerpt_en = COALESCE(NULLIF(excerpt_en, ''), NULLIF(excerpt, '')),
  content_en = COALESCE(NULLIF(content_en, ''), NULLIF(content, '')),
  meta_description_es = COALESCE(meta_description_es, NULLIF(seo_description_es, '')),
  meta_description_en = COALESCE(meta_description_en, NULLIF(seo_description, '')),
  og_title_es = COALESCE(og_title_es, NULLIF(seo_title_es, '')),
  og_title_en = COALESCE(og_title_en, NULLIF(seo_title, '')),
  primary_keyword_es = COALESCE(primary_keyword_es, seo_keywords_es[1]),
  primary_keyword_en = COALESCE(primary_keyword_en, seo_keywords[1]),
  cover_image_url = COALESCE(cover_image_url, NULLIF(image, '')),
  cover_image_thumbnail_url = COALESCE(cover_image_thumbnail_url, NULLIF(image, '')),
  cover_image_alt_es = COALESCE(cover_image_alt_es, NULLIF(title_es, '')),
  cover_image_alt_en = COALESCE(cover_image_alt_en, NULLIF(title_en, '')),
  cover_image_public_id = COALESCE(cover_image_public_id, NULLIF(image, '')),
  geo_country = COALESCE(NULLIF(geo_country, ''), 'Dominican Republic'),
  updated_at = COALESCE(updated_at, timezone('utc'::text, now()))
WHERE TRUE;

DROP TRIGGER IF EXISTS trg_blog_posts_set_updated_at ON public.blog_posts;

CREATE TRIGGER trg_blog_posts_set_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp();

COMMIT;