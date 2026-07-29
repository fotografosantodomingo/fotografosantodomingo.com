import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedForGallery } from '@/lib/gallery/session'

export const runtime = 'edge'

type Params = { params: { slug: string } }

// Called once at the start of a "download all" — the per-file fetches that
// follow use ?silent=1 on the photo route, so this is the single row that
// represents the whole batch/zip action.
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAuthorizedForGallery(req, params.slug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    /* body optional */
  }
  const downloadType = body.download_type === 'batch' ? 'batch' : 'zip'

  const supabase = createServiceClient()
  const { data: gallery } = await supabase.from('galleries').select('id').eq('slug', params.slug).single()
  if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase.from('gallery_downloads').insert({
    gallery_id: gallery.id,
    photo_id: null,
    download_type: downloadType,
    ip: req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for'),
    user_agent: req.headers.get('user-agent'),
  })

  return NextResponse.json({ ok: true })
}
