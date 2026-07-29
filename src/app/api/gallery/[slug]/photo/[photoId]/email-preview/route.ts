import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyPhotoPreviewToken } from '@/lib/gallery/crypto'
import { gallerySessionSecret } from '@/lib/gallery/session'
import { getGalleryObject } from '@/lib/gallery/r2'

export const runtime = 'edge'

type Params = { params: { slug: string; photoId: string } }

/**
 * GET /api/gallery/[slug]/photo/[photoId]/email-preview?token=...
 *
 * Thumbnail source for <img> tags in emails — email clients can't send the
 * gallery session cookie, so this uses a signed token instead (see
 * signPhotoPreviewToken), scoped to one photo and expiring with the gallery
 * itself rather than the short-lived browser session.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const token = req.nextUrl.searchParams.get('token') ?? ''
  const verified = await verifyPhotoPreviewToken(token, gallerySessionSecret())
  if (!verified || verified.slug !== params.slug || verified.photoId !== params.photoId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase.from('galleries').select('id, status').eq('slug', params.slug).single()
  if (!gallery || gallery.status !== 'ready') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: photo } = await supabase
    .from('gallery_photos')
    .select('preview_key, media_type')
    .eq('id', params.photoId)
    .eq('gallery_id', gallery.id)
    .single()

  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const object = await getGalleryObject(photo.preview_key)
  if (!object) return NextResponse.json({ error: 'File missing' }, { status: 404 })

  return new NextResponse(object.body, {
    headers: {
      'content-type': photo.media_type || 'image/jpeg',
      'content-length': String(object.size),
      'cache-control': 'private, max-age=86400',
    },
  })
}
