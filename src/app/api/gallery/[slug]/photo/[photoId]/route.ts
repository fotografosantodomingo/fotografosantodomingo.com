import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedForGallery } from '@/lib/gallery/session'
import { getGalleryObject } from '@/lib/gallery/r2'

export const runtime = 'edge'

type Params = { params: { slug: string; photoId: string } }

/**
 * GET /api/gallery/[slug]/photo/[photoId]?silent=1
 *
 * Streams the original file — never a resized/watermarked copy. `silent=1`
 * skips the download-log insert; the client-side "download all" flow uses it
 * per-file so the audit trail shows one 'zip' event instead of N 'single' ones
 * (see /api/gallery/[slug]/log-download).
 */
export async function GET(req: NextRequest, { params }: Params) {
  if (!(await isAuthorizedForGallery(req, params.slug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, status')
    .eq('slug', params.slug)
    .single()

  if (!gallery || gallery.status !== 'ready') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: photo } = await supabase
    .from('gallery_photos')
    .select('id, filename, original_key, media_type')
    .eq('id', params.photoId)
    .eq('gallery_id', gallery.id)
    .single()

  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const object = await getGalleryObject(photo.original_key)
  if (!object) return NextResponse.json({ error: 'File missing' }, { status: 404 })

  const silent = req.nextUrl.searchParams.get('silent') === '1'
  if (!silent) {
    await supabase.from('gallery_downloads').insert({
      gallery_id: gallery.id,
      photo_id: photo.id,
      download_type: 'single',
      ip: req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for'),
      user_agent: req.headers.get('user-agent'),
    })
  }

  return new NextResponse(object.body, {
    headers: {
      'content-type': photo.media_type || 'image/jpeg',
      'content-disposition': `attachment; filename="${photo.filename.replace(/"/g, '')}"`,
      'content-length': String(object.size),
      'cache-control': 'private, no-store',
    },
  })
}
