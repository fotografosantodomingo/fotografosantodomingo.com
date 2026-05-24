import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { converse } from '@/lib/ai/converse'
import { buildPhotographerSystemPrompt } from '@/lib/ai/chat-prompts'
import { buildPhotographyKnowledge } from '@/lib/ai/chat-knowledge'
import { classifyAssistantTurn } from '@/lib/ai/gating'

export const runtime = 'edge'

const REPLY_ADDRESS = process.env.EMAIL_REPLY_ADDRESS ?? 'chat@fotografosantodomingo.com'

async function verifyHmac(payload: string, sig: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const sigBytes = Uint8Array.from(
    sig.match(/.{2}/g)!.map((b) => parseInt(b, 16)),
  )
  return crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payload))
}

function normalizeSubject(subject: string): string {
  return subject.replace(/^(re|fwd?|aw|sv):\s*/gi, '').trim().toLowerCase()
}

function detectLocale(text: string): 'en' | 'es' {
  const esWords = /\b(hola|gracias|precio|sesión|quiero|tengo|fotos|boda|cuánto|cómo|necesito)\b/i
  return esWords.test(text) ? 'es' : 'en'
}

const InboundSchema = z.object({
  to: z.string(),
  from: z.string(),
  messageId: z.string(),
  inReplyTo: z.string().nullable().default(null),
  references: z.array(z.string()).default([]),
  subject: z.string(),
  bodyText: z.string().default(''),
  bodyHtml: z.string().default(''),
  dkimPass: z.boolean().default(false),
  spfPass: z.boolean().default(false),
  dmarcPass: z.boolean().default(false),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Verify HMAC
  const secret = process.env.EMAIL_INBOUND_SECRET
  if (!secret) {
    console.error('[inbound/email] EMAIL_INBOUND_SECRET not set')
    return NextResponse.json({ error: 'misconfigured' }, { status: 500 })
  }
  const sig = req.headers.get('x-inbound-signature') ?? ''
  const rawBody = await req.text()
  const valid = await verifyHmac(rawBody, sig, secret).catch(() => false)
  if (!valid) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  // 2. Parse + validate
  const parsed = InboundSchema.safeParse(JSON.parse(rawBody))
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }
  const data = parsed.data
  const admin = createServiceClient()

  // 3. Idempotency — skip if we've already processed this message_id
  const { data: existing } = await admin
    .from('email_messages')
    .select('id')
    .eq('message_id', data.messageId)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  const locale = detectLocale(data.bodyText)
  const userBody = data.bodyText.trim() || '(email with no text body)'

  // 4. Thread resolution via In-Reply-To or subject fallback
  let threadId: string
  let conversationId: string
  const subjectNorm = normalizeSubject(data.subject)

  let existingThread: { id: string; conversation_id: string; root_message_id: string } | null = null

  if (data.inReplyTo) {
    // Try to find a thread that contains a message with this Message-ID
    const { data: parentMsg } = await admin
      .from('email_messages')
      .select('thread_id, email_threads!inner(id, conversation_id, root_message_id)')
      .eq('message_id', data.inReplyTo)
      .maybeSingle()
    if (parentMsg) {
      const t = Array.isArray(parentMsg.email_threads)
        ? parentMsg.email_threads[0]
        : (parentMsg.email_threads as any)
      existingThread = { id: t.id, conversation_id: t.conversation_id, root_message_id: t.root_message_id }
    }
  }

  // Subject fallback: same buyer, same normalised subject, within 30 days
  if (!existingThread) {
    const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    const { data: subjectMatch } = await admin
      .from('email_threads')
      .select('id, conversation_id, root_message_id')
      .eq('buyer_email', data.from)
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
    // Update last_message_at on the conversation
    await admin
      .from('ai_conversations')
      .update({ last_message_at: new Date().toISOString(), buyer_email: data.from })
      .eq('id', conversationId)
  } else {
    // New thread + new conversation
    const { data: newConv, error: convErr } = await admin
      .from('ai_conversations')
      .insert({
        channel: 'email',
        buyer_session_token: crypto.randomUUID(), // placeholder for email convs
        buyer_email: data.from,
        buyer_locale: locale,
      })
      .select('id')
      .single()
    if (convErr || !newConv) {
      console.error('[inbound/email] create conversation failed', convErr)
      return NextResponse.json({ error: 'create_failed' }, { status: 500 })
    }
    conversationId = newConv.id

    const { data: newThread, error: threadErr } = await admin
      .from('email_threads')
      .insert({
        conversation_id: conversationId,
        subject: data.subject,
        subject_normalized: subjectNorm,
        root_message_id: data.messageId,
        buyer_email: data.from,
      })
      .select('id')
      .single()
    if (threadErr || !newThread) {
      console.error('[inbound/email] create thread failed', threadErr)
      return NextResponse.json({ error: 'create_failed' }, { status: 500 })
    }
    threadId = newThread.id

    await admin.from('ai_conversation_events').insert({
      conversation_id: conversationId,
      kind: 'started',
      payload: { channel: 'email', from: data.from },
    })
  }

  // 5. Insert user turn into spine
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
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 })
  }

  // 6. Insert inbound email_messages row
  const { error: emErr } = await admin.from('email_messages').insert({
    conversation_message_id: userMsg.id,
    thread_id: threadId,
    direction: 'inbound',
    message_id: data.messageId,
    in_reply_to: data.inReplyTo,
    refs: data.references,
    from_address: data.from,
    to_address: data.to,
    subject: data.subject,
    dkim_pass: data.dkimPass,
    spf_pass: data.spfPass,
    dmarc_pass: data.dmarcPass,
  })
  if (emErr) console.error('[inbound/email] email_messages insert failed', emErr)

  await admin.from('ai_conversation_events').insert({
    conversation_id: conversationId,
    kind: 'message_user',
    payload: { channel: 'email', subject: data.subject },
  })

  // 7. Pull conversation history for LLM context
  const { data: history } = await admin
    .from('ai_conversation_messages')
    .select('role, body, approval_status')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20)

  const messages = (history ?? [])
    .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.approval_status !== 'rejected'))
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.body }))

  // 8. Generate AI draft
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
    console.error('[inbound/email] LLM call failed', err)
    // Store without draft — admin can draft manually
    return NextResponse.json({ ok: true, drafted: false })
  }

  // 9. Classify + persist assistant draft as PENDING (HITL for email)
  const classification = classifyAssistantTurn({ userText: userBody, assistantDraft: fullDraft, locale })

  const { data: assistantMsg, error: aErr } = await admin
    .from('ai_conversation_messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      channel: 'email',
      body: fullDraft,
      approval_status: 'pending',  // email stays HITL — you review before it sends
      confidence: classification.confidence,
      intent: classification.intent,
      risk_flags: classification.riskFlags,
    })
    .select('id')
    .single()
  if (aErr) console.error('[inbound/email] assistant turn insert failed', aErr)

  // 10. Log cost
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

  return NextResponse.json({ ok: true, drafted: true, conversationId })
}
