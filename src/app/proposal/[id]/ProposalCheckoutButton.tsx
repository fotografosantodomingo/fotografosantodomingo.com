'use client'

import { useState } from 'react'

type Props = {
  quoteId: string
  token: string
  isEs: boolean
}

export default function ProposalCheckoutButton({ quoteId, token, isEs }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, token }),
      })
      const json = await res.json()

      if (!res.ok || !json.url) {
        setError(json.error || (isEs ? 'No se pudo iniciar el pago. Intenta de nuevo.' : 'Could not start checkout. Please try again.'))
        return
      }

      window.location.href = json.url
    } catch {
      setError(isEs ? 'Error de conexion. Intenta de nuevo.' : 'Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-lg hover:bg-emerald-500 disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {isEs ? 'Procesando…' : 'Processing…'}
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2M5 9h14l1 11H4L5 9z"/>
            </svg>
            {isEs ? 'Pagar y confirmar reserva' : 'Pay and confirm booking'}
          </>
        )}
      </button>
    </div>
  )
}
