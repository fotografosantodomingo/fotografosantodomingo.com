import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'

export const runtime = 'edge'

type Params = { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const photoId = typeof body.photo_id === 'string' ? body.photo_id : ''
  if (!photoId) return NextResponse.json({ error: 'photo_id is required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: photo } = await supabase
    .from('gallery_photos')
    .select('id')
    .eq('id', photoId)
    .eq('gallery_id', params.id)
    .single()

  if (!photo) return NextResponse.json({ error: 'Photo not found in this gallery' }, { status: 404 })

  const { error } = await supabase.from('galleries').update({ cover_photo_id: photoId }).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
