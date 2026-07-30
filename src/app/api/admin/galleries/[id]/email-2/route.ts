import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'

export const runtime = 'edge'

type Params = { params: { id: string } }

// Lets an admin add/edit the optional second recipient after creation — the
// booking auto-create path only ever has one email (bookings.customer_email),
// so this is how a partner's email gets added for those galleries.
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

  const raw = typeof body.client_email_2 === 'string' ? body.client_email_2.trim().toLowerCase() : ''

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('galleries')
    .update({ client_email_2: raw || null })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
