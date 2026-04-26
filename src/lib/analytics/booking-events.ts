/**
 * Booking funnel — canonical analytics events.
 *
 * The 7 events below are the ONLY booking-related events that should be fired
 * from the application. Every booking-touching component must call one of these
 * named wrappers — never `gtag()` or `dataLayer.push()` directly.
 *
 * The events are pushed to BOTH:
 *   1. Google Tag Manager `window.dataLayer` (used by GTM-WM442J55)
 *   2. Google Analytics 4 via `window.gtag('event', …)` (used by G-C59XKYJNTQ)
 *
 * Both sinks are wired in `src/app/layout.tsx`. SSR-safe: every wrapper is a
 * no-op on the server.
 *
 * Naming convention: snake_case events (matches GA4 + GTM conventions).
 * Param values are kept primitive (strings, numbers) for compatibility with
 * GA4 custom-dimension reports.
 *
 * Source ID values that may appear in the `source` / `source_cta` fields
 * are documented in `docs/cta-audit.md` (the canonical list of CTA identifiers).
 */

// ─── Window type augmentation ────────────────────────────────────────────────
// `dataLayer` is also declared in src/components/GoogleTagManager.tsx;
// re-declaring here so this module type-checks standalone. `declare global`
// merges, so duplicate declarations of the same shape are safe.

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (
      command: 'event' | 'config' | 'js' | 'consent',
      action: string,
      params?: Record<string, unknown>
    ) => void
  }
}

// ─── Event payload schemas ───────────────────────────────────────────────────

export type Locale = 'es' | 'en'

/** Source page — where the user is when they trigger the event. */
export type SourcePage =
  | 'home'
  | 'services_landing'
  | 'services_seo_page'
  | 'services_compare'
  | 'prices'
  | 'spoke'
  | 'blog_post'
  | 'about'
  | 'contact'
  | 'birthday_seo'
  | 'book_wizard'
  | 'book_confirmation'
  | 'get_quote_wizard'
  | 'get_quote_confirmation'
  | 'other'

/** CTA identifier — see docs/cta-audit.md for the canonical list. */
export type SourceCta = string

// 1 · view_family — fired when a user lands on a family-related page (SEO page or compare)
export interface ViewFamilyPayload {
  family_slug: string
  locale: Locale
  source_page: SourcePage
}

// 2 · view_package_compare — fired when a user lands on (or scrolls into) the package compare module
export interface ViewPackageComparePayload {
  family_slug: string
  locale: Locale
  source_page: SourcePage
  /** How the user arrived at the compare module */
  source_cta?: SourceCta
}

// 3 · click_book_package — fired when a user clicks a "Reserve" CTA on a specific package
export interface ClickBookPackagePayload {
  family_slug: string
  package_slug: string
  locale: Locale
  source_page: SourcePage
  source_cta: SourceCta
}

// 4 · start_checkout — fired when /book is opened with ?family=…&package=… and renders the wizard
export interface StartCheckoutPayload {
  family_slug: string
  package_slug: string
  locale: Locale
  deposit_usd: number
  source_page?: SourcePage
  source_cta?: SourceCta
}

// 5 · complete_deposit — fired when the Stripe PaymentElement returns success
export interface CompleteDepositPayload {
  family_slug: string
  package_slug: string
  locale: Locale
  deposit_usd: number
  booking_id: string
}

// 6 · start_custom_quote — fired when the RFQ form opens (with or without family/package context)
export interface StartCustomQuotePayload {
  family_slug?: string
  package_slug?: string
  locale: Locale
  source_page: SourcePage
  source_cta?: SourceCta
}

// 7 · submit_custom_quote — fired when the RFQ form is submitted successfully
export interface SubmitCustomQuotePayload {
  family_slug?: string
  package_slug?: string
  locale: Locale
}

// ─── Internal track() helper ────────────────────────────────────────────────

/**
 * Single sink for booking events. Pushes to both GTM dataLayer and GA4 gtag.
 * SSR-safe: returns early on the server. Errors are swallowed so a broken
 * analytics tag never breaks user flow.
 */
function track<P extends object>(eventName: string, payload: P): void {
  if (typeof window === 'undefined') return

  // Strip undefined / null values — keeps the payload tidy in GA4 reports
  const clean: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
    if (v !== undefined && v !== null) clean[k] = v
  }

  try {
    // 1. GTM dataLayer
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...clean })
    }
    // 2. GA4 gtag
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, clean)
    }
    // 3. Optional debug
    if (DEBUG && typeof window.console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.debug(`[analytics] ${eventName}`, clean)
    }
  } catch {
    // Analytics must never throw into user code
  }
}

const DEBUG =
  typeof window !== 'undefined' &&
  // Set window.__BOOKING_ANALYTICS_DEBUG__ = true in DevTools to log every event
  (window as unknown as { __BOOKING_ANALYTICS_DEBUG__?: boolean })
    .__BOOKING_ANALYTICS_DEBUG__ === true

// ─── 7 canonical event wrappers ──────────────────────────────────────────────

/** 1 · User views a service family (SEO page or compare page). */
export function viewFamily(p: ViewFamilyPayload): void {
  track('view_family', p)
}

/** 2 · User views the package compare UI (standalone page or embedded module). */
export function viewPackageCompare(p: ViewPackageComparePayload): void {
  track('view_package_compare', p)
}

/** 3 · User clicks a Reserve CTA on a specific package. */
export function clickBookPackage(p: ClickBookPackagePayload): void {
  track('click_book_package', p)
}

/** 4 · /book wizard renders with a preselected package (top-of-funnel for paid conversion). */
export function startCheckout(p: StartCheckoutPayload): void {
  track('start_checkout', p)
}

/** 5 · Stripe deposit succeeds (the conversion event). Fired client-side from the wizard. */
export function completeDeposit(p: CompleteDepositPayload): void {
  track('complete_deposit', p)
}

/** 6 · /get-quote opens (RFQ funnel start, separate from /book funnel). */
export function startCustomQuote(p: StartCustomQuotePayload): void {
  track('start_custom_quote', p)
}

/** 7 · /get-quote form submitted successfully. */
export function submitCustomQuote(p: SubmitCustomQuotePayload): void {
  track('submit_custom_quote', p)
}

// ─── Strict event-name registry (for TS-side validation in tests / lints) ───
//
// If you ever add an 8th event here, also add the wrapper above and document
// it in docs/cta-audit.md + BOOKING_REBUILD_BLUEPRINT.md.

export const BOOKING_EVENT_NAMES = [
  'view_family',
  'view_package_compare',
  'click_book_package',
  'start_checkout',
  'complete_deposit',
  'start_custom_quote',
  'submit_custom_quote',
] as const

export type BookingEventName = (typeof BOOKING_EVENT_NAMES)[number]
