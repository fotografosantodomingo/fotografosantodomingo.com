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

  // ?family=<slug>, ?package=<slug>, ?cta=<id> for source attribution
  // and family preselection from compare-card deep links.
  const [sourcePage, setSourcePage] = useState<string | null>(null)
  const [sourceCta, setSourceCta] = useState<string | null>(null)
  const [presetPackageSlug, setPresetPackageSlug] = useState<string | null>(null)
  const [presetFamilySlug, setPresetFamilySlug] = useState<string | null>(null)
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isEs ? 'Recibimos tu solicitud' : 'We received your request'}
        </h2>
        <p className="mt-3 text-slate-600 dark:text-gray-300">
          {isEs
            ? 'Gracias. Nuestro equipo revisara tus detalles y te contactara pronto con un presupuesto personalizado.'
            : 'Thank you. Our team will review your details and contact you soon with a personalized quote.'}
        </p>
        <Link href={`/${locale}`} className="mt-6 inline-flex rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-500">
          {isEs ? 'Volver al inicio' : 'Back to home'}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8 dark:border-white/10 dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-sky-700 dark:text-sky-300">
            {isEs ? 'Formulario de cotizacion' : 'Quote form'}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">
            {isEs ? 'Solicita tu presupuesto' : 'Request your quote'}
          </h1>
        </div>
        <div className="text-sm font-semibold text-slate-600 dark:text-gray-300">
          {isEs ? `Paso ${step} de ${maxStep}` : `Step ${step} of ${maxStep}`}
        </div>
      </div>

      <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
        <div className="h-full rounded-full bg-sky-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {errors.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-400/20 dark:bg-red-500/10">
          {errors.map((error) => (
            <p key={error} className="text-sm text-red-700 dark:text-red-300">{error}</p>
          ))}
        </div>
      )}

      {submitError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-400/20 dark:bg-red-500/10">
          <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">{isEs ? 'Selecciona el tipo de servicio' : 'Choose your service type'}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUOTE_SERVICE_TYPES.map((item) => {
              const active = form.serviceType === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      serviceType: item.value,
                      addDrone: DRONE_ADDON_ELIGIBLE_SERVICES.includes(item.value) ? prev.addDrone : false,
                    }))
                  }}
                  className={`rounded-xl border p-4 text-left transition ${active ? 'border-sky-500 bg-sky-50 dark:bg-sky-400/10' : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/30'}`}
                >
                  <div className="text-2xl">{item.icon}</div>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{isEs ? item.labelEs : item.labelEn}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">
              {isEs ? 'Cuantas personas incluye el servicio' : 'How many people are included in the service'}
            </label>
            <input
              type="number"
              min={1}
              step={1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 md:max-w-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
              value={form.participantsCount}
              onChange={(e) => update('participantsCount', e.target.value)}
              placeholder={isEs ? 'Ejemplo: 40' : 'Example: 40'}
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">
              {isEs ? 'Extras opcionales' : 'Optional extras'}
            </p>
            {droneEligible ? (
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={form.addDrone}
                  onChange={(e) => update('addDrone', e.target.checked)}
                />
                <span>{isEs ? 'Agregar cobertura con drone' : 'Add drone coverage'}</span>
              </label>
            ) : (
              <p className="mt-3 text-sm text-slate-600 dark:text-gray-300">
                {isEs
                  ? 'Este servicio no incluye opcion de drone.'
                  : 'This service does not include a drone option.'}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">{isEs ? 'Pais' : 'Country'}</label>
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-white/15 dark:bg-gray-800 dark:text-white" value={form.country} onChange={(e) => update('country', e.target.value as FormState['country'])}>
              <option value="">{isEs ? 'Selecciona' : 'Select'}</option>
              <option value="US">{isEs ? 'Estados Unidos' : 'United States'}</option>
              <option value="DO">{isEs ? 'Republica Dominicana' : 'Dominican Republic'}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">{isEs ? 'Estado / Provincia' : 'State / Province'}</label>
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-white/15 dark:bg-gray-800 dark:text-white" value={form.state} onChange={(e) => update('state', e.target.value)} placeholder={isEs ? 'Selecciona estado' : 'Select state'} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">{isEs ? 'Ciudad' : 'City'}</label>
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-white/15 dark:bg-gray-800 dark:text-white" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder={isEs ? 'Selecciona ciudad' : 'Select city'} />
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">{isEs ? 'Fecha del evento' : 'Event date'}</label>
          <input type="date" min={minDate} className="w-full rounded-lg border border-slate-300 px-3 py-2 md:max-w-sm dark:border-white/15 dark:bg-gray-800 dark:text-white" value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} />
        </div>
      )}

      {step === 5 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">{isEs ? 'Nombre completo' : 'Full name'}</label>
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-white/15 dark:bg-gray-800 dark:text-white" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">Email</label>
            <input type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-white/15 dark:bg-gray-800 dark:text-white" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">WhatsApp</label>
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-white/15 dark:bg-gray-800 dark:text-white" value={form.whatsappPhone} onChange={(e) => update('whatsappPhone', e.target.value)} placeholder={isEs ? '+1 809 ...' : '+1 809 ...'} />
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-gray-200">{isEs ? 'Metodo de contacto preferido' : 'Preferred contact method'}</p>
            <div className="flex flex-wrap gap-2">
              {QUOTE_CONTACT_METHODS.map((item) => {
                const active = form.preferredContactMethod === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => update('preferredContactMethod', item.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200' : 'border-slate-300 text-slate-700 hover:border-slate-400 dark:border-white/20 dark:text-gray-200 dark:hover:border-white/40'}`}
                  >
                    {isEs ? item.labelEs : item.labelEn}
                  </button>
                )
              })}
            </div>
          </div>

          {form.preferredContactMethod === 'PHONE_CALL' && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">{isEs ? 'Horario preferido para llamada' : 'Preferred callback time'}</label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 md:max-w-md dark:border-white/15 dark:bg-gray-800 dark:text-white" value={form.callbackTimePreference} onChange={(e) => update('callbackTimePreference', e.target.value)}>
                <option value="">{isEs ? 'Selecciona horario' : 'Select a time window'}</option>
                {QUOTE_CALLBACK_WINDOWS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {isEs ? option.labelEs : option.labelEn}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">{isEs ? 'Describe tu sesion, objetivos y presupuesto esperado' : 'Describe your session, goals, and budget expectations'}</label>
            <textarea className="min-h-[140px] w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-white/15 dark:bg-gray-800 dark:text-white" value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={previousStep} disabled={step === 1 || savingDraft} className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40 dark:border-white/20 dark:text-gray-200">
          {isEs ? 'Atras' : 'Back'}
        </button>

        {step < maxStep ? (
          <button type="button" onClick={() => void nextStep()} disabled={savingDraft} className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60">
            {savingDraft ? (isEs ? 'Guardando...' : 'Saving...') : isEs ? 'Continuar' : 'Continue'}
          </button>
        ) : (
          <button type="submit" disabled={savingDraft} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">
            {savingDraft ? (isEs ? 'Enviando...' : 'Submitting...') : isEs ? 'Enviar solicitud' : 'Submit request'}
          </button>
        )}
      </div>
    </form>
  )
}
