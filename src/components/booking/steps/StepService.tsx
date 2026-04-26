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
      <div className="border border-hairline p-4 text-sm text-ink">
        <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
          {locale === 'es' ? 'Error' : 'Error'}
        </p>
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid gap-0 border-t border-l border-hairline-soft sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 border-r border-b border-hairline-soft animate-pulse" />
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
    <div className="space-y-10">
      <h2 className="font-mono uppercase tracking-widest text-[11px] text-ink-muted">
        {locale === 'es' ? 'Elige tu paquete' : 'Choose your package'}
      </h2>

      {data.families.map(fam => {
        const list = packagesByFamily.get(fam.id) ?? []
        if (list.length === 0) return null
        const famTitle = locale === 'es' ? fam.title_es : fam.title_en
        return (
          <section key={fam.id}>
            <h3 className="mb-4 flex items-center gap-2.5">
              <span className="text-base" aria-hidden="true">{fam.icon}</span>
              <span className="font-mono uppercase tracking-widest text-[11px] text-ink">{famTitle}</span>
            </h3>
            <ul className="grid border-t border-l border-hairline-soft sm:grid-cols-2">
              {list.map(s => {
                const name = locale === 'es' ? s.name_es : s.name_en
                const desc = locale === 'es' ? s.description_es : s.description_en
                const deposit = Number(s.price_usd) * (s.deposit_percent / 100)
                return (
                  <li key={s.id} className="border-r border-b border-hairline-soft">
                    <button
                      type="button"
                      onClick={() => onPick(s)}
                      className="group flex flex-col w-full h-full p-5 text-left hover:bg-ink/5 transition-colors duration-200"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3 min-h-[20px]">
                        <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {s.popular_badge ? s.popular_badge.replace('_', ' ') : ''}
                        </span>
                        <span className="font-display text-ink" style={{ fontSize: '24px', lineHeight: '1' }}>
                          ${Number(s.price_usd).toFixed(0)}
                        </span>
                      </div>
                      <h4
                        className="font-display uppercase text-ink"
                        style={{ fontSize: '17px', lineHeight: '1.15', letterSpacing: '0' }}
                      >
                        {name}
                      </h4>
                      {desc && (
                        <p className="mt-2 line-clamp-2 text-sm text-ink-muted leading-snug">{desc}</p>
                      )}
                      <div className="mt-4 pt-3 border-t border-hairline-soft flex items-center justify-between font-mono uppercase tracking-widest text-[10px] text-ink-muted">
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
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
