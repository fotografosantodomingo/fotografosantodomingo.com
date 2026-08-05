import { type NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/service'
import { finalizeSelection } from '@/lib/gallery/service'

export const runtime = 'edge'

/**
 * POST /api/stripe/gallery-overage-webhook
 *
 * Separate endpoint (own signing secret) for the selection-overage charge —
 * same pattern as /api/stripe/booking-webhook, so each payment flow can be
 * configured independently in the Stripe Dashboard.
 *
 * Configure: https://www.fotografosantodomingo.com/api/stripe/gallery-overage-webhook
 * Env: STRIPE_GALLERY_WEBHOOK_SECRET (falls back to STRIPE_WEBHOOK_SECRET).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  const webhookSecret = process.env.STRIPE_GALLERY_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('Gallery overage webhook secret not configured')
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
    console.error('Gallery overage webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const galleryId = session.metadata?.galleryId

    if (!galleryId) {
      // Not a gallery-selection checkout — ignore (shouldn't happen given
      // the dedicated endpoint, but don't fail the webhook over it).
      return NextResponse.json({ received: true })
    }
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const supabase = createServiceClient()
    const result = await finalizeSelection(supabase, galleryId)
    if (!result.ok) {
      console.error('Gallery overage webhook: finalizeSelection failed:', result.error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    console.log(`Gallery ${galleryId} selection finalized via overage payment`)
  }

  return NextResponse.json({ received: true })
}
