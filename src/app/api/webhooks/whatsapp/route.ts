import { NextRequest } from 'next/server'
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
        if (m.type !== 'text') continue

        const phoneNumber  = String(m.from ?? '')
        const waMessageId  = String(m.id ?? '')
        const textBody     = (m.text as Record<string, unknown>)?.body as string | undefined
        const waTimestamp  = new Date(Number(m.timestamp ?? 0) * 1000).toISOString()
        const displayName  = contacts?.[0]?.profile
          ? String((contacts[0].profile as Record<string, unknown>).name ?? '')
          : undefined

        if (!phoneNumber || !waMessageId) continue

        // Store message — if duplicate (webhook retry), skip entirely
        const { data: insertedMsg, error: insertErr } = await sb
          .from('whatsapp_messages')
          .upsert({
            phone_number:  phoneNumber,
            display_name:  displayName ?? null,
            wa_message_id: waMessageId,
            direction:     'inbound',
            body:          textBody ?? null,
            media_type:    'text',
            wa_timestamp:  waTimestamp,
          }, { onConflict: 'wa_message_id', ignoreDuplicates: true })
          .select('id')

        if (insertErr || !insertedMsg || insertedMsg.length === 0) continue

        // Fetch full conversation thread for both auto-reply and quote
        const { data: thread } = await sb
          .from('whatsapp_messages')
          .select('direction, body, wa_timestamp')
          .eq('phone_number', phoneNumber)
          .not('body', 'is', null)
          .order('wa_timestamp', { ascending: true })

        // ── Auto-reply via Claude ─────────────────────────────────────────────
        await handleAutoReply(sb, phoneNumber, waMessageId, thread ?? [], displayName)

        // ── Quote creation after 5+ messages ─────────────────────────────────
        const { count } = await sb
          .from('whatsapp_messages')
          .select('id', { count: 'exact', head: true })
          .eq('phone_number', phoneNumber)
          .eq('direction', 'inbound')
          .eq('quote_generated', false)

        if ((count ?? 0) < 5) continue

        const { data: existing } = await sb
          .from('whatsapp_messages')
          .select('id')
          .eq('phone_number', phoneNumber)
          .eq('quote_generated', true)
          .limit(1)

        if (existing && existing.length > 0) continue

        if (!thread || thread.length === 0) continue

        const transcript = thread
          .map(r => `[${r.direction === 'inbound' ? 'Client' : 'Us'}]: ${r.body}`)
          .join('\n')

        const extracted = await extractQuoteFields(transcript, displayName)
        if (!extracted) continue

        const serviceType = extracted.service_type ?? null
        const { data: quote, error: quoteErr } = await sb
          .from('quotes')
          .insert({
            status:            'PENDING_REVIEW',
            locale:            extracted.locale ?? 'es',
            full_name:         extracted.full_name ?? displayName ?? null,
            whatsapp_phone:    phoneNumber,
            service_type:      serviceType,
            event_date:        extracted.event_date ?? null,
            city:              extracted.city ?? null,
            country:           extracted.country ?? null,
            description:       extracted.description ?? null,
            whatsapp_raw_text: transcript,
            scoping_checklist: getChecklistTemplate(serviceType),
            payment_mode:      'FULL',
            source_page:       'whatsapp',
            form_step_reached: 1,
          })
          .select('id')
          .single()

        if (quoteErr || !quote) continue

        await sb
          .from('whatsapp_messages')
          .update({ quote_generated: true, quote_id: quote.id })
          .eq('phone_number', phoneNumber)

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

// ─── Auto-reply ───────────────────────────────────────────────────────────────

type ThreadRow = { direction: string; body: string | null; wa_timestamp: string }

async function handleAutoReply(
  sb: ReturnType<typeof createServiceClient>,
  phoneNumber: string,
  waMessageId: string,
  thread: ThreadRow[],
  displayName?: string,
): Promise<void> {
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!accessToken || !phoneNumberId) return

  // Skip if we already replied to this specific inbound message
  const replyMsgId = `bot-${waMessageId}`
  const { data: alreadySent } = await sb
    .from('whatsapp_messages')
    .select('id')
    .eq('wa_message_id', replyMsgId)
    .maybeSingle()
  if (alreadySent) return

  const reply = await generateSalesReply(thread, displayName)
  if (!reply) return

  // Send via WhatsApp Cloud API
  const sent = await sendWhatsAppMessage(phoneNumber, reply, accessToken, phoneNumberId)
  if (!sent) return

  // Store outbound reply
  await sb.from('whatsapp_messages').insert({
    phone_number:  phoneNumber,
    wa_message_id: replyMsgId,
    direction:     'outbound',
    body:          reply,
    media_type:    'text',
    wa_timestamp:  new Date().toISOString(),
  })
}

