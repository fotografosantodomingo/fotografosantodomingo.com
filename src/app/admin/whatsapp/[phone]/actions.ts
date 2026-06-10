'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

export type ReplyState = { error: string | null; success: boolean }

export async function sendManualReply(
  _prev: ReplyState,
  formData: FormData,
): Promise<ReplyState> {
  const phone = String(formData.get('phone') ?? '')
  const body  = String(formData.get('body') ?? '').trim()

  if (!phone || !body) return { error: 'Mensaje vacío.', success: false }

  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!accessToken || !phoneNumberId) {
    return { error: 'WhatsApp API no configurado (faltan tokens).', success: false }
  }

  // Send via WhatsApp Cloud API
  let res: Response
  try {
    res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body },
      }),
    })
  } catch {
    return { error: 'Error de red al enviar el mensaje.', success: false }
  }

  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json() as { error?: { message?: string } }
      detail = j.error?.message ?? ''
    } catch { /* ignore */ }
    // The 24h customer-service window is the most common failure.
    return {
      error: detail || 'No se pudo enviar. Posible ventana de 24h cerrada — el cliente debe escribir primero.',
      success: false,
    }
  }

  const sentJson = await res.json().catch(() => ({})) as { messages?: Array<{ id?: string }> }
  const waMessageId = sentJson.messages?.[0]?.id ?? `manual-${Date.now()}`

  // Store outbound message
  const sb = createServiceClient()
  await sb.from('whatsapp_messages').insert({
    phone_number:  phone,
    wa_message_id: waMessageId,
    direction:     'outbound',
    body,
    media_type:    'text',
    wa_timestamp:  new Date().toISOString(),
  })

  revalidatePath(`/admin/whatsapp/${encodeURIComponent(phone)}`)
  return { error: null, success: true }
}
