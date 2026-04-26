import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { BOOKING_STATUS_LABELS, BOOKING_TIMEZONE } from '@/lib/bookings/constants'
import type { BookingStatus } from '@/lib/bookings/constants'
import BookingActions from './BookingActions'

export const dynamic = 'force-dynamic'

type Snap = {
  family_slug?: string
  package_slug?: string
  name_es?: string
  name_en?: string
  family_icon?: string
  duration_min?: number
  family_title_es?: string
  family_title_en?: string
} | null

type BookingDetail = {
  id: string
  starts_at: string
  ends_at: string
  status: BookingStatus
  locale: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  stripe_amount_usd: number | null
  deposit_amount_usd: number | null
  refund_amount_usd: number | null
  currency_display: string
  terms_accepted_at: string | null
  cancellation_reason: string | null
  cancelled_at: string | null
  admin_notes: string | null
  created_at: string
  service_id: string | null
  staff_id: string
  package_id: string | null
  family_id: string | null
  package_snapshot: Snap
  family: { id: string; slug: string; title_es: string; title_en: string; icon: string } | null
  staff: { id: string; name: string } | null
}

function fmtAst(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: BOOKING_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `id, starts_at, ends_at, status, locale, customer_name, customer_email, customer_phone,
       stripe_payment_intent_id, stripe_charge_id, stripe_amount_usd, deposit_amount_usd,
       refund_amount_usd, currency_display, terms_accepted_at, cancellation_reason,
       cancelled_at, admin_notes, created_at, service_id, staff_id, package_id, family_id,
       package_snapshot,
       family:service_families ( id, slug, title_es, title_en, icon ),
       staff:staff_members ( id, name )`
    )
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        Failed to load booking: {error.message}
      </div>
    )
  }

  const booking = data as BookingDetail | null
  if (!booking) notFound()

  const status = BOOKING_STATUS_LABELS[booking.status]
  const depositCents = Math.round(Number(booking.deposit_amount_usd ?? 0) * 100)
  const alreadyRefundedUsd = Number(booking.refund_amount_usd ?? 0)
  const snap = booking.package_snapshot
  const displayIcon = snap?.family_icon ?? booking.family?.icon ?? '📷'
  const displayName = snap?.name_en ?? '—'
  const displayDurationMin = snap?.duration_min ?? 60

  // Email log
  const { data: emails } = await supabase
    .from('booking_email_log')
    .select('email_type, recipient_email, sent_at, error')
    .eq('booking_id', booking.id)
    .order('sent_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/bookings"
          className="text-sm text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to bookings
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          {displayIcon} {displayName}
        </h1>
        <div className="mt-1 flex items-center gap-3 text-sm">
          <span className={`font-semibold ${status.color}`}>{status.en}</span>
          <span className="text-slate-500 dark:text-gray-400">
            Booked {fmtAst(booking.created_at)}
          </span>
        </div>
      </div>

      <BookingActions
        bookingId={booking.id}
        staffId={booking.staff_id}
        durationMin={displayDurationMin}
        status={booking.status}
        depositCents={depositCents}
        alreadyRefundedUsd={alreadyRefundedUsd}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Schedule">
          <Field label="Starts" value={fmtAst(booking.starts_at)} />
          <Field label="Ends" value={fmtAst(booking.ends_at)} />
          <Field label="Duration" value={`${displayDurationMin} min`} />
          <Field label="Staff" value={booking.staff?.name ?? '—'} />
        </Section>

        <Section title="Customer">
          <Field label="Name" value={booking.customer_name} />
          <Field
            label="Email"
            value={
              <a href={`mailto:${booking.customer_email}`} className="text-emerald-600 hover:underline dark:text-emerald-400">
                {booking.customer_email}
              </a>
            }
          />
          <Field
            label="Phone"
            value={
              booking.customer_phone ? (
                <a href={`tel:${booking.customer_phone}`} className="text-emerald-600 hover:underline dark:text-emerald-400">
                  {booking.customer_phone}
                </a>
              ) : (
                '—'
              )
            }
          />
          <Field label="Locale" value={booking.locale.toUpperCase()} />
          <Field label="Terms accepted" value={fmtAst(booking.terms_accepted_at)} />
        </Section>

        <Section title="Payment">
          <Field
            label="Service price"
            value={
              booking.stripe_amount_usd != null
                ? `$${Number(booking.stripe_amount_usd).toFixed(2)} USD`
                : '—'
            }
          />
          <Field
            label="Deposit (50%)"
            value={
              booking.deposit_amount_usd != null
                ? `$${Number(booking.deposit_amount_usd).toFixed(2)} USD`
                : '—'
            }
          />
          <Field
            label="Balance due at session"
            value={
              booking.stripe_amount_usd != null && booking.deposit_amount_usd != null
                ? `$${(Number(booking.stripe_amount_usd) - Number(booking.deposit_amount_usd)).toFixed(2)} USD`
                : '—'
            }
          />
          {alreadyRefundedUsd > 0 && (
            <Field
              label="Refunded"
              value={
                <span className="text-amber-600 dark:text-amber-400">
                  ${alreadyRefundedUsd.toFixed(2)} USD
                </span>
              }
            />
          )}
          <Field
            label="Stripe PI"
            value={
              booking.stripe_payment_intent_id ? (
                <a
                  href={`https://dashboard.stripe.com/payments/${booking.stripe_payment_intent_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  {booking.stripe_payment_intent_id} ↗
                </a>
              ) : (
                '—'
              )
            }
          />
        </Section>

        <Section title="Admin">
          {booking.cancellation_reason && (
            <Field label="Cancellation reason" value={booking.cancellation_reason} />
          )}
          {booking.cancelled_at && (
            <Field label="Cancelled at" value={fmtAst(booking.cancelled_at)} />
          )}
          {!booking.cancellation_reason && !booking.cancelled_at && (
            <p className="text-sm text-slate-500 dark:text-gray-400">No admin notes yet.</p>
          )}
        </Section>
      </div>

      <Section title={`Email log (${emails?.length ?? 0})`}>
        {!emails || emails.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-gray-400">
            No emails sent yet (email system arrives in Sprint 3).
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">
              <tr>
                <th className="py-2">Type</th>
                <th className="py-2">Recipient</th>
                <th className="py-2">Sent</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {emails.map((e, i) => (
                <tr key={i}>
                  <td className="py-2 font-mono text-xs">{e.email_type}</td>
                  <td className="py-2">{e.recipient_email}</td>
                  <td className="py-2">{fmtAst(e.sent_at)}</td>
                  <td className="py-2">
                    {e.error ? (
                      <span className="text-red-600 dark:text-red-400">{e.error}</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">sent</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
        {title}
      </h2>
      <dl className="space-y-2">{children}</dl>
    </section>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <dt className="text-slate-500 dark:text-gray-400">{label}</dt>
      <dd className="col-span-2 text-slate-900 dark:text-white">{value}</dd>
    </div>
  )
}
