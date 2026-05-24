import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'edge'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url)
  const conversationId = url.searchParams.get('conversationId')
  const sessionToken = url.searchParams.get('sessionToken')
  const since = url.searchParams.get('since') // last message id the widget has seen

  if (!conversationId || !sessionToken) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 })
  }

  const admin = createServiceClient()

  // Auth: session token must match the conversation
  const { data: conv } = await admin
    .from('ai_conversations')
    .select('id, buyer_session_token')
    .eq('id', conversationId)
    .maybeSingle()
  if (!conv || conv.buyer_session_token !== sessionToken) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  let query = admin
    .from('ai_conversation_messages')
    .select('id, role, body, edited_body, sent_at, created_at')
    .eq('conversation_id', conversationId)
    .eq('role', 'assistant')
    .not('sent_at', 'is', null)
    .order('created_at', { ascending: true })

  if (since) {
    query = query.gt('created_at', since)
  }

  const { data: messages, error } = await query.limit(20)
  if (error) {
    console.error('[ai-chat/poll]', error)
    return NextResponse.json({ error: 'query_failed' }, { status: 500 })
  }

  return NextResponse.json({
    messages: (messages ?? []).map((m) => ({
      id: m.id,
      body: m.edited_body ?? m.body,
      sent_at: m.sent_at,
      created_at: m.created_at,
    })),
  })
}
