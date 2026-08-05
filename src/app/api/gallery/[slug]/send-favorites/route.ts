import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedForGallery } from '@/lib/gallery/session'
import { sendPhotographerSelectionNotice } from '@/lib/email/galleries'

export const runtime = 'edge'

type Params = { params: { slug: string } }

/**
 * POST /api/gallery/[slug]/send-favorites
 *
 * The "ready" (delivery) gallery equivalent of submit-selection — but
 * simpler: no included-count math, no overage, no Stripe, and no status
 * change (the gallery is already final; liking here is pure favoriting).
 * Can be called repeatedly as the client changes their mind — each call
 * just re-sends the current favorites list.
 */
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAuthorizedForGallery(req, params.slug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, slug, client_name, topic, status')
    .eq('slug', params.slug)
    .single()

  if (!gallery || gallery.status !== 'ready') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: favoritePhotos } = await supabase
    .from('gallery_photos')
    .select('filename')
    .eq('gallery_id', gallery.id)
    .eq('selected', true)

  const filenames = (favoritePhotos ?? []).map((p) => p.filename)
  if (filenames.length === 0) {
    return NextResponse.json({ error: 'No favorites marked yet' }, { status: 400 })
  }

  const emailSent = await sendPhotographerSelectionNotice({
    slug: gallery.slug,
    clientName: gallery.client_name,
    topic: gallery.topic,
    selectedFilenames: filenames,
    includedPhotoCount: 0,
    overageTier: 0,
    overageAmountUsd: null,
  })

  return NextResponse.json({ ok: true, emailSent, favoriteCount: filenames.length })
}
