/**
 * Edge-runtime-safe crypto for gallery passwords and session tokens.
 * Uses Web Crypto (SubtleCrypto) only — no native bcrypt, which isn't
 * available on Cloudflare's edge runtime.
 */

const PBKDF2_ITERATIONS = 100_000
// Ambiguous characters (0/O, 1/I/l) removed so a printed/emailed password is
// never misread.
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

export function generateGalleryPassword(length = 10): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => PASSWORD_ALPHABET[b % PASSWORD_ALPHABET.length]).join('')
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  )
}

export async function hashGalleryPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bits = await pbkdf2(password, salt)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt.buffer as ArrayBuffer)}$${toHex(bits)}`
}

export async function verifyGalleryPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = Number(parts[1])
  const salt = fromHex(parts[2])
  const expected = parts[3]
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']),
    256
  )
  const actual = toHex(bits)
  // Constant-time-ish compare — lengths already fixed (64 hex chars), so this
  // is adequate for a low-value-target internal tool.
  if (actual.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

// ─── Session tokens (signed, not encrypted — payload is just slug + expiry) ──

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return toHex(sig)
}

function b64url(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function unb64url(s: string): string {
  return atob(s.replace(/-/g, '+').replace(/_/g, '/'))
}

export async function signGallerySession(slug: string, secret: string, ttlSeconds = 60 * 60 * 24 * 14): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const payload = `${b64url(slug)}.${exp}`
  const sig = await hmac(secret, payload)
  return `${payload}.${sig}`
}

export async function verifyGallerySession(token: string, secret: string): Promise<string | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [slugPart, expPart, sig] = parts
  const payload = `${slugPart}.${expPart}`
  const expected = await hmac(secret, payload)
  if (expected !== sig) return null
  const exp = Number(expPart)
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null
  try {
    return unb64url(slugPart)
  } catch {
    return null
  }
}

// ─── Photo preview tokens (for <img> tags in emails — no cookie available) ──
// Scoped to one photo, expiring with the gallery itself (not a fixed short
// TTL), since the recipient may open the email any time before then.

export async function signPhotoPreviewToken(
  slug: string,
  photoId: string,
  expiresAt: string,
  secret: string
): Promise<string> {
  const exp = Math.floor(new Date(expiresAt).getTime() / 1000)
  const payload = `${b64url(slug)}.${b64url(photoId)}.${exp}`
  const sig = await hmac(secret, payload)
  return `${payload}.${sig}`
}

export async function verifyPhotoPreviewToken(
  token: string,
  secret: string
): Promise<{ slug: string; photoId: string } | null> {
  const parts = token.split('.')
  if (parts.length !== 4) return null
  const [slugPart, photoPart, expPart, sig] = parts
  const payload = `${slugPart}.${photoPart}.${expPart}`
  const expected = await hmac(secret, payload)
  if (expected !== sig) return null
  const exp = Number(expPart)
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null
  try {
    return { slug: unb64url(slugPart), photoId: unb64url(photoPart) }
  } catch {
    return null
  }
}
