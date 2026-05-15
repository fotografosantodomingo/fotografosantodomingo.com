'use client'

export const runtime = 'edge'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminAccountPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setStatus('pending')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setStatus('error') }
    else { setStatus('success'); setPassword(''); setConfirm('') }
  }

  return (
    <div className="max-w-sm">
      <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Account</h1>
      <p className="mb-8 text-sm text-slate-500 dark:text-gray-400">Change your admin password.</p>

      {status === 'success' && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-400/20 dark:bg-green-500/10 dark:text-green-300">
          Password updated successfully.
        </div>
      )}
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
          disabled={status === 'pending'}
          className="rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {status === 'pending' ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
