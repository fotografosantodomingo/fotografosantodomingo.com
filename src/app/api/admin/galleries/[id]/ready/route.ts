import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'
import { computeExpiresAt } from '@/lib/gallery/service'
import { generateGalleryPassword, hashGalleryPassword } from '@/lib/gallery/crypto'
import { sendGalleryReady } from '@/lib/email/galleries'

export const runtime = 'edge'

type Params = { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select(
      'id, slug, client_name, client_email, client_email_2, topic, photo_count, cover_photo_id, status, password_hash'
    )
    .eq('id', params.id)
    .single()

  if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (gallery.photo_count < 1) {
    return NextResponse.json({ error: 'Cannot mark ready — no photos uploaded yet' }, { status: 409 })
  }

  const readyAt = new Date()
  const expiresAt = computeExpiresAt(readyAt)

  // Only generate a password the first time this gallery goes ready — a later
  // re-ready (e.g. admin added more photos) must not invalidate a password
  // already handed to the client. We can't recover the old plaintext (only
  // its hash is stored), so the email just omits it on repeat sends.
  const isFirstReady = !gallery.password_hash
  let plainPassword: string | null = null
  let passwordHash = gallery.password_hash
  if (isFirstReady) {
    plainPassword = generateGalleryPassword()
    passwordHash = await hashGalleryPassword(plainPassword)
  }

  // Also doubles as the thumbnail-strip source for the ready email below —
  // one query covers both the cover-photo fallback and the preview thumbnails.
  const { data: firstPhotos } = await supabase
    .from('gallery_photos')
    .select('id')
    .eq('gallery_id', params.id)
    .order('created_at', { ascending: true })
    .limit(5)

  let coverPhotoId = gallery.cover_photo_id
  if (!coverPhotoId) {
    coverPhotoId = firstPhotos?.[0]?.id ?? null
  }

  const { error } = await supabase
    .from('galleries')
    .update({
      status: 'ready',
      ready_at: readyAt.toISOString(),
      expires_at: expiresAt,
      cover_photo_id: coverPhotoId,
      password_hash: passwordHash,
      reminder_sent: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sendGalleryReady(supabase, {
    galleryId: gallery.id,
    slug: gallery.slug,
    clientName: gallery.client_name,
    clientEmail: gallery.client_email,
    clientEmail2: gallery.client_email_2,
    topic: gallery.topic,
    expiresAt,
    password: plainPassword, // null on a repeat "ready" — email adapts its wording
    previewPhotos: firstPhotos ?? [],
    photoCount: gallery.photo_count,
  })

  return NextResponse.json({ ok: true, expires_at: expiresAt, password: plainPassword })
}
