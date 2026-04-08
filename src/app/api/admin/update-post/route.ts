import { NextRequest, NextResponse } from 'next/server'
import { ZodError, z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

const UpdatePostSchema = z.object({
  id: z.string().uuid({ message: 'id must be a valid UUID' }),
  status: z.enum(['published', 'draft', 'archived']),
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

    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        status: body.status,
        updated_at: new Date().toISOString(),
      })
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
        status: body.status,
        slug_es: existing.slug_es,
        slug_en: existing.slug_en,
        previous_status: existing.status,
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