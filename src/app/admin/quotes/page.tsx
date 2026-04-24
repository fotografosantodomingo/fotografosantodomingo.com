import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'Pending',
  SENT_TO_CUSTOMER: 'Sent',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300',
  SENT_TO_CUSTOMER: 'bg-sky-100 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300',
  ACCEPTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
  REJECTED: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-gray-400',
}

type Quote = {
  id: string
  created_at: string
  full_name: string | null
  email: string | null
  service_type: string | null
  event_date: string | null
  city: string | null
  country: string | null
  status: string
  final_price_usd: number | null
  locale: string
}

const VALID_STATUSES = ['PENDING_REVIEW', 'SENT_TO_CUSTOMER', 'ACCEPTED', 'REJECTED', ''] as const
type FilterStatus = (typeof VALID_STATUSES)[number]

function isValidStatus(value: string): value is FilterStatus {
  return (VALID_STATUSES as readonly string[]).includes(value)
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  const rawStatus = searchParams?.status ?? ''
  const statusFilter: FilterStatus = isValidStatus(rawStatus) ? rawStatus : ''

  const supabase = createServiceClient()
  let query = supabase
    .from('quotes')
    .select(
      'id, created_at, full_name, email, service_type, event_date, city, country, status, final_price_usd, locale'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data: quotes, error } = await query

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quote Requests</h1>
        <span className="text-sm text-slate-500 dark:text-gray-400">{quotes?.length ?? 0} results</span>
      </div>

      {/* Status filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {([['', 'All'], ['PENDING_REVIEW', 'Pending'], ['SENT_TO_CUSTOMER', 'Sent'], ['ACCEPTED', 'Accepted'], ['REJECTED', 'Rejected']] as const).map(([value, label]) => (
          <Link
            key={value}
            href={value ? `/admin/quotes?status=${value}` : '/admin/quotes'}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              statusFilter === value
                ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          Error loading quotes: {error.message}
        </div>
      )}

      {!error && quotes?.length === 0 && (
        <p className="text-slate-500 dark:text-gray-400">No quotes found.</p>
      )}

      {quotes && quotes.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:text-gray-400">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {(quotes as Quote[]).map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-gray-400">
                    {new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {q.full_name ?? '—'}
                    <div className="text-xs font-normal text-slate-400">{q.email ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-gray-300">
                    {q.service_type ? q.service_type.replace(/-/g, ' ') : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-gray-400">
                    {q.event_date ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-gray-400">
                    {[q.city, q.country].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[q.status] ?? ''}`}>
                      {STATUS_LABELS[q.status] ?? q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-gray-300">
                    {q.final_price_usd ? `$${Number(q.final_price_usd).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/quotes/${q.id}`}
                      className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-500"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
