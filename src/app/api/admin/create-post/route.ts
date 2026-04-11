import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { CreatePostSchema } from '@/lib/automation/schemas'

const BASE_URL = 'https://www.fotografosantodomingo.com'

function normalizePortfolioCategory(serviceType?: string | null, schemaServiceType?: string | null) {
  const value = `${serviceType || ''} ${schemaServiceType || ''}`.toLowerCase()

  if (value.includes('wedding') || value.includes('boda')) return 'wedding'
  if (value.includes('drone') || value.includes('dron')) return 'drone'
  if (value.includes('event') || value.includes('evento')) return 'event'
  if (
    value.includes('portrait') ||
    value.includes('retrato') ||
    value.includes('couple') ||
    value.includes('pareja') ||
    value.includes('famil')
  ) {
    return 'portrait'
  }
  if (
    value.includes('commercial') ||
    value.includes('comercial') ||
    value.includes('fashion') ||
    value.includes('producto') ||
    value.includes('brand')
  ) {
    return 'commercial'
  }

  return 'other'
}

function normalizePublicId(publicId: string) {
  return publicId
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.(webp|jpg|jpeg|png|avif)$/i, '')
}

function withSlugSuffix(base: string, suffixNumber: number) {
  const suffix = `-${suffixNumber}`
  const maxBaseLength = Math.max(1, 200 - suffix.length)
  const trimmedBase = base.slice(0, maxBaseLength).replace(/-+$/g, '')
  return `${trimmedBase}${suffix}`
}

