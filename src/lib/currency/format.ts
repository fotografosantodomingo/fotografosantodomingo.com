/**
 * Locale-aware price formatter. ES → DOP (rounded), EN → USD.
 *
 * Stripe charges in USD regardless of locale; the DOP display is
 * derived from the daily rate (see ./exchange-rate.ts) and used purely
 * for visible UI. Always pair the DOP figure with a USD note + a
 * "Pago procesado en USD" disclaimer near checkout.
 */

export type FormattedPrice = {
  /** Main label — "RD$ 12,000" for ES, "$200" for EN. */
  primary: string
  /** Currency suffix — "USD" for EN, undefined for ES (handled by note). */
  primarySuffix?: string
  /** USD reference shown alongside DOP for ES users — undefined for EN. */
  usdReference?: string
}

/**
 * Format one USD amount for display. Pass `dopRate` (from
 * getUsdToDopRate()) when locale is 'es'. When omitted on ES, falls
 * back to USD display so the page never shows a wrong-format price.
 */
export function formatServicePrice(
  usdAmount: number,
  locale: string,
  dopRate?: number | null
): FormattedPrice {
  const usd = Math.round(usdAmount)
  const usdLabel = `$${usd.toLocaleString('en-US')}`

  if (locale === 'es' && dopRate && dopRate > 0) {
    // Round DOP to nearest 100 for thousands ≥10K, nearest 10 below.
    // Avoids spurious precision like "RD$ 12,034" — feels more like a
    // posted rate than a calculation.
    const dopRaw = usdAmount * dopRate
    const dop =
      dopRaw >= 10000 ? Math.round(dopRaw / 100) * 100 : Math.round(dopRaw / 10) * 10
    return {
      primary: `RD$ ${dop.toLocaleString('es-DO')}`,
      usdReference: `≈ ${usdLabel} USD`,
    }
  }

  return {
    primary: usdLabel,
    primarySuffix: 'USD',
  }
}

/**
 * One-line localized note explaining the DOP → USD transparency.
 * Render below DOP price displays. EN locale returns null (no note needed).
 */
export function paymentDisclosureNote(locale: string): string | null {
  if (locale !== 'es') return null
  return 'Tipo de cambio referencial actualizado diariamente. Pago procesado en USD vía Stripe.'
}
