BEGIN;

CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  folder TEXT NOT NULL,
  public_id TEXT,
  image_format TEXT NOT NULL DEFAULT 'webp',
  service_type TEXT,
  location TEXT,
  language TEXT,
  status TEXT NOT NULL,
  phase TEXT,
  error_message TEXT,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  blog_url_es TEXT,
  blog_url_en TEXT,
  instagram_status TEXT NOT NULL DEFAULT 'pending',
  facebook_status TEXT NOT NULL DEFAULT 'pending',
  linkedin_status TEXT NOT NULL DEFAULT 'pending',
  pinterest_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ,

  CONSTRAINT automation_logs_image_format_check CHECK (image_format = 'webp'),
  CONSTRAINT automation_logs_language_check CHECK (language IS NULL OR language IN ('ES', 'EN')),
  CONSTRAINT automation_logs_status_check CHECK (
    status IN (
      'success',
      'failed_openai',
      'failed_cms',
      'failed_social',
      'rejected_format',
      'rejected_prefix',
      'partial_success'
    )
  ),
  CONSTRAINT automation_logs_instagram_status_check CHECK (instagram_status IN ('success', 'failed', 'skipped', 'pending')),
  CONSTRAINT automation_logs_facebook_status_check CHECK (facebook_status IN ('success', 'failed', 'skipped', 'pending')),
  CONSTRAINT automation_logs_linkedin_status_check CHECK (linkedin_status IN ('success', 'failed', 'skipped', 'pending')),
  CONSTRAINT automation_logs_pinterest_status_check CHECK (pinterest_status IN ('success', 'failed', 'skipped', 'pending'))
);

ALTER TABLE public.automation_logs
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS folder TEXT,
  ADD COLUMN IF NOT EXISTS public_id TEXT,
  ADD COLUMN IF NOT EXISTS image_format TEXT NOT NULL DEFAULT 'webp',
  ADD COLUMN IF NOT EXISTS service_type TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS phase TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS blog_url_es TEXT,
  ADD COLUMN IF NOT EXISTS blog_url_en TEXT,
  ADD COLUMN IF NOT EXISTS instagram_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS facebook_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS linkedin_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pinterest_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'automation_logs_idempotency_key_key'
      AND conrelid = 'public.automation_logs'::regclass
  ) THEN
    ALTER TABLE public.automation_logs
      ADD CONSTRAINT automation_logs_idempotency_key_key UNIQUE (idempotency_key);
  END IF;
END $$;

COMMIT;