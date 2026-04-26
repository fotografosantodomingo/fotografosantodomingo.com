'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  DRONE_ADDON_ELIGIBLE_SERVICES,
  QUOTE_CALLBACK_WINDOWS,
  QUOTE_CONTACT_METHODS,
  QUOTE_SERVICE_TYPES,
  QUOTE_SERVICE_TYPE_TO_FAMILY_SLUG,
  type QuoteContactMethod,
  type QuoteServiceType,
} from '@/lib/quotes/constants'

type Props = {
  locale: string
}

const FORM_STARTED_AT = typeof Date !== 'undefined' ? Date.now() : 0

type FormState = {
  serviceType: QuoteServiceType | ''
  participantsCount: string
  addDrone: boolean
  country: '' | 'US' | 'DO'
  state: string
  city: string
  eventDate: string
  fullName: string
  email: string
  whatsappPhone: string
  preferredContactMethod: QuoteContactMethod | ''
  callbackTimePreference: string
  description: string
}

const INITIAL_STATE: FormState = {
  serviceType: '',
  participantsCount: '',
  addDrone: false,
  country: '',
  state: '',
  city: '',
  eventDate: '',
  fullName: '',
  email: '',
  whatsappPhone: '',
  preferredContactMethod: '',
  callbackTimePreference: '',
  description: '',
}

