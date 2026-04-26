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
  duration_min: number
  price_usd: number
  deposit_percent: number
  photo_count: number | null
  minimum_billable_hours: number | null
  popular_badge: 'most_booked' | 'best_value' | null
  featured: boolean
  legacy_aliases: string[]
  family_id: string
  family_slug: string
  family_title_es: string
  family_title_en: string
}

type ApiResponse = {
  services: Service[]
  families: Array<{ id: string; slug: string; title_es: string; title_en: string; icon: string }>
}

export default function StepService({
  locale,
  onPick,
  onLoaded,
}: {
  locale: 'es' | 'en'
  onPick: (s: Service) => void
  onLoaded?: (services: Service[]) => void
}) {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/bookings/services')
      .then(r => r.json())
      .then((d: ApiResponse) => {
        setData(d)
        onLoaded?.(d.services ?? [])
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

  if (!data) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  // Group packages by family, preserve family sort_order from server
  const packagesByFamily = new Map<string, Service[]>()
  for (const s of data.services) {
    const arr = packagesByFamily.get(s.family_id) ?? []
    arr.push(s)
    packagesByFamily.set(s.family_id, arr)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        {locale === 'es' ? 'Elige tu servicio' : 'Choose your service'}
      </h2>

      {data.families.map(fam => {
        const list = packagesByFamily.get(fam.id) ?? []
        if (list.length === 0) return null
        const famTitle = locale === 'es' ? fam.title_es : fam.title_en
        return (
          <section key={fam.id}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {fam.icon} {famTitle}
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
                      <span>
                        {s.duration_min} min
                        {s.minimum_billable_hours
                          ? locale === 'es'
                            ? ` · mín ${s.minimum_billable_hours}h`
                            : ` · min ${s.minimum_billable_hours}h`
                          : ''}
                      </span>
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
