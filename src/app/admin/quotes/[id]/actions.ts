'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { sendProposalEmail } from '@/lib/email/resend'
import { generateProposalSlug } from '@/lib/quotes/slug'
import type { ChecklistItem } from '@/lib/quotes/checklist'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'

// ─── Legacy token helpers (kept for /proposal/[id] backwards compat) ─────────

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashToken(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(hashBuffer))
}

function randomTokenHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return bytesToHex(bytes)
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ActionState = { error: string | null; success: boolean }
export type LinkState = { error: string | null; success: boolean; url?: string }

// ─── Save Price (legacy — single price field) ─────────────────────────────────

export async function savePrice(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const quoteId = formData.get('quoteId') as string
  const rawPrice = formData.get('finalPriceUsd') as string
  const adminNote = ((formData.get('adminNoteCustomer') as string) ?? '').trim() || null
  const internalNotes = ((formData.get('adminInternalNotes') as string) ?? '').trim() || null

  const price = Number(rawPrice)
  if (!quoteId || !rawPrice || isNaN(price) || price <= 0) {
    return { error: 'A valid price is required.', success: false }
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('quotes')
    .update({
      final_price_usd: price,
      admin_note_customer: adminNote,
      admin_internal_notes: internalNotes,
    })
    .eq('id', quoteId)

  if (error) {
    console.error('savePrice error:', error)
    return { error: 'Failed to save price.', success: false }
  }

  return { error: null, success: true }
}

// ─── Save Line Items (Phase 2 — computes final_price_usd from sum) ────────────

export type LineItem = { description: string; amount_usd: number }

export async function saveLineItems(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const quoteId = formData.get('quoteId') as string
  const rawItems = formData.get('lineItems') as string
  const paymentMode = formData.get('paymentMode') as string
  const adminNote = ((formData.get('adminNoteCustomer') as string) ?? '').trim() || null
  const internalNotes = ((formData.get('adminInternalNotes') as string) ?? '').trim() || null
  const serviceDescription = ((formData.get('serviceDescription') as string) ?? '').trim() || null

  if (!quoteId) return { error: 'Missing quote ID', success: false }

  let items: LineItem[]
  try {
    items = JSON.parse(rawItems)
    if (!Array.isArray(items) || items.length === 0) throw new Error('empty')
  } catch {
    return { error: 'Invalid line items', success: false }
  }

  const total = items.reduce((sum, i) => sum + Number(i.amount_usd), 0)
  if (total <= 0) return { error: 'Total must be greater than zero', success: false }

  const depositAmount = Math.round(total * 100 * 0.5) / 100
  const mode = paymentMode === 'DEPOSIT' ? 'DEPOSIT' : 'FULL'

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('quotes')
    .update({
      line_items: items,
      final_price_usd: total,
      deposit_amount_usd: depositAmount,
      payment_mode: mode,
      admin_note_customer: adminNote,
      admin_internal_notes: internalNotes,
      ...(serviceDescription !== null ? { description: serviceDescription } : {}),
    })
    .eq('id', quoteId)

  if (error) {
    console.error('saveLineItems error:', error)
    return { error: 'Failed to save line items', success: false }
  }

  return { error: null, success: true }
}

// ─── Update Checklist Item ─────────────────────────────────────────────────

export async function updateChecklistItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const quoteId = formData.get('quoteId') as string
  const itemId = formData.get('itemId') as string
  const checked = formData.get('checked') === 'true'

  if (!quoteId || !itemId) return { error: 'Missing params', success: false }

  const supabase = createServiceClient()
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('scoping_checklist')
    .eq('id', quoteId)
    .single()

  if (fetchError || !quote) return { error: 'Quote not found', success: false }

  const items: ChecklistItem[] = Array.isArray(quote.scoping_checklist) ? quote.scoping_checklist : []
  const updated = items.map(i => i.id === itemId ? { ...i, checked } : i)

  const { error } = await supabase
    .from('quotes')
    .update({ scoping_checklist: updated })
    .eq('id', quoteId)

  if (error) return { error: 'Failed to update checklist', success: false }

  return { error: null, success: true }
}

// ─── Generate Proposal Link (slug-based, replaces old token flow) ─────────────

export async function generateProposalLink(
  _prev: LinkState,
  formData: FormData
): Promise<LinkState> {
  const quoteId = formData.get('quoteId') as string
  const expiryDays = Math.min(Math.max(Number(formData.get('expiryDays') ?? 7), 1), 90)

  if (!quoteId) return { error: 'Quote ID is missing.', success: false }

  const supabase = createServiceClient()
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('id, locale, full_name, email, service_type, final_price_usd, admin_note_customer, status, proposal_slug, event_date, event_time, description')
    .eq('id', quoteId)
    .single()

  if (fetchError || !quote) return { error: 'Quote not found.', success: false }
  if (!quote.final_price_usd) return { error: 'Set a price before generating the link.', success: false }
  if (quote.status === 'ACCEPTED') return { error: 'Quote is already accepted.', success: false }
  if (quote.status === 'REJECTED') return { error: 'Quote is rejected.', success: false }

  const slug = quote.proposal_slug ?? generateProposalSlug(quote.full_name)
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()

  const { error: updateError } = await supabase
    .from('quotes')
    .update({
      status: 'SENT_TO_CUSTOMER',
      proposal_slug: slug,
      proposal_expires_at: expiresAt,
    })
    .eq('id', quoteId)

  if (updateError) {
    console.error('generateProposalLink update error:', updateError)
    return { error: 'Failed to generate link.', success: false }
  }

  const proposalUrl = `${BASE_URL}/quotations/${slug}`

  // Send email if client has one
  if (quote.email && quote.full_name) {
    try {
      await sendProposalEmail({
        id: quoteId,
        locale: quote.locale ?? 'es',
        fullName: quote.full_name,
        email: quote.email,
        serviceType: quote.service_type ?? '',
        finalPriceUsd: Number(quote.final_price_usd),
        adminNoteCustomer: quote.admin_note_customer ?? null,
        proposalUrl,
        proposalExpiresAt: expiresAt,
        eventDate: quote.event_date ?? null,
        eventTime: quote.event_time ?? null,
        description: quote.description ?? null,
      })
    } catch (emailError) {
      console.error('Proposal email failed (link still generated):', emailError)
    }
  }

  return { error: null, success: true, url: proposalUrl }
}

