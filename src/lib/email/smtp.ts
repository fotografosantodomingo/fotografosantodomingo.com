/**
 * Email transport via Brevo HTTP API.
 *
 * Replaces the previous worker-mailer + Hostinger SMTP path. Cloudflare
 * Workers' outbound TCP socket API rejected SMTP connections to Hostinger
 * with "proxy request failed" — the architectural fix is to send via
 * Brevo's HTTP REST endpoint (api.brevo.com/v3/smtp/email) which is just
 * a regular HTTPS call that works perfectly from edge runtime.
 *
 * The file is still named smtp.ts to keep import paths stable across all
 * callers (resend.ts, bookings.ts, quote-requests.ts, email-test route).
 *
 * Env vars:
 *   BREVO_API_KEY        required — starts with `xkeysib-...`
 *   EMAIL_FROM_ADDRESS   default: noreply@fotografosantodomingo.com
 *   EMAIL_FROM_NAME      default: Babula Shots
 *
 * Sender domain (fotografosantodomingo.com) must be verified in Brevo
 * via DKIM/SPF DNS records for production deliverability. Until DNS
 * propagates, sending from the apex domain may be flagged or rejected
 * by Brevo's anti-spoofing check — fallback to the account's verified
 * personal email is documented in the README of the email module.
 */

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'

export type MailAddress = { name?: string; email: string }

export type MailMessage = {
  /** Override default FROM. Accepts plain string ("Name <email>") or {name, email} object. */
  from?: string | MailAddress
  to: string | MailAddress | Array<string | MailAddress>
  bcc?: string | MailAddress | Array<string | MailAddress>
  replyTo?: string | MailAddress
  subject: string
  html?: string
  text?: string
}

export type SendResult = {
  ok: boolean
  /** Brevo's messageId on success, null on failure. */
  id: string | null
  error?: string
}

/** Parse "Name <email@domain>" into a structured address. */
function parseAddress(input: string | MailAddress): MailAddress {
  if (typeof input !== 'string') return input
  const match = input.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/)
  if (match) return { name: match[1].trim() || undefined, email: match[2].trim() }
  return { email: input.trim() }
}

function normalizeRecipients(
  input: string | MailAddress | Array<string | MailAddress>
): MailAddress[] {
  const arr = Array.isArray(input) ? input : [input]
  return arr.map(parseAddress)
}

function defaultFrom(): MailAddress {
  return {
    name: process.env.EMAIL_FROM_NAME ?? 'Babula Shots',
    email:
      process.env.EMAIL_FROM_ADDRESS ??
      process.env.SMTP_FROM_EMAIL ?? // back-compat with previous env var
      'noreply@fotografosantodomingo.com',
  }
}

/**
 * Send one transactional email via Brevo HTTP API. Returns
 * `{ ok: true, id: <messageId> }` on success or `{ ok: false, error }`
 * on any failure. Never throws — callers can fire-and-forget.
 */
export async function sendMail(msg: MailMessage): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.error(
      '[email/transport] BREVO_API_KEY missing — email skipped. Set it in Cloudflare Pages → Settings → Environment Variables.'
    )
    return { ok: false, id: null, error: 'BREVO_API_KEY not set' }
  }

  const from = msg.from ? parseAddress(msg.from) : defaultFrom()
  const to = normalizeRecipients(msg.to)
  const bcc = msg.bcc ? normalizeRecipients(msg.bcc) : undefined
  const replyTo = msg.replyTo ? parseAddress(msg.replyTo) : undefined

  const payload: Record<string, unknown> = {
    sender: from,
    to,
    subject: msg.subject,
  }
  if (bcc && bcc.length) payload.bcc = bcc
  if (replyTo) payload.replyTo = replyTo
  if (msg.html) payload.htmlContent = msg.html
  if (msg.text) payload.textContent = msg.text

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      // Brevo returns structured error JSON; capture it for diagnosis.
      let errorBody: unknown
      try {
        errorBody = await res.json()
      } catch {
        errorBody = await res.text().catch(() => '<no body>')
      }
      const errorMsg =
        typeof errorBody === 'object' && errorBody !== null
          ? `Brevo ${res.status}: ${(errorBody as { code?: string; message?: string }).message ?? JSON.stringify(errorBody)}`
          : `Brevo ${res.status}: ${String(errorBody)}`
      console.error('[email/transport] Brevo rejected send:', errorMsg, 'payload:', { sender: payload.sender, to: payload.to, subject: payload.subject })
      return { ok: false, id: null, error: errorMsg }
    }

    const data = (await res.json()) as { messageId?: string }
    return { ok: true, id: data.messageId ?? null }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e)
    console.error('[email/transport] fetch failed:', errorMsg, e)
    return { ok: false, id: null, error: errorMsg }
  }
}
