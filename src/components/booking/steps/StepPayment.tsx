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
      <div className="border border-hairline p-4 text-sm text-ink">
        <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
          {locale === 'es' ? 'Error' : 'Error'}
        </p>
        {locale === 'es'
          ? 'Error de configuración: Stripe no está disponible.'
          : 'Configuration error: Stripe is not available.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
          {locale === 'es' ? 'Depósito' : 'Deposit'}
        </h2>
        <div className="flex items-baseline gap-3">
          <div
            className="font-display text-ink"
            style={{ fontSize: 'clamp(40px, 6vw, 56px)', lineHeight: '1' }}
          >
            ${depositUsd.toFixed(2)}
          </div>
          <div className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
            USD
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-md">
          {locale === 'es'
            ? 'Cargo seguro ahora. El saldo se paga el día de la sesión.'
            : 'Secure charge now. Balance is paid on the session day.'}
        </p>
      </div>

      {/* Stripe Elements iframe — uses its own appearance theme. We keep
          'night' regardless of html.dark / html.light-mode because the
          payment field reads as a luxury "concierge" surface in both
          modes (Apple Pay-style dark embed). */}
      <Elements
        stripe={stripeJs}
        options={{
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#ffffff',
              colorBackground: '#000000',
              colorText: '#ffffff',
              colorDanger: '#ffffff',
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              borderRadius: '6px',
              spacingUnit: '4px',
            },
            rules: {
              '.Input': {
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                fontSize: '15px',
              },
              '.Input:focus': {
                border: '1px solid #ffffff',
                boxShadow: 'none',
              },
              '.Label': {
                color: '#999999',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              },
              '.Tab': {
                border: '1px solid rgba(255, 255, 255, 0.18)',
              },
              '.Tab--selected': {
                border: '1px solid #ffffff',
              },
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div className="border border-hairline p-4 text-sm text-ink">
          <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
            {locale === 'es' ? 'Error' : 'Error'}
          </p>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] py-4 rounded-full bg-ink text-canvas hover:opacity-80 disabled:opacity-30 transition-opacity duration-200"
      >
        {submitting
          ? locale === 'es' ? 'Procesando pago…' : 'Processing payment…'
          : locale === 'es' ? 'Pagar y confirmar' : 'Pay and confirm'}
      </button>

      <p className="text-center font-mono uppercase tracking-widest text-[10px] text-ink-muted">
        {locale === 'es'
          ? 'Pagos seguros · Stripe · No almacenamos tu tarjeta'
          : 'Secure payments · Stripe · We never store your card'}
      </p>
    </form>
  )
}
