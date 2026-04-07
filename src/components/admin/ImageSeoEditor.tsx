'use client'

import { useState } from 'react'
import type { PortfolioImage } from '@/lib/types/portfolio'

interface Props {
  image: PortfolioImage
  adminSecret: string
}

type Lang = 'es' | 'en'
type ActionStatus = 'idle' | 'saved' | 'generated' | 'error'

const FIELDS: { key: string; label: string; rows?: number }[] = [
  { key: 'alt',         label: 'Alt text (SEO + accessibility)', rows: 2 },
  { key: 'title',       label: 'Title attribute (hover tooltip)' },
  { key: 'caption',     label: 'Caption (figcaption — visible + crawlable)', rows: 2 },
  { key: 'description', label: 'Long description (JSON-LD)', rows: 3 },
]

export default function ImageSeoEditor({ image, adminSecret }: Props) {
  const [lang, setLang] = useState<Lang>('es')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState<ActionStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Keywords input for AI generation
  const [keywords, setKeywords] = useState(image.seo_keywords ?? '')

  // All 8 editable fields
  const [values, setValues] = useState({
    alt_es:         image.alt_es,
    alt_en:         image.alt_en,
    title_es:       image.title_es,
    title_en:       image.title_en,
    caption_es:     image.caption_es,
    caption_en:     image.caption_en,
    description_es: image.description_es,
    description_en: image.description_en,
  })

  // Track if captions were AI generated (per session — resets on page reload)
  const [isAiGenerated, setIsAiGenerated] = useState(image.ai_generated ?? false)

  function setValue(field: string, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    setStatus('idle')
  }

  // ── Save ──────────────────────────────────────────────────────────────────
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

  // ── Generate AI captions ──────────────────────────────────────────────────
  async function generateAI() {
    setGenerating(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/admin/generate-captions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          publicId: image.public_id,
          keywords: keywords.trim() || undefined,
          category: image.category,
          location: image.location,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Generation failed')
        setStatus('error')
        return
      }
      // Populate form with AI-generated values
      setValues({
        alt_es:         data.captions.alt_es,
        alt_en:         data.captions.alt_en,
        title_es:       data.captions.title_es,
        title_en:       data.captions.title_en,
        caption_es:     data.captions.caption_es,
        caption_en:     data.captions.caption_en,
        description_es: data.captions.description_es,
        description_en: data.captions.description_en,
      })
      setIsAiGenerated(true)
      setStatus('generated')
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Network error')
      setStatus('error')
    } finally {
      setGenerating(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      {/* Image identity */}
      <div className="flex gap-3 items-start mb-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
          📷
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-mono text-xs text-gray-500 break-all">{image.public_id}</p>
            {isAiGenerated && (
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                ✨ AI draft
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-0.5">
            Category: <span className="font-medium">{image.category}</span>
            {' · '}{image.location}
            {image.featured && <span className="ml-2 text-yellow-600">★ featured</span>}
          </p>
          <p className="text-xs text-gray-400">{image.width}×{image.height}</p>
        </div>
      </div>

      {/* ── AI Generation panel ── */}
      <div className="mb-5 p-3 bg-violet-50 border border-violet-200 rounded-lg">
        <p className="text-xs font-semibold text-violet-800 mb-2">
          ✨ AI Caption Generator (GPT-4o Vision)
        </p>
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <label className="block text-xs text-violet-700 mb-1">
              Page keywords to inject (optional — comma-separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. fotógrafo bodas punta cana, ceremonia playa, fotografo dominicano"
              className="w-full border border-violet-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            />
          </div>
          <button
            onClick={generateAI}
            disabled={generating || saving}
            className="flex-shrink-0 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-5"
          >
            {generating ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating…
              </span>
            ) : (
              '✨ Generate'
            )}
          </button>
        </div>
        {status === 'generated' && (
          <p className="text-xs text-violet-700 mt-2">
            ✓ AI captions generated in both languages. Review below and click <strong>Save changes</strong>.
          </p>
        )}
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
        <span className="ml-auto text-xs text-gray-400 self-center">
          Showing {lang === 'es' ? 'Spanish' : 'English'} fields
        </span>
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
          disabled={saving || generating}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {status === 'saved' && (
          <span className="text-green-600 text-sm font-medium">✓ Saved to Supabase</span>
        )}
        {status === 'error' && (
          <span className="text-red-600 text-sm">✗ {errorMsg}</span>
        )}
      </div>
    </div>
  )
}
