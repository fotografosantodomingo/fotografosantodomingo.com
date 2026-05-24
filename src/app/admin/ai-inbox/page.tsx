import { createServiceClient } from '@/lib/supabase/service'
import AiInboxClient from './AiInboxClient'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

type PendingDraft = {
  id: string
  body: string
  intent: string | null
  risk_flags: string[]
  confidence: number | null
  created_at: string
  channel: string
  conversation: {
    id: string
    buyer_locale: string
    buyer_email: string | null
    first_message_at: string
    last_message_at: string
  }
  user_message: string | null
  email_subject: string | null
}

export default async function AiInboxPage() {
  const admin = createServiceClient()

  const { data: drafts } = await admin
    .from('ai_conversation_messages')
    .select(
      `
      id,
      body,
      intent,
      risk_flags,
      confidence,
      created_at,
      channel,
      conversation:ai_conversations!inner(
        id,
        buyer_locale,
        buyer_email,
        first_message_at,
        last_message_at
      )
    `,
    )
    .eq('role', 'assistant')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50)

  const enriched: PendingDraft[] = await Promise.all(
    (drafts ?? []).map(async (d) => {
      const conv = Array.isArray(d.conversation) ? d.conversation[0] : d.conversation

      const { data: userMsg } = await admin
        .from('ai_conversation_messages')
        .select('body')
        .eq('conversation_id', conv.id)
        .eq('role', 'user')
        .lt('created_at', d.created_at)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // For email conversations, pull the subject from email_threads
      let emailSubject: string | null = null
      if (d.channel === 'email') {
        const { data: thread } = await admin
          .from('email_threads')
          .select('subject')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single()
        emailSubject = thread?.subject ?? null
      }

      return {
        id: d.id,
        body: d.body,
        intent: d.intent,
        risk_flags: d.risk_flags ?? [],
        confidence: d.confidence,
        created_at: d.created_at,
        channel: d.channel ?? 'web_chat',
        conversation: conv as PendingDraft['conversation'],
        user_message: userMsg?.body ?? null,
        email_subject: emailSubject,
      }
    }),
  )

  return <AiInboxClient drafts={enriched} />
}
