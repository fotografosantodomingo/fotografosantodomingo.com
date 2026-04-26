import { createServiceClient } from '@/lib/supabase/service'
import {
  EditFamilyButton,
  NewFamilyButton,
  ToggleFlag,
  type Family,
} from './FamilyEditor'

export const dynamic = 'force-dynamic'

export default async function AdminFamiliesPage() {
  const supabase = createServiceClient()

  const [familiesRes, packagesRes] = await Promise.all([
    supabase
      .from('service_families')
      .select('id, slug, title_es, title_en, tagline_es, tagline_en, icon, seo_parent_url, bookable, quoteable, active, sort_order')
      .order('sort_order', { ascending: true }),
    supabase
      .from('service_packages')
      .select('family_id, active'),
  ])

  const families = (familiesRes.data as Family[] | null) ?? []
  const packages = (packagesRes.data as { family_id: string; active: boolean }[] | null) ?? []
  const error = familiesRes.error ?? packagesRes.error

  const counts = new Map<string, { total: number; active: number }>()
  for (const p of packages) {
    const c = counts.get(p.family_id) ?? { total: 0, active: 0 }
    c.total += 1
    if (p.active) c.active += 1
    counts.set(p.family_id, c)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Service families</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {families.length} families. These power the homepage hub and /services/&lt;slug&gt; pages.
          </p>
        </div>
        <NewFamilyButton />
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Failed to load: {error.message}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">
            <tr>
              <th className="py-2">Family</th>
              <th className="py-2">SEO URL</th>
              <th className="py-2 text-right">Packages</th>
              <th className="py-2">Flags</th>
              <th className="py-2 text-right">Order</th>
              <th className="py-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {families.map(f => {
              const c = counts.get(f.id) ?? { total: 0, active: 0 }
              return (
                <tr key={f.id} className={!f.active ? 'opacity-50' : ''}>
                  <td className="py-3">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {f.icon} {f.title_en}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">
                      {f.slug} · {f.title_es}
                    </div>
                  </td>
                  <td className="py-3 font-mono text-xs text-slate-600 dark:text-gray-300">
                    {f.seo_parent_url}
                  </td>
                  <td className="py-3 text-right font-mono text-slate-700 dark:text-gray-200">
                    {c.active}/{c.total}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      <ToggleFlag id={f.id} field="active" current={f.active} label="active" />
                      <ToggleFlag id={f.id} field="bookable" current={f.bookable} label="bookable" />
                      <ToggleFlag id={f.id} field="quoteable" current={f.quoteable} label="quoteable" />
                    </div>
                  </td>
                  <td className="py-3 text-right text-slate-500 dark:text-gray-400">
                    {f.sort_order}
                  </td>
                  <td className="py-3 text-right">
                    <EditFamilyButton family={f} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
