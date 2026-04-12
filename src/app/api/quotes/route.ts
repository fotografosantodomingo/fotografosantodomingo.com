import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendQuoteSubmissionConfirmation, sendQuoteSubmissionNotification } from '@/lib/email/resend'
import type { QuoteContactMethod, QuoteServiceType } from '@/lib/quotes/constants'

type QuoteMode = 'draft' | 'final'

type QuotePayload = {
  mode: QuoteMode
  quoteId?: string | null
  locale?: string
  formStepReached?: number
  serviceType?: QuoteServiceType | null
  country?: string | null
  state?: string | null
  city?: string | null
  eventDate?: string | null
  fullName?: string | null
  email?: string | null
  whatsappPhone?: string | null
  preferredContactMethod?: QuoteContactMethod | null
  callbackTimePreference?: string | null
  description?: string | null
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value?: string | null) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function validateFinalPayload(payload: QuotePayload) {
  const required = {
    serviceType: payload.serviceType,
    country: clean(payload.country),
    state: clean(payload.state),
    city: clean(payload.city),
    eventDate: clean(payload.eventDate),
    fullName: clean(payload.fullName),
    email: clean(payload.email),
    whatsappPhone: clean(payload.whatsappPhone),
    preferredContactMethod: payload.preferredContactMethod,
    description: clean(payload.description),
  }

  for (const [key, value] of Object.entries(required)) {
    if (!value) return `Missing required field: ${key}`
  }

  if (!EMAIL_REGEX.test(required.email!)) {
    return 'Invalid email format'
  }

  if (required.preferredContactMethod === 'PHONE_CALL' && !clean(payload.callbackTimePreference)) {
    return 'callbackTimePreference is required for PHONE_CALL method'
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QuotePayload

    if (body.mode !== 'draft' && body.mode !== 'final') {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    if (body.mode === 'final') {
      const validationError = validateFinalPayload(body)
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }
    }

    const locale = body.locale === 'en' ? 'en' : 'es'
    const formStepReached = Math.min(Math.max(body.formStepReached ?? 1, 1), 5)

    const payload = {
      locale,
      service_type: body.serviceType || null,
      event_date: clean(body.eventDate),
      country: clean(body.country),
      state: clean(body.state),
      city: clean(body.city),
      full_name: clean(body.fullName),
      email: clean(body.email)?.toLowerCase() || null,
      whatsapp_phone: clean(body.whatsappPhone),
      preferred_contact_method: body.preferredContactMethod || null,
      callback_time_preference: clean(body.callbackTimePreference),
      description: clean(body.description),
      form_step_reached: body.mode === 'final' ? 5 : formStepReached,
      status: 'PENDING_REVIEW' as const,
    }

    const supabase = createServiceClient()

    let quoteId = body.quoteId || null

    if (!quoteId) {
      const { data, error } = await supabase
        .from('quotes')
        .insert(payload)
        .select('id')
        .single()

      if (error) {
        console.error('Quote insert error:', error)
        return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
      }

      quoteId = data.id
    } else {
      const { error } = await supabase
        .from('quotes')
        .update(payload)
        .eq('id', quoteId)

      if (error) {
        console.error('Quote update error:', error)
        return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
      }
    }

    if (body.mode === 'final') {
      if (!quoteId) {
        return NextResponse.json({ error: 'Quote ID was not generated' }, { status: 500 })
      }

      const finalRecord = {
        id: quoteId,
        locale,
        serviceType: payload.service_type!,
        eventDate: payload.event_date!,
        country: payload.country!,
        state: payload.state!,
        city: payload.city!,
        fullName: payload.full_name!,
        email: payload.email!,
        whatsappPhone: payload.whatsapp_phone!,
        preferredContactMethod: payload.preferred_contact_method!,
        callbackTimePreference: payload.callback_time_preference,
        description: payload.description!,
      }

      try {
        await sendQuoteSubmissionNotification(finalRecord)
        await sendQuoteSubmissionConfirmation(finalRecord)
      } catch (emailError) {
        console.error('Quote email sending failed:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      mode: body.mode,
      id: quoteId,
    })
  } catch (error) {
    console.error('Quote API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
