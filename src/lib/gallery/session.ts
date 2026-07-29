import type { NextRequest } from 'next/server'
import { verifyGallerySession } from './crypto'

export const GALLERY_COOKIE = 'gallery_session'

function secret(): string {
  const s = process.env.GALLERY_SESSION_SECRET
  if (!s) throw new Error('GALLERY_SESSION_SECRET is not set')
  return s
}

// Returns the slug embedded in the caller's session cookie if valid, or null.
// Callers must still check it matches the gallery slug in the route params —
// this only proves the cookie is authentic and unexpired, not which gallery.
export async function getGallerySessionSlug(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(GALLERY_COOKIE)?.value
  if (!token) return null
  try {
    return await verifyGallerySession(token, secret())
  } catch {
    return null
  }
}

export async function isAuthorizedForGallery(req: NextRequest, slug: string): Promise<boolean> {
  const sessionSlug = await getGallerySessionSlug(req)
  return sessionSlug !== null && sessionSlug === slug
}

export { secret as gallerySessionSecret }
