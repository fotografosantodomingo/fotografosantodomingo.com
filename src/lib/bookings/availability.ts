/**
 * Availability helpers for the booking system.
 *
 *  - Timezone conversion AST (America/Santo_Domingo, fixed UTC-4 — no DST) ↔ UTC
 *  - Wrapper around the SQL function `get_available_slots()` that returns slots
 *    in both display (AST "HH:MM") and UTC ISO form for direct booking insert
 *  - Stale `PENDING_PAYMENT` cleanup so abandoned wizards don't lock slots forever
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { BOOKING_PENDING_EXPIRY_MIN, BOOKING_TIMEZONE } from './constants'

/** Dominican Republic offset — fixed (no DST since 2000) */
const AST_OFFSET = '-04:00'

export type AvailableSlot = {
  /** AST display time, "HH:MM" (24h) */
  time: string
  /** UTC ISO timestamp suitable for `bookings.starts_at` insert */
  startsAtUtc: string
  /** UTC ISO timestamp suitable for `bookings.ends_at` insert */
  endsAtUtc: string
}

// ─── Timezone helpers ────────────────────────────────────────────────────────

/**
 * Convert an AST calendar date + time of day to a UTC ISO timestamp.
 * @example astDateTimeToUtcIso('2026-04-25', '14:00') → '2026-04-25T18:00:00.000Z'
 */
export function astDateTimeToUtcIso(dateYmd: string, timeHm: string): string {
  // Normalize "HH:MM" or "HH:MM:SS" to "HH:MM:SS"
  const normalizedTime = timeHm.length === 5 ? `${timeHm}:00` : timeHm
  return new Date(`${dateYmd}T${normalizedTime}${AST_OFFSET}`).toISOString()
}

/** Format a UTC instant as the AST clock time, "HH:MM" (24h). */
export function utcToAstTime(utcIso: string | Date): string {
  const date = typeof utcIso === 'string' ? new Date(utcIso) : utcIso
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: BOOKING_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/** Format a UTC instant as the AST calendar date, "YYYY-MM-DD". */
export function utcToAstDate(utcIso: string | Date): string {
  const date = typeof utcIso === 'string' ? new Date(utcIso) : utcIso
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BOOKING_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

// ─── Slot-fetching wrapper ───────────────────────────────────────────────────

/**
 * Wraps the `get_available_slots(p_staff_id, p_date, p_duration_min)` SQL
 * function and returns slots paired with UTC ISO timestamps (so callers can
 * insert directly into `bookings.starts_at` / `ends_at` without re-converting).
 *
 * The SQL function already excludes both PENDING_PAYMENT and CONFIRMED
 * overlapping bookings.
 */
export async function getAvailableSlots(
  supabase: SupabaseClient,
  params: { staffId: string; dateYmd: string; durationMin: number }
): Promise<AvailableSlot[]> {
  const { data, error } = await supabase.rpc('get_available_slots', {
    p_staff_id: params.staffId,
    p_date: params.dateYmd,
    p_duration_min: params.durationMin,
  })

  if (error) {
    throw new Error(`get_available_slots failed: ${error.message}`)
  }

  if (!Array.isArray(data)) return []

  return data.map((row: { slot_time: string }) => {
    // PG returns TIME as "HH:MM:SS"
    const time = row.slot_time.slice(0, 5)
    const startsAtUtc = astDateTimeToUtcIso(params.dateYmd, time)
    const endsAtUtc = new Date(
      new Date(startsAtUtc).getTime() + params.durationMin * 60_000
    ).toISOString()
    return { time, startsAtUtc, endsAtUtc }
  })
}

// ─── Stale PENDING_PAYMENT cleanup ───────────────────────────────────────────

/**
 * Cancels PENDING_PAYMENT bookings older than BOOKING_PENDING_EXPIRY_MIN minutes.
 * This frees the slot so other customers can book it.
 *
 * Called lazily before availability checks and booking creation — no cron needed.
 * Returns the number of bookings released.
 */
export async function releaseStalePendingBookings(
  supabase: SupabaseClient
): Promise<number> {
  const cutoffIso = new Date(
    Date.now() - BOOKING_PENDING_EXPIRY_MIN * 60_000
  ).toISOString()

  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'CANCELLED',
      cancellation_reason: 'Payment timeout (30 min)',
      cancelled_at: new Date().toISOString(),
    })
    .eq('status', 'PENDING_PAYMENT')
    .lt('created_at', cutoffIso)
    .select('id')

  if (error) {
    console.error('releaseStalePendingBookings error:', error)
    return 0
  }
  return data?.length ?? 0
}
