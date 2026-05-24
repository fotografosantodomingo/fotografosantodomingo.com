import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { converse } from '@/lib/ai/converse'
import { buildPhotographerSystemPrompt } from '@/lib/ai/chat-prompts'
import { buildPhotographyKnowledge } from '@/lib/ai/chat-knowledge'
import { classifyAssistantTurn } from '@/lib/ai/gating'

export const runtime = 'edge'

const REPLY_ADDRESS = process.env.EMAIL_REPLY_ADDRESS ?? 'chat@mail.fotografosantodomingo.com'

function normalizeSubject(subject: string): string {
  return subject.replace(/^(re|fwd?|aw|sv):\s*/gi, '').trim().toLowerCase()
}

function detectLocale(text: string): 'en' | 'es' {
  const esWords = /\b(hola|gracias|precio|sesi[oó]n|quiero|tengo|fotos|boda|cu[aá]nto|c[oó]mo|necesito)\b/i
  return esWords.test(text) ? 'es' : 'en'
}

// Brevo inbound parsing webhook schema
const BrevoMessageSchema = z.object({
  MessageId: z.string(),
  InReplyTo: z.string().nullable().optional(),
  From: z.object({ Address: z.string() }),
  To: z.array(z.object({ Address: z.string() })).default([]),
  Subject: z.string().default('(no subject)'),
  MessageBody: z
    .array(z.object({ ContentType: z.string(), Content: z.string() }))
    .default([]),
  Headers: z.record(z.string()).optional().default({}),
  SpamScore: z.number().optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Validate shared secret in query param
  const secret = process.env.BREVO_INBOUND_SECRET
  if (!secret) {
    console.error('[inbound/email] BREVO_INBOUND_SECRET not set')
    return NextResponse.json({ error: 'misconfigured' }, { status: 500 })
  }
  if (req.nextUrl.searchParams.get('secret') !== secret) {
    return NextResponse.json({ error: 'invalid_secret' }, { status: 401 })
  }

  // 2. Parse — Brevo sends an array (usually length 1)
  let arr: unknown[]
  try {
    const raw = await req.text()
    const parsed = JSON.parse(raw)
    arr = Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  for (const item of arr) {
    const result = BrevoMessageSchema.safeParse(item)
    if (!result.success) {
      console.error('[inbound/email] schema mismatch', result.error.flatten())
      continue
    }
    await processEmail(result.data)
  }

  return NextResponse.json({ ok: true })
}

async function processEmail(data: z.infer<typeof BrevoMessageSchema>): Promise<void> {
  // Spam gate
  if ((data.SpamScore ?? 0) > 5) return

  const admin = createServiceClient()

  // Idempotency
  const { data: existing } = await admin
    .from('email_messages')
    .select('id')
    .eq('message_id', data.MessageId)
    .maybeSingle()
  if (existing) return

  const fromAddress = data.From.Address.toLowerCase()
  const toAddress = data.To[0]?.Address ?? REPLY_ADDRESS
  const inReplyTo = data.InReplyTo ?? null

  // Parse References header
  const refsRaw =
    data.Headers?.['References'] ?? data.Headers?.['references'] ?? ''
  const references = refsRaw
    .split(/\s+/)
    .filter((r) => r.startsWith('<') && r.endsWith('>'))

  const textBody =
    data.MessageBody.find((b) => b.ContentType === 'text/plain')?.Content ??
    data.MessageBody[0]?.Content ??
    ''

  const locale = detectLocale(textBody)
  const userBody = textBody.trim() || '(email with no text body)'
  const subjectNorm = normalizeSubject(data.Subject)

  // Thread resolution: In-Reply-To → subject fallback
  let threadId: string
  let conversationId: string
  let existingThread: { id: string; conversation_id: string; root_message_id: string } | null = null

  if (inReplyTo) {
    const { data: parentMsg } = await admin
      .from('email_messages')
      .select('thread_id, email_threads!inner(id, conversation_id, root_message_id)')
      .eq('message_id', inReplyTo)
      .maybeSingle()
    if (parentMsg) {
      const t = Array.isArray(parentMsg.email_threads)
        ? parentMsg.email_threads[0]
        : (parentMsg.email_threads as { id: string; conversation_id: string; root_message_id: string })
      existingThread = t
    }
  }

  if (!existingThread) {
    const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    const { data: subjectMatch } = await admin
      .from('email_threads')
      .select('id, conversation_id, root_message_id')
      .eq('buyer_email', fromAddress)
      .eq('subject_normalized', subjectNorm)
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (subjectMatch) existingThread = subjectMatch
  }

  if (existingThread) {
    threadId = existingThread.id
    conversationId = existingThread.conversation_id
    await admin
      .from('ai_conversations')
      .update({ last_message_at: new Date().toISOString(), buyer_email: fromAddress })
      .eq('id', conversationId)
  } else {
    const { data: newConv, error: convErr } = await admin
      .from('ai_conversations')
      .insert({
        channel: 'email',
        buyer_session_token: crypto.randomUUID(),
        buyer_email: fromAddress,
        buyer_locale: locale,
      })
      .select('id')
      .single()
    if (convErr || !newConv) {
      console.error('[inbound/email] create conversation failed', convErr)
      return
    }
    conversationId = newConv.id

    const { data: newThread, error: threadErr } = await admin
      .from('email_threads')
      .insert({
        conversation_id: conversationId,
        subject: data.Subject,
        subject_normalized: subjectNorm,
        root_message_id: data.MessageId,
        buyer_email: fromAddress,
      })
      .select('id')
      .single()
    if (threadErr || !newThread) {
      console.error('[inbound/email] create thread failed', threadErr)
      return
    }
    threadId = newThread.id

    await admin.from('ai_conversation_events').insert({
      conversation_id: conversationId,
      kind: 'started',
      payload: { channel: 'email', from: fromAddress },
    })
  }

  // User turn
  const { data: userMsg, error: userErr } = await admin
    .from('ai_conversation_messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      channel: 'email',
      body: userBody,
      approval_status: 'auto_sent',
      sent_at: new Date().toISOString(),
    })
    .select('id')
    .single()
  if (userErr || !userMsg) {
    console.error('[inbound/email] user turn insert failed', userErr)
    return
  }

  await admin.from('email_messages').insert({
    conversation_message_id: userMsg.id,
    thread_id: threadId,
    direction: 'inbound',
    message_id: data.MessageId,
    in_reply_to: inReplyTo,
    refs: references,
    from_address: fromAddress,
    to_address: toAddress,
    subject: data.Subject,
    dkim_pass: false,
    spf_pass: false,
    dmarc_pass: false,
  })

  await admin.from('ai_conversation_events').insert({
    conversation_id: conversationId,
    kind: 'message_user',
    payload: { channel: 'email', subject: data.Subject },
  })

  // Build conversation history for LLM
  const { data: history } = await admin
    .from('ai_conversation_messages')
    .select('role, body, approval_status')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20)

  const messages = (history ?? [])
    .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.approval_status !== 'rejected'))
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.body }))

  // AI draft
  const systemPrompt = buildPhotographerSystemPrompt({ buyerLocale: locale, channel: 'web_chat' })
  const knowledge = buildPhotographyKnowledge(locale)
  const startedAt = Date.now()
  let fullDraft = ''
  let inputTokens = 0
  let outputTokens = 0

  try {
    for await (const event of converse({ system: systemPrompt, knowledge, messages, maxTokens: 1024 })) {
      if (event.type === 'text-delta') fullDraft += event.text
      else if (event.type === 'done') {
        inputTokens = event.usage.input_tokens
        outputTokens = event.usage.output_tokens
      }
    }
  } catch (err) {
    console.error('[inbound/email] LLM failed', err)
    return
  }

  const classification = classifyAssistantTurn({ userText: userBody, assistantDraft: fullDraft, locale })

  await admin.from('ai_conversation_messages').insert({
    conversation_id: conversationId,
    role: 'assistant',
    channel: 'email',
    body: fullDraft,
    approval_status: 'pending',
    confidence: classification.confidence,
    intent: classification.intent,
    risk_flags: classification.riskFlags,
  })

  const costCents = (inputTokens * 0.003 + outputTokens * 0.015) / 1000
  await admin.from('ai_generation_log').insert({
    conversation_id: conversationId,
    purpose: 'email_draft',
    model: 'claude-sonnet-4-6',
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost_cents: costCents,
    latency_ms: Date.now() - startedAt,
  })

  await admin.from('ai_conversation_events').insert({
    conversation_id: conversationId,
    kind: 'draft_pending',
    payload: { channel: 'email', intent: classification.intent, risk_flags: classification.riskFlags },
  })
}
