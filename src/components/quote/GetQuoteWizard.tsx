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

  function nextStep() {
    if (!validateCurrentStep()) return
    setStep((prev) => Math.min(prev + 1, maxStep))
  }

  function previousStep() {
    setErrors([])
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateCurrentStep()) return

    // Phase 1 scaffold: API wiring starts in the next development slice.
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          {isEs ? 'Recibimos tu solicitud' : 'We received your request'}
        </h2>
        <p className="mt-3 text-slate-600">
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
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-sky-700">
            {isEs ? 'Formulario de cotizacion' : 'Quote form'}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {isEs ? 'Solicita tu presupuesto' : 'Request your quote'}
          </h1>
        </div>
        <div className="text-sm font-semibold text-slate-600">
          {isEs ? `Paso ${step} de ${maxStep}` : `Step ${step} of ${maxStep}`}
        </div>
      </div>

      <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-sky-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {errors.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3">
          {errors.map((error) => (
            <p key={error} className="text-sm text-red-700">{error}</p>
          ))}
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900">{isEs ? 'Selecciona el tipo de servicio' : 'Choose your service type'}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUOTE_SERVICE_TYPES.map((item) => {
              const active = form.serviceType === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => update('serviceType', item.value)}
                  className={`rounded-xl border p-4 text-left transition ${active ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="text-2xl">{item.icon}</div>
                  <p className="mt-2 font-semibold text-slate-900">{isEs ? item.labelEs : item.labelEn}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">{isEs ? 'Pais' : 'Country'}</label>
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.country} onChange={(e) => update('country', e.target.value as FormState['country'])}>
              <option value="">{isEs ? 'Selecciona' : 'Select'}</option>
              <option value="US">{isEs ? 'Estados Unidos' : 'United States'}</option>
              <option value="DO">{isEs ? 'Republica Dominicana' : 'Dominican Republic'}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">{isEs ? 'Estado / Provincia' : 'State / Province'}</label>
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.state} onChange={(e) => update('state', e.target.value)} placeholder={isEs ? 'Selecciona estado' : 'Select state'} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">{isEs ? 'Ciudad' : 'City'}</label>
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder={isEs ? 'Selecciona ciudad' : 'Select city'} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800">{isEs ? 'Fecha del evento' : 'Event date'}</label>
          <input type="date" min={minDate} className="w-full rounded-lg border border-slate-300 px-3 py-2 md:max-w-sm" value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} />
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">{isEs ? 'Nombre completo' : 'Full name'}</label>
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">Email</label>
            <input type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-800">WhatsApp</label>
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.whatsappPhone} onChange={(e) => update('whatsappPhone', e.target.value)} placeholder={isEs ? '+1 809 ...' : '+1 809 ...'} />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">{isEs ? 'Metodo de contacto preferido' : 'Preferred contact method'}</p>
            <div className="flex flex-wrap gap-2">
              {QUOTE_CONTACT_METHODS.map((item) => {
                const active = form.preferredContactMethod === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => update('preferredContactMethod', item.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? 'border-sky-500 bg-sky-50 text-sky-800' : 'border-slate-300 text-slate-700 hover:border-slate-400'}`}
                  >
                    {isEs ? item.labelEs : item.labelEn}
                  </button>
                )
              })}
            </div>
          </div>

          {form.preferredContactMethod === 'PHONE_CALL' && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-800">{isEs ? 'Horario preferido para llamada' : 'Preferred callback time'}</label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 md:max-w-md" value={form.callbackTimePreference} onChange={(e) => update('callbackTimePreference', e.target.value)}>
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
            <label className="mb-1 block text-sm font-semibold text-slate-800">{isEs ? 'Describe tu sesion, objetivos y presupuesto esperado' : 'Describe your session, goals, and budget expectations'}</label>
            <textarea className="min-h-[140px] w-full rounded-lg border border-slate-300 px-3 py-2" value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={previousStep} disabled={step === 1} className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">
          {isEs ? 'Atras' : 'Back'}
        </button>

        {step < maxStep ? (
          <button type="button" onClick={nextStep} className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500">
            {isEs ? 'Continuar' : 'Continue'}
          </button>
        ) : (
          <button type="submit" className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
            {isEs ? 'Enviar solicitud' : 'Submit request'}
          </button>
        )}
      </div>
    </form>
  )
}
