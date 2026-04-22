import { NextRequest, NextResponse } from 'next/server'
import { ZodError, z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'edge'

const UpdatePostSchema = z.object({
  id: z.string().uuid({ message: 'id must be a valid UUID' }),
  status: z.enum(['published', 'draft', 'archived']).optional(),
  instagram_post_url: z.preprocess(
    (value) => (typeof value === 'string' && !value.trim() ? undefined : value),
    z.string().url().optional()
  ),
  facebook_post_url: z.preprocess(
    (value) => (typeof value === 'string' && !value.trim() ? undefined : value),
    z.string().url().optional()
  ),
  linkedin_post_url: z.preprocess(
    (value) => (typeof value === 'string' && !value.trim() ? undefined : value),
    z.string().url().optional()
  ),
  pinterest_post_url: z.preprocess(
    (value) => (typeof value === 'string' && !value.trim() ? undefined : value),
    z.string().url().optional()
  ),
  blogger_post_url: z.preprocess(
    (value) => (typeof value === 'string' && !value.trim() ? undefined : value),
    z.string().url().optional()
  ),
}).superRefine((value, ctx) => {
  if (
    !value.status &&
    !value.instagram_post_url &&
    !value.facebook_post_url &&
    !value.linkedin_post_url &&
    !value.pinterest_post_url &&
    !value.blogger_post_url
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Provide at least one updatable field (status or social URLs)',
      path: ['status'],
    })
  }
})

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.ADMIN_SECRET

  if (!authHeader?.startsWith('Bearer ') || !expectedSecret) {
    return false
  }

  const token = authHeader.slice('Bearer '.length)
  return token === expectedSecret
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json()
    const body = UpdatePostSchema.parse(rawBody)
    const supabase = createServiceClient()

    const { data: existing, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, status, slug_es, slug_en')
      .eq('id', body.id)
      .limit(1)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not found', message: `No blog post found with id: ${body.id}` },
        { status: 404 }
      )
    }

    const updates: Record<string, string> = {
      updated_at: new Date().toISOString(),
    }

    if (body.status) updates.status = body.status
    if (body.instagram_post_url) updates.instagram_post_url = body.instagram_post_url
    if (body.facebook_post_url) updates.facebook_post_url = body.facebook_post_url
    if (body.linkedin_post_url) updates.linkedin_post_url = body.linkedin_post_url
    if (body.pinterest_post_url) updates.pinterest_post_url = body.pinterest_post_url
    if (body.blogger_post_url) updates.blogger_post_url = body.blogger_post_url

    const { error: updateError } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', body.id)

    if (updateError) {
      console.error('update-post update failed:', updateError)
      return NextResponse.json(
        { error: 'Internal server error', message: 'DB update failed' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        id: body.id,
        status: body.status ?? existing.status,
        slug_es: existing.slug_es,
        slug_en: existing.slug_en,
        previous_status: existing.status,
        instagram_post_url: body.instagram_post_url ?? null,
        facebook_post_url: body.facebook_post_url ?? null,
        linkedin_post_url: body.linkedin_post_url ?? null,
        pinterest_post_url: body.pinterest_post_url ?? null,
        blogger_post_url: body.blogger_post_url ?? null,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 422 }
      )
    }

    console.error('update-post unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'DB update failed' },
      { status: 500 }
    )
  }
}