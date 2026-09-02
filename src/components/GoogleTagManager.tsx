'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const GTM_ID = 'GTM-WM442J55'

// window.dataLayer is declared globally in
// src/lib/analytics/booking-events.ts — not re-declared here to avoid
// TypeScript's "must have identical modifiers" conflict across files.

/**
 * Loads the GTM container once the browser is idle (next/script's
 * lazyOnload). Keeps this third-party script off the critical rendering
 * path so it doesn't compete with LCP/FCP for real visitors — the
 * dataLayer stub is already initialized synchronously in the root
 * layout's <head>, so pushes queued before this loads aren't lost.
 */
export default function GoogleTagManager() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.dataLayer) return
    window.dataLayer.push({ event: 'pageview', page: pathname })
  }, [pathname])

  return (
    <Script id="gtm-loader" strategy="lazyOnload">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');
      `}
    </Script>
  )
}
