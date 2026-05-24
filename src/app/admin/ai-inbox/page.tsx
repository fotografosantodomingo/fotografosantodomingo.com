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
  conversation: {
    id: string
    buyer_locale: string
    buyer_email: string | null
    first_message_at: string
    last_message_at: string
  }
  user_message: string | null
}

export default async function AiInboxPage() {
  const admin = createServiceClient()

  // Fetch pending drafts with their conversation and the preceding user message
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

  // For each draft, grab the user message that triggered it
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

      return {
        id: d.id,
        body: d.body,
        intent: d.intent,
        risk_flags: d.risk_flags ?? [],
        confidence: d.confidence,
        created_at: d.created_at,
        conversation: conv as PendingDraft['conversation'],
        user_message: userMsg?.body ?? null,
      }
    }),
  )

  return <AiInboxClient drafts={enriched} />
}
