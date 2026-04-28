/**
 * SMTP email transport for Cloudflare Workers / Pages edge runtime.
 *
 * Replaces the Resend HTTP API with direct SMTP via Hostinger using the
 * `worker-mailer` package, which speaks SMTP over Cloudflare's
 * `cloudflare:sockets` TCP socket API. Requires `nodejs_compat` flag
 * (already set in wrangler.toml) and a verified SMTP_PASSWORD env var.
 *
 * Env vars:
 *   SMTP_HOST          default: smtp.hostinger.com
 *   SMTP_PORT          default: 465
 *   SMTP_USER          default: SMTP_FROM_EMAIL
 *   SMTP_FROM_EMAIL    required (e.g. info@fotografosantodomingo.com)
 *   SMTP_PASSWORD      required (Hostinger mailbox password)
 *   SMTP_FROM_NAME     default: 'Babula Shots'
 *
 * Public API mirrors what the higher-level files (resend.ts, bookings.ts,
 * quote-requests.ts) used to call on the Resend client, so swap is local
 * to those files.
 */

export type MailAddress = { name?: string; email: string }

export type MailMessage = {
  /** Override default FROM (rarely needed). Accepts plain string ("Name <email>") or {name, email} object. */
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
  /** Locally-generated id (SMTP doesn't return a server-side message id we can use). */
  id: string | null
  error?: string
}

/**
 * Parse a Resend-style "Name <email@domain>" into a structured address.
 * Falls back to plain email when no name is present.
 */
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
    name: process.env.SMTP_FROM_NAME ?? 'Babula Shots',
    email:
      process.env.SMTP_FROM_EMAIL ?? 'noreply@fotografosantodomingo.com',
  }
}

/**
 * Send one message over SMTP. Returns `{ ok: true }` on success or
 * `{ ok: false, error: string }` on any failure (missing creds, connect
 * failure, server rejection). Never throws — callers can fire-and-forget.
 *
 * worker-mailer is dynamically imported so the build doesn't pull
 * `cloudflare:sockets` until runtime (the virtual module only resolves
 * inside the CF Workers runtime).
 */
export async function sendMail(msg: MailMessage): Promise<SendResult> {
  const password = process.env.SMTP_PASSWORD
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? 'noreply@fotografosantodomingo.com'

  if (!password) {
    console.error(
      '[email/smtp] SMTP_PASSWORD missing — email skipped. Set it in Cloudflare Pages → Settings → Environment Variables for both Production and Preview.'
    )
    return { ok: false, id: null, error: 'SMTP_PASSWORD not set' }
  }

  const host = process.env.SMTP_HOST ?? 'smtp.hostinger.com'
  const port = Number(process.env.SMTP_PORT ?? 465)
  const user = process.env.SMTP_USER ?? fromEmail
  const from = msg.from ? parseAddress(msg.from) : defaultFrom()
  const to = normalizeRecipients(msg.to)
  const bcc = msg.bcc ? normalizeRecipients(msg.bcc) : undefined
  const replyTo = msg.replyTo ? parseAddress(msg.replyTo) : undefined

  try {
    const { WorkerMailer } = await import('worker-mailer')

    const mailer = await WorkerMailer.connect({
      credentials: { username: user, password },
      authType: 'plain',
      host,
      port,
      secure: true,
    })

    // worker-mailer's Email constructor uses `reply` (not `replyTo`)
    // for the Reply-To header. Map it here so admin alerts that pass
    // replyTo: customerEmail still produce a working Reply-To.
    await mailer.send({
      from,
      to,
      ...(bcc && bcc.length ? { bcc } : {}),
      ...(replyTo ? { reply: replyTo } : {}),
      subject: msg.subject,
      ...(msg.html ? { html: msg.html } : {}),
      ...(msg.text ? { text: msg.text } : {}),
    })

    // SMTP doesn't surface a server message id we can index, so we
    // fabricate one from the timestamp for local logging dedupe.
    return { ok: true, id: `smtp-${Date.now()}` }
  } catch (e) {
    // worker-mailer throws plain objects on SMTP rejection (not Error
    // subclasses), so `String(e)` would yield "[object Object]" and the
    // real reason would be lost. Extract any useful payload manually:
    //   - .message (Error-like)
    //   - .reason / .response / .responseCode (worker-mailer SMTP shape)
    //   - JSON.stringify with own-property capture as last resort.
    const errorMsg = extractErrorMessage(e)
    console.error('[email/smtp] send failed:', errorMsg, e)
    return { ok: false, id: null, error: errorMsg }
  }
}

function extractErrorMessage(e: unknown): string {
  if (e == null) return 'Unknown error'
  if (typeof e === 'string') return e
  if (e instanceof Error) return e.message || e.name || 'Error'
  if (typeof e === 'object') {
    const o = e as Record<string, unknown>
    if (typeof o.message === 'string' && o.message) return o.message
    if (typeof o.reason === 'string' && o.reason) {
      const code = typeof o.responseCode === 'number' ? ` [SMTP ${o.responseCode}]` : ''
      const resp = typeof o.response === 'string' ? `: ${o.response}` : ''
      return `${o.reason}${code}${resp}`
    }
    if (typeof o.response === 'string') return o.response
    try {
      return JSON.stringify(e, Object.getOwnPropertyNames(e))
    } catch {
      return Object.prototype.toString.call(e)
    }
  }
  return String(e)
}
