import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAuthorizedForGallery } from '@/lib/gallery/session'
import { overageTierPercent } from '@/lib/gallery/types'
import { finalizeSelection } from '@/lib/gallery/service'
import { getStripe } from '@/lib/stripe/server'

export const runtime = 'edge'

type Params = { params: { slug: string } }

const BASE_URL = 'https://www.fotografosantodomingo.com'

/**
 * POST /api/gallery/[slug]/submit-selection
 *
 * Reads the current selected count straight from gallery_photos (already
 * saved per-swipe, not passed in the body — the client can't lie about its
 * own selection). Within the included count -> finalizes immediately. Over
 * -> creates a Stripe Checkout session for the tiered overage against
 * session_price_usd; finalization happens in the webhook once paid.
 */
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAuthorizedForGallery(req, params.slug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, slug, topic, client_name, status, included_photo_count, session_price_usd')
    .eq('slug', params.slug)
    .single()

  if (!gallery || gallery.status !== 'selecting') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { count: selectedCount } = await supabase
    .from('gallery_photos')
    .select('id', { count: 'exact', head: true })
    .eq('gallery_id', gallery.id)
    .eq('selected', true)

  if (!selectedCount || selectedCount === 0) {
    return NextResponse.json({ error: 'Select at least one photo first' }, { status: 400 })
  }

  const included = gallery.included_photo_count ?? 0
  const tier = overageTierPercent(selectedCount, included)

  if (tier === 0) {
    const result = await finalizeSelection(supabase, gallery.id)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })
    return NextResponse.json({ ok: true, requiresPayment: false, selectedCount })
  }

  if (!gallery.session_price_usd) {
    return NextResponse.json(
      { error: 'This selection needs an additional charge, but the session price isn\'t set — contact us directly.' },
      { status: 409 }
    )
  }

  const amountUsd = Math.round(gallery.session_price_usd * (tier / 100) * 100) / 100
  const topic = gallery.topic || gallery.client_name

  let session
  try {
    const stripe = getStripe()
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amountUsd * 100),
            product_data: {
              name: `Babula Shots — Fotos adicionales (${topic})`,
              description: `${selectedCount} fotos seleccionadas · ${included} incluidas · recargo del ${tier}%`,
            },
          },
        },
      ],
      success_url: `${BASE_URL}/g/${params.slug}?selection_paid=1`,
      cancel_url: `${BASE_URL}/g/${params.slug}?selection_cancelled=1`,
      metadata: {
        galleryId: gallery.id,
        slug: params.slug,
        tier: String(tier),
        selectedCount: String(selectedCount),
      },
    })
  } catch (err) {
    console.error('submit-selection: Stripe checkout creation failed:', err)
    return NextResponse.json({ error: 'No se pudo iniciar el pago. Intenta de nuevo en un momento.' }, { status: 502 })
  }

  // Gallery row untouched until the Stripe session actually exists — a
  // failed checkout-session.create above leaves nothing to clean up, so a
  // retry from the client starts clean.
  await supabase
    .from('galleries')
    .update({
      selection_overage_tier: tier,
      selection_overage_amount_usd: amountUsd,
      selection_payment_status: 'pending',
      stripe_overage_session_id: session.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gallery.id)

  return NextResponse.json({
    ok: true,
    requiresPayment: true,
    checkoutUrl: session.url,
    overageTier: tier,
    overageAmountUsd: amountUsd,
    selectedCount,
  })
}
