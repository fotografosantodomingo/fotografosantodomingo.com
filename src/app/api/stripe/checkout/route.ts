import { type NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'edge'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'

async function hashToken(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

const SERVICE_LABELS: Record<string, { es: string; en: string }> = {
  WEDDINGS:           { es: 'Fotografía de Bodas',        en: 'Wedding Photography' },
  ENGAGEMENT_SESSION: { es: 'Sesión de Compromiso',        en: 'Engagement Session' },
  QUINCEANERAS:       { es: 'Quinceañera',                 en: 'Quinceañera' },
  MATERNITY:          { es: 'Maternidad',                  en: 'Maternity' },
  FAMILY:             { es: 'Sesión Familiar',             en: 'Family Session' },
  BIRTHDAY_PARTY:     { es: 'Fiesta de Cumpleaños',        en: 'Birthday Party' },
  BAPTISMS:           { es: 'Bautizo',                     en: 'Baptism' },
  GRADUATION:         { es: 'Graduación',                  en: 'Graduation' },
  CHILDRENS_SESSIONS: { es: 'Sesión Infantil',             en: "Children's Session" },
  ARCHITECTURE:       { es: 'Arquitectura',                en: 'Architecture' },
  PORTRAITS:          { es: 'Retratos',                    en: 'Portraits' },
  CORPORATE_EVENTS:   { es: 'Evento Corporativo',          en: 'Corporate Event' },
  CORPORATE_PORTRAITS:{ es: 'Retratos Corporativos',       en: 'Corporate Portraits' },
  FOOD_AND_BEVERAGE:  { es: 'Alimentos y Bebidas',         en: 'Food and Beverage' },
  VIDEO_PRODUCTION:   { es: 'Producción de Video',         en: 'Video Production' },
  DRONE_AERIAL:       { es: 'Fotografía con Drone',        en: 'Drone Photography' },
  OTHER:              { es: 'Servicio Fotográfico',        en: 'Photography Service' },
}

function getServiceLabel(type: string | null, isEs: boolean): string {
  if (!type) return isEs ? 'Servicio Fotográfico' : 'Photography Service'
  const entry = SERVICE_LABELS[type]
  return entry ? (isEs ? entry.es : entry.en) : type.replace(/_/g, ' ')
}

// ─── Slug-based checkout (Phase 2 /quotations/[slug]) ────────────────────────

async function handleSlugCheckout(
  slug: string,
  requestedMode: string | undefined
) {
  const supabase = createServiceClient()
  const { data: quote, error } = await supabase
    .from('quotes')
    .select('id, locale, full_name, email, service_type, final_price_usd, payment_mode, deposit_amount_usd, status, proposal_expires_at')
    .eq('proposal_slug', slug)
    .single()

  if (error || !quote) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
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

  const totalCents = Math.round(Number(quote.final_price_usd) * 100)
  // Client can request 'deposit' or 'full'; fall back to the quote's stored payment_mode
  const effectiveMode =
    requestedMode === 'deposit' ? 'DEPOSIT'
    : requestedMode === 'full' ? 'FULL'
    : (quote.payment_mode ?? 'FULL')

  const amountCents = effectiveMode === 'DEPOSIT'
    ? Math.round(totalCents * 0.5)
    : totalCents

  const isEs = quote.locale === 'es'
  const serviceLabel = getServiceLabel(quote.service_type, isEs)

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: quote.email ?? undefined,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: amountCents,
        product_data: {
          name: `Babula Shots — ${serviceLabel}`,
          description: effectiveMode === 'DEPOSIT'
            ? (isEs ? `Depósito del 50% — saldo restante el día de sesión. ID: ${quote.id}` : `50% deposit — balance due on session day. ID: ${quote.id}`)
            : (isEs ? `Pago completo del servicio. ID: ${quote.id}` : `Full payment for service. ID: ${quote.id}`),
        },
      },
    }],
    success_url: `${BASE_URL}/quotations/${slug}?paid=1`,
    cancel_url: `${BASE_URL}/quotations/${slug}?cancelled=1`,
    metadata: {
      quoteId: quote.id,
      paymentMode: effectiveMode,
      source: 'slug',
    },
  })

  return NextResponse.json({ url: session.url })
}

// ─── Legacy token-based checkout (/proposal/[id]) ────────────────────────────

async function handleTokenCheckout(quoteId: string, token: string) {
  if (token.length > 128) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const tokenHash = await hashToken(token)
  const supabase = createServiceClient()

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

  const isEs = quote.locale === 'es'
  const serviceLabel = getServiceLabel(quote.service_type, isEs)
  const amountCents = Math.round(Number(quote.final_price_usd) * 100)

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: quote.email ?? undefined,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: amountCents,
        product_data: {
          name: `Babula Shots — ${serviceLabel}`,
          description: isEs
            ? `Pago completo del servicio fotográfico. ID: ${quote.id}`
            : `Full payment for photography service. ID: ${quote.id}`,
        },
      },
    }],
    success_url: `${BASE_URL}/proposal/${quoteId}?token=${token}&paid=1`,
    cancel_url: `${BASE_URL}/proposal/${quoteId}?token=${token}&cancelled=1`,
    metadata: {
      quoteId: quote.id,
      tokenHash,
      paymentMode: 'FULL',
      source: 'token',
    },
  })

  return NextResponse.json({ url: session.url })
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Phase 2: slug-based
    if (typeof body.slug === 'string' && body.slug) {
      return await handleSlugCheckout(body.slug, body.paymentMode)
    }

    // Legacy: quoteId + token
    if (typeof body.quoteId === 'string' && typeof body.token === 'string') {
      return await handleTokenCheckout(body.quoteId, body.token)
    }

    return NextResponse.json({ error: 'Missing slug or quoteId+token' }, { status: 400 })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
