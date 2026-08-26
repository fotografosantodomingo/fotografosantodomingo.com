'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

/**
 * Google's "Preferred Sources" button (launched Aug 2026) — lets readers mark
 * this site as a preferred source across Search, Discover, and Google News,
 * which increases odds of surfacing in Top Stories and AI answers (AI
 * Overviews / AI Mode). Official two-element embed per
 * https://developers.google.com/search/docs/appearance/preferred-sources —
 * only the theme is wired up dynamically here to match the site's light/dark
 * toggle (see ThemeToggle.tsx — same html.dark / html.light-mode convention).
 */
export default function PreferredSourceButton({ locale }: { locale: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const html = document.documentElement
    setTheme(html.classList.contains('light-mode') ? 'light' : 'dark')

    const observer = new MutationObserver(() => {
      setTheme(html.classList.contains('light-mode') ? 'light' : 'dark')
    })
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Script async src="https://news.google.com/swg/js/v1/publisher.js" strategy="afterInteractive" />
      <div
        ref={ref}
        google-add-preferred-source-btn=""
        data-theme={theme}
        data-lang={locale === 'es' ? 'es' : 'en'}
      />
    </>
  )
}
