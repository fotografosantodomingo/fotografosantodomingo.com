import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'
import { createGallery } from '@/lib/gallery/service'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('galleries')
    .select(
      'id, slug, client_name, client_email, topic, included_photo_count, status, photo_count, total_bytes, created_at, ready_at, expires_at, booking_id'
      // TODO: add session_price_usd once migration 20260805043 is applied.
    )
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ galleries: data })
}

export async function POST(req: NextRequest) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const clientName = typeof body.client_name === 'string' ? body.client_name.trim() : ''
  const clientEmail = typeof body.client_email === 'string' ? body.client_email.trim().toLowerCase() : ''
  const clientEmail2 = typeof body.client_email_2 === 'string' ? body.client_email_2.trim().toLowerCase() : ''
  const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
  const bookingId = typeof body.booking_id === 'string' && body.booking_id ? body.booking_id : null
  const includedPhotoCount = Number(body.included_photo_count)

  if (!clientName || !clientEmail || !topic) {
    return NextResponse.json({ error: 'client_name, client_email, and topic are required' }, { status: 400 })
  }
  if (!Number.isFinite(includedPhotoCount) || includedPhotoCount <= 0) {
    return NextResponse.json({ error: 'included_photo_count must be a positive number' }, { status: 400 })
  }

  const supabase = createServiceClient()
  try {
    const gallery = await createGallery(supabase, {
      clientName,
      clientEmail,
      clientEmail2: clientEmail2 || null,
      topic,
      includedPhotoCount,
      bookingId,
    })
    return NextResponse.json({ gallery })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
