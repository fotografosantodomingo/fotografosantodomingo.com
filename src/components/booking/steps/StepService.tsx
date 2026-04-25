'use client'

import { useEffect, useState } from 'react'

export type Service = {
  id: string
  slug: string
  name_es: string
  name_en: string
  description_es: string | null
  description_en: string | null
  icon: string
  category: string
  duration_min: number
  price_usd: number
  deposit_percent: number
}

const CATEGORIES: Array<{ key: string; labelEs: string; labelEn: string }> = [
  { key: 'celebrations', labelEs: 'Celebraciones', labelEn: 'Celebrations' },
  { key: 'portraits', labelEs: 'Retratos', labelEn: 'Portraits' },
  { key: 'commercial', labelEs: 'Comercial', labelEn: 'Commercial' },
  { key: 'specialty', labelEs: 'Especialidades', labelEn: 'Specialty' },
]

export default function StepService({
  locale,
  onPick,
  onLoaded,
}: {
  locale: 'es' | 'en'
  onPick: (s: Service) => void
  onLoaded?: (services: Service[]) => void
}) {
  const [services, setServices] = useState<Service[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/bookings/services')
      .then(r => r.json())
      .then(data => {
        const list: Service[] = data.services ?? []
        setServices(list)
        onLoaded?.(list)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [onLoaded])

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
        {error}
      </div>
    )
  }

  if (!services) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  const grouped: Record<string, Service[]> = {}
  for (const s of services) {
    if (!grouped[s.category]) grouped[s.category] = []
    grouped[s.category].push(s)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        {locale === 'es' ? 'Elige tu servicio' : 'Choose your service'}
      </h2>

      {CATEGORIES.map(cat => {
        const list = grouped[cat.key] ?? []
        if (list.length === 0) return null
        return (
          <section key={cat.key}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {locale === 'es' ? cat.labelEs : cat.labelEn}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map(s => {
                const name = locale === 'es' ? s.name_es : s.name_en
                const desc = locale === 'es' ? s.description_es : s.description_en
                const deposit = Number(s.price_usd) * (s.deposit_percent / 100)
                return (
                  <button
                    key={s.id}
                    onClick={() => onPick(s)}
                    className="group flex flex-col rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-emerald-400/50 hover:bg-white/10"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="text-2xl">{s.icon}</span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                        ${Number(s.price_usd).toFixed(0)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-white">{name}</h4>
                    {desc && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-400">{desc}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{s.duration_min} min</span>
                      <span>
                        {locale === 'es'
                          ? `Depósito $${deposit.toFixed(0)}`
                          : `Deposit $${deposit.toFixed(0)}`}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
