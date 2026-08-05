'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Photo = { id: string; filename: string }

const SWIPE_THRESHOLD = 90

export default function SwipeSelector({
  slug,
  photos,
  includedPhotoCount,
  initialSelected,
  submitting,
  onSubmit,
}: {
  slug: string
  photos: Photo[]
  includedPhotoCount: number
  initialSelected: Set<string>
  submitting: boolean
  onSubmit: (selectedIds: string[]) => void
}) {
  // Skip the welcome screen when resuming a session that already has
  // decisions — no need to re-explain the gesture to someone mid-review.
  const [started, setStarted] = useState(initialSelected.size > 0)
  // Photos already marked selected (e.g. resumed session) are treated as
  // already-reviewed and skipped to the front of "done" — but still counted.
  const [index, setIndex] = useState(0)
  const [decisions, setDecisions] = useState<Map<string, boolean>>(new Map(initialSelected.size ? Array.from(initialSelected, (id) => [id, true]) : []))
  const [history, setHistory] = useState<string[]>([])
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startXRef = useRef(0)
  const decisionsRef = useRef(decisions)
  decisionsRef.current = decisions

  // Skip past anything already decided in a previous session on this device.
  useEffect(() => {
    let i = 0
    while (i < photos.length && decisionsRef.current.has(photos[i].id)) i++
    setIndex(i)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = photos[index]
  const reviewedCount = decisions.size
  const selectedCount = Array.from(decisions.values()).filter(Boolean).length
  const done = index >= photos.length

  const commit = useCallback(
    (photoId: string, selected: boolean) => {
      setDecisions((prev) => new Map(prev).set(photoId, selected))
      setHistory((h) => [...h, photoId])
      fetch(`/api/gallery/${slug}/photo/${photoId}/select`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ selected }),
      }).catch(() => {
        /* best-effort — the final submit re-reads server state anyway */
      })
    },
    [slug]
  )

  const decide = useCallback(
    (selected: boolean) => {
      if (!current) return
      commit(current.id, selected)
      setDragX(0)
      setIndex((i) => i + 1)
    },
    [current, commit]
  )

  function undo() {
    if (history.length === 0) return
    const lastId = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setDecisions((prev) => {
      const next = new Map(prev)
      next.delete(lastId)
      return next
    })
    setIndex((i) => Math.max(0, i - 1))
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') decide(true)
      else if (e.key === 'ArrowLeft') decide(false)
      else if (e.key === 'Backspace' || e.key === 'z') undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decide, history])

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true)
    startXRef.current = e.clientX
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return
    setDragX(e.clientX - startXRef.current)
  }
  function onPointerUp() {
    if (!dragging) return
    setDragging(false)
    if (dragX > SWIPE_THRESHOLD) decide(true)
    else if (dragX < -SWIPE_THRESHOLD) decide(false)
    else setDragX(0)
  }

  if (!started) {
    return (
      <WelcomeScreen photoCount={photos.length} includedPhotoCount={includedPhotoCount} onStart={() => setStarted(true)} />
    )
  }

  if (done) {
    return (
      <SelectionSummary
        slug={slug}
        photos={photos}
        decisions={decisions}
        includedPhotoCount={includedPhotoCount}
        submitting={submitting}
        onBack={() => setIndex(Math.max(0, photos.length - 1))}
        onRemove={(photoId) => commit(photoId, false)}
        onSubmit={onSubmit}
      />
    )
  }

  const rotate = dragX / 18

  return (
    // 100dvh (not vh) — accounts for mobile browser chrome so the deck is
    // genuinely edge-to-edge, not cut off under the address bar.
    <div className="fixed inset-0 z-50 flex flex-col bg-black" style={{ height: '100dvh' }}>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white/90">
        <span className="tabular-nums">
          {reviewedCount} de {photos.length} · {selectedCount} elegidas
          {includedPhotoCount ? ` (${includedPhotoCount} incluidas)` : ''}
        </span>
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold disabled:opacity-30"
        >
          Deshacer
        </button>
      </div>

      <div
        className="relative flex-1 touch-none select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          key={current.id}
          src={`/api/gallery/${slug}/photo/${current.id}/view`}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
            transition: dragging ? 'none' : 'transform 0.25s ease-out',
          }}
        />
        {dragX > 30 && (
          <div className="pointer-events-none absolute left-6 top-8 -rotate-12 rounded-lg border-4 border-emerald-400 px-4 py-1 text-3xl font-black text-emerald-400">
            SÍ
          </div>
        )}
        {dragX < -30 && (
          <div className="pointer-events-none absolute right-6 top-8 rotate-12 rounded-lg border-4 border-red-400 px-4 py-1 text-3xl font-black text-red-400">
            NO
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-10 py-6">
        <button
          onClick={() => decide(false)}
          aria-label="No me gusta"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl text-red-400 active:scale-95"
        >
          ✕
        </button>
        <button
          onClick={() => decide(true)}
          aria-label="Me gusta"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl text-emerald-400 active:scale-95"
        >
          ❤
        </button>
      </div>
    </div>
  )
}

