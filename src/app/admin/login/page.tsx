'use client'

import { useState } from 'react'
import { signIn } from './actions'

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string }
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const fd = new FormData(e.currentTarget)
      const result = await signIn({ error: null }, fd)
      if (result?.error) setError(result.error)
    } catch {
      setError('Unexpected error. Try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Admin Login</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-gray-400">Babula Shots back-office</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {searchParams?.next && (
            <input type="hidden" name="next" value={searchParams.next} />
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none dark:border-white/15 dark:bg-gray-800 dark:text-white dark:focus:border-sky-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none dark:border-white/15 dark:bg-gray-800 dark:text-white dark:focus:border-sky-400"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
