import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { deleteGalleryObjects } from '@/lib/gallery/r2'
import { sendGalleryReminder } from '@/lib/email/galleries'
import { GALLERY_REMINDER_DAYS_BEFORE } from '@/lib/gallery/service'

export const runtime = 'edge'

/**
 * GET /api/cron/gallery-expiration
 *
 * Triggered hourly by the same Cloudflare Worker as booking-reminders
 * (workers/cron-bookings) — see that route for the auth pattern.
 *
 * Two passes per run:
 *   1. Reminder — 'ready' galleries expiring in ~46-50h (2-day window, sized
 *      for an hourly cron) with reminder_sent = false get the T-2 email.
 *   2. Expire — 'ready' galleries past expires_at get their R2 objects
 *      deleted and flip to 'expired'. Metadata row is kept.
 */
export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    console.error('CRON_SECRET not set — refusing to run gallery-expiration cron')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  const auth = request.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()

  // ─── Pass 1: T-2-day reminders ─────────────────────────────────────────
  const reminderWindowStart = new Date(now.getTime() + (GALLERY_REMINDER_DAYS_BEFORE * 24 - 2) * 60 * 60 * 1000)
  const reminderWindowEnd = new Date(now.getTime() + (GALLERY_REMINDER_DAYS_BEFORE * 24 + 2) * 60 * 60 * 1000)

  const { data: dueForReminder } = await supabase
    .from('galleries')
    .select('id, slug, client_name, client_email, client_email_2, expires_at')
    .eq('status', 'ready')
    .eq('reminder_sent', false)
    .gte('expires_at', reminderWindowStart.toISOString())
    .lte('expires_at', reminderWindowEnd.toISOString())

  let remindersSent = 0
  for (const gallery of dueForReminder ?? []) {
    await sendGalleryReminder(supabase, {
      slug: gallery.slug,
      clientName: gallery.client_name,
      clientEmail: gallery.client_email,
      clientEmail2: gallery.client_email_2,
      expiresAt: gallery.expires_at,
    })
    await supabase.from('galleries').update({ reminder_sent: true }).eq('id', gallery.id)
    remindersSent++
  }

  // ─── Pass 2: expire + delete R2 objects ────────────────────────────────
  const { data: expiredGalleries } = await supabase
    .from('galleries')
    .select('id')
    .eq('status', 'ready')
    .lte('expires_at', now.toISOString())

  let expiredCount = 0
  for (const gallery of expiredGalleries ?? []) {
    try {
      await deleteGalleryObjects(gallery.id)
      await supabase
        .from('galleries')
        .update({ status: 'expired', deleted_at: now.toISOString(), deleted_reason: 'expiration' })
        .eq('id', gallery.id)
      expiredCount++
    } catch (err) {
      console.error('Failed to expire gallery', gallery.id, err)
    }
  }

  return NextResponse.json({ ok: true, remindersSent, expiredCount })
}
