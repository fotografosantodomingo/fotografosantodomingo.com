/**
 * Admin route: POST /api/admin/update-image
 *
 * Updates localized SEO fields for a portfolio image.
 * Protected by ADMIN_SECRET env var — must be passed as Bearer token.
 */

import { NextRequest, NextResponse } from 'next/server'
import { updateImageSeo } from '@/lib/supabase/images'

export async function POST(req: NextRequest) {
  // --- Auth check ---
  const secret = process.env.ADMIN_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 503 })
  }

  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''

  if (token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // --- Parse body ---
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    id,
    alt_es, alt_en,
    caption_es, caption_en,
    title_es, title_en,
    description_es, description_en,
  } = body

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { error } = await updateImageSeo(id, {
    alt_es, alt_en,
    caption_es, caption_en,
    title_es, title_en,
    description_es, description_en,
  })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
