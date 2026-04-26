'use client'

import { useEffect, useMemo, useState } from 'react'
import StepService, { type Service } from './steps/StepService'
import StepDate from './steps/StepDate'
import StepTime, { type Slot } from './steps/StepTime'
import StepDetails, { type Details } from './steps/StepDetails'
import StepPayment from './steps/StepPayment'
import StepConfirmation from './steps/StepConfirmation'

type Locale = 'es' | 'en'

const STEPS: Array<{ key: string; labelEs: string; labelEn: string }> = [
  { key: 'service', labelEs: 'Servicio', labelEn: 'Service' },
  { key: 'date', labelEs: 'Fecha', labelEn: 'Date' },
  { key: 'time', labelEs: 'Hora', labelEn: 'Time' },
  { key: 'details', labelEs: 'Tus datos', labelEn: 'Your details' },
  { key: 'payment', labelEs: 'Pago', labelEn: 'Payment' },
]

type State = {
  service: Service | null
  date: string | null // YYYY-MM-DD in AST
  slot: Slot | null
  details: Details | null
  bookingId: string | null
  clientSecret: string | null
  staffId: string | null
}

const t = (locale: Locale, es: string, en: string) => (locale === 'es' ? es : en)

export default function BookingWizard({
  locale,
  preselectedServiceSlug,
}: {
  locale: Locale
  preselectedServiceSlug?: string
}) {
  const [stepIdx, setStepIdx] = useState(0)
  const [state, setState] = useState<State>({
    service: null,
    date: null,
    slot: null,
    details: null,
    bookingId: null,
    clientSecret: null,
    staffId: null,
  })
  const [confirmed, setConfirmed] = useState(false)

  // Fetch staff id once (solo-staff mode → first active)
  useEffect(() => {
    let cancelled = false
    fetch('/api/bookings/services')
      .then(() => fetch('/api/bookings/services')) // already cached above; we just need staff_id from a separate path
      .catch(() => {})
    // We don't have a public staff endpoint; the booking POST auto-assigns staff.
    // For availability calls, we need staff_id. Hit the services endpoint and the
    // SQL+API guarantees a single active staff. We'll just fetch the staff list
    // via Supabase REST anon read.
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/staff_members?active=eq.true&select=id&order=sort_order&limit=1`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        },
      }
    )
      .then(r => r.json())
      .then((rows: { id: string }[]) => {
        if (!cancelled && rows[0]?.id) {
          setState(s => ({ ...s, staffId: rows[0].id }))
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  function goNext() {
    setStepIdx(i => Math.min(i + 1, STEPS.length - 1))
  }
  function goBack() {
    setStepIdx(i => Math.max(i - 1, 0))
  }

  // Reset slot when date changes
  function onPickDate(date: string) {
    setState(s => ({ ...s, date, slot: null }))
    goNext()
  }

  function onPickService(service: Service) {
    setState(s => ({ ...s, service }))
    goNext()
  }

  function onPickSlot(slot: Slot) {
    setState(s => ({ ...s, slot }))
    goNext()
  }

  // After details + create booking → go to payment
  async function onSubmitDetails(details: Details) {
    if (!state.service || !state.slot) return
    setState(s => ({ ...s, details }))

    // Create the booking + PaymentIntent (canonical: package_id)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        package_id: state.service.id,
        starts_at: state.slot.startsAtUtc,
        customer_name: details.name,
        customer_email: details.email,
        customer_phone: details.phone || undefined,
        locale,
        terms_accepted: true,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? `Booking creation failed (${res.status})`)
    }

    const { booking_id, client_secret } = (await res.json()) as {
      booking_id: string
      client_secret: string
    }

    setState(s => ({ ...s, bookingId: booking_id, clientSecret: client_secret }))
    goNext()
  }

  function onPaymentSuccess() {
    setConfirmed(true)
  }

  // Service preselection from ?service= — match canonical package slug,
  // legacy_aliases (so old ?service=wedding-photography still works), or
  // family slug (jump to first package in that family).
  function onServicesLoaded(services: Service[]) {
    if (state.service || !preselectedServiceSlug) return
    const slug = preselectedServiceSlug
    const exact = services.find(s => s.slug === slug)
    const viaAlias = exact ?? services.find(s => s.legacy_aliases?.includes(slug))
    const viaFamily = viaAlias ?? services.find(s => s.family_slug === slug)
    if (viaFamily) {
      setState(s => ({ ...s, service: viaFamily }))
      setStepIdx(1) // jump straight to date step
    }
  }

  const currentStepKey = STEPS[stepIdx].key

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16 lg:py-20">
      <header className="mb-10 md:mb-14">
        <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
          {t(locale, 'Reserva', 'Booking')}
        </p>
        <h1
          className="font-display uppercase text-ink"
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            lineHeight: '0.95',
            letterSpacing: '-0.01em',
          }}
        >
          {t(locale, 'Reserva tu sesión', 'Book your session')}
        </h1>
        <p className="mt-5 font-mono uppercase tracking-widest text-[11px] text-ink-muted">
          {t(
            locale,
            'Confirmación inmediata · Depósito 50% · Stripe',
            'Instant confirmation · 50% deposit · Stripe'
          )}
        </p>
      </header>

      {confirmed ? (
        <StepConfirmation
          locale={locale}
          bookingId={state.bookingId!}
        />
      ) : (
        <>
          <Stepper currentIdx={stepIdx} locale={locale} />

          <BookingSummary state={state} locale={locale} />

          <div className="mt-6">
            {currentStepKey === 'service' && (
              <StepService
                locale={locale}
                onPick={onPickService}
                onLoaded={onServicesLoaded}
              />
            )}

            {currentStepKey === 'date' && state.service && (
              <StepDate
                locale={locale}
                serviceDuration={state.service.duration_min}
                staffId={state.staffId}
                onBack={goBack}
                onPick={onPickDate}
              />
            )}

            {currentStepKey === 'time' && state.service && state.date && state.staffId && (
              <StepTime
                locale={locale}
                date={state.date}
                staffId={state.staffId}
                durationMin={state.service.duration_min}
                onBack={goBack}
                onPick={onPickSlot}
              />
            )}

            {currentStepKey === 'details' && state.service && state.slot && (
              <StepDetails
                locale={locale}
                onBack={goBack}
                onSubmit={onSubmitDetails}
              />
            )}

            {currentStepKey === 'payment' &&
              state.bookingId &&
              state.clientSecret &&
              state.service && (
                <StepPayment
                  locale={locale}
                  clientSecret={state.clientSecret}
                  bookingId={state.bookingId}
                  depositUsd={
                    Number(state.service.price_usd) * (state.service.deposit_percent / 100)
                  }
                  onSuccess={onPaymentSuccess}
                />
              )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Stepper ────────────────────────────────────────────────────────────────
// Bugatti telemetry-row stepper: mono-caps step counter on left, current step
// label on right. Inactive labels stay in ink-muted; active in ink. No
// circles, no chips, no color shift — scale + opacity carry hierarchy.

function Stepper({ currentIdx, locale }: { currentIdx: number; locale: Locale }) {
  return (
    <div className="mb-10 border-y border-hairline-soft py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
          {String(currentIdx + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
        </div>
        <div className="font-mono uppercase tracking-widest text-[11px] text-ink">
          {locale === 'es' ? STEPS[currentIdx].labelEs : STEPS[currentIdx].labelEn}
        </div>
      </div>
      <div className="mt-3 flex gap-1">
        {STEPS.map((s, i) => {
          const done = i < currentIdx
          const active = i === currentIdx
          return (
            <span
              key={s.key}
              className={`h-px flex-1 ${active ? 'bg-ink' : done ? 'bg-ink/60' : 'bg-hairline-soft'}`}
              aria-hidden="true"
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Persistent summary (shown after service is picked) ─────────────────────
// Flat hairline-bordered strip, no card chassis.

function BookingSummary({ state, locale }: { state: State; locale: Locale }) {
  if (!state.service) return null
  const name = locale === 'es' ? state.service.name_es : state.service.name_en
  const slot = state.slot
  const dateStr = slot
    ? new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
        timeZone: 'America/Santo_Domingo',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(new Date(slot.startsAtUtc))
    : state.date

  return (
    <div className="border border-hairline-soft px-4 py-3.5 text-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl shrink-0" aria-hidden="true">{state.service.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-display uppercase text-ink truncate" style={{ fontSize: '15px', lineHeight: '1.1' }}>
            {name}
          </div>
          <div className="mt-1 font-mono uppercase tracking-widest text-[10px] text-ink-muted">
            {state.service.duration_min} min · ${Number(state.service.price_usd).toFixed(0)} USD
            {dateStr && ` · ${dateStr}`}
            {slot && ` · ${slot.time} AST`}
          </div>
        </div>
      </div>
    </div>
  )
}
