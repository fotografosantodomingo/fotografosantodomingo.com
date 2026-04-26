'use client'

import { useEffect, useState } from 'react'

export type Slot = {
  time: string // 'HH:MM' AST display
  startsAtUtc: string
  endsAtUtc: string
}

export default function StepTime({
  locale,
  date,
  staffId,
  durationMin,
  onBack,
  onPick,
}: {
  locale: 'es' | 'en'
  date: string
  staffId: string
  durationMin: number
  onBack: () => void
  onPick: (slot: Slot) => void
}) {
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(
      `/api/bookings/availability?staff_id=${staffId}&date=${date}&duration_min=${durationMin}`,
      { signal: ctrl.signal }
    )
      .then(r => r.json())
      .then(data => setSlots(data.slots ?? []))
      .catch(err => {
        if (err.name !== 'AbortError') setError(err.message)
      })
    return () => ctrl.abort()
  }, [date, staffId, durationMin])

  const dateLabel = new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    timeZone: 'America/Santo_Domingo',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T12:00:00-04:00`))

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-mono uppercase tracking-widest text-[11px] text-ink-muted">
            {locale === 'es' ? 'Elige una hora' : 'Pick a time'}
          </h2>
          <p
            className="mt-3 font-display uppercase text-ink capitalize"
            style={{ fontSize: 'clamp(20px, 3vw, 28px)', lineHeight: '1.1' }}
          >
            {dateLabel}
          </p>
        </div>
        <button
          onClick={onBack}
          className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity shrink-0"
        >
          ← {locale === 'es' ? 'Atrás' : 'Back'}
        </button>
      </div>

      {error && (
        <div className="border border-hairline p-4 text-sm text-ink">
          <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
            {locale === 'es' ? 'Error' : 'Error'}
          </p>
          {error}
        </div>
      )}

      {!slots ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 border-t border-l border-hairline-soft">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 border-r border-b border-hairline-soft animate-pulse" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="border border-dashed border-hairline-soft p-10 text-center">
          <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
            {locale === 'es' ? 'No disponible' : 'Not available'}
          </p>
          <p className="text-sm text-ink-muted">
            {locale === 'es'
              ? 'No hay horarios disponibles ese día. Prueba otra fecha.'
              : 'No times available on this date. Try another date.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 border-t border-l border-hairline-soft">
          {slots.map(slot => (
            <button
              key={slot.startsAtUtc}
              onClick={() => onPick(slot)}
              className="font-mono text-ink text-base py-4 border-r border-b border-hairline-soft hover:bg-ink hover:text-canvas transition-colors duration-150"
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}

      <p className="text-center font-mono uppercase tracking-widest text-[10px] text-ink-muted">
        {locale === 'es'
          ? 'Hora local · Santo Domingo (AST)'
          : 'Local time · Santo Domingo (AST)'}
      </p>
    </div>
  )
}
