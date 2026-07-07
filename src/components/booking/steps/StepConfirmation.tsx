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
      <div className="border border-hairline-soft p-10 text-center">
        <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-5">
          {locale === 'es' ? 'Procesando' : 'Processing'}
        </p>
        <p
          className="font-display uppercase text-ink"
          style={{ fontSize: 'clamp(20px, 3vw, 28px)', lineHeight: '1.1' }}
        >
          {locale === 'es' ? 'Confirmando tu reserva…' : 'Confirming your booking…'}
        </p>
        <p className="mt-3 text-sm text-ink-muted">
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
    <div className="space-y-8">
      <div className="border border-hairline-soft p-8 md:p-10 text-center">
        <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-5">
          {isConfirmed
            ? (locale === 'es' ? 'Confirmado' : 'Confirmed')
            : (locale === 'es' ? 'En proceso' : 'Processing')}
        </p>
        <h2
          className="font-display uppercase text-ink"
          style={{ fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: '1' }}
        >
          {isConfirmed
            ? locale === 'es' ? '¡Reserva confirmada!' : 'Booking confirmed!'
            : locale === 'es' ? 'Procesando pago' : 'Payment processing'}
        </h2>
        <p className="mt-5 text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
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

      <div>
        <h3 className="mb-5 font-mono uppercase tracking-widest text-[11px] text-ink-muted">
          {locale === 'es' ? 'Detalles de tu cita' : 'Appointment details'}
        </h3>
        <dl className="border-t border-hairline-soft">
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

      <div className="flex flex-col gap-3">
        <a
          href="https://wa.me/18097789547"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] py-3.5 rounded-full bg-[#25D366] text-black hover:opacity-90 transition-opacity duration-200"
        >
          {locale === 'es' ? 'Hablar por WhatsApp' : 'Message on WhatsApp'}
        </a>
        <a
          href={`/${locale}`}
          className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
        >
          {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
        </a>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-3.5 border-b border-hairline-soft">
      <dt className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0">{label}</dt>
      <dd className="text-right text-ink text-sm">{value}</dd>
    </div>
  )
}
