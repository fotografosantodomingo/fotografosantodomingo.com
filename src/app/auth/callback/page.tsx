'use client'

export const runtime = 'edge'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
  const [step, setStep] = useState<'loading' | 'form' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pending, setPending] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const type = params.get('type')
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (type === 'recovery' && accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) { setError(error.message); setStep('error') }
          else setStep('form')
        })
    } else {
      setError('Invalid or expired recovery link.')
      setStep('error')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setError('')
    setPending(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setPending(false) }
    else setStep('success')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-gray-900">
        {step === 'loading' && (
          <p className="text-center text-sm text-slate-500 dark:text-gray-400">Verifying link…</p>
        )}

        {step === 'form' && (
          <>
            <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Set new password</h1>
            <p className="mb-6 text-sm text-slate-500 dark:text-gray-400">Enter your new admin password below.</p>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none dark:border-white/15 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none dark:border-white/15 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
              >
                {pending ? 'Saving…' : 'Set password'}
              </button>
            </form>
          </>
        )}

        {step === 'success' && (
          <>
            <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Password updated</h1>
            <p className="mb-6 text-sm text-slate-500 dark:text-gray-400">You can now sign in with your new password.</p>
            <a
              href="/admin/login"
              className="block w-full rounded-full bg-sky-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-sky-500"
            >
              Go to admin login
            </a>
          </>
        )}

        {step === 'error' && (
          <>
            <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Link invalid</h1>
            <p className="mb-6 text-sm text-red-500">{error}</p>
            <a
              href="/admin/login"
              className="block w-full rounded-full bg-slate-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-600"
            >
              Back to login
            </a>
          </>
        )}
      </div>
    </div>
  )
}
