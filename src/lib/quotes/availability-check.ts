/**
 * Availability lookup for auto-generated quote options (src/lib/quotes/auto-generate.ts
 * and src/app/api/quote-option-action/route.ts).
 *
 * Wraps the existing booking-calendar primitives (src/lib/bookings/availability.ts) —
 * same slot RPC the real booking wizard uses, so "available" here means the exact
 * same thing it means on /book. Resolves staff dynamically (solo-staff today, but
 * never hardcode the id — src/app/api/bookings/route.ts sets the precedent).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { getAvailableSlots } from '@/lib/bookings/availability'
import { BOOKING_MIN_ADVANCE_HOURS, BOOKING_MAX_ADVANCE_DAYS } from '@/lib/bookings/constants'

export type SlotResult =
  | { kind: 'no_date_requested' }
  | { kind: 'confirmed'; date: string; time: string; startsAtUtc: string; endsAtUtc: string }
  | { kind: 'alternate'; date: string; time: string; startsAtUtc: string; endsAtUtc: string; daysOffset: number }
  | { kind: 'no_slots_found' }

const DEFAULT_LOOKAHEAD_DAYS = 7

function addDays(dateYmd: string, days: number): string {
  const d = new Date(`${dateYmd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Resolves the sole/first active staff member — same pattern as src/app/api/bookings/route.ts. */
export async function getPrimaryStaffId(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase
    .from('staff_members')
    .select('id')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .single()
  if (error || !data) return null
  return data.id
}

/**
 * Finds an open slot for the requested date, or the earliest open slot on a
 * later day (up to `maxLookaheadDays`) if the requested date is full.
 * Always returns the EARLIEST slot on whichever day it lands on.
 */
export async function findAvailableSlotOrAlternate(
  supabase: SupabaseClient,
  params: { staffId: string; requestedDateYmd: string | null; durationMin: number; maxLookaheadDays?: number },
): Promise<SlotResult> {
  const { staffId, requestedDateYmd, durationMin } = params
  const maxLookaheadDays = params.maxLookaheadDays ?? DEFAULT_LOOKAHEAD_DAYS

  if (!requestedDateYmd) return { kind: 'no_date_requested' }

  const minAdvanceMs = Date.now() + BOOKING_MIN_ADVANCE_HOURS * 60 * 60 * 1000
  const maxAdvanceMs = Date.now() + BOOKING_MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000

  for (let offset = 0; offset <= maxLookaheadDays; offset++) {
    const dateYmd = addDays(requestedDateYmd, offset)
    const midnightUtc = new Date(`${dateYmd}T00:00:00-04:00`).getTime()
    if (midnightUtc > maxAdvanceMs) break

    let slots
    try {
      slots = await getAvailableSlots(supabase, { staffId, dateYmd, durationMin })
    } catch (err) {
      console.error('findAvailableSlotOrAlternate: getAvailableSlots failed:', err)
      continue
    }
    slots = slots.filter(s => new Date(s.startsAtUtc).getTime() >= minAdvanceMs)
    if (slots.length === 0) continue

    const earliest = slots[0]
    return offset === 0
      ? { kind: 'confirmed', date: dateYmd, time: earliest.time, startsAtUtc: earliest.startsAtUtc, endsAtUtc: earliest.endsAtUtc }
      : { kind: 'alternate', date: dateYmd, time: earliest.time, startsAtUtc: earliest.startsAtUtc, endsAtUtc: earliest.endsAtUtc, daysOffset: offset }
  }

  return { kind: 'no_slots_found' }
}
