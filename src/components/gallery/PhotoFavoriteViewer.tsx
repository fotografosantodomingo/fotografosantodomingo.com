'use client'

import { useCallback, useRef, useState } from 'react'

type Photo = { id: string; filename: string; selected: boolean }

const SWIPE_THRESHOLD = 90

/**
 * Full-screen viewer for a 'ready' (delivery) gallery — tap a thumbnail in
 * the grid to open here. Swipe right/left to like/dislike (same gesture as
 * the pre-delivery selection deck, for consistency), or use the arrows to
 * browse freely without deciding. No billing here — editing is already
 * done, so liking is pure favoriting. "Send favorites" can be tapped
 * repeatedly as the client changes their mind; it doesn't lock anything.
 */
export default function PhotoFavoriteViewer({
  slug,
  photos,
  startIndex,
  onClose,
}: {
  slug: string
  photos: Photo[]
  startIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  const [liked, setLiked] = useState<Map<string, boolean>>(
    () => new Map(photos.map((p) => [p.id, p.selected]))
  )
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startXRef = useRef(0)
  const [sending, setSending] = useState(false)
  const [sendMessage, setSendMessage] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  const current = photos[index]
  const likedCount = Array.from(liked.values()).filter(Boolean).length

  const toggleLike = useCallback(
    (photoId: string, value: boolean) => {
      setLiked((prev) => new Map(prev).set(photoId, value))
      fetch(`/api/gallery/${slug}/photo/${photoId}/select`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ selected: value }),
      }).catch(() => {
        /* best-effort — a retry or a later toggle will re-sync */
      })
    },
    [slug]
  )

  function goNext() {
    setDragX(0)
    setIndex((i) => Math.min(photos.length - 1, i + 1))
  }
  function goPrev() {
    setDragX(0)
    setIndex((i) => Math.max(0, i - 1))
  }

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
    if (dragX > SWIPE_THRESHOLD) {
      toggleLike(current.id, true)
      goNext()
    } else if (dragX < -SWIPE_THRESHOLD) {
      toggleLike(current.id, false)
      goNext()
    } else {
      setDragX(0)
    }
  }

  async function sendFavorites() {
    setSending(true)
    setSendMessage(null)
    setSendError(null)
    try {
      const res = await fetch(`/api/gallery/${slug}/send-favorites`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo enviar')
      setSendMessage(`Enviamos tus ${data.favoriteCount} favoritas.`)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  const isLiked = liked.get(current.id) ?? false
  const rotate = dragX / 18

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black" style={{ height: '100dvh' }}>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white/90">
        <button onClick={onClose} className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold">
          ✕ Cerrar
        </button>
        <span className="tabular-nums">
          {index + 1} / {photos.length} · {likedCount} ❤
        </span>
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

      <div className="flex items-center justify-center gap-4 py-4">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white disabled:opacity-30"
        >
          ‹
        </button>
        <button
          onClick={() => toggleLike(current.id, false)}
          aria-label="No me gusta"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl text-red-400 active:scale-95"
        >
          ✕
        </button>
        <a
          href={`/api/gallery/${slug}/photo/${current.id}`}
          aria-label="Descargar"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-xl text-sky-400 active:scale-95"
        >
          ⬇
        </a>
        <button
          onClick={() => toggleLike(current.id, true)}
          aria-label="Me gusta"
          className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl active:scale-95 ${
            isLiked ? 'bg-emerald-500 text-white' : 'bg-white/10 text-emerald-400'
          }`}
        >
          ❤
        </button>
        <button
          onClick={goNext}
          disabled={index === photos.length - 1}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="px-4 pb-5">
        <button
          onClick={sendFavorites}
          disabled={sending || likedCount === 0}
          className="w-full rounded-full bg-sky-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          {sending ? 'Enviando…' : `Enviar mis favoritas (${likedCount})`}
        </button>
        {sendMessage && <p className="mt-2 text-center text-xs font-semibold text-emerald-400">{sendMessage}</p>}
        {sendError && <p className="mt-2 text-center text-xs font-semibold text-red-400">{sendError}</p>}
      </div>
    </div>
  )
}
