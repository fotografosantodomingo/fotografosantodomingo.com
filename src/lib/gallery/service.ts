import type { SupabaseClient } from '@supabase/supabase-js'
import { generateGallerySlug } from './slug'

export const GALLERY_EXPIRY_DAYS = 30
export const GALLERY_REMINDER_DAYS_BEFORE = 2

// No password yet — generated when the gallery goes 'ready' (src/lib/gallery
// service.ts / the ready route), since that's the moment it's first emailed
// to the client. Nothing to protect while still draft/uploading.
export async function createGallery(
  supabase: SupabaseClient,
  params: { clientName: string; clientEmail: string; clientEmail2?: string | null; bookingId?: string | null }
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
        status: 'draft',
      })
      .select('id, slug')
      .single()

    if (!error && data) return { id: data.id, slug: data.slug }
    if (error && error.code !== '23505') throw error // not a unique-violation — don't retry
  }
  throw new Error('Failed to create gallery after retries (slug collisions)')
}

export function computeExpiresAt(from: Date = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + GALLERY_EXPIRY_DAYS)
  return d.toISOString()
}
