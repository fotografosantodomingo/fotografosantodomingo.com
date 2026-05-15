'use client'

/**
 * Tawk.to live-chat widget.
 *
 * Loaded with strategy="lazyOnload" — Next.js holds the script until the
 * browser is idle (after onLoad fires and the main thread is free), so the
 * widget never blocks LCP or interaction-readiness on first paint. This is
 * the lesson from commit 2df6250: the original install used afterInteractive,
 * which competed with hydration and tanked CLS/LCP, so it was stripped out
 * during the perf cleanup. lazyOnload solves both: the chat is back, and
 * Lighthouse stays green.
 *
 * Property + widget IDs come from the Tawk.to dashboard
 * (Admin → Channels → Chat Widget → Direct Chat Link).
 *
 * Default IDs match the original property created on 2026-04-16. Override
 * via env if the property is rotated (e.g. dev vs prod).
 */

import Script from 'next/script'

const DEFAULT_PROPERTY_ID = '662b0680a0c6737bd1308ff1'
const DEFAULT_WIDGET_ID = '1hsc12p8m'

export default function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || DEFAULT_PROPERTY_ID
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || DEFAULT_WIDGET_ID

  if (!propertyId || !widgetId) return null

  return (
    <>
      <Script
        id="tawkto-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: 'var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();',
        }}
      />
      <Script
        id="tawkto-widget"
        strategy="lazyOnload"
        src={`https://embed.tawk.to/${propertyId}/${widgetId}`}
        crossOrigin="anonymous"
      />
      <Script
        id="tawkto-iframe-title"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `(function(){var o=new MutationObserver(function(){document.querySelectorAll('iframe[src*="tawk.to"]:not([title])').forEach(function(f){f.setAttribute('title','Live chat support');});});o.observe(document.body,{childList:true,subtree:true});})();`,
        }}
      />
    </>
  )
}
