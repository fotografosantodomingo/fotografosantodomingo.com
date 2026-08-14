import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyActionSig } from '@/lib/quotes/action-links'
import { getPrimaryStaffId, findAvailableSlotOrAlternate } from '@/lib/quotes/availability-check'
import { sendCustomerFinalQuoteEmail } from '@/lib/email/quote-proposal'

export const runtime = 'edge'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'

/**
 * Admin-facing Approve/Deny endpoint for auto-generated dual-quote options
 * (src/lib/quotes/auto-generate.ts). Sibling to /api/quote-action — kept
 * separate because that route's accept path is WhatsApp-only production
 * logic; this one re-checks availability, holds a bookings slot, and emails
 * the customer directly instead.
 */

function page(title: string, body: string, status = 200): Response {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;background:#0e0e0d;color:#f0ede6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px}
    .box{max-width:480px;padding:40px;border:1px solid #2e2c29;background:#161513;border-radius:14px;text-align:center}
    h1{color:#c8a96e;font-size:1.5rem;margin:0 0 12px}p{color:#b8b4ad;font-size:14px;margin:0;line-height:1.6}</style>
    </head><body><div class="box"><h1>${title}</h1><p>${body}</p></div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html;charset=utf-8' } },
  )
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const quoteId = url.searchParams.get('id') ?? ''
  const action  = url.searchParams.get('action') ?? ''
  const ts      = parseInt(url.searchParams.get('ts') ?? '0', 10)
  const sig     = url.searchParams.get('sig') ?? ''

  if (!quoteId || !['accept', 'decline'].includes(action)) {
    return page('Invalid link', 'This link is not valid.', 400)
  }

  const valid = await verifyActionSig(quoteId, action, ts, sig)
  if (!valid) {
    return page('Link expired or invalid', 'This link is no longer valid (expires after 14 days).', 403)
  }

  const sb = createServiceClient()

  // ── DECLINE ──────────────────────────────────────────────────────────────
  if (action === 'decline') {
    const { data: quote } = await sb
      .from('quotes')
      .select('id, status, auto_generated')
      .eq('id', quoteId)
      .single()
    if (!quote || !quote.auto_generated) return page('Not found', 'Quote option not found.', 404)
    if (quote.status !== 'PENDING_REVIEW') {
      return page('Already handled', `This option was already processed (status: ${quote.status}). No action taken.`)
    }
    await sb.from('quotes').update({ status: 'REJECTED' }).eq('id', quoteId)
    return page('Option declined', 'This quote option was marked as denied. Nothing was sent to the customer.')
  }

  // ── APPROVE ──────────────────────────────────────────────────────────────
  const { data: quote, error } = await sb
    .from('quotes')
    .select('id, status, auto_generated, quote_request_id, package_id, family_id, locale, full_name, email, whatsapp_phone, event_date, line_items, final_price_usd, deposit_amount_usd, proposal_slug')
    .eq('id', quoteId)
    .single()

  if (error || !quote || !quote.auto_generated) return page('Not found', 'Quote option not found.', 404)
  if (quote.status !== 'PENDING_REVIEW') {
    return page('Already handled', `This option was already processed (status: ${quote.status}). No email was re-sent.`)
  }
  if (!quote.package_id || !quote.final_price_usd) {
    return page('Missing pricing', 'This quote option is missing its package or price — cannot send.', 422)
  }

  const { data: pkg, error: pkgErr } = await sb
    .from('service_packages')
    .select('id, name_es, name_en, duration_min, inclusions_es, inclusions_en')
    .eq('id', quote.package_id)
    .single()
  if (pkgErr || !pkg) return page('Error', 'Could not load the package for this quote.', 500)

  const staffId = await getPrimaryStaffId(sb)
  if (!staffId) return page('Error', 'No active staff member configured.', 500)

  // Read-only — informs the customer email's copy (does their requested date
  // currently look open?) but no longer holds anything. The customer picks
  // their own slot on the hosted proposal page (src/app/api/quotations/[slug]/select-slot),
  // which does the actual booking insert at the moment they choose a time.
  const availability = await findAvailableSlotOrAlternate(sb, {
    staffId,
    requestedDateYmd: quote.event_date,
    durationMin: pkg.duration_min,
  })

  const { error: updErr } = await sb
    .from('quotes')
    .update({ status: 'SENT_TO_CUSTOMER' })
    .eq('id', quoteId)
  if (updErr) return page('Error', `Could not update the quote: ${updErr.message}`, 500)

  // Auto-supersede the sibling option — once the customer has a price in
  // hand, the other tier is moot.
  if (quote.quote_request_id) {
    await sb
      .from('quotes')
      .update({ status: 'REJECTED' })
      .eq('quote_request_id', quote.quote_request_id)
      .neq('id', quoteId)
      .eq('status', 'PENDING_REVIEW')
  }

  const isEs = quote.locale === 'es'
  const packageName = isEs ? pkg.name_es : pkg.name_en
  const inclusions = (isEs ? pkg.inclusions_es : pkg.inclusions_en) ?? []
  const lineItems = (quote.line_items as Array<{ description: string; amount_usd: number }> | null) ?? [
    { description: packageName, amount_usd: Number(quote.final_price_usd) },
  ]

  if (quote.email) {
    await sendCustomerFinalQuoteEmail({
      email: quote.email,
      fullName: quote.full_name ?? (isEs ? 'Cliente' : 'Customer'),
      locale: quote.locale as 'es' | 'en',
      packageName,
      inclusions,
      durationMin: pkg.duration_min,
      lineItems,
      finalPriceUsd: Number(quote.final_price_usd),
      depositUsd: Number(quote.deposit_amount_usd ?? 0),
      availability,
      proposalUrl: `${BASE}/quotations/${quote.proposal_slug}`,
      proposalSlug: quote.proposal_slug,
    }).catch(err => console.error('quote-option-action: customer email failed:', err))
  }

  return page(
    'Quote sent ✓',
    `The ${escapeHtml(packageName)} quote (${Number(quote.final_price_usd).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}) was emailed to ${escapeHtml(quote.full_name ?? quote.email ?? 'the customer')}. They'll pick their own date and time on their quote page.`,
  )
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
