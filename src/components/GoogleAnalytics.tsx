import Script from 'next/script'

// Hardcoded to match the ID that's actually been live/collecting data —
// NEXT_PUBLIC_GA_MEASUREMENT_ID in Cloudflare's env is a different,
// unused property (G-DBLQHVMY07); using it here would silently switch
// which GA4 property receives data. Update this directly if the GA4
// property is ever intentionally changed.
const GA_ID = 'G-C59XKYJNTQ'

// window.gtag / window.dataLayer are declared globally in
// src/lib/analytics/booking-events.ts — not re-declared here to avoid
// TypeScript's "must have identical modifiers" conflict across files.

/**
 * Loads the gtag.js library and configures GA4 once the browser is idle
 * (next/script's lazyOnload waits for requestIdleCallback / window 'load').
 * Keeps third-party tracking off the critical rendering path so it doesn't
 * compete with LCP/FCP for real visitors — the consent-mode default and
 * dataLayer stub are already set synchronously in the root layout's <head>,
 * so no tracking calls are lost by deferring the library itself.
 */
export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="ga-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  )
}
