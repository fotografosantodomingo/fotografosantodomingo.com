import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'
import { galleryObjectKey, putGalleryObject } from '@/lib/gallery/r2'

export const runtime = 'edge'

type Params = { params: { id: string; photoId: string } }

/**
 * POST /api/admin/galleries/[id]/photos/[photoId]/preview?width=1400&height=933
 *
 * Uploads a resized preview generated client-side (see
 * src/lib/gallery/resize-client.ts) and points gallery_photos.preview_key at
 * it — separate from original_key, which is untouched and never resized.
 * Before this, preview_key == original_key, so the grid was loading full
 * multi-MB originals as "thumbnails" (the actual cause of slow mobile loads).
 */
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!req.body) return NextResponse.json({ error: 'Empty body' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: photo } = await supabase
    .from('gallery_photos')
    .select('id')
    .eq('id', params.photoId)
    .eq('gallery_id', params.id)
    .single()

  if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

  const key = galleryObjectKey(params.id, params.photoId, 'preview')
  try {
    await putGalleryObject(key, req.body, 'image/jpeg')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `R2 upload failed: ${msg}` }, { status: 500 })
  }

  const width = Number(req.nextUrl.searchParams.get('width')) || null
  const height = Number(req.nextUrl.searchParams.get('height')) || null

  const { error } = await supabase
    .from('gallery_photos')
    .update({ preview_key: key, ...(width && height ? { width, height } : {}) })
    .eq('id', params.photoId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
