BEGIN;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'blog_posts'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.blog_posts;', policy_record.policyname);
  END LOOP;
END $$;

CREATE POLICY "anon_read_published_blog_posts"
  ON public.blog_posts
  FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "service_role_select_all_blog_posts"
  ON public.blog_posts
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "service_role_insert_blog_posts"
  ON public.blog_posts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "service_role_update_blog_posts"
  ON public.blog_posts
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'automation_logs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.automation_logs;', policy_record.policyname);
  END LOOP;
END $$;

CREATE POLICY "service_role_select_automation_logs"
  ON public.automation_logs
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "service_role_insert_automation_logs"
  ON public.automation_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "service_role_update_automation_logs"
  ON public.automation_logs
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;