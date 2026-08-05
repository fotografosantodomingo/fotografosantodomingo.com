import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'

export const runtime = 'edge'

type Params = { params: { id: string } }

// Edits the included-photo-count after creation — booking-auto-created
// galleries inherit it from package_snapshot.photo_count, but admin may
// need to correct it, and older galleries (pre-dating this field) have none.
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

  const raw = body.included_photo_count
  const value = raw === '' || raw === null || raw === undefined ? null : Number(raw)
  if (value !== null && (!Number.isFinite(value) || value <= 0)) {
    return NextResponse.json({ error: 'included_photo_count must be a positive number' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('galleries')
    .update({ included_photo_count: value })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
