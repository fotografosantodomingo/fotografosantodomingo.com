import { type NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs' // Stripe raw body parsing requires Node.js runtime

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
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const quoteId = session.metadata?.quoteId

    if (!quoteId) {
      console.error('Webhook: checkout.session.completed missing quoteId in metadata')
      return NextResponse.json({ received: true })
    }

    if (session.payment_status !== 'paid') {
      // Not fully paid yet (e.g. payment_intent requires action) — wait for next event
      return NextResponse.json({ received: true })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('quotes')
      .update({
        status: 'ACCEPTED',
        stripe_session_id: session.id,
        stripe_payment_intent: typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
      })
      .eq('id', quoteId)
      .neq('status', 'ACCEPTED') // idempotency guard

    if (error) {
      console.error('Webhook: failed to update quote status:', error)
      // Return 500 so Stripe retries
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    console.log(`Quote ${quoteId} marked ACCEPTED via Stripe webhook`)
  }

  return NextResponse.json({ received: true })
}
