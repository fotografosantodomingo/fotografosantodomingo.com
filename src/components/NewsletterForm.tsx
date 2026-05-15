'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'already' | 'error'

export default function NewsletterForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const isEs = locale === 'es'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })
      if (res.ok) {
        setStatus('success')
        return
      }
      if (res.status === 409) {
        setStatus('already')
        return
      }
      const data = await res.json().catch(() => ({}))
      setErrorMsg(typeof data?.error === 'string' ? data.error : null)
      setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-green-400 text-sm py-2">
        {isEs ? '✅ ¡Suscrito! Te enviaremos novedades pronto.' : '✅ Subscribed! We\'ll be in touch soon.'}
      </p>
    )
  }

  if (status === 'already') {
    return (
      <p className="text-amber-300 text-sm py-2">
        {isEs
          ? 'Este email ya está suscrito. ¡Gracias por seguirnos!'
          : "This email is already subscribed. Thanks for following along!"}
      </p>
    )
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isEs ? 'Tu email' : 'Your email'}
          required
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-primary-700 hover:bg-primary-800 disabled:opacity-60 px-6 py-2 rounded-r-lg transition-colors text-sm font-medium text-white"
        >
          {status === 'loading'
            ? '...'
            : isEs ? 'Suscribirse' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-red-400 text-xs mt-2">
          {errorMsg
            ? (isEs ? `Error: ${errorMsg}` : `Error: ${errorMsg}`)
            : (isEs ? 'Error. Intenta de nuevo en un momento.' : 'Error. Please try again in a moment.')}
        </p>
      )}
    </div>
  )
}
