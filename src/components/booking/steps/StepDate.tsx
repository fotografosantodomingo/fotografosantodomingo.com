'use client'

import { useEffect, useMemo, useState } from 'react'

const MIN_ADVANCE_HOURS = 24
const MAX_ADVANCE_DAYS = 180
const TIMEZONE = 'America/Santo_Domingo'

function astTodayYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function ymdToDate(ymd: string): Date {
  // Construct as AST midnight to avoid timezone drift on the calendar grid
  return new Date(`${ymd}T00:00:00-04:00`)
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function ymd(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`
}

function monthLabel(year: number, month: number, locale: 'es' | 'en') {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))
}

export default function StepDate({
  locale,
  serviceDuration,
  staffId,
  onBack,
  onPick,
}: {
  locale: 'es' | 'en'
  serviceDuration: number
  staffId: string | null
  onBack: () => void
  onPick: (date: string) => void
}) {
  const today = astTodayYmd()
  const [todayY, todayM, todayD] = today.split('-').map(Number)
  const [viewYear, setViewYear] = useState(todayY)
  const [viewMonth, setViewMonth] = useState(todayM - 1) // 0-indexed
  const [availability, setAvailability] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const minDate = useMemo(() => {
    const d = new Date()
    d.setTime(d.getTime() + MIN_ADVANCE_HOURS * 60 * 60 * 1000)
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)
  }, [])

  const maxDate = useMemo(() => {
    const d = new Date()
    d.setTime(d.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000)
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)
  }, [])

  // Fetch availability counts for visible month
  useEffect(() => {
    if (!staffId) return
    const ctrl = new AbortController()
    setLoading(true)

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const dates: string[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const candidate = ymd(viewYear, viewMonth, d)
      if (candidate >= minDate && candidate <= maxDate) {
        dates.push(candidate)
      }
    }

    Promise.all(
      dates.map(date =>
        fetch(
          `/api/bookings/availability?staff_id=${staffId}&date=${date}&duration_min=${serviceDuration}`,
          { signal: ctrl.signal }
        )
          .then(r => r.json())
          .then((data: { slots?: { time: string }[] }) => [date, data.slots?.length ?? 0] as const)
          .catch(() => [date, 0] as const)
      )
    )
      .then(pairs => {
        const next: Record<string, number> = {}
        for (const [d, n] of pairs) next[d] = n
        setAvailability(next)
      })
      .finally(() => setLoading(false))

    return () => ctrl.abort()
  }, [staffId, viewYear, viewMonth, serviceDuration, minDate, maxDate])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay() // 0=Sun
  const cells: Array<{ ymd: string; day: number } | null> = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ ymd: ymd(viewYear, viewMonth, d), day: d })
  }

  const dayNames = locale === 'es'
    ? ['D', 'L', 'M', 'M', 'J', 'V', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  function gotoPrev() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }
  function gotoNext() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const canGoPrev = ymd(viewYear, viewMonth, 1) > minDate
  const canGoNext = ymd(viewYear, viewMonth, daysInMonth) < maxDate

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {locale === 'es' ? 'Elige una fecha' : 'Pick a date'}
        </h2>
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white">
          ← {locale === 'es' ? 'Atrás' : 'Back'}
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={gotoPrev}
            disabled={!canGoPrev}
            className="rounded-md p-1.5 text-gray-300 hover:bg-white/10 disabled:opacity-30"
          >
            ←
          </button>
          <div className="text-sm font-semibold capitalize">
            {monthLabel(viewYear, viewMonth, locale)}
          </div>
          <button
            onClick={gotoNext}
            disabled={!canGoNext}
            className="rounded-md p-1.5 text-gray-300 hover:bg-white/10 disabled:opacity-30"
          >
            →
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
          {dayNames.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} />
            const inRange = cell.ymd >= minDate && cell.ymd <= maxDate
            const slotCount = availability[cell.ymd] ?? 0
            const hasSlots = slotCount > 0
            const disabled = !inRange || (!loading && !hasSlots)
            return (
              <button
                key={i}
                onClick={() => !disabled && onPick(cell.ymd)}
                disabled={disabled}
                className={
                  disabled
                    ? 'aspect-square rounded-md text-sm text-gray-600'
                    : 'aspect-square rounded-md bg-white/10 text-sm font-semibold text-white hover:bg-emerald-500 hover:text-gray-950'
                }
                title={hasSlots ? `${slotCount} slots` : undefined}
              >
                {cell.day}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-center text-xs text-gray-500">
        {loading
          ? locale === 'es' ? 'Cargando disponibilidad…' : 'Loading availability…'
          : locale === 'es'
            ? 'Las fechas en gris no tienen horarios disponibles.'
            : 'Greyed-out dates have no available slots.'}
      </p>
    </div>
  )
}
