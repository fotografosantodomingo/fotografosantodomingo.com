import type { SupabaseClient } from '@supabase/supabase-js'
import { generateGallerySlug } from './slug'
import { generateGalleryPassword, hashGalleryPassword } from './crypto'

export const GALLERY_EXPIRY_DAYS = 30
export const GALLERY_REMINDER_DAYS_BEFORE = 2

// No password yet — generated the first time the client can actually see
// something ('ready for selection' or, if selection is skipped, 'mark
// ready' for final delivery — see ensureGalleryPassword). Nothing to
// protect while still draft/uploading.
export async function createGallery(
  supabase: SupabaseClient,
  params: {
    clientName: string
    clientEmail: string
    clientEmail2?: string | null
    topic?: string | null
    includedPhotoCount?: number | null
    sessionPriceUsd?: number | null
    bookingId?: string | null
  }
): Promise<{ id: string; slug: string }> {
  // Retry on slug collision — vanishingly unlikely with a random suffix, but cheap to guard.
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = generateGallerySlug(params.clientName)
    const { data, error } = await supabase
      .from('galleries')
      .insert({
        slug,
        booking_id: params.bookingId ?? null,
        client_name: params.clientName,
        client_email: params.clientEmail,
        client_email_2: params.clientEmail2 ?? null,
        topic: params.topic ?? null,
        included_photo_count: params.includedPhotoCount ?? null,
        // TODO: session_price_usd write is temporarily disabled — re-enable
        // once migration 20260805043_gallery_selection.sql (adds the
        // column) has actually been applied. Until then this would break
        // every gallery creation with a "column does not exist" error.
        status: 'draft',
      })
      .select('id, slug')
      .single()

    if (!error && data) return { id: data.id, slug: data.slug }
    if (error && error.code !== '23505') throw error // not a unique-violation — don't retry
  }
  throw new Error('Failed to create gallery after retries (slug collisions)')
}

// Shared by "ready for selection" and "mark ready" — either can be the
// first time a client-facing password is needed, depending on whether the
// admin uses the selection step at all. Returns the plaintext only the
// first time (so the caller's email includes it); null on repeat calls,
// since we only ever store the hash.
export async function ensureGalleryPassword(
  supabase: SupabaseClient,
  galleryId: string,
  currentPasswordHash: string | null
): Promise<{ passwordHash: string; plainPassword: string | null }> {
  if (currentPasswordHash) return { passwordHash: currentPasswordHash, plainPassword: null }
  const plainPassword = generateGalleryPassword()
  const passwordHash = await hashGalleryPassword(plainPassword)
  return { passwordHash, plainPassword }
}

export function computeExpiresAt(from: Date = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + GALLERY_EXPIRY_DAYS)
  return d.toISOString()
}
