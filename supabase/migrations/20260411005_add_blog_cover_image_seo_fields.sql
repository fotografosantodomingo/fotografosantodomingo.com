BEGIN;

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS cover_image_title_es TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_title_en TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_caption_es TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_caption_en TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_description_es TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_description_en TEXT;

UPDATE public.blog_posts
SET
  cover_image_title_es = COALESCE(NULLIF(cover_image_title_es, ''), NULLIF(title_es, ''), NULLIF(cover_image_alt_es, ''), NULLIF(og_title_es, '')),
  cover_image_title_en = COALESCE(NULLIF(cover_image_title_en, ''), NULLIF(title_en, ''), NULLIF(cover_image_alt_en, ''), NULLIF(og_title_en, '')),
  cover_image_caption_es = COALESCE(NULLIF(cover_image_caption_es, ''), NULLIF(excerpt_es, ''), NULLIF(meta_description_es, ''), NULLIF(title_es, '')),
  cover_image_caption_en = COALESCE(NULLIF(cover_image_caption_en, ''), NULLIF(excerpt_en, ''), NULLIF(meta_description_en, ''), NULLIF(title_en, '')),
  cover_image_description_es = COALESCE(NULLIF(cover_image_description_es, ''), NULLIF(meta_description_es, ''), NULLIF(excerpt_es, ''), NULLIF(title_es, '')),
  cover_image_description_en = COALESCE(NULLIF(cover_image_description_en, ''), NULLIF(meta_description_en, ''), NULLIF(excerpt_en, ''), NULLIF(title_en, ''))
WHERE TRUE;

COMMIT;
