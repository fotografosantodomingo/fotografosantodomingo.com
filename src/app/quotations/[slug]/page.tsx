import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { getTermsForService } from '@/lib/quotes/terms'
import { getPrimaryStaffId } from '@/lib/quotes/availability-check'
import { utcToAstDate, utcToAstTime } from '@/lib/bookings/availability'
import ProposalView from './ProposalView'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

type Props = {
  params: { slug: string }
  searchParams: { paid?: string; cancelled?: string }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Quotation — Babula Shots',
    robots: { index: false, follow: false },
  }
}

export default async function QuotationPage({ params }: Props) {
  const { slug } = params

  const supabase = createServiceClient()
  const { data: quote, error } = await supabase
    .from('quotes')
    .select(
      'id, full_name, client_company, service_type, description, line_items, final_price_usd, deposit_amount_usd, payment_mode, admin_note_customer, proposal_expires_at, locale, status, event_date, event_time, package_id, booking_id'
    )
    .eq('proposal_slug', slug)
    .single()

  if (error || !quote) notFound()

  // Self-service date/time picker — only for quotes tied to a real catalog
  // package (auto-generated dual-quote options). Manually-drafted quotes
  // have no package_id and keep the static event_date/event_time display.
  let bookingFlow: {
    staffId: string
    durationMin: number
    confirmedSlot: { date: string; time: string } | null
  } | undefined

  if (quote.package_id) {
    const [{ data: pkg }, staffId] = await Promise.all([
      supabase.from('service_packages').select('duration_min').eq('id', quote.package_id).single(),
      getPrimaryStaffId(supabase),
    ])

    if (pkg && staffId) {
      let confirmedSlot: { date: string; time: string } | null = null
      if (quote.booking_id) {
        const { data: booking } = await supabase
          .from('bookings')
          .select('starts_at')
          .eq('id', quote.booking_id)
          .single()
        if (booking) {
          confirmedSlot = {
            date: utcToAstDate(booking.starts_at),
            time: utcToAstTime(booking.starts_at),
          }
        }
      }
      bookingFlow = { staffId, durationMin: pkg.duration_min, confirmedSlot }
    }
  }

  // Build line items — support both new line_items JSONB and legacy single price
  const lineItems: { description: string; amount_usd: number }[] =
    Array.isArray(quote.line_items) && quote.line_items.length > 0
      ? quote.line_items
      : quote.final_price_usd
      ? [{ description: quote.service_type?.replace(/_/g, ' ') ?? 'Photography service', amount_usd: Number(quote.final_price_usd) }]
      : []

  const totalUsd = lineItems.reduce((s, i) => s + Number(i.amount_usd), 0)
  const depositUsd = quote.deposit_amount_usd
    ? Number(quote.deposit_amount_usd)
    : Math.round(totalUsd * 100 * 0.5) / 100

  const terms = getTermsForService(quote.service_type)
  const locale = quote.locale === 'en' ? 'en' : 'es'
  const paymentMode: 'FULL' | 'DEPOSIT' = quote.payment_mode === 'DEPOSIT' ? 'DEPOSIT' : 'FULL'

  return (
    <ProposalView
      slug={slug}
      quoteId={quote.id}
      clientName={quote.full_name ?? 'Cliente'}
      clientCompany={quote.client_company ?? null}
      serviceType={quote.service_type ?? null}
      description={quote.description ?? null}
      lineItems={lineItems}
      totalUsd={totalUsd}
      paymentMode={paymentMode}
      depositUsd={depositUsd}
      adminNote={quote.admin_note_customer ?? null}
      expiresAt={quote.proposal_expires_at ?? null}
      status={quote.status}
      locale={locale}
      terms={terms}
      eventDate={quote.event_date ?? null}
      eventTime={quote.event_time ?? null}
      bookingFlow={bookingFlow}
    />
  )
}
