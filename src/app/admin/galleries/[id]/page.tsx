'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { generatePreviewBlob } from '@/lib/gallery/resize-client'

type Gallery = {
  id: string
  slug: string
  client_name: string
  client_email: string
  client_email_2: string | null
  topic: string | null
  status: 'draft' | 'uploading' | 'ready' | 'expired' | 'deleted'
  photo_count: number
  total_bytes: number
  cover_photo_id: string | null
  internal_notes: string | null
  expires_at: string | null
  ready_at: string | null
}

type Photo = { id: string; filename: string; file_size: number; media_type: string; created_at: string }

function fmtBytes(n: number) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminGalleryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [email2, setEmail2] = useState('')
  const [topic, setTopic] = useState('')

  const [uploadQueue, setUploadQueue] = useState<{ total: number; done: number; currentName: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [readyPassword, setReadyPassword] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)
  const [extending, setExtending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [regenerating, setRegenerating] = useState<{ total: number; done: number } | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/galleries/${id}`)
    if (!res.ok) {
      setError('Failed to load gallery')
      return
    }
    const data = await res.json()
    setGallery(data.gallery)
    setPhotos(data.photos)
    setNotes(data.gallery.internal_notes ?? '')
    setEmail2(data.gallery.client_email_2 ?? '')
    setTopic(data.gallery.topic ?? '')
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return
    setUploadQueue({ total: list.length, done: 0, currentName: list[0].name })

    for (let i = 0; i < list.length; i++) {
      const file = list[i]
      setUploadQueue({ total: list.length, done: i, currentName: file.name })
      try {
        const res = await fetch(`/api/admin/galleries/${id}/upload`, {
          method: 'POST',
          headers: {
            'x-filename': encodeURIComponent(file.name),
            'content-type': file.type || 'image/jpeg',
          },
          body: file,
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error ?? `Upload failed for ${file.name}`)
        }
        const { photo } = await res.json()
        await uploadPreviewFor(photo.id, file)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    }

    setUploadQueue(null)
    await load()
  }

  // Generates a small resized JPEG client-side and uploads it as the grid
  // preview — separate from the original, which stays untouched for
  // download. Non-fatal on failure: the grid just falls back to loading the
  // original for that one photo instead of blocking the whole upload.
  async function uploadPreviewFor(photoId: string, source: File | Blob) {
    try {
      const { blob, width, height } = await generatePreviewBlob(source)
      await fetch(`/api/admin/galleries/${id}/photos/${photoId}/preview?width=${width}&height=${height}`, {
        method: 'POST',
        headers: { 'content-type': 'image/jpeg' },
        body: blob,
      })
    } catch (err) {
      console.error('Preview generation failed for', photoId, err)
    }
  }

  // For photos uploaded before real previews existed — fetches each
  // original (via the admin preview route, which currently just returns the
  // original for these), resizes it client-side, and uploads a proper
  // preview. Same mechanism as uploadPreviewFor, just sourced from R2
  // instead of a fresh File.
  async function regeneratePreviews() {
    setRegenerating({ total: photos.length, done: 0 })
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      try {
        const res = await fetch(`/api/admin/galleries/${id}/preview/${photo.id}`)
        if (res.ok) {
          const blob = await res.blob()
          await uploadPreviewFor(photo.id, blob)
        }
      } catch (err) {
        console.error('Regenerate preview failed for', photo.id, err)
      }
      setRegenerating({ total: photos.length, done: i + 1 })
    }
    setRegenerating(null)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }

  async function deletePhoto(photoId: string) {
    if (!confirm('Delete this photo? This cannot be undone.')) return
    const res = await fetch(`/api/admin/galleries/${id}/photos/${photoId}`, { method: 'DELETE' })
    if (!res.ok) {
      setError('Failed to delete photo')
      return
    }
    await load()
  }

  async function setCover(photoId: string) {
    await fetch(`/api/admin/galleries/${id}/cover`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ photo_id: photoId }),
    })
    await load()
  }

  async function markReady() {
    setMarking(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/galleries/${id}/ready`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to mark ready')
      if (data.password) setReadyPassword(data.password)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setMarking(false)
    }
  }

  async function extend(days: number) {
    setExtending(true)
    try {
      const res = await fetch(`/api/admin/galleries/${id}/extend`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ days }),
      })
      if (!res.ok) throw new Error('Failed to extend')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setExtending(false)
    }
  }

  async function deleteGallery() {
    if (!confirm(`Delete all photos in "${gallery?.client_name}"'s gallery? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/galleries/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete gallery')
      window.location.href = '/admin/galleries'
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setDeleting(false)
    }
  }

  async function saveNotes() {
    // Simple direct save — reuses no dedicated endpoint, piggybacks on cover
    // route's pattern would be overkill for one field; inline fetch is fine.
    await fetch(`/api/admin/galleries/${id}/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ internal_notes: notes }),
    })
  }

  async function saveEmail2() {
    await fetch(`/api/admin/galleries/${id}/email-2`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ client_email_2: email2 }),
    })
  }

  async function saveTopic() {
    await fetch(`/api/admin/galleries/${id}/topic`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic }),
    })
    await load()
  }

  if (!gallery) {
    return <div className="text-slate-500 dark:text-gray-400">{error ?? 'Loading…'}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{gallery.topic || gallery.client_name}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {gallery.client_name} · {gallery.client_email} · {gallery.photo_count} photos ·{' '}
            {fmtBytes(gallery.total_bytes)} · <span className="font-semibold">{gallery.status}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onBlur={saveTopic}
                placeholder="e.g. Boda García"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-white/10 dark:bg-gray-950 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                Second email <span className="font-normal text-slate-400 dark:text-gray-500">(optional)</span>
              </label>
              <input
                type="email"
                value={email2}
                onChange={(e) => setEmail2(e.target.value)}
                onBlur={saveEmail2}
                placeholder="e.g. partner's email"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-white/10 dark:bg-gray-950 dark:text-white"
              />
            </div>
          </div>
          {gallery.status === 'ready' && (
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
              Ready {fmtDate(gallery.ready_at)} · Expires {fmtDate(gallery.expires_at)} · Link:{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-white/10">/g/{gallery.slug}</code>
            </p>
          )}
        </div>
        <div className="flex flex-none gap-2">
          {gallery.status === 'ready' && (
            <>
              <button
                onClick={() => extend(7)}
                disabled={extending}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 disabled:opacity-50 dark:border-white/10 dark:text-gray-300"
              >
                +7d
              </button>
              <button
                onClick={() => extend(14)}
                disabled={extending}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 disabled:opacity-50 dark:border-white/10 dark:text-gray-300"
              >
                +14d
              </button>
              <button
                onClick={() => extend(30)}
                disabled={extending}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 disabled:opacity-50 dark:border-white/10 dark:text-gray-300"
              >
                +30d
              </button>
            </>
          )}
          {gallery.status !== 'deleted' && gallery.status !== 'expired' && (
            <button
              onClick={markReady}
              disabled={marking || gallery.photo_count === 0}
              className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {marking ? 'Marking ready…' : gallery.status === 'ready' ? 'Re-confirm ready' : 'Mark ready'}
            </button>
          )}
          <button
            onClick={deleteGallery}
            disabled={deleting}
            className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Delete gallery
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Upload dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
            : 'border-slate-300 bg-white hover:border-slate-400 dark:border-white/10 dark:bg-gray-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploadQueue ? (
          <div>
            <p className="font-semibold text-slate-700 dark:text-gray-200">
              Uploading {uploadQueue.done + 1} of {uploadQueue.total}…
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{uploadQueue.currentName}</p>
            <div className="mx-auto mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width]"
                style={{ width: `${(uploadQueue.done / uploadQueue.total) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Drag JPGs here, or click to select files
          </p>
        )}
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-gray-400">{photos.length} photos</p>
          <button
            onClick={regeneratePreviews}
            disabled={!!regenerating}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 disabled:opacity-50 dark:border-white/10 dark:text-gray-300"
            title="Rebuild small preview images — fixes slow-loading grids from before previews existed"
          >
            {regenerating ? `Regenerating… ${regenerating.done}/${regenerating.total}` : 'Regenerate previews'}
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {photos.map((p) => (
          <div
            key={p.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5"
          >
            <img
              src={`/api/admin/galleries/${id}/preview/${p.id}`}
              alt={p.filename}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {gallery.cover_photo_id === p.id && (
              <span className="absolute left-1 top-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                Cover
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => setCover(p.id)}
                title="Set as cover"
                className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-white/30"
              >
                Cover
              </button>
              <button
                onClick={() => deletePhoto(p.id)}
                title="Delete"
                className="rounded bg-red-500/80 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Internal notes */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
          Internal notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={3}
          placeholder="e.g. client requested extension, delivered via USB also…"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950 dark:text-white"
        />
      </div>

      {/* One-time password reveal */}
      {readyPassword && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setReadyPassword(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-white/10 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gallery is ready</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
              The client just got this by email. Shown here once — it&apos;s not retrievable later.
            </p>
            <p className="mt-4 rounded-lg bg-slate-100 py-3 font-mono text-2xl font-extrabold tracking-wider text-slate-900 dark:bg-white/10 dark:text-white">
              {readyPassword}
            </p>
            <button
              onClick={() => setReadyPassword(null)}
              className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
