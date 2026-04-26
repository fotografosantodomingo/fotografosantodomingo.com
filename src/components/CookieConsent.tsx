'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const STORAGE_KEY = 'cookie_consent'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

type Consent = 'accepted' | 'declined' | null

export default function CookieConsent() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'es'
  const isEs = locale === 'es'

  const [consent, setConsent] = useState<Consent>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null
    setConsent(stored)
    // If already accepted, grant consent immediately (gtag loaded in <head>)
    if (stored === 'accepted' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'granted' })
    }
    // Show banner only if no prior choice
    if (!stored) {
      // Small delay so it doesn't flash before hydration
      const timer = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(timer)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setConsent('accepted')
    setVisible(false)
    // Grant analytics consent — gtag is already loaded in <head> with consent mode
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'granted' })
    }
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setConsent('declined')
    setVisible(false)
  }

  return (
    <>
      {visible && (
        <div
          role="dialog"
          aria-label={isEs ? 'Aviso de cookies' : 'Cookie notice'}
          className="fixed bottom-0 left-0 right-0 z-40"
        >
          {/* Bugatti cookie strip — bg-canvas + 1px hairline top, no shadow,
              no radius. Compact horizontal layout on desktop; stacked on
              mobile but with mono-caps copy that respects the typographic
              register. */}
          <div className="bg-canvas border-t border-hairline-soft">
            <div className="container mx-auto px-4 py-3.5 md:py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <p className="flex-1 min-w-0 text-xs md:text-sm text-ink-muted leading-snug">
                {isEs ? (
                  <>
                    Usamos cookies para analítica anónima.
                    {' '}
                    <Link
                      href={`/${locale}/privacy`}
                      className="text-ink underline underline-offset-2 hover:opacity-70"
                    >
                      Política de privacidad
                    </Link>
                  </>
                ) : (
                  <>
                    We use cookies for anonymous analytics.
                    {' '}
                    <Link
                      href={`/${locale}/privacy`}
                      className="text-ink underline underline-offset-2 hover:opacity-70"
                    >
                      Privacy policy
                    </Link>
                  </>
                )}
              </p>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={decline}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[10px] px-4 py-2 rounded-full border border-hairline-soft text-ink-muted hover:text-ink hover:border-hairline transition-colors"
                >
                  {isEs ? 'Rechazar' : 'Decline'}
                </button>
                <button
                  onClick={accept}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[10px] px-4 py-2 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity"
                >
                  {isEs ? 'Aceptar' : 'Accept'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
