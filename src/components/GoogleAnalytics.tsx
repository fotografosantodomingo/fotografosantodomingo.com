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
 * Loads the gtag.js library once the browser is idle (next/script's
 * lazyOnload waits for requestIdleCallback / window 'load'). This does NOT
 * send its own pageview — GTM-WM442J55 has its own internal GA4
 * Configuration tag pointed at this same GA_ID, confirmed via live network
 * capture to be firing a pageview on every load already. Calling
 * gtag('config', ...) here too was double-counting every real visit.
 *
 * gtag.js is still loaded and initialized (send_page_view: false keeps the
 * config call from auto-firing a pageview, but still establishes window.gtag
 * as a working destination) because src/lib/analytics/booking-events.ts
 * deliberately sends 7 real conversion events (view_family through
 * complete_deposit — the actual booking-deposit conversion) directly via
 * window.gtag('event', ...) as a second sink alongside GTM's dataLayer.
 * Removing gtag.js entirely would silently kill GA4 visibility into those
 * conversions unless GTM is separately configured to forward the same
 * custom dataLayer events — not something verifiable from code alone, so
 * this keeps that path intact while killing only the confirmed duplicate.
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
            anonymize_ip: true,
            send_page_view: false
          });
        `}
      </Script>
    </>
  )
}
