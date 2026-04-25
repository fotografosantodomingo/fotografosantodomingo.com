'use client'

import { useEffect, useState } from 'react'

type Booking = {
  id: string
  starts_at: string
  ends_at: string
  status: string
  customer_name: string
  customer_email: string
  stripe_amount_usd: number | null
  deposit_amount_usd: number | null
  service: { name_es: string; name_en: string; icon: string; duration_min: number } | null
  staff: { name: string } | null
}

export default function StepConfirmation({
  locale,
  bookingId,
}: {
  locale: 'es' | 'en'
  bookingId: string
}) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [polling, setPolling] = useState(true)

  // Poll booking status every 2s until CONFIRMED (webhook may take a moment)
  useEffect(() => {
    let attempts = 0
    let cancelled = false

    async function check() {
      if (cancelled) return
      attempts++
      try {
        const res = await fetch(`/api/bookings/${bookingId}`)
        if (res.ok) {
          const { booking: b } = (await res.json()) as { booking: Booking }
          setBooking(b)
          if (b.status === 'CONFIRMED' || attempts >= 15) {
            setPolling(false)
            return
          }
        }
      } catch {}
      setTimeout(check, 2000)
    }
    check()

    return () => {
      cancelled = true
    }
  }, [bookingId])

  if (!booking) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="text-3xl">⏳</div>
        <p className="mt-4 text-lg font-semibold">
          {locale === 'es' ? 'Confirmando tu reserva…' : 'Confirming your booking…'}
        </p>
        <p className="mt-2 text-sm text-gray-400">
          {locale === 'es'
            ? 'Esto solo toma unos segundos.'
            : 'This only takes a few seconds.'}
        </p>
      </div>
    )
  }

  const name = locale === 'es'
    ? booking.service?.name_es
    : booking.service?.name_en
  const dateLabel = new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    timeZone: 'America/Santo_Domingo',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(booking.starts_at))
  const timeLabel = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Santo_Domingo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(booking.starts_at))

  const isConfirmed = booking.status === 'CONFIRMED'
  const isPending = booking.status === 'PENDING_PAYMENT'

  return (
    <div className="space-y-6">
      <div
        className={
          isConfirmed
            ? 'rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-6 text-center'
            : 'rounded-xl border border-amber-500/40 bg-amber-950/40 p-6 text-center'
        }
      >
        <div className="text-5xl">{isConfirmed ? '✅' : '⏳'}</div>
        <h2 className="mt-3 text-2xl font-bold">
          {isConfirmed
            ? locale === 'es' ? '¡Reserva confirmada!' : 'Booking confirmed!'
            : locale === 'es' ? 'Procesando pago' : 'Payment processing'}
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          {isConfirmed ? (
            locale === 'es'
              ? `Te enviamos los detalles a ${booking.customer_email}.`
              : `We sent the details to ${booking.customer_email}.`
          ) : (
            locale === 'es'
              ? 'Tu pago se está procesando. Recibirás un email de confirmación en breve.'
              : 'Your payment is being processed. You will receive a confirmation email shortly.'
          )}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          {locale === 'es' ? 'Detalles de tu cita' : 'Appointment details'}
        </h3>
        <dl className="space-y-2 text-sm">
          <Row label={locale === 'es' ? 'Servicio' : 'Service'} value={`${booking.service?.icon} ${name}`} />
          <Row label={locale === 'es' ? 'Fecha' : 'Date'} value={dateLabel} />
          <Row label={locale === 'es' ? 'Hora' : 'Time'} value={`${timeLabel} AST`} />
          <Row label={locale === 'es' ? 'Fotógrafo' : 'Photographer'} value={booking.staff?.name ?? '—'} />
          {booking.deposit_amount_usd != null && (
            <Row
              label={locale === 'es' ? 'Depósito pagado' : 'Deposit paid'}
              value={`$${Number(booking.deposit_amount_usd).toFixed(2)} USD`}
            />
          )}
          {booking.stripe_amount_usd != null && booking.deposit_amount_usd != null && (
            <Row
              label={locale === 'es' ? 'Saldo (día de la sesión)' : 'Balance (session day)'}
              value={`$${(Number(booking.stripe_amount_usd) - Number(booking.deposit_amount_usd)).toFixed(2)} USD`}
            />
          )}
        </dl>
      </div>

      <div className="space-y-2">
        <a
          href="https://wa.me/18097209547"
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-full bg-emerald-500 py-3 text-center font-semibold text-gray-950 hover:bg-emerald-400"
        >
          {locale === 'es' ? 'Hablar por WhatsApp' : 'Message on WhatsApp'}
        </a>
        <a
          href={`/${locale}`}
          className="block w-full rounded-full border border-white/10 py-3 text-center text-sm text-gray-300 hover:bg-white/5"
        >
          {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
        </a>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-right font-medium text-white">{value}</dd>
    </div>
  )
}
