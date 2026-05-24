import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { converse } from '@/lib/ai/converse'
import { buildPhotographerSystemPrompt } from '@/lib/ai/chat-prompts'
import { buildPhotographyKnowledge } from '@/lib/ai/chat-knowledge'
import { classifyAssistantTurn } from '@/lib/ai/gating'

export const runtime = 'edge'

const RequestSchema = z.object({
  conversationId: z.string().uuid().nullable().default(null),
  userMessage: z.string().min(1).max(4000),
  sessionToken: z.string().min(16).max(128),
  locale: z.enum(['en', 'es']).default('es'),
})

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const data = parsed.data
  const admin = createServiceClient()

  // Resolve or create conversation
  let conversationId: string
  if (data.conversationId) {
    const { data: conv } = await admin
      .from('ai_conversations')
      .select('id, buyer_session_token')
      .eq('id', data.conversationId)
      .maybeSingle()
    if (!conv || conv.buyer_session_token !== data.sessionToken) {
      return NextResponse.json({ error: 'conversation_not_found' }, { status: 404 })
    }
    conversationId = conv.id
    await admin
      .from('ai_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)
  } else {
    const { data: newConv, error: insertErr } = await admin
      .from('ai_conversations')
      .insert({
        channel: 'web_chat',
        buyer_session_token: data.sessionToken,
        buyer_locale: data.locale,
      })
      .select('id')
      .single()
    if (insertErr || !newConv) {
      console.error('[ai-chat] create conversation failed', insertErr)
      return NextResponse.json({ error: 'create_failed' }, { status: 500 })
    }
    conversationId = newConv.id
    const { error: evErr } = await admin.from('ai_conversation_events').insert({
      conversation_id: conversationId,
      kind: 'started',
      payload: { locale: data.locale },
    })
    if (evErr) console.error('[ai-chat] event insert failed', evErr)
  }

  // Persist user turn
  const { error: userInsertErr } = await admin.from('ai_conversation_messages').insert({
    conversation_id: conversationId,
    role: 'user',
    channel: 'web_chat',
    body: data.userMessage,
    approval_status: 'auto_sent',
    sent_at: new Date().toISOString(),
  })
  if (userInsertErr) {
    console.error('[ai-chat] user turn insert failed', userInsertErr)
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 })
  }

  const { error: msgEvErr } = await admin.from('ai_conversation_events').insert({
    conversation_id: conversationId,
    kind: 'message_user',
    payload: { length: data.userMessage.length },
  })
  if (msgEvErr) console.error('[ai-chat] message_user event failed', msgEvErr)

  // Pull last 20 turns for LLM context
  const { data: history } = await admin
    .from('ai_conversation_messages')
    .select('role, body, approval_status')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20)

  const messages = (history ?? [])
    .filter(
      (m) =>
        m.role === 'user' ||
        (m.role === 'assistant' && m.approval_status !== 'rejected'),
    )
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.body }))

  const systemPrompt = buildPhotographerSystemPrompt({
    buyerLocale: data.locale,
    channel: 'web_chat',
  })
  const knowledge = buildPhotographyKnowledge(data.locale)

  // Stream the LLM call and collect the full draft
  const encoder = new TextEncoder()
  let fullDraft = ''
  let inputTokens = 0
  let outputTokens = 0
  const startedAt = Date.now()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of converse({
          system: systemPrompt,
          knowledge,
          messages,
          maxTokens: 1024,
        })) {
          if (event.type === 'text-delta') {
            fullDraft += event.text
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'text-delta', text: event.text })}\n\n`,
              ),
            )
          } else if (event.type === 'done') {
            inputTokens = event.usage.input_tokens
            outputTokens = event.usage.output_tokens
          } else if (event.type === 'error') {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', error: event.error })}\n\n`,
              ),
            )
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', error: msg })}\n\n`),
        )
      }

      // Post-stream: persist assistant draft, classify, log cost
      // All awaited before close so CF Workers doesn't discard them
      const classification = classifyAssistantTurn({
        userText: data.userMessage,
        assistantDraft: fullDraft,
        locale: data.locale,
      })

      // Insert BEFORE sending done so we can include the real DB id.
      // The client uses it to replace the pendingId placeholder, which
      // lets the poll dedup correctly skip the message.
      const { data: assistantRow, error: assistantInsertErr } = await admin
        .from('ai_conversation_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          channel: 'web_chat',
          body: fullDraft,
          approval_status: 'auto_sent',
          sent_at: new Date().toISOString(),
          confidence: classification.confidence,
          intent: classification.intent,
          risk_flags: classification.riskFlags,
        })
        .select('id')
        .single()
      if (assistantInsertErr) {
        console.error('[ai-chat] assistant turn insert failed', assistantInsertErr)
      }

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: 'done', conversationId, messageId: assistantRow?.id ?? null })}\n\n`,
        ),
      )

      const costCents =
        (inputTokens * 0.003 + outputTokens * 0.015) / 1000
      const { error: logErr } = await admin.from('ai_generation_log').insert({
        conversation_id: conversationId,
        purpose: 'chat_draft',
        model: 'claude-sonnet-4-6',
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost_cents: costCents,
        latency_ms: Date.now() - startedAt,
      })
      if (logErr) console.error('[ai-chat] generation log failed', logErr)

      const { error: draftEvErr } = await admin.from('ai_conversation_events').insert({
        conversation_id: conversationId,
        kind: 'auto_sent',
        payload: {
          intent: classification.intent,
          risk_flags: classification.riskFlags,
          confidence: classification.confidence,
        },
      })
      if (draftEvErr) console.error('[ai-chat] draft_pending event failed', draftEvErr)

      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache',
      'x-conversation-id': conversationId,
    },
  })
}
