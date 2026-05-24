import PostalMime from 'postal-mime'

interface Env {
  EMAIL_INBOUND_SECRET: string
  APP_BASE: string
  REPLY_ADDRESS: string
}

async function hmacSha256(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    // Read the raw email
    const rawBytes = await new Response(message.raw).arrayBuffer()
    const raw = new TextDecoder().decode(rawBytes)

    // Parse RFC-5322 with postal-mime
    let parsed: Awaited<ReturnType<typeof PostalMime.parse>>
    try {
      parsed = await PostalMime.parse(raw)
    } catch (err) {
      console.error('[inbound-email] postal-mime parse failed', err)
      return
    }

    const payload = {
      to: message.to,
      from: message.from,
      messageId: parsed.messageId ?? `<${Date.now()}@fotografosantodomingo.com>`,
      inReplyTo: parsed.inReplyTo ?? null,
      references: parsed.references
        ? (typeof parsed.references === 'string'
            ? parsed.references.split(/\s+/).filter(Boolean)
            : parsed.references)
        : [],
      subject: parsed.subject ?? '(no subject)',
      bodyText: parsed.text ?? '',
      bodyHtml: parsed.html ?? '',
      dkimPass: !!(parsed as any).dkimPass,
      spfPass: !!(parsed as any).spfPass,
      dmarcPass: !!(parsed as any).dmarcPass,
    }

    const sig = await hmacSha256(JSON.stringify(payload), env.EMAIL_INBOUND_SECRET)

    const res = await fetch(`${env.APP_BASE}/api/inbound/email`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-inbound-signature': sig,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[inbound-email] app rejected', { status: res.status, body })
      // Re-throw so Cloudflare Email Worker retries on transient failures
      if (res.status >= 500) throw new Error(`app HTTP ${res.status}`)
    }
  },
} satisfies ExportedHandler<Env>
