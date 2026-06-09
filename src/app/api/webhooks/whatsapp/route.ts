import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getAdminRecipients } from '@/lib/email/admin-recipients'
import { sendMail } from '@/lib/email/smtp'
import { getChecklistTemplate } from '@/lib/quotes/checklist'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'edge'

// ─── Meta webhook verification (GET) ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? '', { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// ─── Incoming message handler (POST) ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return new Response('ok', { status: 200 }) }

  const entry = (body as Record<string, unknown>)?.entry
  if (!Array.isArray(entry)) return new Response('ok', { status: 200 })

  const sb = createServiceClient()

  for (const e of entry) {
    const changes = (e as Record<string, unknown>)?.changes
    if (!Array.isArray(changes)) continue

    for (const change of changes) {
      const value = (change as Record<string, unknown>)?.value as Record<string, unknown> | undefined
      const messages = value?.messages
      if (!Array.isArray(messages)) continue

      const contacts = value?.contacts as Array<Record<string, unknown>> | undefined

      for (const msg of messages) {
        const m = msg as Record<string, unknown>
        if (m.type !== 'text') continue  // skip non-text for now

        const phoneNumber  = String(m.from ?? '')
        const waMessageId  = String(m.id ?? '')
        const textBody     = (m.text as Record<string, unknown>)?.body as string | undefined
        const waTimestamp  = new Date(Number(m.timestamp ?? 0) * 1000).toISOString()
        const displayName  = contacts?.[0]?.profile
          ? String((contacts[0].profile as Record<string, unknown>).name ?? '')
          : undefined

        if (!phoneNumber || !waMessageId) continue

        // Store message (upsert on wa_message_id to deduplicate retries)
        const { error: insertErr } = await sb.from('whatsapp_messages').upsert({
          phone_number:   phoneNumber,
          display_name:   displayName ?? null,
          wa_message_id:  waMessageId,
          direction:      'inbound',
          body:           textBody ?? null,
          media_type:     'text',
          wa_timestamp:   waTimestamp,
        }, { onConflict: 'wa_message_id', ignoreDuplicates: true })

        if (insertErr) continue

        // Count messages from this phone where no quote has been generated yet
        const { count } = await sb
          .from('whatsapp_messages')
          .select('id', { count: 'exact', head: true })
          .eq('phone_number', phoneNumber)
          .eq('direction', 'inbound')
          .eq('quote_generated', false)

        if ((count ?? 0) < 5) continue

        // Check no quote already generated for this phone
        const { data: existing } = await sb
          .from('whatsapp_messages')
          .select('id')
          .eq('phone_number', phoneNumber)
          .eq('quote_generated', true)
          .limit(1)

        if (existing && existing.length > 0) continue

        // Fetch all messages for this phone to feed Claude
        const { data: thread } = await sb
          .from('whatsapp_messages')
          .select('direction, body, wa_timestamp')
          .eq('phone_number', phoneNumber)
          .not('body', 'is', null)
          .order('wa_timestamp', { ascending: true })

        if (!thread || thread.length === 0) continue

        const transcript = thread
          .map(r => `[${r.direction === 'inbound' ? 'Client' : 'Us'}]: ${r.body}`)
          .join('\n')

        // Extract quote fields with Claude
        const extracted = await extractQuoteFields(transcript, displayName)
        if (!extracted) continue

        // Create draft quote
        const serviceType = extracted.service_type ?? null
        const { data: quote, error: quoteErr } = await sb
          .from('quotes')
          .insert({
            status:             'PENDING_REVIEW',
            locale:             extracted.locale ?? 'es',
            full_name:          extracted.full_name ?? displayName ?? null,
            whatsapp_phone:     phoneNumber,
            service_type:       serviceType,
            event_date:         extracted.event_date ?? null,
            city:               extracted.city ?? null,
            country:            extracted.country ?? null,
            description:        extracted.description ?? null,
            whatsapp_raw_text:  transcript,
            scoping_checklist:  getChecklistTemplate(serviceType),
            payment_mode:       'FULL',
            source_page:        'whatsapp',
            form_step_reached:  1,
          })
          .select('id')
          .single()

        if (quoteErr || !quote) continue

        // Mark all messages for this phone as quote generated
        await sb
          .from('whatsapp_messages')
          .update({ quote_generated: true, quote_id: quote.id })
          .eq('phone_number', phoneNumber)

        // Notify admin
        await notifyAdmin({
          quoteId:     quote.id,
          phoneNumber,
          displayName: extracted.full_name ?? displayName ?? phoneNumber,
          serviceType: extracted.service_type ?? 'Unknown',
          eventDate:   extracted.event_date ?? null,
          city:        extracted.city ?? null,
          description: extracted.description ?? null,
        })
      }
    }
  }

  return new Response('ok', { status: 200 })
}

