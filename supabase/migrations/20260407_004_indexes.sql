BEGIN;

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug_es ON public.blog_posts(slug_es);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug_en ON public.blog_posts(slug_en);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at ON public.blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_service_type ON public.blog_posts(service_type);
CREATE INDEX IF NOT EXISTS idx_blog_posts_location ON public.blog_posts(location);

CREATE UNIQUE INDEX IF NOT EXISTS idx_automation_logs_idempotency ON public.automation_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_automation_logs_status ON public.automation_logs(status);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON public.automation_logs(created_at DESC);

COMMIT;