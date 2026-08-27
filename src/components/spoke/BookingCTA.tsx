/**
 * BookingCTA — reusable booking call-to-action block
 *
 * Three action buttons: Book online (Setmore), WhatsApp, Get a Quote.
 * Accepts a pre-filled WhatsApp message and optional headline overrides.
 * Fully dark-mode aware, responsive.
 */

import Link from 'next/link'

const WHATSAPP_NUMBER = '18097789547'
const SETMORE_URL = 'https://babulashotsrd.setmore.com/reserva'

type BookingCTAProps = {
  locale: string
  waMessage: string
  /** Optional: if omitted the component renders its own default label */
  bookLabel?: string
  waLabel?: string
  quoteLabel?: string
  /**
   * Overrides the primary button's destination. Defaults to the Setmore
   * booking page; pass an internal `/[locale]/book?service=...` URL to
   * route straight into the real calendar + Stripe wizard instead.
   */
  bookUrl?: string
  /** Render a full-width horizontal or stacked card layout */
  layout?: 'horizontal' | 'stacked'
  className?: string
}

function encodeWa(message: string): string {
  return encodeURIComponent(message)
}

export default function BookingCTA({
  locale,
  waMessage,
  bookLabel,
  waLabel,
  quoteLabel,
  bookUrl,
  layout = 'horizontal',
  className = '',
}: BookingCTAProps) {
  const isEs = locale === 'es'

  const resolvedBookLabel = bookLabel ?? (isEs ? 'Reservar fecha' : 'Book a date')
  const resolvedWaLabel = waLabel ?? (isEs ? 'WhatsApp' : 'WhatsApp')
  const resolvedQuoteLabel = quoteLabel ?? (isEs ? 'Solicitar cotización' : 'Get a quote')

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeWa(waMessage)}`
  const quoteUrl = `/${locale}/${isEs ? 'cotizaciones' : 'get-quote'}`
  const isInternalBookUrl = Boolean(bookUrl)
  const resolvedBookUrl = bookUrl ?? SETMORE_URL

  const containerClass =
    layout === 'horizontal'
      ? 'flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4'
      : 'flex flex-col items-center gap-3'

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Primary — Book online (internal calendar+Stripe wizard when bookUrl is set, else Setmore) */}
      {isInternalBookUrl ? (
        <Link
          href={resolvedBookUrl}
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition-all hover:bg-amber-400 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          <span>📅</span>
          {resolvedBookLabel}
        </Link>
      ) : (
        <a
          href={resolvedBookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition-all hover:bg-amber-400 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          <span>📅</span>
          {resolvedBookLabel}
        </a>
      )}

      {/* Secondary — WhatsApp */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-green-500 bg-transparent px-7 py-3 text-sm font-semibold uppercase tracking-wide text-green-600 transition-all hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-current"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.11 1.522 5.827L.057 23.97l6.285-1.45A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.82 9.82 0 01-5.01-1.369l-.36-.213-3.729.858.895-3.614-.233-.371A9.818 9.818 0 012.182 12C2.182 6.568 6.568 2.182 12 2.182c5.432 0 9.818 4.386 9.818 9.818 0 5.432-4.386 9.818-9.818 9.818z" />
        </svg>
        {resolvedWaLabel}
      </a>

      {/* Tertiary — Get a quote */}
      <Link
        href={quoteUrl}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-transparent px-7 py-3 text-sm font-semibold uppercase tracking-wide text-neutral-700 transition-all hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <span>💬</span>
        {resolvedQuoteLabel}
      </Link>
    </div>
  )
}