async function sendWhatsAppMessage(
  to: string,
  message: string,
  accessToken: string,
  phoneNumberId: string,
): Promise<boolean> {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

async function generateSalesReply(
  thread: ThreadRow[],
  displayName?: string,
): Promise<string | null> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const conversation = thread
      .map(r => `[${r.direction === 'inbound' ? 'Cliente' : 'Nosotros'}]: ${r.body}`)
      .join('\n')

    const resp = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: `Eres el asistente de ventas de Babula Shots (fotografosantodomingo.com), estudio de fotografía profesional en Santo Domingo, República Dominicana.

TONO: Cálido, profesional, conciso. Estilo WhatsApp — respuestas cortas (máx. 5 líneas). Responde en español salvo que el cliente escriba en inglés.

TU OBJETIVO: Entender qué necesitan → recomendar el paquete correcto → dirigir a cotizar o confirmar.

PREGUNTAS CLAVE (hazlas de forma natural, no todas a la vez):
- ¿Qué tipo de evento? (boda, familia, propuesta, corporativo, cumpleaños, retrato, drone)
- ¿Qué fecha?
- ¿Dónde (ciudad/lugar)?
- ¿Cuántas horas / invitados?
- ¿Necesitan video también?

PAQUETES REALES (usa siempre estos números exactos, nunca inventes):

BODAS — /es/services/wedding-photography
• Boda Esencial: hasta 4h · 80 fotos · $900 · entrega 14 días
• Boda Premium: hasta 6h · 150 fotos · $1,500 · entrega 14 días
• Día Completo Lujo: hasta 8h · 250 fotos · $2,500 · teaser mismo día

FAMILIA — /es/services/family-beach-photography
• Esencial: 1h · hasta 5 personas · 20 fotos · $350 · entrega 7 días
• Premium Playa: 90min · hasta 10 personas · 30 fotos · $480
• Lujo Saona/Catalina: 3h · 40 fotos · $650 (lancha incluida)

RETRATO — /es/services/luxury-portrait-photography
• Esencial: 1h · 15 fotos · $250 · entrega 48h
• Editorial Premium: 90min · 25 fotos · $390 · entrega 48h
• Sesión Firma: 2h · 40 fotos · $550

PROPUESTA — /es/services/proposal-photography
• Playa Secreta: 2h oculta · 20 fotos · $250 · entrega 24h
• Propuesta Firma: 3h · 35 fotos · $390 · misma noche
• Lujo + Drone: 4h · 50 fotos · $480 · misma noche

EVENTOS CORPORATIVOS — /es/services/corporate-event-photography
• Por Hora Estándar: $100/h · mínimo 2h · entrega 48h
• Por Hora Premium: $200/h · mínimo 2h · teaser mismo día + full 24h
• Día Completo: 8h · $550 · entrega 48h

QUINCEAÑERAS / CUMPLEAÑOS — /es/services/birthday-event-photography
• Cobertura Esencial: 1h · 20 fotos · $200 · entrega 7 días
• Celebración Firma: 2h · 30 fotos · $350 · entrega 7 días
• Quinceañera Premium: 4h · 60 fotos · $500 · entrega 14 días

COMERCIAL — /es/services/commercial-branding-photography
• Esencial: 1h · 15 imágenes · $400 · entrega 48h
• Branding Premium: 3h · 30 imágenes · $700
• Campaña Lujo: 6h · 60 imágenes · $1,200

DRONE / INMOBILIARIA — /es/services/real-estate-drone-photography
• Listado Esencial: 90min · 20 fotos · $200 · entrega 48h
• Propiedad Premium: 3h · 35 fotos + drone · $400
• Finca Lujo: 4h · 50+ fotos + video 4K drone · $600

COTIZAR: fotografosantodomingo.com/es/cotizar

REGLAS:
- Máximo 5 líneas por respuesta — es WhatsApp, no email
- No listes todos los paquetes a la vez — solo los 2 más relevantes
- Si no tienes suficiente info para recomendar, haz UNA pregunta concreta
- Nunca prometas disponibilidad — di "verificaremos disponibilidad para esa fecha"
- Para solicitudes muy complejas: "Nuestro fotógrafo te contactará en breve para una propuesta personalizada"
- Agosto, diciembre y enero son temporada alta — úsalo para crear urgencia`,

      messages: [{
        role:    'user',
        content: `Conversación WhatsApp${displayName ? ` con ${displayName}` : ''}:\n\n${conversation}\n\nGenera la respuesta al último mensaje del cliente.`,
      }],
    })

    const text = resp.content[0].type === 'text' ? resp.content[0].text.trim() : null
    return text || null
  } catch {
    return null
  }
}

// ─── Claude quote extraction ──────────────────────────────────────────────────

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
  const BASE     = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.fotografosantodomingo.com'
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
        ${data.eventDate  ? row('Fecha del evento', data.eventDate) : ''}
        ${data.city       ? row('Ciudad', data.city) : ''}
        ${data.description ? row('Descripción', data.description) : ''}
      </table>
      ${data.description ? `<p style="margin:16px 0 0;color:#6b7280;font-style:italic">${data.description}</p>` : ''}
      <div style="margin-top:24px;display:flex;gap:12px">
        <a href="${adminUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Ver cotización →</a>
        <a href="${waUrl}"    style="display:inline-block;background:#25d366;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Abrir WhatsApp</a>
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
