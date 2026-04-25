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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {locale === 'es' ? 'Elige una hora' : 'Pick a time'}
          </h2>
          <p className="text-xs capitalize text-gray-400">{dateLabel}</p>
        </div>
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white">
          ← {locale === 'es' ? 'Atrás' : 'Back'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!slots ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-white/5" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-400">
          {locale === 'es'
            ? 'No hay horarios disponibles ese día. Prueba otra fecha.'
            : 'No times available on this date. Try another date.'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map(slot => (
            <button
              key={slot.startsAtUtc}
              onClick={() => onPick(slot)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white hover:border-emerald-400/50 hover:bg-emerald-500 hover:text-gray-950"
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-500">
        {locale === 'es'
          ? 'Hora local — Santo Domingo (AST)'
          : 'Local time — Santo Domingo (AST)'}
      </p>
    </div>
  )
}
