// HMAC-signed action links for quote proposals (email Accept / Decline).
// Edge-compatible (Web Crypto). Same scheme as the drive-pipeline worker.

const SECRET = () => process.env.EMAIL_LINK_SECRET ?? ''
const BASE   = () => process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'

const EXPIRY_DAYS = 14

async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const bytes = new Uint8Array(sig)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export async function verifyActionSig(
  quoteId: string,
  action: string,
  ts: number,
  sig: string,
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000)
  if (now - ts > EXPIRY_DAYS * 24 * 3600) return false
  const expected = await hmacSign(SECRET(), `${quoteId}:${action}:${ts}`)
  return expected === sig
}

export async function buildActionLinks(quoteId: string): Promise<{
  acceptUrl: string
  declineUrl: string
  editUrl: string
}> {
  const ts = Math.floor(Date.now() / 1000)
  const acceptSig  = await hmacSign(SECRET(), `${quoteId}:accept:${ts}`)
  const declineSig = await hmacSign(SECRET(), `${quoteId}:decline:${ts}`)

  const link = (action: string, sig: string) =>
    `${BASE()}/api/quote-action?id=${quoteId}&action=${action}&ts=${ts}&sig=${encodeURIComponent(sig)}`

  return {
    acceptUrl:  link('accept', acceptSig),
    declineUrl: link('decline', declineSig),
    editUrl:    `${BASE()}/admin/quotes/${quoteId}`,
  }
}

/**
 * Same HMAC scheme as buildActionLinks (the signed message has no route-path
 * dependency), but points at /api/quote-option-action — the sibling route for
 * auto-generated dual-quote options (src/lib/quotes/auto-generate.ts). Kept
 * separate from buildActionLinks so the WhatsApp-bot accept/decline route
 * (/api/quote-action) never needs to change.
 */
export async function buildAutoQuoteActionLinks(quoteId: string): Promise<{
  acceptUrl: string
  declineUrl: string
}> {
  const ts = Math.floor(Date.now() / 1000)
  const acceptSig  = await hmacSign(SECRET(), `${quoteId}:accept:${ts}`)
  const declineSig = await hmacSign(SECRET(), `${quoteId}:decline:${ts}`)

  const link = (action: string, sig: string) =>
    `${BASE()}/api/quote-option-action?id=${quoteId}&action=${action}&ts=${ts}&sig=${encodeURIComponent(sig)}`

  return {
    acceptUrl:  link('accept', acceptSig),
    declineUrl: link('decline', declineSig),
  }
}
