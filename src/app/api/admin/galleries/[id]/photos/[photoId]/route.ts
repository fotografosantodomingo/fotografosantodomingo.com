import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'
import { getGalleryBucket } from '@/lib/gallery/r2'

export const runtime = 'edge'

type Params = { params: { id: string; photoId: string } }

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: photo } = await supabase
    .from('gallery_photos')
    .select('id, original_key, preview_key, file_size')
    .eq('id', params.photoId)
    .eq('gallery_id', params.id)
    .single()

  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const bucket = getGalleryBucket()
  const keys = Array.from(new Set([photo.original_key, photo.preview_key]))
  await bucket.delete(keys)

  const { error: deletePhotoError } = await supabase.from('gallery_photos').delete().eq('id', params.photoId)
  if (deletePhotoError) return NextResponse.json({ error: deletePhotoError.message }, { status: 500 })

  // Clear cover_photo_id if it pointed at the deleted photo (FK is ON DELETE
  // SET NULL, but do it explicitly so the response reflects it immediately).
  await supabase.from('galleries').update({ cover_photo_id: null }).eq('id', params.id).eq('cover_photo_id', params.photoId)

  await supabase.rpc('increment_gallery_stats', {
    p_gallery_id: params.id,
    p_delta_count: -1,
    p_delta_bytes: -photo.file_size,
  })

  return NextResponse.json({ ok: true })
}
