import { NextRequest, NextResponse } from 'next/server'
import { downloadZip } from 'client-zip'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedForGallery } from '@/lib/gallery/session'
import { getGalleryObject } from '@/lib/gallery/r2'

export const runtime = 'edge'

type Params = { params: { slug: string } }

function sanitizeFilename(name: string) {
  return name.replace(/[/\\:*?"<>|]/g, '').trim() || 'galeria'
}

/**
 * GET /api/gallery/[slug]/download-all
 *
 * Streams a ZIP of every original photo, built on the fly (client-zip pulls
 * one R2 object at a time into the archive — never buffers the whole thing
 * in Worker memory, no matter how many hundreds of photos). Content-Length
 * is set from the DB's stored file sizes (predicted exactly, no need to
 * touch R2 first), so the browser gets an accurate total for a real
 * percentage progress bar client-side — replaces the old client-side JSZip
 * approach, which needed the ugly "download in batches" fallback for large
 * galleries since it buffered everything in the browser's memory instead.
 */
export async function GET(req: NextRequest, { params }: Params) {
  if (!(await isAuthorizedForGallery(req, params.slug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, topic, client_name, status')
    .eq('slug', params.slug)
    .single()

  if (!gallery || gallery.status !== 'ready') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('filename, original_key, file_size')
    .eq('gallery_id', gallery.id)
    .order('created_at', { ascending: true })

  if (!photos || photos.length === 0) {
    return NextResponse.json({ error: 'No photos' }, { status: 404 })
  }

  await supabase.from('gallery_downloads').insert({
    gallery_id: gallery.id,
    photo_id: null,
    download_type: 'zip',
    ip: req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for'),
    user_agent: req.headers.get('user-agent'),
  })

  const metadata = photos.map((p) => ({ name: p.filename, size: p.file_size }))

  async function* inputs() {
    for (const p of photos!) {
      const obj = await getGalleryObject(p.original_key)
      if (!obj) continue // skip a photo whose R2 object went missing rather than fail the whole zip
      yield { input: obj.body, name: p.filename, size: p.file_size }
    }
  }

  const zipResponse = downloadZip(inputs(), { metadata })
  const headers = new Headers(zipResponse.headers)
  const zipName = sanitizeFilename(gallery.topic || gallery.client_name)
  headers.set('content-disposition', `attachment; filename="${zipName}.zip"`)
  headers.set('cache-control', 'private, no-store')

  return new NextResponse(zipResponse.body, { status: 200, headers })
}
