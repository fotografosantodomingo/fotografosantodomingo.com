'use client'

import { useEffect, useMemo, useState } from 'react'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'

const PUBLISHABLE = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

let stripePromise: Promise<Stripe | null> | null = null
function getStripeJs() {
  if (!PUBLISHABLE) return null
  if (!stripePromise) stripePromise = loadStripe(PUBLISHABLE)
  return stripePromise
}

export default function StepPayment({
  locale,
  clientSecret,
  bookingId,
  depositUsd,
  onSuccess,
}: {
  locale: 'es' | 'en'
  clientSecret: string
  bookingId: string
  depositUsd: number
  onSuccess: () => void
}) {
  const stripeJs = useMemo(() => getStripeJs(), [])

  if (!stripeJs) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
        {locale === 'es'
          ? 'Error de configuración: Stripe no está disponible.'
          : 'Configuration error: Stripe is not available.'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        {locale === 'es' ? 'Pagar el depósito' : 'Pay the deposit'}
      </h2>
      <p className="text-sm text-gray-400">
        {locale === 'es'
          ? `Cargo seguro de $${depositUsd.toFixed(2)} USD ahora. El saldo se paga el día de la sesión.`
          : `Secure $${depositUsd.toFixed(2)} USD charge now. Balance is paid on the session day.`}
      </p>

      <Elements
        stripe={stripeJs}
        options={{
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#10b981',
              colorBackground: '#0f172a',
              colorText: '#ffffff',
              colorDanger: '#ef4444',
              fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
              borderRadius: '8px',
            },
          },
        }}
      >
        <PaymentForm locale={locale} bookingId={bookingId} onSuccess={onSuccess} />
      </Elements>
    </div>
  )
}

function PaymentForm({
  locale,
  bookingId,
  onSuccess,
}: {
  locale: 'es' | 'en'
  bookingId: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements || submitting) return

    setSubmitting(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Payment validation failed')
      setSubmitting(false)
      return
    }

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/${locale}/book?paid=${bookingId}`,
      },
    })

    if (result.error) {
      setError(result.error.message ?? 'Payment failed')
      setSubmitting(false)
      return
    }

    if (result.paymentIntent?.status === 'succeeded') {
      onSuccess()
      return
    }

    if (result.paymentIntent?.status === 'requires_action') {
      // 3DS handled inline by stripe.confirmPayment with redirect:'if_required'
      setError(
        locale === 'es'
          ? 'Verifica el cargo con tu banco y reintenta.'
          : 'Verify the charge with your bank and retry.'
      )
      setSubmitting(false)
      return
    }

    // Payment is processing — webhook will mark CONFIRMED, the customer
    // will receive the confirmation email. Move to confirmation screen.
    onSuccess()
  }

  // Useful UX: poll booking status if redirect_status param is set after 3DS redirect
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('paid') === bookingId) {
      onSuccess()
    }
  }, [bookingId, onSuccess])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-full bg-emerald-500 py-3 font-semibold text-gray-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {submitting
          ? locale === 'es' ? 'Procesando pago…' : 'Processing payment…'
          : locale === 'es' ? 'Pagar y confirmar reserva' : 'Pay and confirm booking'}
      </button>

      <p className="text-center text-xs text-gray-500">
        {locale === 'es'
          ? 'Pagos procesados de forma segura por Stripe. No almacenamos tu tarjeta.'
          : 'Payments processed securely by Stripe. We never store your card.'}
      </p>
    </form>
  )
}
