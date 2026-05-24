import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createServerClient } from '@supabase/ssr'
import { sendEmailReply } from '@/lib/email/chat-reply'

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
    .select('id, conversation_id, approval_status, body, channel')
    .eq('id', messageId)
    .maybeSingle()

  if (fetchErr || !msg) {
    return NextResponse.json({ error: 'message_not_found' }, { status: 404 })
  }
  if (msg.approval_status !== 'pending') {
    return NextResponse.json({ error: 'already_actioned' }, { status: 409 })
  }

  const finalBody = editedBody ?? msg.body
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

  // For email conversations: send the reply via Brevo
  if (msg.channel === 'email') {
    await sendEmailReply_forConversation(admin, msg.conversation_id, messageId, finalBody)
  }

  return NextResponse.json({ ok: true, status })
}

async function sendEmailReply_forConversation(
  admin: ReturnType<typeof createServiceClient>,
  conversationId: string,
  assistantMessageId: string,
  replyBody: string,
): Promise<void> {
  // Get conversation for buyer email
  const { data: conv } = await admin
    .from('ai_conversations')
    .select('buyer_email, buyer_locale')
    .eq('id', conversationId)
    .maybeSingle()
  if (!conv?.buyer_email) {
    console.error('[ai-inbox/approve] email conversation has no buyer_email', conversationId)
    return
  }

  // Get thread for subject + threading headers
  const { data: thread } = await admin
    .from('email_threads')
    .select('id, subject, root_message_id')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!thread) {
    console.error('[ai-inbox/approve] no email_threads row for conversation', conversationId)
    return
  }

  // Get the most recent inbound email_message for In-Reply-To
  const { data: lastInbound } = await admin
    .from('email_messages')
    .select('message_id, refs')
    .eq('thread_id', thread.id)
    .eq('direction', 'inbound')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const inReplyTo = lastInbound?.message_id ?? thread.root_message_id
  const references = lastInbound?.refs?.length
    ? lastInbound.refs
    : [thread.root_message_id]

  const result = await sendEmailReply({
    toAddress: conv.buyer_email,
    subject: thread.subject,
    bodyText: replyBody,
    inReplyTo,
    references,
  })

  if (!result.ok) {
    console.error('[ai-inbox/approve] email send failed', result.error)
    return
  }

  // Record the outbound email_messages row
  const { error: outErr } = await admin.from('email_messages').insert({
    conversation_message_id: assistantMessageId,
    thread_id: thread.id,
    direction: 'outbound',
    message_id: result.messageId,
    in_reply_to: inReplyTo,
    refs: references,
    from_address: process.env.EMAIL_REPLY_ADDRESS ?? 'chat@fotografosantodomingo.com',
    to_address: conv.buyer_email,
    subject: thread.subject,
  })
  if (outErr) console.error('[ai-inbox/approve] outbound email_messages insert failed', outErr)
}
