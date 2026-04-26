import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { BOOKING_STATUS_LABELS, BOOKING_TIMEZONE } from '@/lib/bookings/constants'
import type { BookingStatus } from '@/lib/bookings/constants'
import { releaseStalePendingBookings } from '@/lib/bookings/availability'

export const dynamic = 'force-dynamic'

type Tab = 'upcoming' | 'past' | 'cancelled' | 'all'

const TAB_LABELS: Record<Tab, string> = {
  upcoming: 'Upcoming',
  past: 'Past',
  cancelled: 'Cancelled',
  all: 'All',
}

type Snap = {
  name_es?: string
  name_en?: string
  family_icon?: string
} | null

type BookingRow = {
  id: string
  starts_at: string
  ends_at: string
  status: BookingStatus
  customer_name: string
  customer_email: string
  stripe_amount_usd: number | null
  deposit_amount_usd: number | null
  package_snapshot: Snap
  family: { icon: string } | null
  staff: { name: string } | null
}

function formatAst(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: BOOKING_TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const tab: Tab = (['upcoming', 'past', 'cancelled', 'all'] as const).includes(
    searchParams.tab as Tab
  )
    ? (searchParams.tab as Tab)
    : 'upcoming'

  const supabase = createServiceClient()

  // Free abandoned slots before listing (so the counts are honest)
  await releaseStalePendingBookings(supabase)

  const nowIso = new Date().toISOString()

  let query = supabase
    .from('bookings')
    .select(
      `id, starts_at, ends_at, status, customer_name, customer_email,
       stripe_amount_usd, deposit_amount_usd,
       package_snapshot,
       family:service_families ( icon ),
       staff:staff_members ( name )`
    )
    .order('starts_at', { ascending: tab === 'upcoming' })
    .limit(200)

  if (tab === 'upcoming') {
    query = query.gte('starts_at', nowIso).in('status', ['PENDING_PAYMENT', 'CONFIRMED'])
  } else if (tab === 'past') {
    query = query.lt('starts_at', nowIso).in('status', ['CONFIRMED', 'COMPLETED', 'NO_SHOW'])
  } else if (tab === 'cancelled') {
    query = query.eq('status', 'CANCELLED')
  }

  const { data, error } = await query
  const rows: BookingRow[] = (data as BookingRow[] | null) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bookings</h1>
        <p className="text-sm text-slate-500 dark:text-gray-400">
          Times shown in AST (America/Santo_Domingo)
        </p>
      </div>

      <div className="border-b border-slate-200 dark:border-white/10">
        <nav className="-mb-px flex gap-6 text-sm">
          {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
            <Link
              key={t}
              href={`?tab=${t}`}
              className={
                t === tab
                  ? 'border-b-2 border-emerald-500 px-1 py-3 font-semibold text-slate-900 dark:text-white'
                  : 'px-1 py-3 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
              }
            >
              {TAB_LABELS[t]}
            </Link>
          ))}
        </nav>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Failed to load bookings: {error.message}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-white/10 dark:text-gray-400">
          No bookings in this view yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3 text-right">Deposit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm dark:divide-white/5">
              {rows.map(row => {
                const status = BOOKING_STATUS_LABELS[row.status]
                return (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {formatAst(row.starts_at)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-gray-200">
                      {(row.package_snapshot?.family_icon ?? row.family?.icon ?? '📷')}{' '}
                      {row.package_snapshot?.name_en ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900 dark:text-white">{row.customer_name}</div>
                      <div className="text-xs text-slate-500 dark:text-gray-400">{row.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-gray-300">
                      {row.staff?.name ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-slate-700 dark:text-gray-200">
                      {row.deposit_amount_usd != null
                        ? `$${Number(row.deposit_amount_usd).toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${status.color}`}>
                        {status.en}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/bookings/${row.id}`}
                        className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
