import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  getAvailableSlots,
  releaseStalePendingBookings,
} from '@/lib/bookings/availability'
import {
  BOOKING_MAX_ADVANCE_DAYS,
  BOOKING_MIN_ADVANCE_HOURS,
} from '@/lib/bookings/constants'

export const runtime = 'edge'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * GET /api/bookings/availability?staff_id=&date=&duration_min=
 *
 * Returns available slots for the given staff member, AST calendar date,
 * and service duration. Slots are 60-minute spaced (per BOOKING_SLOT_INTERVAL_MIN
 * in the SQL function).
 *
 * Each slot includes:
 *   - time:        "HH:MM" in AST (display)
 *   - startsAtUtc: UTC ISO timestamp (used for booking insert)
 *   - endsAtUtc:   UTC ISO timestamp
 *
 * Side effect: lazily releases stale PENDING_PAYMENT bookings before the check.
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const staffId = url.searchParams.get('staff_id')
    const date = url.searchParams.get('date')
    const durationMinRaw = url.searchParams.get('duration_min')

    if (!staffId || !UUID_RE.test(staffId)) {
      return NextResponse.json({ error: 'Invalid staff_id' }, { status: 400 })
    }

    if (!date || !DATE_RE.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date — expected YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const durationMin = Number(durationMinRaw)
    if (!Number.isInteger(durationMin) || durationMin <= 0 || durationMin > 600) {
      return NextResponse.json({ error: 'Invalid duration_min' }, { status: 400 })
    }

    // Reject dates beyond the max advance booking window
    const targetMidnightUtc = new Date(`${date}T00:00:00-04:00`)
    const maxAdvance = new Date(
      Date.now() + BOOKING_MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000
    )
    if (targetMidnightUtc.getTime() > maxAdvance.getTime()) {
      return NextResponse.json({ slots: [] })
    }

    const supabase = createServiceClient()

    // Free up slots held by abandoned wizards
    await releaseStalePendingBookings(supabase)

    let slots = await getAvailableSlots(supabase, {
      staffId,
      dateYmd: date,
      durationMin,
    })

    // Hide slots that are within MIN_ADVANCE_HOURS of now
    const minAdvanceMs = Date.now() + BOOKING_MIN_ADVANCE_HOURS * 60 * 60 * 1000
    slots = slots.filter(s => new Date(s.startsAtUtc).getTime() >= minAdvanceMs)

    return NextResponse.json({ slots })
  } catch (err) {
    console.error('GET /api/bookings/availability error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
