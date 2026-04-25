import { createServiceClient } from '@/lib/supabase/service'
import {
  EditServiceButton,
  NewServiceButton,
  ToggleFlag,
  type Service,
} from './ServiceEditor'

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<string, string> = {
  celebrations: 'Celebrations',
  portraits: 'Portraits',
  commercial: 'Commercial',
  specialty: 'Specialty',
}

export default async function AdminBookingServicesPage() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('booking_services')
    .select(
      'id, slug, name_es, name_en, description_es, description_en, icon, category, duration_min, price_usd, deposit_percent, sort_order, bookable, active'
    )
    .order('sort_order', { ascending: true })

  const services = (data as Service[] | null) ?? []

  // Group by category
  const grouped: Record<string, Service[]> = {}
  for (const s of services) {
    if (!grouped[s.category]) grouped[s.category] = []
    grouped[s.category].push(s)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Services</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {services.length} services. Toggle &quot;active&quot; to hide from /prices.
            Toggle &quot;bookable&quot; to show &quot;Get Quote&quot; instead of &quot;Book Now&quot;.
          </p>
        </div>
        <NewServiceButton />
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Failed to load services: {error.message}
        </div>
      )}

      {Object.keys(CATEGORY_LABELS).map(catKey => {
        const list = grouped[catKey] ?? []
        if (list.length === 0) return null
        return (
          <section key={catKey} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
              {CATEGORY_LABELS[catKey]}
            </h2>

            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">
                <tr>
                  <th className="py-2">Service</th>
                  <th className="py-2 text-right">Duration</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Deposit</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Order</th>
                  <th className="py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {list.map(s => (
                  <tr key={s.id} className={!s.active ? 'opacity-50' : ''}>
                    <td className="py-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {s.icon} {s.name_en}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-gray-400">
                        {s.slug} · {s.name_es}
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-700 dark:text-gray-200">
                      {s.duration_min} min
                    </td>
                    <td className="py-3 text-right font-mono text-slate-700 dark:text-gray-200">
                      ${Number(s.price_usd).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-700 dark:text-gray-200">
                      {s.deposit_percent}%
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        <ToggleFlag id={s.id} field="active" current={s.active} label="active" />
                        <ToggleFlag id={s.id} field="bookable" current={s.bookable} label="bookable" />
                      </div>
                    </td>
                    <td className="py-3 text-right text-slate-500 dark:text-gray-400">
                      {s.sort_order}
                    </td>
                    <td className="py-3 text-right">
                      <EditServiceButton service={s} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )
      })}
    </div>
  )
}
