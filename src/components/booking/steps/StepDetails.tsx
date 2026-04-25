'use client'

import { useState } from 'react'

export type Details = {
  name: string
  email: string
  phone: string
}

export default function StepDetails({
  locale,
  onBack,
  onSubmit,
}: {
  locale: 'es' | 'en'
  onBack: () => void
  onSubmit: (d: Details) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [terms, setTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid =
    name.trim().length >= 2 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) &&
    terms

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {locale === 'es' ? 'Tus datos' : 'Your details'}
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← {locale === 'es' ? 'Atrás' : 'Back'}
        </button>
      </div>

      <Field
        label={locale === 'es' ? 'Nombre completo' : 'Full name'}
        type="text"
        value={name}
        onChange={setName}
        required
        autoComplete="name"
      />

      <Field
        label={locale === 'es' ? 'Correo electrónico' : 'Email'}
        type="email"
        value={email}
        onChange={setEmail}
        required
        autoComplete="email"
      />

      <Field
        label={locale === 'es' ? 'Teléfono / WhatsApp (opcional)' : 'Phone / WhatsApp (optional)'}
        type="tel"
        value={phone}
        onChange={setPhone}
        autoComplete="tel"
      />

      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
        <input
          type="checkbox"
          checked={terms}
          onChange={e => setTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500"
        />
        <span className="text-gray-300">
          {locale === 'es' ? (
            <>
              Acepto los{' '}
              <a href="/es/terms" target="_blank" className="text-emerald-400 hover:underline">
                términos
              </a>{' '}
              y la{' '}
              <a href="/es/privacy" target="_blank" className="text-emerald-400 hover:underline">
                política de privacidad
              </a>
              . Entiendo que el depósito del 50% no es reembolsable dentro de las 24 horas previas a la sesión.
            </>
          ) : (
            <>
              I accept the{' '}
              <a href="/en/terms" target="_blank" className="text-emerald-400 hover:underline">
                terms
              </a>{' '}
              and{' '}
              <a href="/en/privacy" target="_blank" className="text-emerald-400 hover:underline">
                privacy policy
              </a>
              . I understand the 50% deposit is non-refundable within 24 hours of the session.
            </>
          )}
        </span>
      </label>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!valid || submitting}
        className="w-full rounded-full bg-emerald-500 py-3 font-semibold text-gray-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {submitting
          ? locale === 'es' ? 'Procesando…' : 'Processing…'
          : locale === 'es' ? 'Continuar al pago' : 'Continue to payment'}
      </button>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string
  value: string
  onChange: (v: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-gray-300">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-gray-500 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
      />
    </label>
  )
}
