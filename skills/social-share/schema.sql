-- ============================================================
-- Drive → Blog → Social Pipeline — Supabase Schema
-- Run in SQL editor at app.supabase.com → SQL Editor
-- ============================================================

-- Blog posts table (main content store)
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Slugs (bilingual)
  slug_es text unique not null,
  slug_en text unique,
  slug text,                              -- legacy compat alias for slug_es

  -- Titles
  title_es text not null,
  title_en text,
  title text,                             -- legacy compat alias for title_es

  -- Excerpts
  excerpt_es text,
  excerpt_en text,
  excerpt text,                           -- legacy compat alias

  -- SEO metadata
  meta_description_es text,
  meta_description_en text,
  og_title_es text,
  og_title_en text,
  primary_keyword_es text,
  primary_keyword_en text,

  -- Content sections (HTML)
  intro_es text,
  intro_en text,
  content_es text,
  content_en text,
  content text,                           -- legacy compat alias for content_es
  location_section_es text,
  location_section_en text,

  -- FAQ (JSONB array of {question, answer})
  faq_es jsonb default '[]'::jsonb,
  faq_en jsonb default '[]'::jsonb,

  -- Cover image
  cover_image_url text,
  cover_image_thumbnail_url text,
  cover_image_alt_es text,
  cover_image_alt_en text,
  cover_image_title_es text,
  cover_image_title_en text,
  cover_image_caption_es text,
  cover_image_caption_en text,
  cover_image_description_es text,
  cover_image_description_en text,
  cover_image_format text default 'webp',

  -- Internal links (JSONB array of {text, url, description})
  internal_links_es jsonb default '[]'::jsonb,
  internal_links_en jsonb default '[]'::jsonb,

  -- Schema.org
  schema_service_type text,

  -- Classification
  reading_time integer default 6,
  service_type text,
  geo_city text,
  tags text[] default '{}',

  -- Status
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  source text default 'drive-pipeline',

  -- Social post URLs (filled after cross-posting)
  facebook_post_url text,
  instagram_post_url text,
  linkedin_post_url text,

  -- Pipeline metadata
  auto_draft_meta jsonb
);

-- Index for slug lookups (used by Next.js blog pages)
create index if not exists blog_posts_slug_es_idx on blog_posts (slug_es);
create index if not exists blog_posts_slug_en_idx on blog_posts (slug_en);
create index if not exists blog_posts_status_idx on blog_posts (status);
create index if not exists blog_posts_published_at_idx on blog_posts (published_at desc);

-- Trigger to update updated_at automatically
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function update_updated_at();

-- ============================================================

-- Deduplication table (prevents reprocessing same Drive files)
create table if not exists processed_drive_files (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  group_key text unique not null,         -- Drive file ID or folder ID
  file_ids text[] not null,               -- All file IDs in this group
  blog_post_id uuid references blog_posts(id),

  status text not null default 'draft_pending'
    check (status in ('draft_pending', 'approved', 'rejected', 'failed')),

  error_msg text
);

create index if not exists processed_drive_files_status_idx
  on processed_drive_files (status);

-- ============================================================

-- Cross-post jobs (one row per platform per post)
create table if not exists cross_post_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  blog_post_id uuid not null references blog_posts(id),
  platform text not null
    check (platform in ('fb', 'ig', 'li', 'pi', 'gbp')),

  status text not null
    check (status in ('posted', 'failed', 'skipped')),

  platform_post_id text,                  -- ID returned by platform API
  error_msg text,
  attempted_at timestamptz,

  unique (blog_post_id, platform)         -- one record per post/platform
);

create index if not exists cross_post_jobs_blog_post_id_idx
  on cross_post_jobs (blog_post_id);

-- ============================================================

-- Storage bucket (run via Supabase dashboard: Storage → New Bucket)
-- Name: blog_media
-- Public: YES (required — social APIs fetch images by URL)
-- File size limit: 50 MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- ============================================================

-- Optional: RLS policies if you expose blog_posts via Supabase client
alter table blog_posts enable row level security;

-- Allow public reads of published posts only
create policy "Public can read published posts"
  on blog_posts for select
  using (status = 'published');

-- Service role (worker) can do everything — uses service_role_key, bypasses RLS
