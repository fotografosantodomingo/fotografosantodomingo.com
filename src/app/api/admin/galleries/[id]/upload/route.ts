import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'
import { galleryObjectKey, putGalleryObject } from '@/lib/gallery/r2'

export const runtime = 'edge'

type Params = { params: { id: string } }

/**
 * POST /api/admin/galleries/[id]/upload
 *
 * Body is the raw file bytes (browser does `fetch(url, { method: 'POST', body: file })`) —
 * streamed straight to R2, never buffered in the Worker. Filename comes via
 * the X-Filename header since the body is opaque bytes, not multipart.
 *
 * No separate resized preview is generated yet (v1 simplification — preview_key
 * points at the same R2 object as original_key). See src/lib/gallery/r2.ts.
 */
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const filenameHeader = req.headers.get('x-filename')
  const filename = filenameHeader ? decodeURIComponent(filenameHeader) : 'photo.jpg'
  const contentType = req.headers.get('content-type') || 'image/jpeg'

  if (!req.body) {
    return NextResponse.json({ error: 'Empty body' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, status')
    .eq('id', params.id)
    .single()

  if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  if (gallery.status === 'deleted' || gallery.status === 'expired') {
    return NextResponse.json({ error: `Cannot upload to a ${gallery.status} gallery` }, { status: 409 })
  }

  const photoId = crypto.randomUUID()
  const key = galleryObjectKey(params.id, photoId, 'original')

  let fileSize: number
  try {
    fileSize = await putGalleryObject(key, req.body, contentType)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `R2 upload failed: ${msg}` }, { status: 500 })
  }

  const { data: photo, error: insertError } = await supabase
    .from('gallery_photos')
    .insert({
      id: photoId,
      gallery_id: params.id,
      filename,
      original_key: key,
      preview_key: key,
      media_type: contentType,
      file_size: fileSize,
    })
    .select('id, filename, file_size')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Atomic increment — safe under concurrent uploads from a batch drag-drop.
  await supabase.rpc('increment_gallery_stats', {
    p_gallery_id: params.id,
    p_delta_count: 1,
    p_delta_bytes: fileSize,
  })

  return NextResponse.json({ photo })
}
