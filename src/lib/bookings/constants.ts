// Booking system configuration constants
// Used by the booking wizard, availability API, and admin panel.

// ─── Slot configuration ──────────────────────────────────────────────────────

/** Interval between available start times, in minutes */
export const BOOKING_SLOT_INTERVAL_MIN = 60

/** How many days ahead customers can book (6 months) */
export const BOOKING_MAX_ADVANCE_DAYS = 180

/** How many hours ahead a booking must be made */
export const BOOKING_MIN_ADVANCE_HOURS = 24

/** Minutes a PENDING_PAYMENT booking holds the slot before being released */
export const BOOKING_PENDING_EXPIRY_MIN = 30

// ─── Deposit + cancellation policy ──────────────────────────────────────────

/** Percentage of total price charged as deposit at booking */
export const BOOKING_DEPOSIT_PERCENT = 50

/** Days before session that free rescheduling is allowed */
export const BOOKING_FREE_RESCHEDULE_DAYS = 3

/** Hours before session within which no refund is given on cancellation */
export const BOOKING_NO_REFUND_HOURS = 24

// ─── Currency ────────────────────────────────────────────────────────────────

/**
 * Stripe always charges in USD.
 * DOP is display-only on the frontend — no DOP Stripe charge ever occurs.
 * Exchange rate is fetched live at booking time and snapshot stored in bookings.dop_rate.
 */
export const BOOKING_STRIPE_CURRENCY = 'usd' as const

/** Exchange rate API for live USD→DOP conversion (display only) */
export const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/USD'

// ─── Review links ────────────────────────────────────────────────────────────

export const REVIEW_LINKS = {
  google: 'https://g.page/r/Cfzh-OCc5eftEAE/review',
  trustpilot: 'https://www.trustpilot.com/review/fotografosantodomingo.com',
} as const

// ─── Service categories (for grouping on /prices and admin UI) ───────────────

export type BookingServiceCategory = 'celebrations' | 'portraits' | 'commercial' | 'specialty'

export const BOOKING_SERVICE_CATEGORIES: Array<{
  key: BookingServiceCategory
  labelEs: string
  labelEn: string
  icon: string
}> = [
  { key: 'celebrations', labelEs: 'Celebraciones y Eventos', labelEn: 'Celebrations & Events', icon: '🎉' },
  { key: 'portraits',    labelEs: 'Retratos y Familia',      labelEn: 'Portraits & Family',     icon: '📷' },
  { key: 'commercial',   labelEs: 'Comercial y Empresarial', labelEn: 'Commercial & Business',  icon: '🏢' },
  { key: 'specialty',    labelEs: 'Especialidades',          labelEn: 'Specialties',            icon: '✨' },
]

// ─── Booking status labels ───────────────────────────────────────────────────

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'

export const BOOKING_STATUS_LABELS: Record<BookingStatus, { es: string; en: string; color: string }> = {
  PENDING_PAYMENT: { es: 'Pendiente de pago',   en: 'Pending Payment',   color: 'text-amber-400'  },
  CONFIRMED:       { es: 'Confirmado',           en: 'Confirmed',         color: 'text-emerald-400' },
  CANCELLED:       { es: 'Cancelado',            en: 'Cancelled',         color: 'text-red-400'    },
  COMPLETED:       { es: 'Completado',           en: 'Completed',         color: 'text-sky-400'    },
  NO_SHOW:         { es: 'No se presentó',       en: 'No Show',           color: 'text-gray-400'   },
}

// ─── Email types ─────────────────────────────────────────────────────────────

export type BookingEmailType =
  | 'CONFIRMATION'
  | 'REMINDER_24H'
  | 'REMINDER_SAME_DAY'
  | 'POST_SESSION'
  | 'ADMIN_ALERT'
  | 'CANCELLATION'

// ─── Working hours reference (for display/docs — DB is authoritative) ────────
// Mon–Fri 09:00–19:00 AST | Sat 10:00–17:00 | Sun 11:00–16:00
// Timezone: America/Santo_Domingo (UTC-4, no DST)
export const BOOKING_TIMEZONE = 'America/Santo_Domingo'
