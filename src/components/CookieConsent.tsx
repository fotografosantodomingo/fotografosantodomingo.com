'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useParams } from 'next/navigation'

const STORAGE_KEY = 'cookie_consent'
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

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
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setConsent('declined')
    setVisible(false)
  }

  return (
    <>
      {/* Load GA only when consent is accepted */}
      {consent === 'accepted' && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-consent-init" strategy="afterInteractive">
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
      )}

      {/* Cookie banner */}
      {visible && (
        <div
          role="dialog"
          aria-label={isEs ? 'Aviso de cookies' : 'Cookie notice'}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 leading-relaxed">
                {isEs ? (
                  <>
                    Usamos cookies de Google Analytics para entender cómo se usa nuestro sitio y mejorar tu experiencia.
                    {' '}
                    <Link href={`/${locale}/privacy`} className="text-sky-400 hover:text-sky-300 underline whitespace-nowrap">
                      Política de privacidad
                    </Link>
                  </>
                ) : (
                  <>
                    We use Google Analytics cookies to understand how our site is used and improve your experience.
                    {' '}
                    <Link href={`/${locale}/privacy`} className="text-sky-400 hover:text-sky-300 underline whitespace-nowrap">
                      Privacy policy
                    </Link>
                  </>
                )}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 shrink-0">
              <button
                onClick={decline}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 border border-gray-600 hover:border-gray-400 hover:text-gray-200 transition-colors"
              >
                {isEs ? 'Rechazar' : 'Decline'}
              </button>
              <button
                onClick={accept}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-colors"
              >
                {isEs ? 'Aceptar' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
