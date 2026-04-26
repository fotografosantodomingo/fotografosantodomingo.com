import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

const STATUSES = ['NEW', 'REVIEWING', 'QUOTED', 'WON', 'LOST'] as const
type Status = (typeof STATUSES)[number]

const STATUS_COLORS: Record<Status, string> = {
  NEW: 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300',
  REVIEWING: 'bg-sky-100 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300',
  QUOTED: 'bg-violet-100 text-violet-800 dark:bg-violet-400/10 dark:text-violet-300',
  WON: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
  LOST: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-gray-400',
}

type Row = {
  id: string
  created_at: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  locale: string
  status: Status
  event_date: string | null
  family_id: string | null
  package_id: string | null
  source_page: string | null
  source_cta: string | null
}

function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value)
}

export default async function AdminQuoteRequestsPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  const supabase = createServiceClient()
  const statusFilter = searchParams?.status && isStatus(searchParams.status) ? searchParams.status : ''

  let query = supabase
    .from('quote_requests')
    .select('id, created_at, customer_name, customer_email, customer_phone, locale, status, event_date, family_id, package_id, source_page, source_cta')
    .order('created_at', { ascending: false })
    .limit(200)

  if (statusFilter) query = query.eq('status', statusFilter)

  const [requestsRes, familiesRes, packagesRes] = await Promise.all([
    query,
    supabase.from('service_families').select('id, slug, title_en, icon'),
    supabase.from('service_packages').select('id, slug, name_en'),
  ])

  const rows = (requestsRes.data as Row[] | null) ?? []
  const families = new Map(
    ((familiesRes.data ?? []) as Array<{ id: string; slug: string; title_en: string; icon: string }>).map(
      f => [f.id, f]
    )
  )
  const packages = new Map(
    ((packagesRes.data ?? []) as Array<{ id: string; slug: string; name_en: string }>).map(p => [p.id, p])
  )

  const error = requestsRes.error ?? familiesRes.error ?? packagesRes.error

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quote requests</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {rows.length} {statusFilter ? `with status ${statusFilter}` : 'most recent'} (max 200).
            RFQ inbox from /get-quote and family compare CTAs.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/admin/quote-requests"
          className={`rounded-full border px-3 py-1 ${
            !statusFilter
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/5'
          }`}
        >
          All
        </Link>
        {STATUSES.map(s => (
          <Link
            key={s}
            href={`/admin/quote-requests?status=${s}`}
            className={`rounded-full border px-3 py-1 ${
              statusFilter === s
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/5'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Failed to load: {error.message}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Family / package</th>
              <th className="px-4 py-3">Event date</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500 dark:text-gray-400">
                  No quote requests found.
                </td>
              </tr>
            )}
            {rows.map(r => {
              const fam = r.family_id ? families.get(r.family_id) : null
              const pkg = r.package_id ? packages.get(r.package_id) : null
              return (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{r.customer_name}</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">
                      {r.customer_email}
                      {r.customer_phone && <> · {r.customer_phone}</>}
                      <> · {r.locale}</>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 dark:text-gray-300">
                    {fam ? <>{fam.icon} {fam.title_en}</> : <span className="text-slate-400">—</span>}
                    {pkg && <div className="font-mono text-[11px] text-slate-500 dark:text-gray-400">{pkg.name_en}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 dark:text-gray-300">
                    {r.event_date ?? <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-gray-300">
                    {r.source_page ? <div className="font-mono text-[11px]">{r.source_page}</div> : <span className="text-slate-400">—</span>}
                    {r.source_cta && <div className="text-[11px] text-slate-500 dark:text-gray-400">cta: {r.source_cta}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/quote-requests/${r.id}`}
                      className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                    >
                      Open
                    </Link>
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
