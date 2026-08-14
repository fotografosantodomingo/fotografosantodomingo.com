/**
 * Emails for the auto dual-quote pipeline (src/lib/quotes/auto-generate.ts →
 * admin alert; src/app/api/quote-option-action/route.ts → customer final quote).
 *
 * Built on the same "Bugatti" dark-luxury shell as the rest of the quotes
 * system (qdOpen/qdCard/qdBtn/qdClose, exported from ./resend.ts) so these
 * read as the same brand as sendProposalEmail / sendQuotePaymentConfirmation.
 */

import { sendMail } from './smtp'
import { getAdminRecipients } from './admin-recipients'
import { qdOpen, qdClose, qdCard, qdBtn, FROM } from './resend'
import type { SlotResult } from '@/lib/quotes/availability-check'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function fmtDate(dateYmd: string, locale: 'es' | 'en'): string {
  return new Date(`${dateYmd}T00:00:00`).toLocaleDateString(
    locale === 'es' ? 'es-DO' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  )
}

function fmtMoney(usd: number): string {
  return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
}

/** Availability line for the ADMIN alert — short, factual, no persuasion. */
function adminAvailabilityLine(a: SlotResult): string {
  switch (a.kind) {
    case 'no_date_requested':
      return 'No date requested by customer'
    case 'confirmed':
      return `✅ Available — ${a.date} at ${a.time} AST`
    case 'alternate':
      return `⚠️ Requested date is full — nearest opening: ${a.date} at ${a.time} AST (+${a.daysOffset}d)`
    case 'no_slots_found':
      return `⚠️ No openings found in the lookahead window`
  }
}

/** Availability sentence for the CUSTOMER email — warm, decided. */
function customerAvailabilitySentence(a: SlotResult, locale: 'es' | 'en'): string {
  const isEs = locale === 'es'
  if (a.kind === 'confirmed') {
    const date = fmtDate(a.date, locale)
    return isEs
      ? `¡Buenas noticias! Confirmamos que <strong>${date}</strong> está disponible — hemos reservado las <strong>${a.time}</strong> para ti.`
      : `Good news — we're happy to confirm <strong>${date}</strong> is available. We've held <strong>${a.time}</strong> for you.`
  }
  if (a.kind === 'alternate') {
    const date = fmtDate(a.date, locale)
    return isEs
      ? `La fecha que solicitaste ya está reservada, pero tenemos disponibilidad el <strong>${date}</strong> a las <strong>${a.time}</strong>. Hemos reservado ese espacio para ti — si prefieres otra fecha, respóndenos y lo coordinamos.`
      : `The date you requested is already booked, but we have an opening on <strong>${date}</strong> at <strong>${a.time}</strong>. We've held that slot for you — reply if you'd prefer a different date and we'll coordinate.`
  }
  return isEs
    ? 'Coordinemos la fecha y hora exactas de tu sesión — responde a este correo o escríbenos por WhatsApp.'
    : "Let's coordinate the exact date and time for your session — reply to this email or reach us on WhatsApp."
}

// ─── Admin: dual-quote alert ───────────────────────────────────────────────

export type AdminQuoteOption = {
  quoteId: string
  label: 'cheaper' | 'premium'
  packageName: string
  durationMin: number
  inclusions: string[]
  finalPriceUsd: number
  depositUsd: number
  availability: SlotResult
  acceptUrl: string
  declineUrl: string
}

