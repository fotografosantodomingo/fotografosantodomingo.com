/**
 * Supabase-backed blog helpers.
 *
 * All functions query the blog_posts table directly via the service role client.
 * NEVER import this file from client components.
 */

import { createServiceClient } from './service'

export type PublishedPostListItem = {
  id: string
  slug: string
  slug_es: string
  slug_en: string
  title: string
  excerpt: string
  cover_image_url: string | null
  cover_image_thumbnail_url: string | null
  cover_image_alt: string | null
  cover_image_title: string | null
  cover_image_caption: string | null
  cover_image_description: string | null
  published_at: string
  service_type: string | null
  location: string | null
}

export type PublishedPostDetail = {
  id: string
  slug_es: string
  slug_en: string
  title_es: string
  title_en: string
  content_es: string
  content_en: string
  excerpt_es: string | null
  excerpt_en: string | null
  meta_description_es: string | null
  meta_description_en: string | null
  og_title_es: string | null
  og_title_en: string | null
  primary_keyword_es: string | null
  primary_keyword_en: string | null
  cover_image_url: string | null
  cover_image_thumbnail_url: string | null
  cover_image_placeholder_url: string | null
  cover_image_alt_es: string | null
  cover_image_alt_en: string | null
  cover_image_title_es: string | null
  cover_image_title_en: string | null
  cover_image_caption_es: string | null
  cover_image_caption_en: string | null
  cover_image_description_es: string | null
  cover_image_description_en: string | null
  cover_image_format: string | null
  cover_image_public_id: string | null
  schema_service_type: string | null
  geo_city: string | null
  geo_country: string | null
  service_type: string | null
  location: string | null
  cloudinary_folder: string | null
  intro_es: string | null
  intro_en: string | null
  location_section_es: string | null
  location_section_en: string | null
  faq_es: Array<{ question: string; answer: string }> | null
  faq_en: Array<{ question: string; answer: string }> | null
  reviews_es: Array<{ author: string; rating: number; text: string; session_type?: string }> | null
  reviews_en: Array<{ author: string; rating: number; text: string; session_type?: string }> | null
  internal_links_es: Array<{ text: string; url: string; description?: string }> | null
  internal_links_en: Array<{ text: string; url: string; description?: string }> | null
  setmore_service_url: string | null
  instagram_post_id: string | null
  published_at: string
  updated_at: string | null
  status: string
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getPublishedPosts(locale: 'es' | 'en'): Promise<PublishedPostListItem[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      'id, slug_es, slug_en, title_es, title_en, excerpt_es, excerpt_en, cover_image_url, cover_image_thumbnail_url, cover_image_alt_es, cover_image_alt_en, cover_image_title_es, cover_image_title_en, cover_image_caption_es, cover_image_caption_en, cover_image_description_es, cover_image_description_en, published_at, service_type, location'
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error || !data) {
    console.error('getPublishedPosts failed:', error)
    return []
  }

  return data.map((post) => ({
    id: post.id,
    slug: locale === 'es' ? post.slug_es : post.slug_en,
    slug_es: post.slug_es,
    slug_en: post.slug_en,
    title: locale === 'es' ? post.title_es : post.title_en,
    excerpt: locale === 'es' ? post.excerpt_es : post.excerpt_en,
    cover_image_url: post.cover_image_url,
    cover_image_thumbnail_url: post.cover_image_thumbnail_url,
    cover_image_alt: locale === 'es' ? post.cover_image_alt_es : post.cover_image_alt_en,
    cover_image_title: locale === 'es' ? post.cover_image_title_es : post.cover_image_title_en,
    cover_image_caption: locale === 'es' ? post.cover_image_caption_es : post.cover_image_caption_en,
    cover_image_description: locale === 'es' ? post.cover_image_description_es : post.cover_image_description_en,
    published_at: post.published_at,
    service_type: post.service_type,
    location: post.location,
  }))
}

export async function getPostBySlug(slug: string): Promise<PublishedPostDetail | null> {
  const supabase = createServiceClient()

  const { data: postByEs } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug_es', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (postByEs) {
    return postByEs as PublishedPostDetail
  }

  const { data: postByEn, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug_en', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    console.error('getPostBySlug failed:', error)
  }

  return (postByEn as PublishedPostDetail | null) ?? null
}

export async function getAllSlugs(): Promise<Array<{ slug_es: string; slug_en: string }>> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug_es, slug_en')
    .eq('status', 'published')

  if (error || !data) {
    console.error('getAllSlugs failed:', error)
    return []
  }

  return data
}

export async function getRelatedPosts(
  serviceType: string,
  excludeSlug: string,
  locale: 'es' | 'en'
): Promise<PublishedPostListItem[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      'id, slug_es, slug_en, title_es, title_en, excerpt_es, excerpt_en, cover_image_url, cover_image_thumbnail_url, cover_image_alt_es, cover_image_alt_en, cover_image_title_es, cover_image_title_en, cover_image_caption_es, cover_image_caption_en, cover_image_description_es, cover_image_description_en, published_at, service_type, location'
    )
    .eq('status', 'published')
    .eq('service_type', serviceType)
    .order('published_at', { ascending: false })
    .limit(4)

  if (error || !data) {
    console.error('getRelatedPosts failed:', error)
    return []
  }

  return data
    .filter((post) => post.slug_es !== excludeSlug && post.slug_en !== excludeSlug)
    .slice(0, 3)
    .map((post) => ({
      id: post.id,
      slug: locale === 'es' ? post.slug_es : post.slug_en,
      slug_es: post.slug_es,
      slug_en: post.slug_en,
      title: locale === 'es' ? post.title_es : post.title_en,
      excerpt: locale === 'es' ? post.excerpt_es : post.excerpt_en,
      cover_image_url: post.cover_image_url,
      cover_image_thumbnail_url: post.cover_image_thumbnail_url,
      cover_image_alt: locale === 'es' ? post.cover_image_alt_es : post.cover_image_alt_en,
      cover_image_title: locale === 'es' ? post.cover_image_title_es : post.cover_image_title_en,
      cover_image_caption: locale === 'es' ? post.cover_image_caption_es : post.cover_image_caption_en,
      cover_image_description: locale === 'es' ? post.cover_image_description_es : post.cover_image_description_en,
      published_at: post.published_at,
      service_type: post.service_type,
      location: post.location,
    }))
}

// ── end of module ────────────────────────────────────────────────────────────
