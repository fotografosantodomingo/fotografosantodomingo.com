import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'
import { getGalleryObject } from '@/lib/gallery/r2'

export const runtime = 'edge'

type Params = { params: { id: string; photoId: string } }

// Streams a photo for the admin grid <img> tag — separate from the public
// download route (which logs downloads and requires a client session, not
// an admin one).
export async function GET(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: photo } = await supabase
    .from('gallery_photos')
    .select('preview_key, media_type')
    .eq('id', params.photoId)
    .eq('gallery_id', params.id)
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
