/**
 * Blog post payload template for POST /api/admin/create-post
 *
 * Copy this object, fill in all fields, then POST it with:
 *   Authorization: Bearer <ADMIN_SECRET>
 *   Content-Type: application/json
 *
 * Slug rules: lowercase, hyphens only, no spaces — /^[a-z0-9]+(?:-[a-z0-9]+)*$/
 * SEO URL safety rules (important for canonical + hreflang):
 * - slug_es must be the Spanish version, slug_en must be the English version.
 * - Never copy slug_es into slug_en (or vice versa) unless both languages intentionally use the exact same phrase.
 * - Store URLs without trailing slash in automation outputs: /es/blog/<slug_es> and /en/blog/<slug_en>
 * - Canonical and hreflang must always reference locale-matching slugs.
 * cover_image_url must be a Cloudinary URL containing f_webp
 * cover_image_format must be 'webp'
 */

export const createPostPayload = {
  // ── Slugs ───────────────────────────────────────────────────────────────
  slug_es: 'titulo-del-articulo-en-espanol',
  slug_en: 'article-title-in-english',

  // ── Content ─────────────────────────────────────────────────────────────
  title_es: 'Título Principal en Español | Babula Shots',
  title_en: 'Primary English Title | Babula Shots',

  content_es: `Abre con un párrafo que deje claro el tema y por qué importa para el lector.

## Subtítulo orientado a la palabra clave

Consejo específico, contexto local Santo Domingo, proceso o guía de compra. Incluye al menos dos enlaces internos a servicios, portafolio o contacto.

## Otro subtítulo útil

Cierra con un CTA contextual hacia el servicio, portafolio o página de contacto relevante.`,

  content_en: `Open with a paragraph that states the topic clearly and explains why it matters.

## Keyword-focused subheading

Specific advice, local Santo Domingo detail, process, or buyer guidance. Include at least two internal links to services, portfolio, or contact.

## Another useful subheading

End with a contextual CTA pointing to the relevant service, portfolio, or contact page.`,

  excerpt_es: 'Resumen SEO único en español de 140-160 caracteres que explique el valor del artículo.',
  excerpt_en: 'Unique English SEO summary in 140-160 characters that explains the article value and matches search intent.',

  // ── SEO metadata ─────────────────────────────────────────────────────────
  og_title_es: 'Título OG corto en español | Babula Shots',
  og_title_en: 'Short EN OG Title | Babula Shots',
  meta_description_es: 'Descripción meta única en español (140-160 caracteres).',
  meta_description_en: 'Unique English meta description (140-160 characters).',
  primary_keyword_es: 'palabra clave principal santo domingo',
  primary_keyword_en: 'primary keyword santo domingo',

  // ── Cover image ───────────────────────────────────────────────────────────
  // Must be a Cloudinary URL with f_webp transform
  cover_image_url: 'https://res.cloudinary.com/dwewurxla/image/upload/f_webp,q_auto,w_1200/blog/replace-public-id',
  cover_image_thumbnail_url: 'https://res.cloudinary.com/dwewurxla/image/upload/f_webp,q_auto,w_600/blog/replace-public-id',
  cover_image_placeholder_url: 'https://res.cloudinary.com/dwewurxla/image/upload/f_webp,q_auto,w_40/blog/replace-public-id',
  cover_image_alt_es: 'Descripción alt de la imagen en español',
  cover_image_alt_en: 'English alt text for the cover image',
  cover_image_title_es: 'Título SEO de imagen en español',
  cover_image_title_en: 'English image SEO title',
  cover_image_caption_es: 'Leyenda breve orientada al servicio y ubicación.',
  cover_image_caption_en: 'Short caption aligned with service and location intent.',
  cover_image_description_es: 'Descripción ampliada en español con contexto de servicio fotográfico y ubicación.',
  cover_image_description_en: 'Extended English description with service and location context.',
  cover_image_format: 'webp' as const,
  cover_image_public_id: 'blog/replace-public-id',

  // ── Taxonomy & geo ────────────────────────────────────────────────────────
  // service_type: 'wedding' | 'portrait' | 'drone' | 'event' | 'commercial' | 'general'
  service_type: 'wedding',
  location: 'Santo Domingo',
  cloudinary_folder: 'blog',
  schema_service_type: 'WeddingPhotography',
  geo_city: 'Santo Domingo',
  geo_country: 'Dominican Republic',

  // ── Publishing ────────────────────────────────────────────────────────────
  // status: 'published' | 'draft' | 'archived'  (default: 'published')
  status: 'published' as const,
}