function WelcomeScreen({
  photoCount,
  includedPhotoCount,
  onStart,
}: {
  photoCount: number
  includedPhotoCount: number
  onStart: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-6 text-center text-white"
      style={{ height: '100dvh' }}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-sky-400">Babula Shots</p>
      <h1 className="mt-3 text-2xl font-extrabold">Elige tus favoritas</h1>
      <p className="mt-3 max-w-xs text-sm text-white/70">
        Tienes <strong>{photoCount}</strong> fotos para revisar, una por una. Tu paquete incluye{' '}
        <strong>{includedPhotoCount}</strong>.
      </p>

      <div className="mt-8 flex items-center gap-6 text-sm text-white/80">
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-red-400">
            ✕
          </span>
          Deslizar izquierda = no
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-emerald-400">
            ❤
          </span>
          Deslizar derecha = sí
        </div>
      </div>

      <p className="mt-6 max-w-xs text-xs text-white/40">
        Al final podrás revisar y quitar cualquiera antes de confirmar. Tu progreso se guarda automáticamente.
      </p>

      <button
        onClick={onStart}
        className="mt-8 w-full max-w-xs rounded-full bg-sky-500 px-6 py-3.5 text-sm font-bold text-white"
      >
        Empezar
      </button>
    </div>
  )
}

function SelectionSummary({
  slug,
  photos,
  decisions,
  includedPhotoCount,
  submitting,
  onBack,
  onRemove,
  onSubmit,
}: {
  slug: string
  photos: Photo[]
  decisions: Map<string, boolean>
  includedPhotoCount: number
  submitting: boolean
  onBack: () => void
  onRemove: (photoId: string) => void
  onSubmit: (selectedIds: string[]) => void
}) {
  const selected = photos.filter((p) => decisions.get(p.id))
  const selectedCount = selected.length
  const overCount = Math.max(0, selectedCount - includedPhotoCount)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black text-white" style={{ minHeight: '100dvh' }}>
      <div className="mx-auto max-w-lg px-5 py-8">
        <h1 className="text-xl font-extrabold">Revisa tu selección</h1>
        <p className="mt-1 text-sm text-white/60">
          Elegiste <strong>{selectedCount}</strong> de {includedPhotoCount} incluidas
          {overCount > 0 && <> — {overCount} de más</>}.
        </p>
        {selected.length > 0 && <p className="mt-1 text-xs text-white/40">Toca una foto para quitarla.</p>}

        <div className="mt-5 grid grid-cols-3 gap-2">
          {selected.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onRemove(p.id)}
              disabled={submitting}
              className="group relative aspect-square overflow-hidden rounded-lg bg-white/5 disabled:opacity-60"
            >
              <img
                src={`/api/gallery/${slug}/photo/${p.id}/view`}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-red-600">
                  ✕
                </span>
              </div>
            </button>
          ))}
          {selected.length === 0 && <p className="col-span-3 py-8 text-center text-sm text-white/40">Ninguna foto elegida aún.</p>}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onBack}
            disabled={submitting}
            className="flex-1 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white/80 disabled:opacity-40"
          >
            Seguir eligiendo
          </button>
          <button
            onClick={() => onSubmit(selected.map((p) => p.id))}
            disabled={selectedCount === 0 || submitting}
            className="flex-1 rounded-full bg-sky-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            {submitting ? 'Enviando…' : 'Confirmar selección'}
          </button>
        </div>
      </div>
    </div>
  )
}
