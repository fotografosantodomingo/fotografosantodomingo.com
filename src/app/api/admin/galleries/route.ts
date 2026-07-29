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
      'id, slug, client_name, client_email, status, photo_count, total_bytes, created_at, ready_at, expires_at, booking_id'
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
  const bookingId = typeof body.booking_id === 'string' && body.booking_id ? body.booking_id : null

  if (!clientName || !clientEmail) {
    return NextResponse.json({ error: 'client_name and client_email are required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  try {
    const gallery = await createGallery(supabase, { clientName, clientEmail, bookingId })
    return NextResponse.json({ gallery })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
