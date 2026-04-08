/**
 * Supabase-backed blog helpers.
 *
 * Tries the DB first; falls back to the static hardcoded posts in
 * src/lib/blog/posts.ts so the site never breaks during maintenance.
 *
 * NEVER import this file from client components.
 */

import { createServiceClient } from './service'
import type { BlogPost } from '@/lib/blog/posts'
import { blogPosts } from '@/lib/blog/posts'

// ── DB row → BlogPost ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToPost(row: Record<string, any>): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    titleEs: row.title_es,
    excerpt: row.excerpt,
    excerptEs: row.excerpt_es,
    content: row.content,
    contentEs: row.content_es,
    author: row.author ?? 'Babula Shots',
    publishedAt: row.published_at,
    updatedAt: row.updated_at ?? undefined,
    category: row.category,
    tags: row.tags ?? [],
    featured: row.featured ?? false,
    image: row.image ?? '',
    readingTime: row.reading_time ?? 5,
    seo: {
      title: row.seo_title || row.title,
      titleEs: row.seo_title_es || row.title_es,
      description: row.seo_description || row.excerpt,
      descriptionEs: row.seo_description_es || row.excerpt_es,
      keywords: row.seo_keywords ?? [],
      keywordsEs: row.seo_keywords_es ?? [],
    },
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getAllPostsFromDb(): Promise<BlogPost[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error || !data || data.length === 0) return staticFallback()
    return data.map(dbToPost)
  } catch {
    return staticFallback()
  }
}

export async function getPostBySlugFromDb(slug: string): Promise<BlogPost | undefined> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) return staticPostFallback(slug)
    return dbToPost(data)
  } catch {
    return staticPostFallback(slug)
  }
}

export async function getFeaturedPostsFromDb(): Promise<BlogPost[]> {
  const posts = await getAllPostsFromDb()
  return posts.filter((p) => p.featured)
}

export async function getPostsByCategoryFromDb(category: string): Promise<BlogPost[]> {
  const posts = await getAllPostsFromDb()
  return posts.filter((p) => p.category === category)
}

export async function getRelatedPostsFromDb(
  post: BlogPost,
  limit = 3
): Promise<BlogPost[]> {
  const posts = await getAllPostsFromDb()
  return posts
    .filter(
      (p) =>
        p.slug !== post.slug &&
        (p.category === post.category || p.tags.some((t) => post.tags.includes(t)))
    )
    .slice(0, limit)
}

export async function searchPostsFromDb(query: string): Promise<BlogPost[]> {
  const posts = await getAllPostsFromDb()
  const q = query.toLowerCase()
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.titleEs.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.excerptEs.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
  )
}

// ── Fallback helpers ─────────────────────────────────────────────────────────

function staticFallback(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

function staticPostFallback(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
