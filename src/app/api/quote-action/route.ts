import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyActionSig } from '@/lib/quotes/action-links'
import { generateProposalSlug } from '@/lib/quotes/slug'
import { sendWhatsAppText } from '@/lib/whatsapp/send'

export const runtime = 'edge'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'
const EXPIRY_DAYS = 14

function page(title: string, body: string, status = 200, link?: { url: string; label: string }): Response {
  const cta = link
    ? `<p style="margin:22px 0 0"><a href="${link.url}" style="display:inline-block;background:#c8a96e;color:#0e0e0d;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700">${link.label}</a></p>`
    : ''
  return new Response(
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;background:#0e0e0d;color:#f0ede6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px}
    .box{max-width:480px;padding:40px;border:1px solid #2e2c29;background:#161513;border-radius:14px;text-align:center}
    h1{color:#c8a96e;font-size:1.5rem;margin:0 0 12px}p{color:#b8b4ad;font-size:14px;margin:0;line-height:1.6}</style>
    </head><body><div class="box"><h1>${title}</h1><p>${body}</p>${cta}</div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html;charset=utf-8' } },
  )
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const quoteId = url.searchParams.get('id') ?? ''
  const action  = url.searchParams.get('action') ?? ''
  const ts      = parseInt(url.searchParams.get('ts') ?? '0', 10)
  const sig     = url.searchParams.get('sig') ?? ''

  if (!quoteId || !['accept', 'decline'].includes(action)) {
    return page('Enlace inválido', 'Este enlace no es válido.', 400)
  }

  const valid = await verifyActionSig(quoteId, action, ts, sig)
  if (!valid) {
    return page('Enlace expirado o inválido', 'Este enlace ya no es válido (caduca a los 14 días). Abre la cotización desde el panel admin.', 403)
  }

  const sb = createServiceClient()

  // ── DECLINE ────────────────────────────────────────────────────────────────
  if (action === 'decline') {
    await sb.from('quotes').update({ status: 'REJECTED' }).eq('id', quoteId)
    return page('Propuesta descartada', 'La cotización fue marcada como rechazada. No se envió nada al cliente.')
  }

  // ── ACCEPT ───────────────────────────────────────────────────────────────────
  const { data: quote, error } = await sb
    .from('quotes')
    .select('id, status, locale, full_name, whatsapp_phone, final_price_usd, admin_note_customer, proposal_slug, service_type')
    .eq('id', quoteId)
    .single()

  if (error || !quote) return page('Error', 'No se encontró la cotización.', 404)

  if (quote.status === 'REJECTED') {
    return page('Ya descartada', 'Esta cotización fue rechazada anteriormente. Reábrela desde el panel admin si quieres enviarla.', 200, { url: `${BASE}/admin/quotes/${quoteId}`, label: 'Abrir cotización' })
  }
  if (!quote.final_price_usd || Number(quote.final_price_usd) <= 0) {
    return page('Falta el precio', 'El bot no fijó un precio para esta cotización. Ábrela en el panel para fijarlo antes de enviar.', 200, { url: `${BASE}/admin/quotes/${quoteId}`, label: 'Fijar precio' })
  }

  const slug = quote.proposal_slug ?? generateProposalSlug(quote.full_name)
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 3600 * 1000).toISOString()

  const { error: updErr } = await sb
    .from('quotes')
    .update({ status: 'SENT_TO_CUSTOMER', proposal_slug: slug, proposal_expires_at: expiresAt })
    .eq('id', quoteId)

  if (updErr) return page('Error', `No se pudo actualizar la cotización: ${updErr.message}`, 500)

  const proposalUrl = `${BASE}/quotations/${slug}`

  // Send proposal to the client over WhatsApp
  let waOk = false
  if (quote.whatsapp_phone) {
    const isEn = quote.locale === 'en'
    const intro = quote.admin_note_customer
      ?? (isEn
        ? `Your photography proposal is ready 🎉`
        : `¡Tu propuesta de fotografía está lista! 🎉`)
    const cta = isEn
      ? `View and confirm your booking here 👇\n${proposalUrl}`
      : `Mira y confirma tu reserva aquí 👇\n${proposalUrl}`
    waOk = await sendWhatsAppText(quote.whatsapp_phone, `${intro}\n\n${cta}`)

    if (waOk) {
      await sb.from('whatsapp_messages').insert({
        phone_number:  quote.whatsapp_phone,
        wa_message_id: `proposal-${quoteId}-${Date.now()}`,
        direction:     'outbound',
        body:          `${intro}\n\n${cta}`,
        media_type:    'text',
        wa_timestamp:  new Date().toISOString(),
      })
    }
  }

  return page(
    'Propuesta enviada ✓',
    waOk
      ? `La propuesta de <strong>$${Number(quote.final_price_usd).toLocaleString()}</strong> fue enviada a ${quote.full_name ?? 'el cliente'} por WhatsApp.`
      : `La cotización quedó lista, pero no se pudo enviar el WhatsApp automáticamente (ventana de 24h o falta de número). Puedes copiar el enlace abajo.`,
    200,
    { url: proposalUrl, label: 'Ver propuesta del cliente' },
  )
}