export default function GetQuoteWizard({ locale }: Props) {
  const isEs = locale === 'es'
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<string[]>([])
  const [savingDraft, setSavingDraft] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<FormState>(INITIAL_STATE)

  const maxStep = 6
  const progress = Math.round((step / maxStep) * 100)

  const minDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    return date.toISOString().split('T')[0]
  }, [])

  // ?family=<slug>, ?package=<slug>, ?city=<slug>, ?cta=<id> for source
  // attribution and family preselection from compare-card and geo-block
  // deep links.
  const [sourcePage, setSourcePage] = useState<string | null>(null)
  const [sourceCta, setSourceCta] = useState<string | null>(null)
  const [presetPackageSlug, setPresetPackageSlug] = useState<string | null>(null)
  const [presetFamilySlug, setPresetFamilySlug] = useState<string | null>(null)
  const [attributionCity, setAttributionCity] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setSourcePage(window.location.pathname)
    const params = new URLSearchParams(window.location.search)
    const cta = params.get('cta')
    if (cta) setSourceCta(cta)
    const family = params.get('family')
    if (family) setPresetFamilySlug(family)
    const pkg = params.get('package')
    if (pkg) setPresetPackageSlug(pkg)
    const city = params.get('city')
    if (city) setAttributionCity(city)
    if (family) {
      const matchEntry = Object.entries(QUOTE_SERVICE_TYPE_TO_FAMILY_SLUG).find(
        ([, slug]) => slug === family
      )
      if (matchEntry) {
        setForm(prev => ({ ...prev, serviceType: matchEntry[0] as QuoteServiceType }))
      }
    }
  }, [])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validateCurrentStep() {
    const stepErrors: string[] = []

    if (step === 1 && !form.serviceType) {
      stepErrors.push(isEs ? 'Selecciona un tipo de servicio.' : 'Please select a service type.')
    }

    if (step === 2) {
      const participants = Number(form.participantsCount)
      if (!form.participantsCount.trim()) {
        stepErrors.push(isEs ? 'Indica cuantas personas incluye el servicio.' : 'Please provide how many people are included.')
      } else if (!Number.isInteger(participants) || participants < 1) {
        stepErrors.push(isEs ? 'El numero de personas debe ser un entero mayor o igual a 1.' : 'People count must be an integer greater than or equal to 1.')
      }
    }

    if (step === 3) {
      if (!form.country) stepErrors.push(isEs ? 'Selecciona un pais.' : 'Please select a country.')
      if (!form.state) stepErrors.push(isEs ? 'Selecciona un estado/provincia.' : 'Please select a state/province.')
      if (!form.city) stepErrors.push(isEs ? 'Selecciona una ciudad.' : 'Please select a city.')
    }

    if (step === 4) {
      if (!form.eventDate) {
        stepErrors.push(isEs ? 'Selecciona una fecha de evento.' : 'Please choose an event date.')
      } else if (form.eventDate < minDate) {
        stepErrors.push(
          isEs
            ? 'La fecha debe ser al menos 2 semanas desde hoy.'
            : 'Date must be at least 2 weeks from today.'
        )
      }
    }

    if (step === 5) {
      if (!form.fullName.trim()) stepErrors.push(isEs ? 'Nombre completo es obligatorio.' : 'Full name is required.')
      if (!form.email.trim()) stepErrors.push(isEs ? 'Email es obligatorio.' : 'Email is required.')
      if (!form.whatsappPhone.trim()) stepErrors.push(isEs ? 'WhatsApp es obligatorio.' : 'WhatsApp number is required.')
    }

    if (step === 6) {
      if (!form.preferredContactMethod) stepErrors.push(isEs ? 'Selecciona metodo de contacto.' : 'Choose a contact method.')
      if (form.preferredContactMethod === 'PHONE_CALL' && !form.callbackTimePreference) {
        stepErrors.push(isEs ? 'Selecciona horario para llamada.' : 'Choose a callback window.')
      }
      if (!form.description.trim()) stepErrors.push(isEs ? 'Describe tu sesion.' : 'Please describe your session.')
    }

    setErrors(stepErrors)
    return stepErrors.length === 0
  }

  const droneEligible =
    form.serviceType !== '' && DRONE_ADDON_ELIGIBLE_SERVICES.includes(form.serviceType)

  async function nextStep() {
    if (!validateCurrentStep()) return
    setStep((prev) => Math.min(prev + 1, maxStep))
  }

  function previousStep() {
    setErrors([])
    setStep((prev) => Math.max(prev - 1, 1))
  }

  function buildDetails(): { details: string; locationText: string } {
    const lines: string[] = []
    const serviceType = QUOTE_SERVICE_TYPES.find(t => t.value === form.serviceType)
    const contactMethod = QUOTE_CONTACT_METHODS.find(c => c.value === form.preferredContactMethod)
    const callbackWindow = QUOTE_CALLBACK_WINDOWS.find(w => w.value === form.callbackTimePreference)
    const isEsLabel = isEs

    if (serviceType) {
      lines.push(
        `${isEsLabel ? 'Servicio' : 'Service'}: ${
          isEsLabel ? serviceType.labelEs : serviceType.labelEn
        }`
      )
    }
    if (form.participantsCount) {
      lines.push(`${isEsLabel ? 'Personas' : 'People'}: ${form.participantsCount}`)
    }
    if (form.addDrone) {
      lines.push(isEsLabel ? 'Extras: cobertura con drone' : 'Extras: drone coverage')
    }
    if (contactMethod) {
      lines.push(
        `${isEsLabel ? 'Contacto preferido' : 'Preferred contact'}: ${
          isEsLabel ? contactMethod.labelEs : contactMethod.labelEn
        }`
      )
    }
    if (callbackWindow) {
      lines.push(
        `${isEsLabel ? 'Horario de llamada' : 'Callback window'}: ${
          isEsLabel ? callbackWindow.labelEs : callbackWindow.labelEn
        }`
      )
    }
    if (presetPackageSlug) {
      lines.push(`Package (preselected): ${presetPackageSlug}`)
    }

    const description = form.description.trim()
    if (description) {
      lines.push('')
      lines.push(description)
    }

    const locationParts = [form.city, form.state, form.country].filter(Boolean)
    return {
      details: lines.join('\n'),
      locationText: locationParts.join(', '),
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateCurrentStep()) return

    setSavingDraft(true)
    setSubmitError(null)

    try {
      const familySlug =
        presetFamilySlug ?? QUOTE_SERVICE_TYPE_TO_FAMILY_SLUG[form.serviceType as QuoteServiceType]
      const { details, locationText } = buildDetails()

      const payload: Record<string, unknown> = {
        client_name: form.fullName,
        client_email: form.email,
        client_phone: form.whatsappPhone || undefined,
        event_date: form.eventDate || undefined,
        location_text: locationText || undefined,
        notes: details,
        locale: locale === 'en' ? 'en' : 'es',
        source_page: sourcePage ?? undefined,
        source_cta: sourceCta ?? undefined,
        _form_started_at: FORM_STARTED_AT,
      }
      if (familySlug) payload.family_slug = familySlug
      if (presetPackageSlug) payload.package_slug = presetPackageSlug
      if (attributionCity) payload.attribution_city = attributionCity

      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || 'Unable to submit quote request')
      }

      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: 'quote_form_submitted',
          service_type: form.serviceType,
          family_slug: familySlug ?? null,
          package_slug: presetPackageSlug ?? null,
          locale,
        })
      }

      setErrors([])
      setSubmitError(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit quote request'
      setSubmitError(message)
      return
    } finally {
      setSavingDraft(false)
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="border border-hairline-soft p-8 md:p-12 text-center">
        <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-5">
          {isEs ? 'Recibido' : 'Received'}
        </p>
        <h2
          className="font-display uppercase text-ink"
          style={{ fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: '1.0' }}
        >
          {isEs ? 'Recibimos tu solicitud' : 'We received your request'}
        </h2>
        <p className="mt-5 text-sm md:text-base text-ink-muted leading-relaxed max-w-md mx-auto">
          {isEs
            ? 'Gracias. Nuestro equipo revisará tus detalles y te contactará pronto con un presupuesto personalizado.'
            : 'Thank you. Our team will review your details and contact you soon with a personalized quote.'}
        </p>
        <Link
          href={`/${locale}`}
          className="mt-10 inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
        >
          {isEs ? 'Volver al inicio' : 'Back to home'}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
          {isEs ? 'Cotización · Solicitud' : 'Quote · Request'}
        </p>
        <h1
          className="font-display uppercase text-ink"
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            lineHeight: '0.95',
            letterSpacing: '-0.01em',
          }}
        >
          {isEs ? 'Solicita tu presupuesto' : 'Request your quote'}
        </h1>
      </div>

      {/* Stepper — same telemetry pattern as /book */}
      <div className="mb-10 border-y border-hairline-soft py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
            {String(step).padStart(2, '0')} / {String(maxStep).padStart(2, '0')}
          </div>
          <div className="font-mono uppercase tracking-widest text-[11px] text-ink">
            {isEs ? `Paso ${step}` : `Step ${step}`}
          </div>
        </div>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: maxStep }).map((_, i) => (
            <span
              key={i}
              className={`h-px flex-1 ${i < step - 1 ? 'bg-ink/60' : i === step - 1 ? 'bg-ink' : 'bg-hairline-soft'}`}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="sr-only">{`${progress}%`}</div>
      </div>

      {errors.length > 0 && (
        <div className="mb-8 border border-hairline p-4">
          <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
            {isEs ? 'Revisa' : 'Check'}
          </p>
          {errors.map((error) => (
            <p key={error} className="text-sm text-ink leading-relaxed">{error}</p>
          ))}
        </div>
      )}

      {submitError && (
        <div className="mb-8 border border-hairline p-4">
          <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
            {isEs ? 'Error' : 'Error'}
          </p>
          <p className="text-sm text-ink leading-relaxed">{submitError}</p>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
            {isEs ? 'Tipo de servicio' : 'Service type'}
          </h2>
          {/* Mobile: 2-col compact tiles (icon + label, tight padding).
              ≥sm:  2-col with breathing room.
              ≥lg:  3-col full premium scale.
              17 items × 2 cols mobile = 9 rows ≈ 540px scroll, well within
              one viewport before the Continue pill. */}
          <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline-soft">
            {QUOTE_SERVICE_TYPES.map((item) => {
              const active = form.serviceType === item.value
              return (
                <li key={item.value} className="border-r border-b border-hairline-soft">
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        serviceType: item.value,
                        addDrone: DRONE_ADDON_ELIGIBLE_SERVICES.includes(item.value) ? prev.addDrone : false,
                      }))
                    }}
                    aria-pressed={active}
                    className={`group flex flex-col w-full h-full min-h-[80px] sm:min-h-[96px] p-3 sm:p-4 lg:p-5 text-left hover:bg-ink/5 transition-colors duration-200 ${active ? 'bg-ink/10' : ''}`}
                  >
                    <div className="text-base sm:text-lg lg:text-xl mb-1.5 sm:mb-2 lg:mb-3" aria-hidden="true">{item.icon}</div>
                    <p className="font-mono uppercase tracking-widest text-[10px] sm:text-[11px] text-ink leading-tight">
                      {isEs ? item.labelEs : item.labelEn}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <FieldBlock label={isEs ? 'Cuántas personas incluye' : 'How many people'}>
            <input
              type="number"
              min={1}
              step={1}
              className="w-full bg-transparent border-0 border-b border-hairline-soft px-0 py-2.5 text-base text-ink placeholder-ink-muted/50 outline-none focus:border-ink transition-colors md:max-w-sm"
              value={form.participantsCount}
              onChange={(e) => update('participantsCount', e.target.value)}
              placeholder={isEs ? 'Ej: 40' : 'e.g. 40'}
            />
          </FieldBlock>

          <div className="border border-hairline-soft p-5">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
              {isEs ? 'Extras opcionales' : 'Optional extras'}
            </p>
            {droneEligible ? (
              <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.addDrone}
                  onChange={(e) => update('addDrone', e.target.checked)}
                  className="h-4 w-4 accent-ink"
                />
                <span>{isEs ? 'Agregar cobertura con drone' : 'Add drone coverage'}</span>
              </label>
            ) : (
              <p className="text-sm text-ink-muted">
                {isEs
                  ? 'Este servicio no incluye opción de drone.'
                  : 'This service does not include a drone option.'}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-6 md:grid-cols-3">
          <FieldBlock label={isEs ? 'País' : 'Country'}>
            <select
              className="w-full bg-transparent border-0 border-b border-hairline-soft px-0 py-2.5 text-base text-ink outline-none focus:border-ink transition-colors"
              value={form.country}
              onChange={(e) => update('country', e.target.value as FormState['country'])}
            >
              <option value="">{isEs ? 'Selecciona' : 'Select'}</option>
              <option value="US">{isEs ? 'Estados Unidos' : 'United States'}</option>
              <option value="DO">{isEs ? 'República Dominicana' : 'Dominican Republic'}</option>
            </select>
          </FieldBlock>
          <FieldBlock label={isEs ? 'Estado / Provincia' : 'State / Province'}>
            <input
              className="w-full bg-transparent border-0 border-b border-hairline-soft px-0 py-2.5 text-base text-ink placeholder-ink-muted/50 outline-none focus:border-ink transition-colors"
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
              placeholder={isEs ? 'Estado' : 'State'}
            />
          </FieldBlock>
          <FieldBlock label={isEs ? 'Ciudad' : 'City'}>
            <input
              className="w-full bg-transparent border-0 border-b border-hairline-soft px-0 py-2.5 text-base text-ink placeholder-ink-muted/50 outline-none focus:border-ink transition-colors"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder={isEs ? 'Ciudad' : 'City'}
            />
          </FieldBlock>
        </div>
      )}

      {step === 4 && (
        <FieldBlock label={isEs ? 'Fecha del evento' : 'Event date'}>
          <input
            type="date"
            min={minDate}
            className="w-full bg-transparent border-0 border-b border-hairline-soft px-0 py-2.5 text-base text-ink outline-none focus:border-ink transition-colors md:max-w-sm"
            value={form.eventDate}
            onChange={(e) => update('eventDate', e.target.value)}
          />
        </FieldBlock>
      )}

      {step === 5 && (
        <div className="grid gap-6 md:grid-cols-2">
          <FieldBlock label={isEs ? 'Nombre completo' : 'Full name'}>
            <input
              className="w-full bg-transparent border-0 border-b border-hairline-soft px-0 py-2.5 text-base text-ink placeholder-ink-muted/50 outline-none focus:border-ink transition-colors"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              autoComplete="name"
            />
          </FieldBlock>
          <FieldBlock label="Email">
            <input
              type="email"
              className="w-full bg-transparent border-0 border-b border-hairline-soft px-0 py-2.5 text-base text-ink placeholder-ink-muted/50 outline-none focus:border-ink transition-colors"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              autoComplete="email"
            />
          </FieldBlock>
          <div className="md:col-span-2">
            <FieldBlock label="WhatsApp">
              <input
                className="w-full bg-transparent border-0 border-b border-hairline-soft px-0 py-2.5 text-base text-ink placeholder-ink-muted/50 outline-none focus:border-ink transition-colors"
                value={form.whatsappPhone}
                onChange={(e) => update('whatsappPhone', e.target.value)}
                placeholder={isEs ? '+1 809 ...' : '+1 809 ...'}
                autoComplete="tel"
              />
            </FieldBlock>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-8">
          <div>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Método de contacto' : 'Contact method'}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUOTE_CONTACT_METHODS.map((item) => {
                const active = form.preferredContactMethod === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => update('preferredContactMethod', item.value)}
                    className={`inline-flex items-center justify-center font-mono uppercase tracking-widest text-[11px] px-5 py-2.5 rounded-full border transition-colors duration-200 ${
                      active
                        ? 'bg-ink text-canvas border-ink'
                        : 'border-hairline text-ink hover:bg-ink hover:text-canvas'
                    }`}
                  >
                    {isEs ? item.labelEs : item.labelEn}
                  </button>
                )
              })}
            </div>
          </div>

          {form.preferredContactMethod === 'PHONE_CALL' && (
            <FieldBlock label={isEs ? 'Horario preferido' : 'Preferred time'}>
              <select
                className="w-full bg-transparent border-0 border-b border-hairline-soft px-0 py-2.5 text-base text-ink outline-none focus:border-ink transition-colors md:max-w-md"
                value={form.callbackTimePreference}
                onChange={(e) => update('callbackTimePreference', e.target.value)}
              >
                <option value="">{isEs ? 'Selecciona horario' : 'Select a time window'}</option>
                {QUOTE_CALLBACK_WINDOWS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {isEs ? option.labelEs : option.labelEn}
                  </option>
                ))}
              </select>
            </FieldBlock>
          )}

          <FieldBlock
            label={isEs ? 'Describe tu sesión y presupuesto' : 'Describe your session and budget'}
          >
            <textarea
              className="min-h-[160px] w-full bg-transparent border border-hairline-soft px-3 py-3 text-base text-ink placeholder-ink-muted/50 outline-none focus:border-ink transition-colors resize-y"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder={isEs ? 'Cuéntanos los detalles…' : 'Tell us the details…'}
            />
          </FieldBlock>
        </div>
      )}

      <div className="mt-12 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={previousStep}
          disabled={step === 1 || savingDraft}
          className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-6 py-3 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-ink transition-colors duration-200"
        >
          {isEs ? 'Atrás' : 'Back'}
        </button>

        {step < maxStep ? (
          <button
            type="button"
            onClick={() => void nextStep()}
            disabled={savingDraft}
            className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3 rounded-full bg-ink text-canvas hover:opacity-80 disabled:opacity-30 transition-opacity duration-200"
          >
            {savingDraft
              ? (isEs ? 'Guardando…' : 'Saving…')
              : (isEs ? 'Continuar' : 'Continue')}
          </button>
        ) : (
          <button
            type="submit"
            disabled={savingDraft}
            className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3 rounded-full bg-ink text-canvas hover:opacity-80 disabled:opacity-30 transition-opacity duration-200"
          >
            {savingDraft
              ? (isEs ? 'Enviando…' : 'Submitting…')
              : (isEs ? 'Enviar solicitud' : 'Submit request')}
          </button>
        )}
      </div>
    </form>
  )
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono uppercase tracking-widest text-[10px] text-ink-muted">
        {label}
      </span>
      {children}
    </label>
  )
}
