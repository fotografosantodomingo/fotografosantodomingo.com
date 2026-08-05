import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedForGallery } from '@/lib/gallery/session'

export const runtime = 'edge'

type Params = { params: { slug: string; photoId: string } }

/**
 * POST /api/gallery/[slug]/photo/[photoId]/select
 * body: { selected: boolean }
 *
 * Saved immediately on every swipe — not just at final submit — so a closed
 * tab or backgrounded phone never loses progress through the deck.
 */
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAuthorizedForGallery(req, params.slug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const selected = body.selected === true

  const supabase = createServiceClient()
  const { data: gallery } = await supabase.from('galleries').select('id, status').eq('slug', params.slug).single()
  if (!gallery || gallery.status !== 'selecting') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('gallery_photos')
    .update({ selected })
    .eq('id', params.photoId)
    .eq('gallery_id', gallery.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
