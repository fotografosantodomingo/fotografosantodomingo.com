import { createServiceClient } from '@/lib/supabase/service'
import {
  EditPackageButton,
  NewPackageButton,
  ToggleFlag,
  type FamilyOption,
  type Package,
} from './PackageEditor'

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export default async function AdminPackagesPage({
  searchParams,
}: {
  searchParams?: { family?: string }
}) {
  const supabase = createServiceClient()

  const familySlugFilter = searchParams?.family && SLUG_RE.test(searchParams.family) ? searchParams.family : ''

  const [familiesRes, packagesRes] = await Promise.all([
    supabase
      .from('service_families')
      .select('id, slug, title_en, icon, sort_order, active')
      .order('sort_order', { ascending: true }),
    supabase
      .from('service_packages')
      .select(
        'id, family_id, slug, name_es, name_en, description_short_es, description_short_en, inclusions_es, inclusions_en, duration_min, starting_price_usd, deposit_percent, photo_count, minimum_billable_hours, bookable_direct, custom_quote_allowed, featured, popular_badge, active, sort_order, legacy_aliases'
      )
      .order('sort_order', { ascending: true }),
  ])

  const allFamilies = (familiesRes.data ?? []) as Array<{
    id: string
    slug: string
    title_en: string
    icon: string
    sort_order: number
    active: boolean
  }>
  const families: FamilyOption[] = allFamilies.map(f => ({
    id: f.id,
    slug: f.slug,
    title_en: f.title_en,
    icon: f.icon,
  }))
  const familyById = new Map(allFamilies.map(f => [f.id, f]))

  const allPackages = (packagesRes.data as Package[] | null) ?? []
  const filteredFamilyId = familySlugFilter
    ? allFamilies.find(f => f.slug === familySlugFilter)?.id
    : undefined
  const packages = filteredFamilyId
    ? allPackages.filter(p => p.family_id === filteredFamilyId)
    : allPackages

  const grouped = new Map<string, Package[]>()
  for (const p of packages) {
    const arr = grouped.get(p.family_id) ?? []
    arr.push(p)
    grouped.set(p.family_id, arr)
  }

  const error = familiesRes.error ?? packagesRes.error

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Packages</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {packages.length} {filteredFamilyId ? 'in selected family' : 'total'}. Pricing engine —
            edits here flow to /book and /services compare grids.
          </p>
        </div>
        <NewPackageButton families={families} />
      </div>

      <form method="GET" className="flex items-center gap-3 text-sm">
        <label className="text-slate-600 dark:text-gray-300">Filter family:</label>
        <select
          name="family"
          defaultValue={familySlugFilter}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 dark:border-white/20 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All families</option>
          {allFamilies.map(f => (
            <option key={f.id} value={f.slug}>{f.icon} {f.title_en}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/5"
        >
          Apply
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Failed to load: {error.message}
        </div>
      )}

      {Array.from(grouped.entries())
        .sort(([a], [b]) => (familyById.get(a)?.sort_order ?? 0) - (familyById.get(b)?.sort_order ?? 0))
        .map(([familyId, list]) => {
          const f = familyById.get(familyId)
          return (
            <section key={familyId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                {f ? `${f.icon} ${f.title_en}` : 'Unknown family'}
              </h2>

              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">
                  <tr>
                    <th className="py-2">Package</th>
                    <th className="py-2 text-right">Duration</th>
                    <th className="py-2 text-right">From</th>
                    <th className="py-2 text-right">Deposit</th>
                    <th className="py-2 text-right">Photos</th>
                    <th className="py-2">Flags</th>
                    <th className="py-2 text-right">Order</th>
                    <th className="py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {list.map(p => (
                    <tr key={p.id} className={!p.active ? 'opacity-50' : ''}>
                      <td className="py-3">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {p.name_en}
                          {p.popular_badge && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                              {p.popular_badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">
                          {p.slug} · {p.name_es}
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-700 dark:text-gray-200">
                        {p.duration_min}m
                        {p.minimum_billable_hours ? <span className="text-xs text-slate-400"> (min {p.minimum_billable_hours}h)</span> : null}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-700 dark:text-gray-200">
                        ${Number(p.starting_price_usd).toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-700 dark:text-gray-200">
                        {p.deposit_percent}%
                      </td>
                      <td className="py-3 text-right font-mono text-slate-700 dark:text-gray-200">
                        {p.photo_count ?? '—'}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          <ToggleFlag id={p.id} field="active" current={p.active} label="active" />
                          <ToggleFlag id={p.id} field="bookable_direct" current={p.bookable_direct} label="direct" />
                          <ToggleFlag id={p.id} field="custom_quote_allowed" current={p.custom_quote_allowed} label="rfq" />
                          <ToggleFlag id={p.id} field="featured" current={p.featured} label="featured" />
                        </div>
                      </td>
                      <td className="py-3 text-right text-slate-500 dark:text-gray-400">
                        {p.sort_order}
                      </td>
                      <td className="py-3 text-right">
                        <EditPackageButton pkg={p} families={families} />
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
