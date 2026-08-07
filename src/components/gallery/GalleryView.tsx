'use client'

import { useEffect, useState } from 'react'
import SwipeSelector from './SwipeSelector'
import PhotoFavoriteViewer from './PhotoFavoriteViewer'

type Photo = {
  id: string
  filename: string
  width: number | null
  height: number | null
  file_size: number
  selected: boolean
}
type PublicGallery = {
  slug: string
  client_name: string
  topic: string | null
  status: string
  photo_count: number
  total_bytes: number
  expires_at: string | null
  included_photo_count: number | null
  photos: Photo[]
}

type ViewState = 'loading' | 'locked' | 'ready' | 'expired' | 'not-found' | 'error'

function fmtBytes(n: number) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
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
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [selectionSubmitting, setSelectionSubmitting] = useState(false)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [selectionConfirmed, setSelectionConfirmed] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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

  async function handleSelectionSubmit() {
    setSelectionSubmitting(true)
    setSelectionError(null)
    try {
      const res = await fetch(`/api/gallery/${slug}/submit-selection`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo enviar tu selección')
      if (data.requiresPayment && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      setSelectionConfirmed(true)
    } catch (err) {
      setSelectionError(err instanceof Error ? err.message : String(err))
    } finally {
      setSelectionSubmitting(false)
    }
  }

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

  // The ZIP is streamed server-side straight from R2 (see download-all's own
  // comment) — but the download itself must be a real browser navigation,
  // not a fetch()-and-buffer-into-a-Blob. That JS approach (previously used
  // here, to drive a custom percentage bar) held the entire archive in page
  // memory before it could be saved, which is exactly what was crashing
  // mobile browsers on large galleries. A plain link lets the browser write
  // the incoming stream straight to disk — no memory ceiling, no custom
  // code — and shows progress in its own native download UI, which is what
  // every real delivery platform (WeTransfer, Pixieset, etc.) actually does.
  function downloadAll() {
    setDownloadStarted(true)
    window.location.href = `/api/gallery/${slug}/download-all`
    setTimeout(() => setDownloadStarted(false), 4000)
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

  if (gallery.status === 'selecting') {
    if (selectionConfirmed) {
      return (
        <CenteredMessage>
          ¡Gracias! Recibimos tu selección.
          <br />
          <span className="mt-2 block text-sm text-slate-500">
            Te avisaremos por email en cuanto tu galería final esté lista para descargar.
          </span>
        </CenteredMessage>
      )
    }
    return (
      <>
        {selectionError && (
          <div className="fixed inset-x-0 top-0 z-[60] bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white">
            {selectionError}
          </div>
        )}
        <SwipeSelector
          slug={slug}
          photos={gallery.photos}
          includedPhotoCount={gallery.included_photo_count ?? 0}
          initialSelected={new Set(gallery.photos.filter((p) => p.selected).map((p) => p.id))}
          submitting={selectionSubmitting}
          onSubmit={handleSelectionSubmit}
        />
        {selectionSubmitting && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 text-white">
            Enviando tu selección…
          </div>
        )}
      </>
    )
  }

  if (gallery.status === 'selected') {
    return (
      <CenteredMessage>
        ¡Ya tenemos tu selección!
        <br />
        <span className="mt-2 block text-sm text-slate-500">
          Estamos editando tus fotos — te avisaremos por email en cuanto tu galería esté lista.
        </span>
      </CenteredMessage>
    )
  }

  const expiresLabel = fmtExpiresDate(gallery.expires_at)

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

          <button
            onClick={downloadAll}
            className="mt-4 w-full max-w-xs rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-500 sm:w-auto"
          >
            Descargar todo (.zip)
          </button>
          {downloadStarted && (
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-gray-400">
              Descarga iniciada — revisa las descargas de tu navegador.
            </p>
          )}
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {gallery.photos.map((p, i) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => setLightboxIndex(i)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setLightboxIndex(i)}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5"
            >
              <img
                src={`/api/gallery/${slug}/photo/${p.id}/view`}
                alt={p.filename}
                className="h-full w-full object-cover opacity-0 transition-opacity duration-300 [&.loaded]:opacity-100"
                loading="lazy"
                decoding="async"
                onLoad={(e) => e.currentTarget.classList.add('loaded')}
              />
              {p.selected && (
                <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-emerald-400">
                  ❤
                </span>
              )}
              <a
                href={`/api/gallery/${slug}/photo/${p.id}`}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-center text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                Descargar
              </a>
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <PhotoFavoriteViewer
          slug={slug}
          photos={gallery.photos}
          startIndex={lightboxIndex}
          onClose={() => {
            setLightboxIndex(null)
            loadGallery() // pick up any likes made inside the viewer, for the grid's heart badges
          }}
        />
      )}
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
