import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import {
  PricingForm,
  SendProposalButton,
  LineItemsEditor,
  ChecklistCard,
  GenerateLinkButton,
  ClientEditCard,
  RejectReopenButtons,
} from './QuoteDetailClient'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending Review',
  SENT_TO_CUSTOMER: 'Sent to Customer',
  DEPOSIT_PAID: 'Deposit Paid',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-violet-100 text-violet-800 dark:bg-violet-400/10 dark:text-violet-300',
  PENDING_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300',
  SENT_TO_CUSTOMER: 'bg-sky-100 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300',
  DEPOSIT_PAID: 'bg-teal-100 text-teal-800 dark:bg-teal-400/10 dark:text-teal-300',
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

  if (error || !quote) notFound()

  const isPhase2 = quote.status === 'DRAFT' || quote.line_items !== null
  const checklist = Array.isArray(quote.scoping_checklist) ? quote.scoping_checklist : []
  const checklistComplete = checklist.length === 0 || checklist.every((i: { checked?: boolean }) => i.checked)
  const hasPrice = !!quote.final_price_usd && Number(quote.final_price_usd) > 0
  const canGenerate = hasPrice && checklistComplete && quote.status !== 'ACCEPTED' && quote.status !== 'REJECTED'
  const canSend = hasPrice && quote.status !== 'ACCEPTED' && quote.status !== 'REJECTED'
  const existingProposalUrl = quote.proposal_slug ? `${BASE_URL}/quotations/${quote.proposal_slug}` : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/quotes" className="text-sm text-sky-600 hover:underline dark:text-sky-400">
          ← All quotes
        </Link>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLORS[quote.status] ?? ''}`}>
          {STATUS_LABELS[quote.status] ?? quote.status}
        </span>
        {quote.first_viewed_at && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            👁 Opened {new Date(quote.first_viewed_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <div className="ml-auto">
          <RejectReopenButtons
            quoteId={quote.id}
            status={quote.status}
            whatsappPhone={quote.whatsapp_phone ?? null}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left column: Quote details ──────────────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Quote details</h2>
            <table className="w-full border-collapse">
              <tbody>
                <DetailRow label="ID" value={<code className="text-xs">{quote.id}</code>} />
                <DetailRow label="Submitted" value={new Date(quote.created_at).toLocaleString()} />
                <DetailRow label="Locale" value={quote.locale} />
                <DetailRow label="Name" value={quote.full_name} />
                {quote.client_company && <DetailRow label="Company" value={quote.client_company} />}
                <DetailRow
                  label="Email"
                  value={quote.email ? <a href={`mailto:${quote.email}`} className="text-sky-600 hover:underline dark:text-sky-400">{quote.email}</a> : null}
                />
                <DetailRow
                  label="WhatsApp"
                  value={quote.whatsapp_phone
                    ? <a href={`https://wa.me/${quote.whatsapp_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline dark:text-sky-400">{quote.whatsapp_phone}</a>
                    : null}
                />
                <DetailRow label="Service" value={quote.service_type?.replace(/_/g, ' ')} />
                <DetailRow label="Event date" value={quote.event_date} />
                <DetailRow
                  label="Location"
                  value={[quote.city, quote.state, quote.country].filter(Boolean).join(', ')}
                />
                {quote.proposal_expires_at && (
                  <DetailRow
                    label="Proposal expires"
                    value={new Date(quote.proposal_expires_at).toLocaleDateString()}
                  />
                )}
                {quote.deposit_amount_usd && (
                  <DetailRow
                    label="Deposit paid"
                    value={`$${Number(quote.deposit_amount_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
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

          {/* Client / event edit panel */}
          <ClientEditCard
            quote={{
              id: quote.id,
              full_name: quote.full_name,
              client_company: quote.client_company ?? null,
              whatsapp_phone: quote.whatsapp_phone,
              email: quote.email,
              service_type: quote.service_type,
              event_date: quote.event_date,
              city: quote.city,
              country: quote.country,
              locale: quote.locale,
              description: quote.description,
            }}
          />

          {/* WhatsApp raw text (DRAFT context) */}
          {quote.whatsapp_raw_text && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
              <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-white">WhatsApp conversation</h2>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs text-slate-700 dark:bg-white/5 dark:text-gray-300">
                {quote.whatsapp_raw_text}
              </pre>
            </div>
          )}
        </div>

        {/* ── Right column: Pricing, checklist, proposal ──────────────── */}
        <div className="space-y-6">
          {/* Scoping checklist (DRAFT / Phase 2 quotes) */}
          {checklist.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
              <ChecklistCard quoteId={quote.id} items={checklist} />
            </div>
          )}

          {/* Pricing section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
              {isPhase2 ? 'Line items & pricing' : 'Pricing & proposal'}
            </h2>
            {isPhase2 ? (
              <LineItemsEditor
                quote={{
                  id: quote.id,
                  line_items: quote.line_items,
                  payment_mode: quote.payment_mode,
                  final_price_usd: quote.final_price_usd,
                  deposit_amount_usd: quote.deposit_amount_usd,
                  admin_note_customer: quote.admin_note_customer,
                  admin_internal_notes: quote.admin_internal_notes,
                  description: quote.description,
                }}
              />
            ) : (
              <PricingForm
                quote={{
                  id: quote.id,
                  final_price_usd: quote.final_price_usd,
                  admin_note_customer: quote.admin_note_customer,
                  admin_internal_notes: quote.admin_internal_notes,
                  status: quote.status,
                }}
              />
            )}
          </div>

          {/* Generate/send proposal */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              {isPhase2 ? 'Proposal link' : 'Send proposal'}
            </h2>
            {isPhase2 ? (
              <>
                <p className="mb-4 text-sm text-slate-500 dark:text-gray-400">
                  Generates a private URL. Copy and send via WhatsApp, or auto-email if client has an address.
                  You&apos;ll be notified the moment they open it.
                </p>
                <GenerateLinkButton
                  quoteId={quote.id}
                  canGenerate={canGenerate}
                  existingUrl={existingProposalUrl}
                  clientName={quote.full_name ?? null}
                />
              </>
            ) : (
              <>
                <p className="mb-4 text-sm text-slate-500 dark:text-gray-400">
                  This generates a magic link and emails the client. Status changes to{' '}
                  <strong>Sent to Customer</strong>. Valid for 7&nbsp;days.
                </p>
                <SendProposalButton quoteId={quote.id} canSend={canSend} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
