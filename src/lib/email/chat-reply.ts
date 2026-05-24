// Outbound email reply for the AI chat email channel.
// Sends via Brevo with proper RFC-5322 threading headers so Gmail/Outlook
// group the exchange into one conversation thread.

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'
const FROM_NAME = 'Babula Shots'
const FROM_ADDRESS = process.env.EMAIL_REPLY_ADDRESS ?? 'chat@fotografosantodomingo.com'

function dedupeSubject(subject: string): string {
  // Strip stacked "Re: Re: Re:" prefixes before adding one back
  const stripped = subject.replace(/^(re|fwd?):\s*/gi, '').trim()
  return `Re: ${stripped}`
}

export interface EmailReplyArgs {
  toAddress: string       // buyer's email
  subject: string         // original thread subject
  bodyText: string        // plain text body (the AI draft)
  inReplyTo: string       // Message-ID of the email we're replying to
  references: string[]    // full ancestor chain
}

export interface EmailReplyResult {
  ok: boolean
  messageId: string | null
  error?: string
}

export async function sendEmailReply(args: EmailReplyArgs): Promise<EmailReplyResult> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.error('[chat-reply] BREVO_API_KEY not set')
    return { ok: false, messageId: null, error: 'BREVO_API_KEY not set' }
  }

  const subject = dedupeSubject(args.subject)

  // Build References: header — include the full ancestor chain + In-Reply-To
  const seen = new Set<string>()
  const allRefs = [...args.references, args.inReplyTo].filter((r): r is string => {
    if (!r || seen.has(r)) return false
    seen.add(r)
    return true
  })

  // Plain-text body wrapped in minimal HTML for better Gmail rendering
  const htmlBody = `<p style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">${
    args.bodyText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
  }</p>`

  const payload = {
    sender: { name: FROM_NAME, email: FROM_ADDRESS },
    to: [{ email: args.toAddress }],
    subject,
    textContent: args.bodyText,
    htmlContent: htmlBody,
    headers: {
      'In-Reply-To': args.inReplyTo,
      'References': allRefs.join(' '),
    },
  }

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
      const errBody = await res.json().catch(() => ({}))
      console.error('[chat-reply] Brevo error', { status: res.status, errBody })
      return { ok: false, messageId: null, error: `Brevo HTTP ${res.status}` }
    }

    const json = await res.json()
    return { ok: true, messageId: json.messageId ?? null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[chat-reply] fetch failed', msg)
    return { ok: false, messageId: null, error: msg }
  }
}
