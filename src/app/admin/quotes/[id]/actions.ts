'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { sendProposalEmail } from '@/lib/email/resend'
import crypto from 'crypto'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export type SavePriceState = { error: string | null; success: boolean }

export async function savePrice(
  _prev: SavePriceState,
  formData: FormData
): Promise<SavePriceState> {
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

  revalidatePath(`/admin/quotes/${quoteId}`)
  return { error: null, success: true }
}

export type SendProposalState = { error: string | null; success: boolean }

export async function sendProposal(
  _prev: SendProposalState,
  formData: FormData
): Promise<SendProposalState> {
  const quoteId = formData.get('quoteId') as string

  if (!quoteId) {
    return { error: 'Quote ID is missing.', success: false }
  }

  const supabase = createServiceClient()

  // Fetch current quote
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('id, locale, full_name, email, service_type, final_price_usd, admin_note_customer, status')
    .eq('id', quoteId)
    .single()

  if (fetchError || !quote) {
    return { error: 'Quote not found.', success: false }
  }

  if (!quote.final_price_usd) {
    return { error: 'Set a price before sending the proposal.', success: false }
  }

  if (!quote.email || !quote.full_name) {
    return { error: 'Quote is missing customer contact info.', success: false }
  }

  // Generate a random token and store its hash
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

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
    // Don't roll back — the DB is updated; admin can resend manually
    return {
      error: 'Proposal saved but email delivery failed. Contact customer manually.',
      success: false,
    }
  }

  revalidatePath(`/admin/quotes/${quoteId}`)
  revalidatePath('/admin/quotes')
  return { error: null, success: true }
}
