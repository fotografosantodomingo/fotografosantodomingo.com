import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedForGallery } from '@/lib/gallery/session'
import { getGalleryObject } from '@/lib/gallery/r2'

export const runtime = 'edge'

type Params = { params: { slug: string; photoId: string } }

// Inline display for the grid <img> — separate from the sibling download
// route, which forces Content-Disposition: attachment and logs a download.
// Not logged, since just viewing the grid isn't "downloading a photo."
export async function GET(req: NextRequest, { params }: Params) {
  if (!(await isAuthorizedForGallery(req, params.slug))) {
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
      'cache-control': 'private, max-age=3600',
    },
  })
}
