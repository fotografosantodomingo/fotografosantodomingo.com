'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type GalleryRow = {
  id: string
  slug: string
  client_name: string
  client_email: string
  status: 'draft' | 'uploading' | 'ready' | 'expired' | 'deleted'
  photo_count: number
  total_bytes: number
  created_at: string
  ready_at: string | null
  expires_at: string | null
  booking_id: string | null
}

function fmtBytes(n: number) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_STYLE: Record<GalleryRow['status'], string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-gray-300',
  uploading: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  expired: 'bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-gray-500',
  deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function AdminGalleriesPage() {
  const [galleries, setGalleries] = useState<GalleryRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [creating, setCreating] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/galleries')
    if (!res.ok) {
      setError('Failed to load galleries')
      return
    }
    const data = await res.json()
    setGalleries(data.galleries)
  }

  useEffect(() => {
    load()
  }, [])

  async function createGallery(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/admin/galleries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ client_name: clientName, client_email: clientEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create gallery')
      setShowCreate(false)
      setClientName('')
      setClientEmail('')
      await load()
      window.location.href = `/admin/galleries/${data.gallery.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Client galleries</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {galleries ? `${galleries.length} galleries` : 'Loading…'} · password-gated photo delivery
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          + New gallery
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">
            <tr>
              <th className="py-2">Client</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Photos</th>
              <th className="py-2 text-right">Size</th>
              <th className="py-2">Created</th>
              <th className="py-2">Expires</th>
              <th className="py-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {(galleries ?? []).map((g) => (
              <tr key={g.id}>
                <td className="py-3">
                  <div className="font-medium text-slate-900 dark:text-white">{g.client_name}</div>
                  <div className="text-xs text-slate-500 dark:text-gray-400">{g.client_email}</div>
                </td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[g.status]}`}>
                    {g.status}
                  </span>
                  {g.booking_id && (
                    <span className="ml-1.5 text-xs text-slate-400 dark:text-gray-500">· from booking</span>
                  )}
                </td>
                <td className="py-3 text-right tabular-nums text-slate-700 dark:text-gray-300">{g.photo_count}</td>
                <td className="py-3 text-right tabular-nums text-slate-700 dark:text-gray-300">
                  {fmtBytes(g.total_bytes)}
                </td>
                <td className="py-3 text-slate-600 dark:text-gray-400">{fmtDate(g.created_at)}</td>
                <td className="py-3 text-slate-600 dark:text-gray-400">{fmtDate(g.expires_at)}</td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/galleries/${g.id}`}
                    className="font-medium text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
            {galleries && galleries.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-gray-500">
                  No galleries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {showCreate && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowCreate(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={createGallery}
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-gray-900"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">New gallery</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
              For a client without a website booking. Starts as a draft — no password needed until you mark it
              ready.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-gray-300">Client name</label>
                <input
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-gray-300">Client email</label>
                <input
                  required
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
