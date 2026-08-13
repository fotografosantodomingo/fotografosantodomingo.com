import { NextRequest, NextResponse } from 'next/server'
import { downloadZip } from 'client-zip'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedForGallery } from '@/lib/gallery/session'
import { getGalleryBucket } from '@/lib/gallery/r2'

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
  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, topic, client_name, status, password_hash')
    .eq('slug', params.slug)
    .single()

  if (!gallery || gallery.status !== 'ready') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (gallery.password_hash && !(await isAuthorizedForGallery(req, params.slug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  // getGalleryBucket() resolves the R2 binding via getRequestContext(), which
  // is only valid synchronously within this handler's own call stack. The
  // async generator below is consumed lazily by client-zip as the response
  // stream is actually read — potentially after this function has returned
  // — so the binding must be captured here, once, up front. Re-deriving it
  // inside the generator (the original bug) silently failed on every photo,
  // shipping a technically-valid but empty zip.
  const bucket = getGalleryBucket()
  const metadata = photos.map((p) => ({ name: p.filename, size: p.file_size }))

  async function* inputs() {
    for (const p of photos!) {
      const obj = await bucket.get(p.original_key)
      if (!obj) throw new Error(`Missing R2 object for ${p.filename} (${p.original_key})`)
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
