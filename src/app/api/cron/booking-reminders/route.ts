import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  sendBookingReminder24h,
  sendBookingReminderSameDay,
  sendBookingPostSession,
  type BookingEmailContext,
} from '@/lib/email/bookings'
import { releaseStalePendingBookings } from '@/lib/bookings/availability'
import { BOOKING_TIMEZONE } from '@/lib/bookings/constants'

export const runtime = 'edge'

/**
 * GET /api/cron/booking-reminders
 *
 * Triggered hourly by the separate Cloudflare Worker (workers/cron-bookings).
 * Authenticated by `Authorization: Bearer <CRON_SECRET>`.
 *
 * Single endpoint that handles all three reminder types in one pass:
 *   1. 24h reminder       — starts_at in 23-25h window
 *   2. Same-day reminder  — starts_at is today (AST) and now ≥ 8:00 AST
 *   3. Post-session       — ends_at was 2-4h ago
 *
 * Each booking is gated by its flag column (reminder_24h_sent, reminder_same_day_sent,
 * post_session_sent), and the email functions set the flag on success — so even
 * if the worker fires the cron twice in a row, only one email goes out.
 *
 * Side effect: releases stale PENDING_PAYMENT bookings (>30 min old) on each run.
 */

type Snap = {
  name_es?: string
  name_en?: string
  family_icon?: string
  duration_min?: number
} | null

type DbBooking = {
  id: string
  customer_name: string
  customer_email: string
  locale: string | null
  starts_at: string
  ends_at: string
  stripe_amount_usd: number | null
  deposit_amount_usd: number | null
  package_snapshot: Snap
  family: { icon: string } | null
  staff: { name: string } | null
}

// Slice A · Step A4 — service info comes from package_snapshot. We still
// JOIN service_families purely as a fallback for the family icon when a
// snapshot is missing the family_icon key (older snapshots backfilled by
// migration 016 did not include it).
const SELECT_COLS = `id, customer_name, customer_email, locale, starts_at, ends_at,
  stripe_amount_usd, deposit_amount_usd,
  package_snapshot,
  family:service_families ( icon ),
  staff:staff_members ( name )` as const

function toCtx(b: DbBooking): BookingEmailContext {
  const snap = b.package_snapshot
  return {
    bookingId: b.id,
    customerName: b.customer_name,
    customerEmail: b.customer_email,
    locale: (b.locale ?? 'es') as 'es' | 'en',
    serviceNameEs: snap?.name_es ?? '',
    serviceNameEn: snap?.name_en ?? '',
    serviceIcon: snap?.family_icon ?? b.family?.icon ?? '📷',
    durationMin: snap?.duration_min ?? 60,
    startsAt: b.starts_at,
    endsAt: b.ends_at,
    staffName: b.staff?.name ?? 'Babula Shots',
    fullPriceUsd: Number(b.stripe_amount_usd ?? 0),
    depositUsd: Number(b.deposit_amount_usd ?? 0),
  }
}

function astDateOf(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BOOKING_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
}

function astHourOf(iso: string): number {
  const hh = new Intl.DateTimeFormat('en-GB', {
    timeZone: BOOKING_TIMEZONE,
    hour: '2-digit',
    hour12: false,
  }).format(new Date(iso))
  return Number(hh)
}

export async function GET(request: NextRequest) {
  // Auth — required
  const expected = process.env.CRON_SECRET
  if (!expected) {
    console.error('CRON_SECRET not set — refusing to run cron')
    return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
  }
  const auth = request.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const stats = {
    stale_released: 0,
    reminder_24h_sent: 0,
    reminder_same_day_sent: 0,
    post_session_sent: 0,
    errors: [] as string[],
  }

  // Lazy cleanup of abandoned PENDING_PAYMENT bookings
  stats.stale_released = await releaseStalePendingBookings(supabase)

  // ── 1. 24h reminders (starts_at in 23–25h window) ──────────────────────────
  try {
    const lo = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString()
    const hi = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('bookings')
      .select(SELECT_COLS)
      .eq('status', 'CONFIRMED')
      .eq('reminder_24h_sent', false)
      .gte('starts_at', lo)
      .lte('starts_at', hi)
      .limit(50)

    if (error) throw error
    for (const b of (data ?? []) as unknown as DbBooking[]) {
      await sendBookingReminder24h(supabase, toCtx(b))
      stats.reminder_24h_sent++
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('24h reminder pass failed:', msg)
    stats.errors.push(`24h: ${msg}`)
  }

  // ── 2. Same-day reminders ──────────────────────────────────────────────────
  // Send on the morning of the session, after 8:00 AST, only for today's bookings.
  if (astHourOf(now.toISOString()) >= 8) {
    try {
      const todayAst = astDateOf(now.toISOString())
      // starts_at must be later today and in the future
      const dayStart = new Date(`${todayAst}T00:00:00-04:00`).toISOString()
      const dayEnd = new Date(`${todayAst}T23:59:59-04:00`).toISOString()

      const { data, error } = await supabase
        .from('bookings')
        .select(SELECT_COLS)
        .eq('status', 'CONFIRMED')
        .eq('reminder_same_day_sent', false)
        .gte('starts_at', dayStart)
        .lte('starts_at', dayEnd)
        .gt('starts_at', now.toISOString())
        .limit(50)

      if (error) throw error
      for (const b of (data ?? []) as unknown as DbBooking[]) {
        await sendBookingReminderSameDay(supabase, toCtx(b))
        stats.reminder_same_day_sent++
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Same-day reminder pass failed:', msg)
      stats.errors.push(`same-day: ${msg}`)
    }
  }

  // ── 3. Post-session review request (ends_at was 2-4h ago) ──────────────────
  try {
    const lo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
    const hi = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('bookings')
      .select(SELECT_COLS)
      .eq('status', 'CONFIRMED')
      .eq('post_session_sent', false)
      .gte('ends_at', lo)
      .lte('ends_at', hi)
      .limit(50)

    if (error) throw error
    for (const b of (data ?? []) as unknown as DbBooking[]) {
      await sendBookingPostSession(supabase, toCtx(b))
      stats.post_session_sent++
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Post-session pass failed:', msg)
    stats.errors.push(`post-session: ${msg}`)
  }

  return NextResponse.json({ ok: stats.errors.length === 0, ...stats })
}
