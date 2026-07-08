-- The cross_post_jobs.platform CHECK was left at ('fb','ig','li') when GBP,
-- Pinterest and DeviantArt cross-posting were added. Their status rows were
-- silently rejected (CHECK 23514, swallowed by the upsert), so gbp/pi/da never
-- recorded 'posted' — which made /retry-crosspost re-post them every time
-- (duplicate GBP localPosts). Widen the constraint to all live platforms.

ALTER TABLE public.cross_post_jobs
  DROP CONSTRAINT IF EXISTS cross_post_jobs_platform_check;

ALTER TABLE public.cross_post_jobs
  ADD CONSTRAINT cross_post_jobs_platform_check
  CHECK (platform IN ('fb', 'ig', 'li', 'gbp', 'pi', 'da'));
