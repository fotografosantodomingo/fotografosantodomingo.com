'use client'

import { useEffect, useMemo, useState } from 'react'
import { SCHEDULE, VENUE, CEREMONY } from './data'

const DOW = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const STORAGE_KEY = 'jcc2026-done-v1'
const GATE_CODE = '1234'
const GAMES_END = new Date(2026, 7, 8, 23, 59, 59) // 8 Aug 2026, local time

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return { dow: DOW[dt.getUTCDay()], label: `${d} ${MON[m - 1]}` }
}

function splitDisc(raw: string): [string, string] {
  const spaceIdx = raw.indexOf(' ')
  const cat = spaceIdx === -1 ? raw : raw.slice(0, spaceIdx)
  const rest = spaceIdx === -1 ? raw : raw.slice(spaceIdx + 1)
  return [cat, rest || cat]
}

function properCase(s: string) {
  return s
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ')
}

type PendingAction = { key: string; nextValue: boolean } | null

export default function Jcc2026Schedule() {
  const dates = useMemo(() => Object.keys(SCHEDULE).sort(), [])
  const totalRows = useMemo(() => dates.reduce((sum, d) => sum + SCHEDULE[d].length, 0), [dates])

  const [done, setDone] = useState<Record<string, boolean>>({})
  const [hydrated, setHydrated] = useState(false)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [pending, setPending] = useState<PendingAction>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  // Load saved progress + compute countdown only on the client, so SSR/hydration
  // never has to guess a date or read localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setDone(JSON.parse(raw))
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true)
    const ms = GAMES_END.getTime() - Date.now()
    setDaysLeft(Math.max(0, Math.ceil(ms / 86_400_000)))
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(done))
  }, [done, hydrated])

  const completedCount = Object.values(done).filter(Boolean).length
  const remainingCount = totalRows - completedCount
  const pct = totalRows > 0 ? Math.round((completedCount / totalRows) * 100) : 0

  function requestToggle(key: string, current: boolean) {
    setPending({ key, nextValue: !current })
    setCode('')
    setError(false)
  }

  function confirmToggle() {
    if (code !== GATE_CODE) {
      setError(true)
      return
    }
    if (pending) {
      setDone((prev) => ({ ...prev, [pending.key]: pending.nextValue }))
    }
    setPending(null)
  }

  return (
    <div className="jcc-scope -mx-4 -my-8 min-h-screen bg-[#f4f0e4] pb-24 text-[#10201f] dark:bg-[#0b1615] dark:text-[#eef1ee]">
      <div className="mx-auto max-w-3xl px-4">
        {/* Masthead */}
        <div className="border-b-[3px] border-[#0f4f4a] py-8 dark:border-[#3fa89a]">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#0f4f4a] dark:text-[#3fa89a]">
            Centro Caribe Sports · Fotógrafo oficial
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ textWrap: 'balance' }}>
            Hoja de ruta — Santo Domingo 2026
          </h1>
          <p className="mt-1 max-w-[60ch] text-sm text-[#5c6f6b] dark:text-[#8fa39d]">
            XXV Juegos Centroamericanos y del Caribe. Disciplinas con sede confirmada en el Gran Santo
            Domingo, 24 de julio – 8 de agosto. Toca el círculo de cada fila para marcarla completada.
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#5c6f6b] dark:text-[#8fa39d]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f4f4a] dark:bg-[#3fa89a]" /> sede confirmada
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[#c1583a] dark:border-[#e08063]" /> verificar
              sede exacta
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#0f4f4a] text-[7px] leading-none text-white dark:bg-[#3fa89a] dark:text-[#0b1615]">
                ✓
              </span>{' '}
              completada
            </span>
          </div>

          <details className="mt-3 text-sm text-[#5c6f6b] dark:text-[#8fa39d]">
            <summary className="cursor-pointer font-semibold text-[#c1583a] dark:text-[#e08063]">
              5 disciplinas excluidas — otras ciudades
            </summary>
            <p className="mt-2 leading-relaxed">
              <strong>Surf</strong> (Zona Norte), <strong>Esquí Náutico</strong> y <strong>Golf</strong> (Boca
              Chica / Punta Cana), <strong>Remo</strong> y <strong>Canotaje</strong> (fuente ambigua entre JPD
              y Zona Norte — excluidas por seguridad).
            </p>
          </details>
        </div>

        {/* Day nav */}
        <div className="sticky top-0 z-10 -mx-4 border-b border-[#dcd5c1] bg-[#f4f0e4] px-4 py-2.5 dark:border-[#24413d] dark:bg-[#0b1615]">
          <nav
            aria-label="Ir a un día"
            className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {dates.map((iso) => {
              const { label } = fmtDate(iso)
              const isCeremony = !!CEREMONY[iso]
              return (
                <a
                  key={iso}
                  href={`#d-${iso}`}
                  className={`flex-none whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold tabular-nums ${
                    isCeremony
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
            const rows = SCHEDULE[iso]
            const ceremony = CEREMONY[iso]
            return (
              <section
                key={iso}
                id={`d-${iso}`}
                className="scroll-mt-16 border-t border-[#e8e2d1] pt-7 first:border-t-0 dark:border-[#1a2f2c]"
              >
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <div className="text-lg font-extrabold tracking-tight sm:text-xl">
                    {dow} {label}
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
                    const key = `${iso}|${idx}`
                    const isDone = !!done[key]
                    return (
                      <div
                        key={idx}
                        className={`grid grid-cols-[2.9rem_1fr_auto] items-start gap-2 border-b border-[#e8e2d1] py-2.5 transition-opacity sm:grid-cols-[3.4rem_1fr_auto] sm:gap-3 dark:border-[#1a2f2c] ${
                          isDone ? 'opacity-50' : ''
                        }`}
                      >
                        {r.time ? (
                          <span className="pt-0.5 font-mono text-[13px] font-semibold tabular-nums text-[#0f4f4a] dark:text-[#3fa89a]">
                            {r.time}
                          </span>
                        ) : (
                          <span className="pt-0.5 text-[11px] italic text-[#5c6f6b] dark:text-[#8fa39d]">
                            s/hora
                          </span>
                        )}
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-[#5c6f6b] dark:text-[#8fa39d]">
                            {properCase(cat)}
                          </span>
                          <span className={`block truncate text-sm font-semibold sm:text-base ${isDone ? 'line-through' : ''}`}>
                            {properCase(discRaw)}
                          </span>
                          <div className="mt-0.5 truncate text-xs text-[#5c6f6b] dark:text-[#8fa39d]">{venue}</div>
                        </div>
                        <div className="mt-0.5 justify-self-end">
                          <button
                            type="button"
                            aria-label={isDone ? 'Desmarcar como completada' : 'Marcar como completada'}
                            onClick={() => requestToggle(key, isDone)}
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold leading-none transition-colors ${
                              isDone
                                ? 'border-[#0f4f4a] bg-[#0f4f4a] text-white dark:border-[#3fa89a] dark:bg-[#3fa89a] dark:text-[#0b1615]'
                                : confirmed
                                ? 'border-[#0f4f4a] text-transparent hover:bg-[#0f4f4a]/10 dark:border-[#3fa89a]'
                                : 'border-[#c1583a] text-transparent hover:bg-[#c1583a]/10 dark:border-[#e08063]'
                            }`}
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </main>

        <footer className="mb-10 mt-8 text-xs leading-relaxed text-[#5c6f6b] dark:text-[#8fa39d]">
          Horas del reporte oficial &quot;Programación x Hora x Disciplina&quot; — algunas disciplinas no
          traían hora de inicio (marcadas &quot;s/hora&quot;). Sedes inferidas del listado oficial de venues
          del JPD, Parque del Este y Gran Santo Domingo; las marcadas con el punto hueco son inferencia
          razonable, no confirmación literal. El progreso se guarda solo en este dispositivo.
        </footer>
      </div>

      {/* Bottom summary bar. Left padding clears the site-wide floating chat
          bubble (fixed bottom-5 left-5, h-12 w-12, z-50) that sits on top of
          this bar on every page. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#dcd5c1] bg-[#fffdf8]/95 py-3 pl-20 pr-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur dark:border-[#24413d] dark:bg-[#10201f]/95">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-xl font-extrabold text-[#0f4f4a] dark:text-[#3fa89a]">{completedCount}</span>
                <span className="text-sm text-[#5c6f6b] dark:text-[#8fa39d]">/ {totalRows} completadas</span>
              </div>
              <div className="text-xs text-[#5c6f6b] dark:text-[#8fa39d]">
                {remainingCount} por hacer
                {daysLeft !== null && (
                  <>
                    {' '}
                    · {daysLeft} {daysLeft === 1 ? 'día restante' : 'días restantes'}
                  </>
                )}
              </div>
            </div>
            <div className="pb-0.5 text-right text-xs font-bold tabular-nums text-[#5c6f6b] dark:text-[#8fa39d]">
              {pct}%
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e8e2d1] dark:bg-[#1a2f2c]">
            <div
              className="h-full rounded-full bg-[#0f4f4a] transition-[width] duration-300 dark:bg-[#3fa89a]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Password gate modal */}
      {pending && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={() => setPending(null)}
        >
          <div
            className="w-full max-w-xs rounded-xl border border-[#dcd5c1] bg-[#fffdf8] p-5 shadow-2xl dark:border-[#24413d] dark:bg-[#10201f]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-bold">
              {pending.nextValue ? 'Marcar como completada' : 'Desmarcar completada'}
            </div>
            <p className="mt-1 text-xs text-[#5c6f6b] dark:text-[#8fa39d]">Ingresa el código para confirmar.</p>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              maxLength={4}
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && confirmToggle()}
              className={`mt-3 w-full rounded-lg border-2 bg-transparent px-3 py-2 text-center text-lg tracking-[0.5em] outline-none ${
                error ? 'border-[#c1583a]' : 'border-[#dcd5c1] focus:border-[#0f4f4a] dark:border-[#24413d] dark:focus:border-[#3fa89a]'
              }`}
              placeholder="••••"
            />
            {error && <p className="mt-1.5 text-xs font-semibold text-[#c1583a] dark:text-[#e08063]">Código incorrecto.</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="flex-1 rounded-lg border border-[#dcd5c1] px-3 py-2 text-sm font-semibold text-[#5c6f6b] dark:border-[#24413d] dark:text-[#8fa39d]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmToggle}
                className="flex-1 rounded-lg bg-[#0f4f4a] px-3 py-2 text-sm font-semibold text-white dark:bg-[#3fa89a] dark:text-[#0b1615]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
