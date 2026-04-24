import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { PricingForm, SendProposalButton } from './QuoteDetailClient'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'Pending Review',
  SENT_TO_CUSTOMER: 'Sent to Customer',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300',
  SENT_TO_CUSTOMER: 'bg-sky-100 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300',
  ACCEPTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
  REJECTED: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-gray-400',
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-slate-100 dark:border-white/5">
      <td className="py-2 pr-4 text-sm text-slate-500 dark:text-gray-400 w-44">{label}</td>
      <td className="py-2 text-sm text-slate-800 dark:text-gray-200">{value || '—'}</td>
    </tr>
  )
}

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const { data: quote, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !quote) {
    notFound()
  }

  const canSend = !!quote.final_price_usd && quote.status !== 'ACCEPTED' && quote.status !== 'REJECTED'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/quotes" className="text-sm text-sky-600 hover:underline dark:text-sky-400">
          ← All quotes
        </Link>
        <div className="ml-auto">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLORS[quote.status] ?? ''}`}>
            {STATUS_LABELS[quote.status] ?? quote.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quote details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Quote details</h2>
          <table className="w-full border-collapse">
            <tbody>
              <DetailRow label="ID" value={<code className="text-xs">{quote.id}</code>} />
              <DetailRow label="Submitted" value={new Date(quote.created_at).toLocaleString()} />
              <DetailRow label="Locale" value={quote.locale} />
              <DetailRow label="Name" value={quote.full_name} />
              <DetailRow
                label="Email"
                value={
                  quote.email ? (
                    <a href={`mailto:${quote.email}`} className="text-sky-600 hover:underline dark:text-sky-400">
                      {quote.email}
                    </a>
                  ) : null
                }
              />
              <DetailRow
                label="WhatsApp"
                value={
                  quote.whatsapp_phone ? (
                    <a
                      href={`https://wa.me/${quote.whatsapp_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline dark:text-sky-400"
                    >
                      {quote.whatsapp_phone}
                    </a>
                  ) : null
                }
              />
              <DetailRow label="Service" value={quote.service_type?.replace(/_/g, ' ')} />
              <DetailRow label="Participants" value={quote.participants_count} />
              <DetailRow label="Drone add-on" value={quote.add_drone ? 'Yes' : 'No'} />
              <DetailRow label="Event date" value={quote.event_date} />
              <DetailRow
                label="Location"
                value={[quote.city, quote.state, quote.country].filter(Boolean).join(', ')}
              />
              <DetailRow label="Contact method" value={quote.preferred_contact_method} />
              {quote.preferred_contact_method === 'PHONE_CALL' && (
                <DetailRow label="Callback window" value={quote.callback_time_preference} />
              )}
              {quote.proposal_expires_at && (
                <DetailRow
                  label="Proposal expires"
                  value={new Date(quote.proposal_expires_at).toLocaleDateString()}
                />
              )}
            </tbody>
          </table>

          {quote.description && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p>
              <p className="whitespace-pre-wrap leading-relaxed">{quote.description}</p>
            </div>
          )}
        </div>

        {/* Admin panel */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Pricing & proposal</h2>
            <PricingForm
              quote={{
                id: quote.id,
                final_price_usd: quote.final_price_usd,
                admin_note_customer: quote.admin_note_customer,
                admin_internal_notes: quote.admin_internal_notes,
                status: quote.status,
              }}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Send proposal</h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-gray-400">
              This generates a magic link and emails the client. Status changes to{' '}
              <strong>Sent to Customer</strong>. Valid for 7&nbsp;days.
            </p>
            <SendProposalButton quoteId={quote.id} canSend={canSend} />
          </div>
        </div>
      </div>
    </div>
  )
}
