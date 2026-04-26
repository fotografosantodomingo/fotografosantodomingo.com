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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-mono uppercase tracking-widest text-[11px] text-ink-muted">
          {locale === 'es' ? 'Tus datos' : 'Your details'}
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
        >
          ← {locale === 'es' ? 'Atrás' : 'Back'}
        </button>
      </div>

      <div className="space-y-5">
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
      </div>

      <label className="flex items-start gap-3 border border-hairline-soft p-4 text-sm cursor-pointer hover:border-hairline transition-colors">
        <input
          type="checkbox"
          checked={terms}
          onChange={e => setTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
        />
        <span className="text-ink-muted leading-relaxed">
          {locale === 'es' ? (
            <>
              Acepto los{' '}
              <a href="/es/terms" target="_blank" className="text-ink underline underline-offset-2 hover:opacity-70">
                términos
              </a>{' '}
              y la{' '}
              <a href="/es/privacy" target="_blank" className="text-ink underline underline-offset-2 hover:opacity-70">
                política de privacidad
              </a>
              . Entiendo que el depósito del 50% no es reembolsable dentro de las 24 horas previas a la sesión.
            </>
          ) : (
            <>
              I accept the{' '}
              <a href="/en/terms" target="_blank" className="text-ink underline underline-offset-2 hover:opacity-70">
                terms
              </a>{' '}
              and{' '}
              <a href="/en/privacy" target="_blank" className="text-ink underline underline-offset-2 hover:opacity-70">
                privacy policy
              </a>
              . I understand the 50% deposit is non-refundable within 24 hours of the session.
            </>
          )}
        </span>
      </label>

      {error && (
        <div className="border border-hairline p-4 text-sm text-ink">
          <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
            {locale === 'es' ? 'Error' : 'Error'}
          </p>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!valid || submitting}
        className="w-full inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] py-4 rounded-full bg-ink text-canvas hover:opacity-80 disabled:opacity-30 transition-opacity duration-200"
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
      <span className="mb-2 block font-mono uppercase tracking-widest text-[10px] text-ink-muted">
        {label}
      </span>
      <input
        {...rest}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent border-0 border-b border-hairline-soft px-0 py-2.5 text-base text-ink placeholder-ink-muted/50 outline-none focus:border-ink transition-colors"
      />
    </label>
  )
}
