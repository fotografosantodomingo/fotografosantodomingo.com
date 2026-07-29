import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyGalleryPassword, signGallerySession } from '@/lib/gallery/crypto'
import { GALLERY_COOKIE, gallerySessionSecret } from '@/lib/gallery/session'

export const runtime = 'edge'

type Params = { params: { slug: string } }

// Simple in-memory-per-request rate limiting isn't meaningful on the edge
// (no shared state across invocations) — a wrong password just costs one DB
// read + one PBKDF2 verify (~100k iterations, not free to brute force).
export async function POST(req: NextRequest, { params }: Params) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select('slug, password_hash, status')
    .eq('slug', params.slug)
    .single()

  // Same generic error whether the gallery doesn't exist, isn't ready yet, or
  // the password is wrong — don't leak which case it is.
  const genericError = () => NextResponse.json({ error: 'Incorrect password' }, { status: 401 })

  if (!gallery || gallery.status !== 'ready' || !gallery.password_hash) {
    return genericError()
  }

  const ok = await verifyGalleryPassword(password, gallery.password_hash)
  if (!ok) return genericError()

  const token = await signGallerySession(gallery.slug, gallerySessionSecret())
  const res = NextResponse.json({ ok: true })
  res.cookies.set(GALLERY_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14, // 14 days — matches signGallerySession's default TTL
  })
  return res
}
