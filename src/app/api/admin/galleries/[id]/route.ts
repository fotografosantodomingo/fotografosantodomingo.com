import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'
import { deleteGalleryObjects } from '@/lib/gallery/r2'

export const runtime = 'edge'

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery, error } = await supabase.from('galleries').select('*').eq('id', params.id).single()
  if (error || !gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('id, filename, file_size, media_type, created_at')
    .eq('gallery_id', params.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ gallery, photos: photos ?? [] })
}

// Manual delete — removes R2 objects immediately, keeps the metadata row
// (same convention as expiration cleanup).
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase.from('galleries').select('id, status').eq('id', params.id).single()
  if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await deleteGalleryObjects(params.id)

  const { error } = await supabase
    .from('galleries')
    .update({ status: 'deleted', deleted_at: new Date().toISOString(), deleted_reason: 'manual' })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