// ─── Update Client Fields ──────────────────────────────────────────────────────

export async function updateClientFields(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const quoteId = formData.get('quoteId') as string
  if (!quoteId) return { error: 'Missing quote ID', success: false }

  const full_name = typeof formData.get('full_name') === 'string' ? (formData.get('full_name') as string).trim() || null : null
  const client_company = typeof formData.get('client_company') === 'string' ? (formData.get('client_company') as string).trim() || null : null
  const whatsapp_phone = typeof formData.get('whatsapp_phone') === 'string' ? (formData.get('whatsapp_phone') as string).trim() || null : null
  const email = typeof formData.get('email') === 'string' ? (formData.get('email') as string).trim().toLowerCase() || null : null
  const service_type = typeof formData.get('service_type') === 'string' ? (formData.get('service_type') as string) || null : null
  const event_date = typeof formData.get('event_date') === 'string' ? (formData.get('event_date') as string) || null : null
  const event_time = typeof formData.get('event_time') === 'string' ? (formData.get('event_time') as string).trim() || null : null
  const city = typeof formData.get('city') === 'string' ? (formData.get('city') as string).trim() || null : null
  const country = typeof formData.get('country') === 'string' ? (formData.get('country') as string).trim() || null : null
  const locale = (formData.get('locale') as string) === 'en' ? 'en' : 'es'
  const description = typeof formData.get('description') === 'string' ? (formData.get('description') as string).trim() || null : null

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('quotes')
    .update({ full_name, client_company, whatsapp_phone, email, service_type, event_date, event_time, city, country, locale, description })
    .eq('id', quoteId)

  if (error) {
    console.error('updateClientFields error:', error)
    return { error: 'Failed to update client fields', success: false }
  }

  return { error: null, success: true }
}

// ─── Reject / Reopen ──────────────────────────────────────────────────────────

export async function rejectQuote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const quoteId = formData.get('quoteId') as string
  if (!quoteId) return { error: 'Missing quote ID', success: false }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('quotes')
    .update({ status: 'REJECTED' })
    .eq('id', quoteId)
    .not('status', 'eq', 'ACCEPTED') // never downgrade a paid quote

  if (error) {
    console.error('rejectQuote error:', error)
    return { error: 'Failed to reject quote', success: false }
  }

  return { error: null, success: true }
}

export async function reopenQuote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const quoteId = formData.get('quoteId') as string
  if (!quoteId) return { error: 'Missing quote ID', success: false }

  const supabase = createServiceClient()

  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('status')
    .eq('id', quoteId)
    .single()

  if (fetchError || !quote) return { error: 'Quote not found', success: false }
  if (quote.status === 'ACCEPTED') return { error: 'Cannot reopen a fully paid quote', success: false }

  const { error } = await supabase
    .from('quotes')
    .update({ status: 'DRAFT' })
    .eq('id', quoteId)
    .eq('status', 'REJECTED')

  if (error) {
    console.error('reopenQuote error:', error)
    return { error: 'Failed to reopen quote', success: false }
  }

  return { error: null, success: true }
}

// ─── Legacy sendProposal (token-based — kept for /proposal/[id] route) ───────

export type SendProposalState = { error: string | null; success: boolean }

export async function sendProposal(
  _prev: SendProposalState,
  formData: FormData
): Promise<SendProposalState> {
  const quoteId = formData.get('quoteId') as string
  if (!quoteId) return { error: 'Quote ID is missing.', success: false }

  const supabase = createServiceClient()
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('id, locale, full_name, email, service_type, final_price_usd, admin_note_customer, status')
    .eq('id', quoteId)
    .single()

  if (fetchError || !quote) return { error: 'Quote not found.', success: false }
  if (!quote.final_price_usd) return { error: 'Set a price before sending.', success: false }
  if (!quote.email || !quote.full_name) return { error: 'Quote is missing customer contact info.', success: false }

  const rawToken = randomTokenHex(32)
  const tokenHash = await hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error: updateError } = await supabase
    .from('quotes')
    .update({
      status: 'SENT_TO_CUSTOMER',
      proposal_token_hash: tokenHash,
      proposal_expires_at: expiresAt,
    })
    .eq('id', quoteId)

  if (updateError) {
    console.error('sendProposal update error:', updateError)
    return { error: 'Failed to update quote status.', success: false }
  }

  const proposalUrl = `${BASE_URL}/proposal/${quoteId}?token=${rawToken}`
  try {
    await sendProposalEmail({
      id: quoteId,
      locale: quote.locale ?? 'es',
      fullName: quote.full_name,
      email: quote.email,
      serviceType: quote.service_type ?? '',
      finalPriceUsd: Number(quote.final_price_usd),
      adminNoteCustomer: quote.admin_note_customer ?? null,
      proposalUrl,
      proposalExpiresAt: expiresAt,
    })
  } catch (emailError) {
    console.error('Proposal email failed:', emailError)
    return { error: 'Proposal saved but email delivery failed. Contact customer manually.', success: false }
  }

  return { error: null, success: true }
}
