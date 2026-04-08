'use client'

import { useState } from 'react'

export default function NewsletterForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-green-400 text-sm py-2">
        {locale === 'es' ? '✅ ¡Suscrito! Te enviaremos novedades pronto.' : '✅ Subscribed! We\'ll be in touch soon.'}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={locale === 'es' ? 'Tu email' : 'Your email'}
        required
        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 px-6 py-2 rounded-r-lg transition-colors text-sm font-medium"
      >
        {status === 'loading'
          ? '...'
          : locale === 'es' ? 'Suscribirse' : 'Subscribe'}
      </button>
      {status === 'error' && (
        <p className="text-red-400 text-xs mt-1 absolute">
          {locale === 'es' ? 'Error. Intenta de nuevo.' : 'Error. Please try again.'}
        </p>
      )}
    </form>
  )
}
