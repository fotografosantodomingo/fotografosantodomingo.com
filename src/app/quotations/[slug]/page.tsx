import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { getTermsForService } from '@/lib/quotes/terms'
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
      'id, full_name, client_company, service_type, description, line_items, final_price_usd, deposit_amount_usd, payment_mode, admin_note_customer, proposal_expires_at, locale, status'
    )
    .eq('proposal_slug', slug)
    .single()

  if (error || !quote) notFound()

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
      locale={locale}
      terms={terms}
    />
  )
}