async function resolveUniqueSlugs(
  supabase: ReturnType<typeof createServiceClient>,
  slugEs: string,
  slugEn: string
) {
  let candidateEs = slugEs
  let candidateEn = slugEn

  for (let attempt = 1; attempt <= 200; attempt += 1) {
    const { data: collision, error } = await supabase
      .from('blog_posts')
      .select('id')
      .or(`slug_es.eq.${candidateEs},slug_en.eq.${candidateEn}`)
      .limit(1)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!collision) {
      return { slugEs: candidateEs, slugEn: candidateEn }
    }

    const suffix = attempt + 1
    candidateEs = withSlugSuffix(slugEs, suffix)
    candidateEn = withSlugSuffix(slugEn, suffix)
  }

  throw new Error('Unable to generate a unique slug after 200 attempts')
}

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.ADMIN_SECRET

  if (!authHeader?.startsWith('Bearer ') || !expectedSecret) {
    return false
  }

  const token = authHeader.slice('Bearer '.length)
  return token === expectedSecret
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json()
    const body = CreatePostSchema.parse(rawBody)
    const supabase = createServiceClient()

    const { slugEs, slugEn } = await resolveUniqueSlugs(supabase, body.slug_es, body.slug_en)

    const insertPayload = {
      slug_es: slugEs,
      slug_en: slugEn,
      title_es: body.title_es,
      title_en: body.title_en,
      content_es: body.content_es,
      content_en: body.content_en,
      excerpt_es: body.excerpt_es ?? '',
      excerpt_en: body.excerpt_en ?? '',
      meta_description_es: body.meta_description_es ?? null,
      meta_description_en: body.meta_description_en ?? null,
      og_title_es: body.og_title_es ?? null,
      og_title_en: body.og_title_en ?? null,
      primary_keyword_es: body.primary_keyword_es ?? null,
      primary_keyword_en: body.primary_keyword_en ?? null,
      cover_image_url: body.cover_image_url,
      cover_image_thumbnail_url: body.cover_image_thumbnail_url,
      cover_image_placeholder_url: body.cover_image_placeholder_url,
      cover_image_alt_es: body.cover_image_alt_es ?? null,
      cover_image_alt_en: body.cover_image_alt_en ?? null,
      cover_image_format: body.cover_image_format,
      cover_image_public_id: body.cover_image_public_id,
      schema_service_type: body.schema_service_type ?? null,
      geo_city: body.geo_city ?? null,
      geo_country: body.geo_country,
      service_type: body.service_type ?? null,
      location: body.location ?? null,
      cloudinary_folder: body.cloudinary_folder ?? null,
      intro_es: body.intro_es ?? null,
      intro_en: body.intro_en ?? null,
      location_section_es: body.location_section_es ?? null,
      location_section_en: body.location_section_en ?? null,
      faq_es: body.faq_es,
      faq_en: body.faq_en,
      reviews_es: body.reviews_es,
      reviews_en: body.reviews_en,
      internal_links_es: body.internal_links_es,
      internal_links_en: body.internal_links_en,
      setmore_service_url: body.setmore_service_url ?? null,
      instagram_post_id: body.instagram_post_id ?? null,
      status: body.status,
      published_at: body.published_at ?? new Date().toISOString(),

      // Compatibility projection for the current blog rendering layer.
      slug: slugEn,
      title: body.title_en,
      excerpt: body.excerpt_en ?? '',
      content: body.content_en,
      image: body.cover_image_url,
      seo_title: body.og_title_en ?? body.title_en,
      seo_title_es: body.og_title_es ?? body.title_es,
      seo_description: body.meta_description_en ?? body.excerpt_en ?? '',
      seo_description_es: body.meta_description_es ?? body.excerpt_es ?? '',
      seo_keywords: body.primary_keyword_en ? [body.primary_keyword_en] : [],
      seo_keywords_es: body.primary_keyword_es ? [body.primary_keyword_es] : [],
      author: 'Babula Shots',
      category: body.service_type ?? 'general',
      tags: [body.service_type, body.location].filter(Boolean),
      featured: false,
      reading_time: Math.max(5, Math.ceil(body.content_en.split(/\s+/).length / 200)),
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(insertPayload)
      .select('id, slug_es, slug_en')
      .single()

    if (error || !data) {
      console.error('create-post insert failed:', error)
      return NextResponse.json(
        { error: 'Internal server error', message: 'DB insert failed' },
        { status: 500 }
      )
    }

    if (body.status === 'published') {
      const portfolioPublicId = normalizePublicId(body.cover_image_public_id)
      const portfolioCategory = normalizePortfolioCategory(body.service_type, body.schema_service_type)
      const portfolioLocation = body.location || body.geo_city || 'República Dominicana'

      const { data: existingPortfolioImage, error: existingPortfolioError } = await supabase
        .from('portfolio_images')
        .select('id')
        .eq('public_id', portfolioPublicId)
        .maybeSingle()

      if (existingPortfolioError) {
        console.error('portfolio image lookup failed:', existingPortfolioError)
        return NextResponse.json(
          { error: 'Internal server error', message: 'Portfolio sync failed' },
          { status: 500 }
        )
      }

      if (existingPortfolioImage?.id) {
        const { error: updatePortfolioError } = await supabase
          .from('portfolio_images')
          .update({
            alt_es: body.cover_image_alt_es || body.title_es,
            alt_en: body.cover_image_alt_en || body.title_en,
            caption_es: body.excerpt_es || body.meta_description_es || body.title_es,
            caption_en: body.excerpt_en || body.meta_description_en || body.title_en,
            title_es: body.title_es,
            title_en: body.title_en,
            description_es: body.meta_description_es || body.excerpt_es || body.title_es,
            description_en: body.meta_description_en || body.excerpt_en || body.title_en,
            category: portfolioCategory,
            location: portfolioLocation,
            width: 1200,
            height: 630,
          })
          .eq('id', existingPortfolioImage.id)

        if (updatePortfolioError) {
          console.error('portfolio image update failed:', updatePortfolioError)
          return NextResponse.json(
            { error: 'Internal server error', message: 'Portfolio sync failed' },
            { status: 500 }
          )
        }
      } else {
        const { data: maxSortRow, error: maxSortError } = await supabase
          .from('portfolio_images')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (maxSortError) {
          console.error('portfolio max sort lookup failed:', maxSortError)
          return NextResponse.json(
            { error: 'Internal server error', message: 'Portfolio sync failed' },
            { status: 500 }
          )
        }

        const nextSortOrder = (maxSortRow?.sort_order ?? 0) + 1

        const { error: insertPortfolioError } = await supabase
          .from('portfolio_images')
          .insert({
            public_id: portfolioPublicId,
            alt_es: body.cover_image_alt_es || body.title_es,
            alt_en: body.cover_image_alt_en || body.title_en,
            caption_es: body.excerpt_es || body.meta_description_es || body.title_es,
            caption_en: body.excerpt_en || body.meta_description_en || body.title_en,
            title_es: body.title_es,
            title_en: body.title_en,
            description_es: body.meta_description_es || body.excerpt_es || body.title_es,
            description_en: body.meta_description_en || body.excerpt_en || body.title_en,
            category: portfolioCategory,
            location: portfolioLocation,
            featured: false,
            sort_order: nextSortOrder,
            width: 1200,
            height: 630,
          })

        if (insertPortfolioError) {
          console.error('portfolio image insert failed:', insertPortfolioError)
          return NextResponse.json(
            { error: 'Internal server error', message: 'Portfolio sync failed' },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        post_id: data.id,
        url_es: `${BASE_URL}/es/blog/${data.slug_es}/`,
        url_en: `${BASE_URL}/en/blog/${data.slug_en}/`,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 422 }
      )
    }

    console.error('create-post unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'DB insert failed' },
      { status: 500 }
    )
  }
}