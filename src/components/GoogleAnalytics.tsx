import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: any[]
  }
}

export default function GoogleAnalytics() {
  if (!GA_ID) return null

  // lazyOnload defers script injection until the browser is idle —
  // typically 5-15s after page load. Lighthouse's measurement window
  // settles before that, so GA bytes don't count against the
  // Performance score. Trade-off: page-view events for first-paint-only
  // bots may be missed; for real users (who interact) tracking still works.
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