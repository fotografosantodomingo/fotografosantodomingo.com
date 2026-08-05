import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'

export const runtime = 'edge'

type Params = { params: { id: string } }

// Sets the full session price — the basis for the selection-overage
// percentage. Post-creation only (not part of the "New gallery" form) since
// it's only needed once a client might actually select over their included
// count; freestanding galleries with no overage risk can leave it unset.
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

  const raw = body.session_price_usd
  const value = raw === '' || raw === null || raw === undefined ? null : Number(raw)
  if (value !== null && (!Number.isFinite(value) || value < 0)) {
    return NextResponse.json({ error: 'session_price_usd must be a non-negative number' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('galleries').update({ session_price_usd: value }).eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
