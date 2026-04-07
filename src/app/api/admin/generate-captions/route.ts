/**
 * Admin API — POST /api/admin/generate-captions
 *
 * Manually triggers AI caption generation for a single image or all images.
 * Protected by ADMIN_SECRET Bearer token (same secret as /api/admin/update-image).
 *
 * Request body:
 * {
 *   publicId:  string          // Cloudinary public_id of the image to process
 *   keywords?: string          // Page-level SEO keywords to inject into prompt
 *   category?: string          // Override category (wedding|portrait|drone|event|commercial)
 *   location?: string          // Override location
 *   model?:    string          // Override OpenAI model (default: gpt-4o-mini)
 * }
 *
 * Response:
 * { ok: true, captions: GeneratedCaptions }   // on success
 * { error: string }                           // on failure
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateBilingualCaptions } from '@/lib/ai/caption-generator'
import { createServiceClient } from '@/lib/supabase/service'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

function makeCloudinaryUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`
}

export async function POST(req: NextRequest) {
  // --- Auth ---
  const secret = process.env.ADMIN_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 503 })
  }
  const auth  = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // --- Parse body ---
  let body: {
    publicId: string
    keywords?: string
    category?: string
    location?: string
    model?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { publicId, keywords, category, location, model } = body
  if (!publicId || typeof publicId !== 'string') {
    return NextResponse.json({ error: 'publicId is required' }, { status: 400 })
  }

  if (!CLOUD_NAME) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set' }, { status: 503 })
  }

  // --- Build image URL + context ---
  const imageUrl = makeCloudinaryUrl(publicId)
  const context = {
    category,
    location,
    keywords,
  }

  // --- Generate ---
  let captions: Awaited<ReturnType<typeof generateBilingualCaptions>>
  try {
    captions = await generateBilingualCaptions(imageUrl, context, model)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'AI generation failed' }, { status: 500 })
  }

  // --- Save to Supabase (upsert so it works for new images too) ---
  const supabase = createServiceClient()
  const { error: dbError } = await supabase
    .from('portfolio_images')
    .upsert({
      public_id: publicId,
      ...captions,
      category:        category ?? 'other',
      location:        location ?? '',
      ai_generated:    true,
      ai_generated_at: new Date().toISOString(),
      seo_keywords:    keywords ?? '',
    }, { onConflict: 'public_id' })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, captions })
}
