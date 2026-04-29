import { sendMail } from './smtp'
import { getAdminRecipients } from './admin-recipients'

/**
 * Admin notification for new public RFQ submissions to /api/quote-request.
 *
 * Fires once per insert into public.quote_requests; sends via the Brevo
 * HTTP transport in ./smtp.ts. Recipients are pulled from the shared
 * admin-recipients module so booking, quote, and contact alerts always
 * reach the same operator inboxes.
 */

export type QuoteRequestNotificationData = {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  locale: 'es' | 'en'
  details: string
  eventDate: string | null
  familyTitle: string | null
  packageName: string | null
  packageStartingPriceUsd: number | null
  sourcePage: string | null
  sourceCta: string | null
  submittedAt: string
}

function escape(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function sendQuoteRequestNotification(
  data: QuoteRequestNotificationData
): Promise<void> {
  const detailLines = data.details
    .split('\n')
    .map(line => `<p style="margin:0 0 6px 0;">${escape(line)}</p>`)
    .join('')

  const familyLine = data.familyTitle
    ? `<p style="margin:6px 0;"><strong>Family:</strong> ${escape(data.familyTitle)}</p>`
    : ''
  const packageLine = data.packageName
    ? `<p style="margin:6px 0;"><strong>Package:</strong> ${escape(data.packageName)}${
        data.packageStartingPriceUsd != null
          ? ` &mdash; $${Number(data.packageStartingPriceUsd).toFixed(2)} starting`
          : ''
      }</p>`
    : ''
  const sourceLine = data.sourcePage
    ? `<p style="margin:6px 0;"><strong>Source:</strong> <code>${escape(
        data.sourcePage
      )}</code>${data.sourceCta ? ` (cta: ${escape(data.sourceCta)})` : ''}</p>`
    : ''

  const html = `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#f8fafc;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:#0f172a;color:#ffffff;padding:18px 24px;">
      <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">New quote request</p>
      <h1 style="margin:6px 0 0 0;font-size:20px;">${escape(data.customerName)}</h1>
    </div>
    <div style="padding:18px 24px;">
      <p style="margin:6px 0;"><strong>Email:</strong> <a href="mailto:${escape(data.customerEmail)}">${escape(data.customerEmail)}</a></p>
      ${data.customerPhone ? `<p style="margin:6px 0;"><strong>Phone:</strong> ${escape(data.customerPhone)}</p>` : ''}
      <p style="margin:6px 0;"><strong>Locale:</strong> ${escape(data.locale)}</p>
      ${data.eventDate ? `<p style="margin:6px 0;"><strong>Event date:</strong> ${escape(data.eventDate)}</p>` : ''}
      ${familyLine}
      ${packageLine}
      ${sourceLine}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0;" />
      ${detailLines}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0;" />
      <p style="margin:0;color:#64748b;font-size:12px;">Submitted ${escape(data.submittedAt)} &middot; ID <code>${escape(data.id)}</code></p>
      <p style="margin:6px 0 0 0;"><a href="https://www.fotografosantodomingo.com/admin/quote-requests/${escape(data.id)}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:8px 14px;border-radius:8px;font-weight:600;font-size:13px;margin-top:8px;">Open in admin</a></p>
    </div>
  </div>
</body></html>`

  const subject = `📩 Quote request: ${data.customerName}${
    data.familyTitle ? ` (${data.familyTitle})` : ''
  }`

  try {
    await sendMail({
      from: { name: 'Babula Shots', email: 'noreply@fotografosantodomingo.com' },
      to: getAdminRecipients(),
      replyTo: data.customerEmail,
      subject,
      html,
    })
  } catch (err) {
    console.error('quote-request notification email failed:', err)
  }
}