export async function sendAdminDualQuoteAlert(data: {
  quoteRequestId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  eventDateRequested: string | null
  options: AdminQuoteOption[]
}): Promise<void> {
  const optionBlocks = data.options.map(opt => {
    const labelText = opt.label === 'cheaper' ? 'CHEAPER OPTION' : 'PREMIUM OPTION'
    const inclusionsList = opt.inclusions.length
      ? `<ul style="margin:10px 0 0;padding-left:18px;color:#8a8680;font-size:13px;line-height:1.8">${opt.inclusions.map(i => `<li>${escape(i)}</li>`).join('')}</ul>`
      : ''
    return `
      <p style="margin:26px 0 0;color:#c8a96e;font-size:9px;letter-spacing:.35em;text-transform:uppercase;font-weight:700">${labelText}</p>
      <h3 style="margin:6px 0 0;color:#f0ede6;font-size:19px;font-weight:400">${escape(opt.packageName)}</h3>
      ${inclusionsList}
      ${qdCard([
        { label: 'DURATION', value: `${opt.durationMin} min` },
        { label: 'PRICE', value: fmtMoney(opt.finalPriceUsd), gold: true },
        { label: 'DEPOSIT (50%)', value: fmtMoney(opt.depositUsd) },
        { label: 'AVAILABILITY', value: adminAvailabilityLine(opt.availability) },
      ])}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 8px">
        <tr>
          <td width="50%" align="center" style="padding-right:6px">
            <a href="${opt.acceptUrl}" style="display:block;background:#2f6b3f;color:#f0ede6;padding:13px 10px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">✓ Approve &amp; Send</a>
          </td>
          <td width="50%" align="center" style="padding-left:6px">
            <a href="${opt.declineUrl}" style="display:block;background:#3a2626;color:#d8b8b8;padding:13px 10px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">✕ Deny</a>
          </td>
        </tr>
      </table>
    `
  }).join('<div style="border-top:1px solid #2e2c29;margin:28px 0 0"></div>')

  await sendMail({
    from: FROM,
    to: getAdminRecipients(),
    replyTo: data.customerEmail,
    subject: `📋 Auto-quote ready: ${data.customerName} — approve or deny`,
    html: `
      ${qdOpen('New lead, priced automatically', `${data.customerName} · ${data.customerEmail}`)}

      <p style="margin:0 0 18px;color:#8a8680;line-height:1.7;font-size:13px">
        ${data.customerPhone ? `Phone: ${escape(data.customerPhone)}<br>` : ''}
        Requested date: ${data.eventDateRequested ? escape(data.eventDateRequested) : 'not specified'}
      </p>

      ${optionBlocks}

      <p style="margin:24px 0 0;color:#5a5753;font-size:11px;text-align:center;line-height:1.9">
        Approving one option automatically declines the other. Availability shown was checked when this email was generated — it is re-verified live at the moment you click Approve.
      </p>

      ${qdClose()}
    `,
  })
}

// ─── Customer: final quote (full inline HTML, not a PDF or teaser) ─────────

export async function sendCustomerFinalQuoteEmail(data: {
  email: string
  fullName: string
  locale: 'es' | 'en'
  packageName: string
  inclusions: string[]
  durationMin: number
  lineItems: Array<{ description: string; amount_usd: number }>
  finalPriceUsd: number
  depositUsd: number
  availability: SlotResult
  proposalUrl: string
  proposalSlug: string
}): Promise<void> {
  const isEs = data.locale === 'es'

  const inclusionsList = data.inclusions.length
    ? `<ul style="margin:10px 0 24px;padding-left:18px;color:#8a8680;font-size:14px;line-height:1.9">${data.inclusions.map(i => `<li>${escape(i)}</li>`).join('')}</ul>`
    : ''

  const lineItemRows = data.lineItems.map(li => ({
    label: li.description.toUpperCase(),
    value: fmtMoney(li.amount_usd),
  }))

  await sendMail({
    from: FROM,
    to: data.email,
    subject: isEs
      ? `Tu cotización para ${data.packageName} — Babula Shots`
      : `Your quote for ${data.packageName} — Babula Shots`,
    html: `
      ${qdOpen(
        isEs ? 'Tu cotización está lista' : 'Your quote is ready',
        isEs ? `Hola, ${data.fullName}` : `Hi, ${data.fullName}`,
      )}

      <p style="margin:0 0 22px;color:#8a8680;line-height:1.7;font-size:14px">
        ${customerAvailabilitySentence(data.availability, data.locale)}
      </p>

      <p style="margin:0 0 6px;color:#5a5753;font-size:9px;letter-spacing:.35em;text-transform:uppercase;font-weight:700">
        ${isEs ? 'SESIÓN' : 'SESSION'}
      </p>
      <h3 style="margin:0 0 4px;color:#f0ede6;font-size:20px;font-weight:400">${escape(data.packageName)}</h3>
      <p style="margin:0;color:#8a8680;font-size:13px">${data.durationMin} min</p>
      ${inclusionsList}

      ${qdCard([
        ...lineItemRows,
        { label: isEs ? 'TOTAL' : 'TOTAL', value: fmtMoney(data.finalPriceUsd), gold: true },
        { label: isEs ? 'DEPÓSITO PARA RESERVAR (50%)' : 'DEPOSIT TO RESERVE (50%)', value: fmtMoney(data.depositUsd) },
      ])}

      ${qdBtn(data.proposalUrl, isEs ? 'RESERVAR MI FECHA →' : 'RESERVE MY DATE →')}

      <p style="margin:0;color:#5a5753;font-size:11px;text-align:center;line-height:1.9;letter-spacing:.03em">
        ${isEs
          ? 'El saldo restante (50%) se paga el día de la sesión. Para cualquier consulta, responde a este correo o escríbenos por WhatsApp.'
          : 'The remaining balance (50%) is due on the day of the session. For any questions, reply to this email or reach us on WhatsApp.'}
      </p>

      ${qdClose()}
      <img src="${BASE_URL}/api/quotations/${data.proposalSlug}/email-open" width="1" height="1" alt="" style="display:none;border:0;width:1px;height:1px" />
    `,
  })
}
