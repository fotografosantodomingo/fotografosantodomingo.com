'use client'

import { useState } from 'react'
import type { PortfolioImage } from '@/lib/types/portfolio'

interface Props {
  image: PortfolioImage
  adminSecret: string
}

type Lang = 'es' | 'en'

const FIELDS: { key: keyof PortfolioImage; label: string; rows?: number }[] = [
  { key: 'alt',         label: 'Alt text (SEO + accessibility)', rows: 2 },
  { key: 'title',       label: 'Title attribute (hover tooltip)' },
  { key: 'caption',     label: 'Caption (figcaption — visible + crawlable)', rows: 2 },
  { key: 'description', label: 'Long description (JSON-LD)', rows: 3 },
]

export default function ImageSeoEditor({ image, adminSecret }: Props) {
  const [lang, setLang] = useState<Lang>('es')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Local editable state for all 8 fields
  const [values, setValues] = useState({
    alt_es: image.alt_es,
    alt_en: image.alt_en,
    title_es: image.title_es,
    title_en: image.title_en,
    caption_es: image.caption_es,
    caption_en: image.caption_en,
    description_es: image.description_es,
    description_en: image.description_en,
  })

  function setValue(field: string, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    setStatus('idle')
  }

  async function save() {
    setSaving(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/admin/update-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({ id: image.id, ...values }),
      })
      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data.error ?? 'Save failed')
        setStatus('error')
      } else {
        setStatus('saved')
      }
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Network error')
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      {/* Image identity */}
      <div className="flex gap-3 items-start mb-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
          📷
        </div>
        <div>
          <p className="font-mono text-xs text-gray-500 break-all">{image.public_id}</p>
          <p className="text-sm text-gray-700 mt-0.5">
            Category: <span className="font-medium">{image.category}</span>
            {image.featured && <span className="ml-2 text-yellow-600">★ featured</span>}
          </p>
          <p className="text-xs text-gray-400">{image.width}×{image.height}</p>
        </div>
      </div>

      {/* Language toggle */}
      <div className="flex gap-2 mb-4">
        {(['es', 'en'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              lang === l
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {l === 'es' ? '🇩🇴 Español' : '🇺🇸 English'}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {FIELDS.map(({ key, label, rows }) => {
          const fieldKey = `${key}_${lang}` as keyof typeof values
          return (
            <div key={fieldKey}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {label}
              </label>
              {rows && rows > 1 ? (
                <textarea
                  rows={rows}
                  value={values[fieldKey]}
                  onChange={(e) => setValue(fieldKey, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder={`${label} (${lang.toUpperCase()})`}
                />
              ) : (
                <input
                  type="text"
                  value={values[fieldKey]}
                  onChange={(e) => setValue(fieldKey, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`${label} (${lang.toUpperCase()})`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Save */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {status === 'saved' && (
          <span className="text-green-600 text-sm">✓ Saved</span>
        )}
        {status === 'error' && (
          <span className="text-red-600 text-sm">✗ {errorMsg}</span>
        )}
      </div>
    </div>
  )
}
