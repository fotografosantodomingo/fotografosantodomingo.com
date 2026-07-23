'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SCHEDULE, VENUE, CEREMONY } from './data'
import { STORAGE_KEY, fmtDate, splitDisc, properCase, timeToMinutes, mapsUrl } from './utils'

function todayIso() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function Jcc2026DayPlan() {
  const pathname = usePathname()
  const base = pathname?.startsWith('/admin') ? '/admin/jcc2026' : '/jcc2026'
  const dates = useMemo(() => Object.keys(SCHEDULE).sort(), [])
  const today = useMemo(() => todayIso(), [])

  const [done, setDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setDone(JSON.parse(raw))
    } catch {
      /* ignore corrupt storage */
    }
  }, [])

  return (
    <div className="jcc-scope -mx-4 -my-8 min-h-screen bg-[#f4f0e4] pb-16 text-[#10201f] dark:bg-[#0b1615] dark:text-[#eef1ee]">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        {/* Masthead */}
        <div className="border-b-[3px] border-[#0f4f4a] py-8 dark:border-[#3fa89a]">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#0f4f4a] dark:text-[#3fa89a]">
            Centro Caribe Sports · Fotógrafo
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ textWrap: 'balance' }}>
            Plan por hora y dirección
          </h1>
          <p className="mt-1 max-w-[60ch] text-sm text-[#5c6f6b] dark:text-[#8fa39d]">
            A dónde ir y a qué hora, día por día. Toca &quot;cómo llegar&quot; para abrir la ruta en
            Google Maps.
          </p>

          <Link
            href={base}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#0f4f4a] hover:underline dark:text-[#3fa89a]"
          >
            ← Ver disciplinas cubiertas
          </Link>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#5c6f6b] dark:text-[#8fa39d]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f4f4a] dark:bg-[#3fa89a]" /> sede confirmada
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[#c1583a] dark:border-[#e08063]" /> verificar
              sede exacta
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f4f4a]/30 dark:bg-[#3fa89a]/30" /> ya cubierta
            </span>
          </div>
        </div>

        {/* Day nav */}
        <div className="sticky top-0 z-10 -mx-5 border-b border-[#dcd5c1] bg-[#f4f0e4] px-5 py-2.5 dark:border-[#24413d] dark:bg-[#0b1615] sm:-mx-6 sm:px-6">
          <nav
            aria-label="Ir a un día"
            className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {dates.map((iso) => {
              const { label } = fmtDate(iso)
              const isCeremony = !!CEREMONY[iso]
              const isToday = iso === today
              return (
                <a
                  key={iso}
                  href={`#d-${iso}`}
                  className={`flex-none whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold tabular-nums ${
                    isToday
                      ? 'border-[#0f4f4a] bg-[#0f4f4a] text-white dark:border-[#3fa89a] dark:bg-[#3fa89a] dark:text-[#0b1615]'
                      : isCeremony
                      ? 'border-[#d98c2b] text-[#d98c2b] dark:border-[#e6a34a] dark:text-[#e6a34a]'
                      : 'border-[#dcd5c1] text-[#2c3f3d] hover:border-[#0f4f4a] dark:border-[#24413d] dark:text-[#c7d1cc] dark:hover:border-[#3fa89a]'
                  }`}
                >
                  {label}
                </a>
              )
            })}
          </nav>
        </div>

        {/* Days */}
        <main>
          {dates.map((iso, i) => {
            const { dow, label } = fmtDate(iso)
            const rows = [...SCHEDULE[iso]].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
            const ceremony = CEREMONY[iso]
            const isToday = iso === today
            return (
              <section
                key={iso}
                id={`d-${iso}`}
                className="scroll-mt-16 border-t border-[#e8e2d1] pt-7 first:border-t-0 dark:border-[#1a2f2c]"
              >
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight sm:text-xl">
                    {dow} {label}
                    {isToday && (
                      <span className="rounded-full bg-[#0f4f4a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-[#3fa89a] dark:text-[#0b1615]">
                        Hoy
                      </span>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-xs font-bold tabular-nums text-[#5c6f6b] dark:text-[#8fa39d]">
                    Día {i + 1} de {dates.length}
                  </div>
                </div>

                {ceremony && (
                  <div className="mb-3 inline-block rounded-md border border-[#d98c2b] bg-[#f2e2c4] px-3 py-1.5 text-xs font-bold text-[#d98c2b] dark:border-[#e6a34a] dark:bg-[#3a2c14] dark:text-[#e6a34a]">
                    {ceremony}
                  </div>
                )}

                <div className="border-t border-[#e8e2d1] dark:border-[#1a2f2c]">
                  {rows.map((r, idx) => {
                    const [cat, discRaw] = splitDisc(r.disc)
                    const [venue, confirmed] = VENUE[`${cat}|${discRaw}`] ?? ['Por confirmar', false]
                    const key = `${cat}|${discRaw}`
                    const isDone = !!done[key]
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 border-b border-[#e8e2d1] py-3 dark:border-[#1a2f2c] ${
                          isDone ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="w-14 flex-none pt-0.5 sm:w-16">
                          {r.time ? (
                            <span className="font-mono text-[13px] font-semibold tabular-nums text-[#0f4f4a] dark:text-[#3fa89a]">
                              {r.time}
                            </span>
                          ) : (
                            <span className="text-[11px] italic text-[#5c6f6b] dark:text-[#8fa39d]">s/hora</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-[#5c6f6b] dark:text-[#8fa39d]">
                            {properCase(cat)}
                          </span>
                          <span className="block truncate text-sm font-semibold sm:text-base">
                            {properCase(discRaw)}
                            {isDone && <span className="ml-1.5 text-xs font-normal">✓ cubierta</span>}
                          </span>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 flex-none rounded-full ${
                                confirmed ? 'bg-[#0f4f4a] dark:bg-[#3fa89a]' : 'border border-[#c1583a] dark:border-[#e08063]'
                              }`}
                            />
                            <span className="truncate text-xs text-[#5c6f6b] dark:text-[#8fa39d]">{venue}</span>
                          </div>
                        </div>
                        <a
                          href={mapsUrl(venue)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 flex-none whitespace-nowrap rounded-full border border-[#0f4f4a] px-2.5 py-1 text-[11px] font-bold text-[#0f4f4a] hover:bg-[#0f4f4a]/10 dark:border-[#3fa89a] dark:text-[#3fa89a]"
                        >
                          Cómo llegar
                        </a>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </main>

        <footer className="mb-10 mt-8 text-xs leading-relaxed text-[#5c6f6b] dark:text-[#8fa39d]">
          Horas y disciplinas de la misma fuente que la hoja de ruta. Los enlaces &quot;cómo llegar&quot;
          abren una búsqueda en Google Maps por nombre de sede — para las sedes marcadas con el punto
          hueco, confirma la ubicación exacta antes de salir. El estado &quot;cubierta&quot; viene del
          seguimiento de disciplinas y se guarda solo en este dispositivo.
        </footer>
      </div>
    </div>
  )
}
