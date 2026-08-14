import { type NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendQuotePaymentConfirmation, sendQuotePaymentAdminAlert } from '@/lib/email/resend'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event
  try {
    const stripe = getStripe()
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const quoteId = session.metadata?.quoteId
    const paymentMode = (session.metadata?.paymentMode ?? 'FULL') as 'DEPOSIT' | 'FULL'

    if (!quoteId) {
      console.error('Webhook: checkout.session.completed missing quoteId in metadata')
      return NextResponse.json({ received: true })
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const newStatus = paymentMode === 'DEPOSIT' ? 'DEPOSIT_PAID' : 'ACCEPTED'

    const supabase = createServiceClient()

    // Fetch quote data before updating (needed for emails + idempotency check)
    const { data: quote } = await supabase
      .from('quotes')
      .select('id, status, full_name, client_company, email, locale, service_type, final_price_usd, deposit_amount_usd, whatsapp_phone, booking_id')
      .eq('id', quoteId)
      .single()

    // Idempotency: skip if already fully paid or already in target status
    if (!quote || quote.status === 'ACCEPTED' || quote.status === newStatus) {
      return NextResponse.json({ received: true })
    }

    const { error } = await supabase
      .from('quotes')
      .update({
        status: newStatus,
        stripe_session_id: session.id,
        stripe_payment_intent: typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
      })
      .eq('id', quoteId)

    if (error) {
      console.error('Webhook: failed to update quote status:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    // Auto dual-quote pipeline only: if this quote holds a bookings row
    // (inserted at admin-approve time — see /api/quote-option-action),
    // flip it to CONFIRMED now that the deposit/full payment landed. No-op
    // for every manually-drafted (WhatsApp-origin) quote, which never sets
    // booking_id.
    if (quote.booking_id) {
      const { error: bookingErr } = await supabase
        .from('bookings')
        .update({ status: 'CONFIRMED' })
        .eq('id', quote.booking_id)
      if (bookingErr) {
        console.error('Webhook: failed to confirm linked booking:', bookingErr)
      }
    }

    console.log(`Quote ${quoteId} → ${newStatus} via Stripe webhook (mode: ${paymentMode})`)

    // Send confirmation emails (fire-and-forget — email failure must not fail the webhook)
    const amountPaidUsd = typeof session.amount_total === 'number' ? session.amount_total / 100 : 0
    const totalUsd = Number(quote.final_price_usd ?? 0)
    const balanceUsd = paymentMode === 'DEPOSIT' ? Math.max(0, totalUsd - amountPaidUsd) : 0

    if (quote.email) {
      sendQuotePaymentConfirmation({
        locale: quote.locale ?? 'es',
        fullName: quote.full_name ?? 'Cliente',
        email: quote.email,
        serviceType: quote.service_type ?? 'OTHER',
        amountPaidUsd,
        paymentMode,
        balanceUsd,
      }).catch(err => console.error('[webhook] client payment email failed:', err))
    }

    sendQuotePaymentAdminAlert({
      quoteId: quote.id,
      fullName: quote.full_name ?? 'Cliente',
      clientCompany: quote.client_company ?? null,
      serviceType: quote.service_type ?? 'OTHER',
      amountPaidUsd,
      paymentMode,
      whatsappPhone: quote.whatsapp_phone ?? null,
      email: quote.email ?? null,
    }).catch(err => console.error('[webhook] admin payment alert email failed:', err))
  }

  return NextResponse.json({ received: true })
}
