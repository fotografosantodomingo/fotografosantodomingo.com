import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'
import { ensureGalleryPassword } from '@/lib/gallery/service'
import { sendGallerySelectionReady } from '@/lib/email/galleries'

export const runtime = 'edge'

type Params = { params: { id: string } }

/**
 * POST /api/admin/galleries/[id]/ready-for-selection
 *
 * Opens the proofing/selection phase — client gets the swipe UI instead of
 * the download grid. Parallel to (not a replacement for) /ready, which is
 * still used for final delivery once the admin has uploaded edited photos
 * of just the selected ones. Skippable: an admin can go straight to /ready
 * for a simple job with no proofing step.
 */
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select(
      'id, slug, client_name, client_email, client_email_2, topic, photo_count, status, password_hash, included_photo_count'
    )
    .eq('id', params.id)
    .single()

  if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (gallery.photo_count < 1) {
    return NextResponse.json({ error: 'Cannot open selection — no proof photos uploaded yet' }, { status: 409 })
  }
  if (!gallery.included_photo_count) {
    return NextResponse.json(
      { error: 'Set "Free photos included" for this gallery before opening selection' },
      { status: 409 }
    )
  }

  const { passwordHash, plainPassword } = await ensureGalleryPassword(supabase, params.id, gallery.password_hash)

  const { error } = await supabase
    .from('galleries')
    .update({
      status: 'selecting',
      selection_ready_at: new Date().toISOString(),
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const emailSent = await sendGallerySelectionReady(supabase, {
    slug: gallery.slug,
    clientName: gallery.client_name,
    clientEmail: gallery.client_email,
    clientEmail2: gallery.client_email_2,
    topic: gallery.topic,
    includedPhotoCount: gallery.included_photo_count,
    password: plainPassword,
  })

  return NextResponse.json({ ok: true, password: plainPassword, emailSent })
}
