-- Migration 020 — Fix JSONB field shapes on the 5 SEO blog posts seeded
-- in migration 019. The blog page (src/app/[locale]/blog/[slug]/page.tsx)
-- expects:
--   faq items:           { question: string, answer: string }
--   internal_links items: { text: string, url: string, description?: string }
--
-- Migration 019 inadvertently used {q, a} and {label, href} respectively,
-- causing normalizeUrl(item.url) to throw on undefined and the page to
-- 500. This migration remaps each JSONB array item to the expected shape.
--
-- Idempotency note: scoped to the 5 sentinel slugs from migration 019.
-- The transform is one-directional — running this twice would null out
-- the renamed fields. Migration tracking prevents re-runs.

UPDATE public.blog_posts
SET
  faq_es = COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'question', item->>'q',
        'answer',   item->>'a'
      )
    )
    FROM jsonb_array_elements(faq_es) AS item
  ), '[]'::jsonb),

  faq_en = COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'question', item->>'q',
        'answer',   item->>'a'
      )
    )
    FROM jsonb_array_elements(faq_en) AS item
  ), '[]'::jsonb),

  internal_links_es = COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'text',        item->>'label',
        'url',         item->>'href',
        'description', item->>'description'
      )
    )
    FROM jsonb_array_elements(internal_links_es) AS item
  ), '[]'::jsonb),

  internal_links_en = COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'text',        item->>'label',
        'url',         item->>'href',
        'description', item->>'description'
      )
    )
    FROM jsonb_array_elements(internal_links_en) AS item
  ), '[]'::jsonb)

WHERE slug_es IN (
  'fotografo-bodas-altos-de-chavon-casa-de-campo',
  'permisos-drone-fotografia-punta-cana-puj',
  'propuesta-sorpresa-sanctuary-cap-cana-juanillo-beach',
  'fotografo-bodas-catedral-primada-zona-colonial-santo-domingo',
  'fotografo-quinceaneras-santo-domingo-locaciones-paquetes'
);
