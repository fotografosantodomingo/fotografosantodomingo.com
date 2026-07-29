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

  const days = Number(body.days)
  if (!Number.isFinite(days) || days <= 0 || days > 90) {
    return NextResponse.json({ error: 'days must be a positive number (max 90)' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase.from('galleries').select('id, expires_at, status').eq('id', params.id).single()
  if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (gallery.status !== 'ready') {
    return NextResponse.json({ error: 'Only a ready gallery has an expiration to extend' }, { status: 409 })
  }

  const base = gallery.expires_at ? new Date(gallery.expires_at) : new Date()
  base.setDate(base.getDate() + days)
  const newExpiresAt = base.toISOString()

  const { error } = await supabase
    .from('galleries')
    .update({ expires_at: newExpiresAt, reminder_sent: false, updated_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, expires_at: newExpiresAt })
}
