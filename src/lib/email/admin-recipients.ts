/**
 * Admin recipient list for new-booking, quote-request, contact-form,
 * and newsletter notifications.
 *
 * Single source of truth so we never again ship a state where a feature
 * sends alerts to one inbox while the operator monitors another.
 *
 * Resolution:
 *   1. process.env.ADMIN_NOTIFICATION_EMAILS — comma-separated list,
 *      checked first. Trim + lowercase + dedupe.
 *   2. Defaults — both the brand inbox and the operator's personal
 *      inbox so alerts arrive even when DNS forwarding for the brand
 *      domain hasn't been configured yet.
 *
 * To override per environment, set ADMIN_NOTIFICATION_EMAILS in
 * Cloudflare Pages → Settings → Environment Variables for both
 * Production and Preview, e.g.:
 *   ADMIN_NOTIFICATION_EMAILS=info@fotografosantodomingo.com,owner@example.com
 */

const DEFAULT_ADMIN_RECIPIENTS = [
  'info@fotografosantodomingo.com',
  'homekrypto@gmail.com',
]

/** Returns the deduped, lowercased recipient list. Always non-empty. */
export function getAdminRecipients(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS
  const list = raw
    ? raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_ADMIN_RECIPIENTS.map((s) => s.toLowerCase())
  // Dedupe while preserving order.
  return Array.from(new Set(list))
}

/** Primary address used as the From-display alias / log key for backwards
 *  compatibility — e.g. booking_email_log.recipient_email stores the first
 *  recipient even when multiple inboxes were CC'd. */
export function getPrimaryAdminRecipient(): string {
  return getAdminRecipients()[0]
}
