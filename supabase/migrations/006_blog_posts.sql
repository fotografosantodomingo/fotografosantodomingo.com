-- Migration: blog_posts table
-- Replaces hardcoded posts.ts with a managed DB-backed blog system.

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,

  -- Bilingual title / excerpt / content
  title     TEXT NOT NULL DEFAULT '',
  title_es  TEXT NOT NULL DEFAULT '',
  excerpt     TEXT NOT NULL DEFAULT '',
  excerpt_es  TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  content_es  TEXT NOT NULL DEFAULT '',

  author       TEXT NOT NULL DEFAULT 'Babula Shots',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ,

  category     TEXT NOT NULL DEFAULT 'general',
  tags         TEXT[] NOT NULL DEFAULT '{}',
  featured     BOOLEAN NOT NULL DEFAULT false,
  image        TEXT NOT NULL DEFAULT '',
  reading_time INTEGER NOT NULL DEFAULT 5,

  -- SEO fields
  seo_title        TEXT NOT NULL DEFAULT '',
  seo_title_es     TEXT NOT NULL DEFAULT '',
  seo_description  TEXT NOT NULL DEFAULT '',
  seo_description_es TEXT NOT NULL DEFAULT '',
  seo_keywords     TEXT[] NOT NULL DEFAULT '{}',
  seo_keywords_es  TEXT[] NOT NULL DEFAULT '{}',

  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at
  ON blog_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON blog_posts (slug);

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public: read published posts only
CREATE POLICY "Anyone can read published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Service role: full access for CMS operations
CREATE POLICY "Service role full access"
  ON blog_posts
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
