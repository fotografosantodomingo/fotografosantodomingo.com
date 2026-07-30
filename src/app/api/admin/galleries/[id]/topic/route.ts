import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'

export const runtime = 'edge'

type Params = { params: { id: string } }

// Edits the topic after creation — needed since booking-auto-created
// galleries get it pre-filled from the service package name and admin may
// want to correct it, and older galleries (pre-dating this field) have none.
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

  const topic = typeof body.topic === 'string' ? body.topic.trim() : ''

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('galleries')
    .update({ topic: topic || null })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