// ─── Claude extraction ────────────────────────────────────────────────────────

type ExtractedQuote = {
  full_name:    string | null
  service_type: string | null
  event_date:   string | null
  city:         string | null
  country:      string | null
  description:  string | null
  locale:       'es' | 'en'
}

async function extractQuoteFields(
  transcript: string,
  displayName?: string,
): Promise<ExtractedQuote | null> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const resp = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `You extract photography booking details from WhatsApp conversations.
Return ONLY valid JSON with these fields (null if unknown):
- full_name: string
- service_type: one of WEDDINGS, ENGAGEMENT_SESSION, QUINCEANERAS, MATERNITY, FAMILY, BIRTHDAY_PARTY, BAPTISMS, GRADUATION, CHILDRENS_SESSIONS, ARCHITECTURE, PORTRAITS, CORPORATE_PORTRAITS, FOOD_AND_BEVERAGE, VIDEO_PRODUCTION, DRONE_AERIAL, OTHER
- event_date: YYYY-MM-DD string
- city: string
- country: string
- description: 1-2 sentence summary of what the client wants
- locale: "es" or "en" based on language used`,
      messages: [{
        role:    'user',
        content: `WhatsApp conversation:\n\n${transcript}${displayName ? `\n\nClient display name: ${displayName}` : ''}`,
      }],
    })

    const text = resp.content[0].type === 'text' ? resp.content[0].text : ''
    const json = text.match(/\{[\s\S]*\}/)?.[0]
    if (!json) return null
    return JSON.parse(json) as ExtractedQuote
  } catch {
    return null
  }
}

// ─── Admin notification ───────────────────────────────────────────────────────

async function notifyAdmin(data: {
  quoteId:     string
  phoneNumber: string
  displayName: string
  serviceType: string
  eventDate:   string | null
  city:        string | null
  description: string | null
}) {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.fotografosantodomingo.com'
  const adminUrl = `${BASE}/admin/quotes/${data.quoteId}`
  const waUrl    = `https://wa.me/${data.phoneNumber.replace(/\D/g, '')}`

  await sendMail({
    from:    'Babula Shots <noreply@fotografosantodomingo.com>',
    to:      getAdminRecipients(),
    subject: `💬 Nueva cotización desde WhatsApp — ${data.displayName}`,
    html: `
<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px 12px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#25d366,#128c7e);padding:22px 24px">
      <p style="margin:0;color:#d1fae5;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700">WhatsApp Auto-Quote</p>
      <h2 style="margin:8px 0 0;color:#fff;font-size:22px">Nueva cotización generada</h2>
      <p style="margin:8px 0 0;color:#d1fae5;font-size:14px">${data.displayName} · ${data.phoneNumber}</p>
    </div>
    <div style="padding:20px 24px;font-size:14px;color:#374151">
      <table style="width:100%;border-collapse:collapse">
        ${row('Servicio', data.serviceType.replace(/_/g, ' '))}
        ${data.eventDate ? row('Fecha del evento', data.eventDate) : ''}
        ${data.city      ? row('Ciudad', data.city) : ''}
        ${data.description ? row('Descripción', data.description) : ''}
      </table>
      ${data.description ? `<p style="margin:16px 0 0;color:#6b7280;font-style:italic">${data.description}</p>` : ''}
      <div style="margin-top:24px;display:flex;gap:12px">
        <a href="${adminUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Ver cotización →</a>
        <a href="${waUrl}" style="display:inline-block;background:#25d366;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Abrir WhatsApp</a>
      </div>
    </div>
  </div>
</div>`,
  })
}

function row(label: string, value: string) {
  return `<tr style="border-bottom:1px solid #f1f5f9">
    <td style="padding:8px 12px 8px 0;color:#6b7280;white-space:nowrap">${label}</td>
    <td style="padding:8px 0">${value}</td>
  </tr>`
}
