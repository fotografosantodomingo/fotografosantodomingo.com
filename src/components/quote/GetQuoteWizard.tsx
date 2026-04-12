'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { QUOTE_CALLBACK_WINDOWS, QUOTE_CONTACT_METHODS, QUOTE_SERVICE_TYPES, type QuoteContactMethod, type QuoteServiceType } from '@/lib/quotes/constants'

type Props = {
  locale: string
}

type FormState = {
  serviceType: QuoteServiceType | ''
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
  const [quoteId, setQuoteId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<FormState>(INITIAL_STATE)

  const maxStep = 5
  const progress = Math.round((step / maxStep) * 100)

  const minDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    return date.toISOString().split('T')[0]
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
      if (!form.country) stepErrors.push(isEs ? 'Selecciona un pais.' : 'Please select a country.')
      if (!form.state) stepErrors.push(isEs ? 'Selecciona un estado/provincia.' : 'Please select a state/province.')
      if (!form.city) stepErrors.push(isEs ? 'Selecciona una ciudad.' : 'Please select a city.')
    }

    if (step === 3) {
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

    if (step === 4) {
      if (!form.fullName.trim()) stepErrors.push(isEs ? 'Nombre completo es obligatorio.' : 'Full name is required.')
      if (!form.email.trim()) stepErrors.push(isEs ? 'Email es obligatorio.' : 'Email is required.')
      if (!form.whatsappPhone.trim()) stepErrors.push(isEs ? 'WhatsApp es obligatorio.' : 'WhatsApp number is required.')
    }

    if (step === 5) {
      if (!form.preferredContactMethod) stepErrors.push(isEs ? 'Selecciona metodo de contacto.' : 'Choose a contact method.')
      if (form.preferredContactMethod === 'PHONE_CALL' && !form.callbackTimePreference) {
        stepErrors.push(isEs ? 'Selecciona horario para llamada.' : 'Choose a callback window.')
      }
      if (!form.description.trim()) stepErrors.push(isEs ? 'Describe tu sesion.' : 'Please describe your session.')
    }

    setErrors(stepErrors)
    return stepErrors.length === 0
  }

  async function syncDraft(targetStep: number) {
    setSavingDraft(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'draft',
          quoteId,
          locale,
          formStepReached: targetStep,
          serviceType: form.serviceType || null,
          country: form.country || null,
          state: form.state || null,
          city: form.city || null,
          eventDate: form.eventDate || null,
          fullName: form.fullName || null,
          email: form.email || null,
          whatsappPhone: form.whatsappPhone || null,
          preferredContactMethod: form.preferredContactMethod || null,
          callbackTimePreference: form.callbackTimePreference || null,
          description: form.description || null,
        }),
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || 'Unable to save draft')
      }

      if (json?.id) {
        setQuoteId(json.id)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save quote draft'
      setSubmitError(message)
      throw error
    } finally {
      setSavingDraft(false)
    }
  }

  async function nextStep() {
    if (!validateCurrentStep()) return

    // Persist form progress as draft from step 2 onwards.
    if (step >= 2) {
      await syncDraft(Math.min(step + 1, maxStep))
    }

    setStep((prev) => Math.min(prev + 1, maxStep))
  }

  function previousStep() {
    setErrors([])
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateCurrentStep()) return

    setSavingDraft(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'final',
          quoteId,
          locale,
          formStepReached: 5,
          serviceType: form.serviceType,
          country: form.country,
          state: form.state,
          city: form.city,
          eventDate: form.eventDate,
          fullName: form.fullName,
          email: form.email,
          whatsappPhone: form.whatsappPhone,
          preferredContactMethod: form.preferredContactMethod,
          callbackTimePreference: form.callbackTimePreference,
          description: form.description,
        }),
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
          locale,
        })
      }

      if (json?.id) {
        setQuoteId(json.id)
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
                  onClick={() => update('serviceType', item.value)}
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

      {step === 3 && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-gray-200">{isEs ? 'Fecha del evento' : 'Event date'}</label>
          <input type="date" min={minDate} className="w-full rounded-lg border border-slate-300 px-3 py-2 md:max-w-sm dark:border-white/15 dark:bg-gray-800 dark:text-white" value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} />
        </div>
      )}

      {step === 4 && (
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

      {step === 5 && (
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
