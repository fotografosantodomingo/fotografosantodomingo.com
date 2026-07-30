'use client'

import { useEffect, useMemo, useState } from 'react'

type Photo = { id: string; filename: string; width: number | null; height: number | null; file_size: number }
type PublicGallery = {
  slug: string
  client_name: string
  topic: string | null
  status: string
  photo_count: number
  total_bytes: number
  expires_at: string | null
  photos: Photo[]
}

type ViewState = 'loading' | 'locked' | 'ready' | 'expired' | 'not-found' | 'error'

const ZIP_THRESHOLD_BYTES = 500 * 1024 * 1024 // 500MB — above this, batch download instead
const BATCH_SIZE = 50

function fmtBytes(n: number) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

// Strip characters that break on Windows/some filesystems — spaces and
// accents are fine, "/\:*?"<>|" aren't.
function sanitizeFilename(name: string) {
  return name.replace(/[/\\:*?"<>|]/g, '').trim() || 'galeria'
}

function fmtExpiresDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function GalleryView({ slug }: { slug: string }) {
  const [state, setState] = useState<ViewState>('loading')
  const [gallery, setGallery] = useState<PublicGallery | null>(null)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [zipping, setZipping] = useState<{ done: number; total: number } | null>(null)

  async function loadGallery() {
    const res = await fetch(`/api/gallery/${slug}`)
    if (res.status === 401) {
      setState('locked')
      return
    }
    if (res.status === 410) {
      setState('expired')
      return
    }
    if (res.status === 404) {
      setState('not-found')
      return
    }
    if (!res.ok) {
      setState('error')
      return
    }
    const data: PublicGallery = await res.json()
    setGallery(data)
    setState('ready')
  }

  useEffect(() => {
    loadGallery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setLoginError(false)
    try {
      const res = await fetch(`/api/gallery/${slug}/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      })
      if (!res.ok) {
        setLoginError(true)
        return
      }
      await loadGallery()
    } finally {
      setSubmitting(false)
    }
  }

  const totalMb = gallery ? gallery.total_bytes : 0
  const needsBatching = totalMb > ZIP_THRESHOLD_BYTES
  const batches = useMemo(() => {
    if (!gallery || !needsBatching) return []
    const out: Photo[][] = []
    for (let i = 0; i < gallery.photos.length; i += BATCH_SIZE) out.push(gallery.photos.slice(i, i + BATCH_SIZE))
    return out
  }, [gallery, needsBatching])

  async function downloadAsZip(photos: Photo[], downloadType: 'zip' | 'batch', zipName: string) {
    setZipping({ done: 0, total: photos.length })
    try {
      await fetch(`/api/gallery/${slug}/log-download`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ download_type: downloadType }),
      })

      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      for (let i = 0; i < photos.length; i++) {
        const p = photos[i]
        const res = await fetch(`/api/gallery/${slug}/photo/${p.id}?silent=1`)
        if (res.ok) {
          const buf = await res.arrayBuffer()
          zip.file(p.filename, buf)
        }
        setZipping({ done: i + 1, total: photos.length })
      }

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = zipName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setZipping(null)
    }
  }

  if (state === 'loading') {
    return <CenteredMessage>Cargando…</CenteredMessage>
  }

  if (state === 'not-found') {
    return <CenteredMessage>Esta galería no existe.</CenteredMessage>
  }

  if (state === 'expired') {
    return (
      <CenteredMessage>
        Esta galería ha expirado.
        <br />
        <span className="mt-2 block text-sm text-slate-500">
          Contáctanos si necesitas que restauremos tus fotos.
        </span>
      </CenteredMessage>
    )
  }

  if (state === 'error') {
    return <CenteredMessage>Algo salió mal. Intenta de nuevo en un momento.</CenteredMessage>
  }

  if (state === 'locked') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-gray-950">
        <form
          onSubmit={submitPassword}
          className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-white/10 dark:bg-gray-900"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400">Babula Shots</p>
          <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Tu galería privada</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            Ingresa la contraseña que te enviamos por email.
          </p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setLoginError(false)
            }}
            className={`mt-5 w-full rounded-lg border-2 bg-white px-3 py-2.5 text-center text-lg tracking-widest text-black outline-none ${
              loginError ? 'border-red-400' : 'border-slate-200 focus:border-sky-500'
            }`}
            placeholder="••••••••••"
          />
          {loginError && <p className="mt-2 text-xs font-semibold text-red-500">Contraseña incorrecta.</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-full bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {submitting ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    )
  }

  if (!gallery) return null

  const expiresLabel = fmtExpiresDate(gallery.expires_at)
  const topic = sanitizeFilename(gallery.topic || gallery.client_name)

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="mb-6 border-b border-slate-200 pb-6 dark:border-white/10">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400">Babula Shots</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            {gallery.topic || gallery.client_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {gallery.photo_count} fotos · {fmtBytes(gallery.total_bytes)}
            {expiresLabel && <> · Disponible hasta el {expiresLabel}</>}
          </p>

          {!needsBatching ? (
            <button
              onClick={() => downloadAsZip(gallery.photos, 'zip', `${topic}.zip`)}
              disabled={!!zipping}
              className="mt-4 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {zipping ? `Preparando ZIP… ${zipping.done}/${zipping.total}` : 'Descargar todo (.zip)'}
            </button>
          ) : (
            <div className="mt-4">
              <p className="mb-2 text-xs text-slate-500 dark:text-gray-400">
                Galería grande — descarga en partes:
              </p>
              <div className="flex flex-wrap gap-2">
                {batches.map((batch, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      downloadAsZip(
                        batch,
                        'batch',
                        `${topic} ${i * BATCH_SIZE + 1}-${i * BATCH_SIZE + batch.length}.zip`
                      )
                    }
                    disabled={!!zipping}
                    className="rounded-full border border-sky-600 px-4 py-2 text-xs font-bold text-sky-600 hover:bg-sky-50 disabled:opacity-50 dark:hover:bg-sky-950/30"
                  >
                    {i * BATCH_SIZE + 1}–{i * BATCH_SIZE + batch.length}
                  </button>
                ))}
              </div>
              {zipping && (
                <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
                  Preparando ZIP… {zipping.done}/{zipping.total}
                </p>
              )}
            </div>
          )}
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {gallery.photos.map((p) => (
            <div
              key={p.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5"
            >
              <img
                src={`/api/gallery/${slug}/photo/${p.id}/view`}
                alt={p.filename}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <a
                href={`/api/gallery/${slug}/photo/${p.id}`}
                className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-center text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                Descargar
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center dark:bg-gray-950">
      <p className="text-slate-600 dark:text-gray-300">{children}</p>
    </div>
  )
}
