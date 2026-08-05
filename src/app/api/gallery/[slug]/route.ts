import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedForGallery } from '@/lib/gallery/session'
import type { PublicGallery } from '@/lib/gallery/types'

export const runtime = 'edge'

type Params = { params: { slug: string } }

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await isAuthorizedForGallery(req, params.slug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, slug, client_name, topic, status, photo_count, total_bytes, expires_at, included_photo_count')
    .eq('slug', params.slug)
    .single()

  if (!gallery || gallery.status === 'deleted') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (gallery.status === 'expired') {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  // TODO: select 'selected' once migration 20260805043_gallery_selection.sql
  // (adds gallery_photos.selected) has been applied — until then this would
  // break the live download gallery for every client with a "column does
  // not exist" error.
  const { data: photoRows } = await supabase
    .from('gallery_photos')
    .select('id, filename, width, height, file_size')
    .eq('gallery_id', gallery.id)
    .order('created_at', { ascending: true })

  const response: PublicGallery = {
    slug: gallery.slug,
    client_name: gallery.client_name,
    topic: gallery.topic,
    status: gallery.status,
    photo_count: gallery.photo_count,
    total_bytes: gallery.total_bytes,
    expires_at: gallery.expires_at,
    included_photo_count: gallery.included_photo_count,
    photos: (photoRows ?? []).map((p) => ({
      id: p.id,
      filename: p.filename,
      width: p.width,
      height: p.height,
      file_size: p.file_size,
      selected: false, // TODO: read real value once the column is migrated
    })),
  }

  return NextResponse.json(response)
}
