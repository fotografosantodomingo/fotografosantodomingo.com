import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'edge'

async function getAdminUserId(req: NextRequest): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    },
  )
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null
  const { data } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .single()
  return data ? session.user.id : null
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminId = await getAdminUserId(req)
  if (!adminId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const messageId: string | undefined = body?.messageId
  const editedBody: string | undefined = body?.editedBody

  if (!messageId) {
    return NextResponse.json({ error: 'missing_messageId' }, { status: 400 })
  }

  const admin = createServiceClient()
  const now = new Date().toISOString()

  const { data: msg, error: fetchErr } = await admin
    .from('ai_conversation_messages')
    .select('id, conversation_id, approval_status')
    .eq('id', messageId)
    .maybeSingle()

  if (fetchErr || !msg) {
    return NextResponse.json({ error: 'message_not_found' }, { status: 404 })
  }
  if (msg.approval_status !== 'pending') {
    return NextResponse.json({ error: 'already_actioned' }, { status: 409 })
  }

  const status = editedBody ? 'edited' : 'approved'
  const { error: updateErr } = await admin
    .from('ai_conversation_messages')
    .update({
      approval_status: status,
      edited_body: editedBody ?? null,
      approved_by: adminId,
      approved_at: now,
      sent_at: now,
    })
    .eq('id', messageId)

  if (updateErr) {
    console.error('[ai-inbox/approve]', updateErr)
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  const { error: evErr } = await admin.from('ai_conversation_events').insert({
    conversation_id: msg.conversation_id,
    kind: status,
    payload: { message_id: messageId, approved_by: adminId },
  })
  if (evErr) console.error('[ai-inbox/approve] event failed', evErr)

  return NextResponse.json({ ok: true, status })
}
