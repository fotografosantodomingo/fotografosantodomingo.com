/**
 * iCalendar (.ics) and Google Calendar URL generators for confirmed bookings.
 *
 * Used by:
 *   - src/app/api/bookings/[id]/ics/route.ts — returns the .ics file
 *     with Content-Type text/calendar so iOS/macOS Calendar.app and
 *     Outlook open it directly.
 *   - src/lib/email/bookings.ts — embeds two buttons in the confirmation
 *     email: Google Calendar pre-filled render URL + .ics download URL.
 */

import { BOOKING_TIMEZONE } from './constants'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const ORG_EMAIL = 'info@fotografosantodomingo.com'
const ORG_NAME = 'Babula Shots'

export type CalendarEvent = {
  bookingId: string
  /** Display title — e.g. "Wedding Photography — Babula Shots". */
  title: string
  /** Multi-line description (iCal escapes handled automatically). */
  description: string
  /** Free-form location string (resort name, address, or "TBD"). */
  location?: string
  /** ISO 8601 UTC start. */
  startsAt: string
  /** ISO 8601 UTC end. */
  endsAt: string
  /** Customer email — added as ATTENDEE in the .ics. */
  customerEmail: string
  /** Customer name — display name on the ATTENDEE line. */
  customerName: string
}

/** Format an ISO date as iCal UTC stamp (YYYYMMDDTHHMMSSZ). */
function toIcsUtc(iso: string): string {
  // 2026-05-12T13:00:00.000Z → 20260512T130000Z
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** Escape iCal text — backslash, semicolon, comma, newline. */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * Build the full iCalendar document for a confirmed booking. Returns
 * a string with CRLF line endings (RFC 5545 requires CRLF). Pass to a
 * Response with Content-Type: text/calendar; charset=utf-8.
 */
export function buildIcsDocument(event: CalendarEvent): string {
  const dtStart = toIcsUtc(event.startsAt)
  const dtEnd = toIcsUtc(event.endsAt)
  const dtStamp = toIcsUtc(new Date().toISOString())
  const uid = `${event.bookingId}@fotografosantodomingo.com`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Babula Shots//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    ...(event.location ? [`LOCATION:${escapeIcsText(event.location)}`] : []),
    `ORGANIZER;CN=${escapeIcsText(ORG_NAME)}:mailto:${ORG_EMAIL}`,
    `ATTENDEE;CN=${escapeIcsText(event.customerName)};RSVP=TRUE:mailto:${event.customerEmail}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'SEQUENCE:0',
    `URL:${BASE_URL}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  // RFC 5545 requires CRLF line endings.
  return lines.join('\r\n') + '\r\n'
}

/**
 * Build the public URL for the .ics endpoint. The endpoint is unauthenticated
 * but the booking_id UUID provides ~122 bits of entropy — adequate for
 * a simple "anyone with the link" share. The exposed data (event title,
 * date, photographer name) is the same the customer already received in
 * the confirmation email; no additional sensitive info leaks.
 */
export function icsUrl(bookingId: string): string {
  return `${BASE_URL}/api/bookings/${bookingId}/ics`
}

/**
 * Build a Google Calendar render URL with the event pre-filled. When
 * clicked, the user is taken to Google Calendar with all fields ready
 * to save with one more click. No auth needed; works for anyone with
 * a Google account.
 *
 * Reference: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md
 */
export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toIcsUtc(event.startsAt)}/${toIcsUtc(event.endsAt)}`,
    details: event.description,
    ctz: BOOKING_TIMEZONE,
  })
  if (event.location) params.set('location', event.location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
