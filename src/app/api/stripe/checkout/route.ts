import { type NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/service'
import crypto from 'crypto'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

type CreateCheckoutBody = {
  quoteId: string
  token: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateCheckoutBody
    const { quoteId, token } = body

    if (!quoteId || typeof quoteId !== 'string' || !token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Missing quoteId or token' }, { status: 400 })
    }

    // Validate token length to prevent excessive lookup attempts
    if (token.length > 128) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const tokenHash = hashToken(token)
    const supabase = createServiceClient()

    // Verify token matches and proposal is still active
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('id, locale, full_name, email, service_type, final_price_usd, status, proposal_expires_at')
      .eq('id', quoteId)
      .eq('proposal_token_hash', tokenHash)
      .single()

    if (error || !quote) {
      return NextResponse.json({ error: 'Proposal not found or token invalid' }, { status: 404 })
    }

    if (quote.status === 'ACCEPTED') {
      return NextResponse.json({ error: 'Proposal already accepted' }, { status: 409 })
    }

    if (quote.status === 'REJECTED') {
      return NextResponse.json({ error: 'Proposal is no longer active' }, { status: 410 })
    }

    if (quote.proposal_expires_at && new Date(quote.proposal_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Proposal has expired' }, { status: 410 })
    }

    if (!quote.final_price_usd) {
      return NextResponse.json({ error: 'Proposal price is not set' }, { status: 422 })
    }

    const stripe = getStripe()
    const isEs = quote.locale === 'es'

    // Full payment in USD cents
    const amountCents = Math.round(Number(quote.final_price_usd) * 100)

    const serviceLabelMap: Record<string, { es: string; en: string }> = {
      WEDDINGS: { es: 'Fotografia de Bodas', en: 'Wedding Photography' },
      ENGAGEMENT_SESSION: { es: 'Sesion de Compromiso', en: 'Engagement Session' },
      QUINCEANERAS: { es: 'Quinceanera', en: 'Quinceanera' },
      MATERNITY: { es: 'Maternidad', en: 'Maternity' },
      FAMILY: { es: 'Sesion Familiar', en: 'Family Session' },
      BIRTHDAY_PARTY: { es: 'Fiesta de Cumpleanos', en: 'Birthday Party' },
      BAPTISMS: { es: 'Bautizo', en: 'Baptism' },
      GRADUATION: { es: 'Graduacion', en: 'Graduation' },
      CHILDRENS_SESSIONS: { es: 'Sesion Infantil', en: "Children's Session" },
      ARCHITECTURE: { es: 'Arquitectura', en: 'Architecture' },
      PORTRAITS: { es: 'Retratos', en: 'Portraits' },
      CORPORATE_EVENTS: { es: 'Evento Corporativo', en: 'Corporate Event' },
      CORPORATE_PORTRAITS: { es: 'Retratos Corporativos', en: 'Corporate Portraits' },
      FOOD_AND_BEVERAGE: { es: 'Alimentos y Bebidas', en: 'Food and Beverage' },
      VIDEO_PRODUCTION: { es: 'Produccion de Video', en: 'Video Production' },
      DRONE_AERIAL: { es: 'Fotografia con Drone', en: 'Drone Photography' },
      OTHER: { es: 'Servicio Fotografico', en: 'Photography Service' },
    }

    const serviceLabel = quote.service_type
      ? (isEs
          ? (serviceLabelMap[quote.service_type]?.es ?? quote.service_type)
          : (serviceLabelMap[quote.service_type]?.en ?? quote.service_type))
      : (isEs ? 'Servicio Fotografico' : 'Photography Service')

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: quote.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: isEs
                ? `Babula Shots — ${serviceLabel}`
                : `Babula Shots — ${serviceLabel}`,
              description: isEs
                ? `Pago completo del servicio fotografico. IDs: ${quote.id}`
                : `Full payment for photography service. ID: ${quote.id}`,
            },
          },
        },
      ],
      success_url: `${BASE_URL}/proposal/${quoteId}?token=${token}&paid=1`,
      cancel_url: `${BASE_URL}/proposal/${quoteId}?token=${token}&cancelled=1`,
      metadata: {
        quoteId: quote.id,
        tokenHash,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
