'use client'

import { useState } from 'react'

interface ImageMeta {
  publicId: string
  category?: string
  location?: string
}

interface Props {
  images: ImageMeta[]
  adminSecret: string
}

export default function BulkGenerateButton({ images, adminSecret }: Props) {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [done, setDone] = useState(false)

  async function runBulk() {
    setRunning(true)
    setProgress(0)
    setErrors([])
    setDone(false)

    const newErrors: string[] = []

    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      try {
        const res = await fetch('/api/admin/generate-captions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminSecret}`,
          },
          body: JSON.stringify({
            publicId: img.publicId,
            category: img.category,
            location: img.location,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          newErrors.push(`${img.publicId}: ${data.error ?? 'failed'}`)
        }
      } catch (e: any) {
        newErrors.push(`${img.publicId}: ${e.message ?? 'network error'}`)
      }
      setProgress(i + 1)
    }

    setErrors(newErrors)
    setRunning(false)
    setDone(true)
  }

  const pct = images.length > 0 ? Math.round((progress / images.length) * 100) : 0

  return (
    <div className="space-y-3">
      {!done && (
        <button
          onClick={runBulk}
          disabled={running}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          {running
            ? `Generating… ${progress}/${images.length} (${pct}%)`
            : `✨ Bulk Generate ${images.length} image${images.length !== 1 ? 's' : ''}`}
        </button>
      )}

      {/* Progress bar */}
      {running && (
        <div className="w-full bg-violet-200 rounded-full h-2">
          <div
            className="bg-violet-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {done && (
        <p className="text-sm font-medium text-green-700">
          ✓ Done! {images.length - errors.length}/{images.length} images captioned.
          {errors.length === 0
            ? ' Refresh the page to see the results.'
            : ' Reload the page — images captioned successfully are now marked ✨ AI draft.'}
        </p>
      )}

      {errors.length > 0 && (
        <details className="text-xs text-red-600">
          <summary className="cursor-pointer font-medium">{errors.length} error(s) — click to expand</summary>
          <ul className="mt-1 space-y-0.5 list-disc list-inside">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </details>
      )}
    </div>
  )
}
