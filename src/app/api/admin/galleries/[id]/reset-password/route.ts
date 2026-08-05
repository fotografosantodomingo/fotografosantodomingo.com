import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'
import { generateGalleryPassword, hashGalleryPassword } from '@/lib/gallery/crypto'
import { sendGalleryReady, sendGallerySelectionReady } from '@/lib/email/galleries'

export const runtime = 'edge'

type Params = { params: { id: string } }

/**
 * POST /api/admin/galleries/[id]/reset-password
 *
 * Recovery path for when the client never actually got their password —
 * we only ever store a hash, so there's no way to "resend the same one."
 * Generates a fresh password and resends whichever email fits the gallery's
 * current phase (selection invite vs. ready-to-download), with the new
 * password included either way.
 */
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select(
      'id, slug, client_name, client_email, client_email_2, topic, status, included_photo_count, photo_count, expires_at'
    )
    .eq('id', params.id)
    .single()

  if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!['selecting', 'selected', 'ready'].includes(gallery.status)) {
    return NextResponse.json(
      { error: 'Gallery must be in selection or ready status to have a password to reset' },
      { status: 409 }
    )
  }

  const plainPassword = generateGalleryPassword()
  const passwordHash = await hashGalleryPassword(plainPassword)

  const { error } = await supabase.from('galleries').update({ password_hash: passwordHash }).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let emailSent: boolean
  if (gallery.status === 'selecting') {
    emailSent = await sendGallerySelectionReady(supabase, {
      slug: gallery.slug,
      clientName: gallery.client_name,
      clientEmail: gallery.client_email,
      clientEmail2: gallery.client_email_2,
      topic: gallery.topic,
      includedPhotoCount: gallery.included_photo_count ?? 0,
      password: plainPassword,
    })
  } else {
    emailSent = await sendGalleryReady(supabase, {
      galleryId: gallery.id,
      slug: gallery.slug,
      clientName: gallery.client_name,
      clientEmail: gallery.client_email,
      clientEmail2: gallery.client_email_2,
      topic: gallery.topic,
      expiresAt: gallery.expires_at ?? new Date().toISOString(),
      password: plainPassword,
      previewPhotos: [],
      photoCount: gallery.photo_count,
    })
  }

  return NextResponse.json({ ok: true, password: plainPassword, emailSent })
}
