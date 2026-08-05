import type { SupabaseClient } from '@supabase/supabase-js'
import { generateGallerySlug } from './slug'
import { generateGalleryPassword, hashGalleryPassword } from './crypto'
import { sendPhotographerSelectionNotice, sendClientSelectionConfirmation } from '@/lib/email/galleries'

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

// Shared by the no-overage submit path (immediate) and the Stripe webhook
// (after overage payment clears) — both end in the same state, so the
// status flip + both notification emails live in one place. Idempotent:
// safe to call twice (e.g. a retried webhook) since it checks status first.
export async function finalizeSelection(
  supabase: SupabaseClient,
  galleryId: string
): Promise<{ ok: true; photographerNotified: boolean } | { ok: false; error: string }> {
  const { data: gallery } = await supabase
    .from('galleries')
    .select(
      'id, slug, client_name, client_email, client_email_2, topic, status, included_photo_count, selection_overage_tier, selection_overage_amount_usd'
    )
    .eq('id', galleryId)
    .single()

  if (!gallery) return { ok: false, error: 'Gallery not found' }
  if (gallery.status === 'selected') return { ok: true, photographerNotified: true } // already finalized — idempotent no-op

  const { data: selectedPhotos } = await supabase
    .from('gallery_photos')
    .select('filename')
    .eq('gallery_id', galleryId)
    .eq('selected', true)

  const filenames = (selectedPhotos ?? []).map((p) => p.filename)

  const { error } = await supabase
    .from('galleries')
    .update({
      status: 'selected',
      selection_submitted_at: new Date().toISOString(),
      selection_payment_status: gallery.selection_overage_tier > 0 ? 'paid' : 'not_required',
      updated_at: new Date().toISOString(),
    })
    .eq('id', galleryId)

  if (error) return { ok: false, error: error.message }

  // The photographer notice is the critical one — it's the only record of
  // which filenames to edit until the admin UI can show selections directly
  // (pending migration). Its result is surfaced to the caller so a failure
  // isn't silently lost the same way the "ready" email failure was.
  const [photographerNotified] = await Promise.all([
    sendPhotographerSelectionNotice({
      slug: gallery.slug,
      clientName: gallery.client_name,
      topic: gallery.topic,
      selectedFilenames: filenames,
      includedPhotoCount: gallery.included_photo_count ?? 0,
      overageTier: gallery.selection_overage_tier,
      overageAmountUsd: gallery.selection_overage_amount_usd,
    }),
    sendClientSelectionConfirmation({
      clientName: gallery.client_name,
      clientEmail: gallery.client_email,
      clientEmail2: gallery.client_email_2,
      topic: gallery.topic,
      selectedCount: filenames.length,
      includedPhotoCount: gallery.included_photo_count ?? 0,
      overageTier: gallery.selection_overage_tier,
      overageAmountUsd: gallery.selection_overage_amount_usd,
    }),
  ])

  if (!photographerNotified) {
    console.error(`finalizeSelection: photographer notice failed for gallery ${galleryId} — filenames:`, filenames)
  }

  return { ok: true, photographerNotified }
}
