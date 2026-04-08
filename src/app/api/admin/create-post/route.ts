import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { CreatePostSchema } from '@/lib/automation/schemas'

const BASE_URL = 'https://www.fotografosantodomingo.com'

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

    const { data: existingEs } = await supabase
      .from('blog_posts')
      .select('id, slug_es')
      .eq('slug_es', body.slug_es)
      .limit(1)
      .maybeSingle()

    if (existingEs) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'A post with this slug already exists',
          conflicting_field: 'slug_es',
          existing_slug: existingEs.slug_es,
        },
        { status: 409 }
      )
    }

    const { data: existingEn } = await supabase
      .from('blog_posts')
      .select('id, slug_en')
      .eq('slug_en', body.slug_en)
      .limit(1)
      .maybeSingle()

    if (existingEn) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'A post with this slug already exists',
          conflicting_field: 'slug_en',
          existing_slug: existingEn.slug_en,
        },
        { status: 409 }
      )
    }

    const insertPayload = {
      slug_es: body.slug_es,
      slug_en: body.slug_en,
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
      status: body.status,
      published_at: body.published_at ?? new Date().toISOString(),

      // Compatibility projection for the current blog rendering layer.
      slug: body.slug_en,
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