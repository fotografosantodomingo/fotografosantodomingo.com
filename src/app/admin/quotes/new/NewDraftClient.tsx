'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUOTE_SERVICE_TYPES } from '@/lib/quotes/constants'

type ParsedData = {
  full_name: string | null
  whatsapp_phone: string | null
  email: string | null
  service_type: string | null
  event_date: string | null
  city: string | null
  country: string | null
  description: string | null
  budget_mentioned: number | null
}

export default function NewDraftClient() {
  const router = useRouter()
  const [rawText, setRawText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [description, setDescription] = useState('')
  const [locale, setLocale] = useState<'es' | 'en'>('es')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleParse() {
    if (!rawText.trim()) return
    setParsing(true)
    setParseError(null)
    try {
      const res = await fetch('/api/admin/quotes/parse-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      })
      const json = await res.json()
      if (!res.ok || !json.data) {
        setParseError(json.error || 'Parse failed')
        return
      }
      const d: ParsedData = json.data
      if (d.full_name) setFullName(d.full_name)
      if (d.whatsapp_phone) setPhone(d.whatsapp_phone)
      if (d.email) setEmail(d.email)
      if (d.service_type) setServiceType(d.service_type)
      if (d.event_date) setEventDate(d.event_date)
      if (d.city) setCity(d.city)
      if (d.country) setCountry(d.country)
      if (d.description) setDescription(d.description)
    } catch {
      setParseError('Connection error — try again')
    } finally {
      setParsing(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/admin/quotes/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName || null,
          whatsapp_phone: phone || null,
          email: email || null,
          client_company: company || null,
          service_type: serviceType || null,
          event_date: eventDate || null,
          city: city || null,
          country: country || null,
          description: description || null,
          whatsapp_raw_text: rawText || null,
          locale,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.id) {
        setSubmitError(json.error || 'Failed to create draft')
        return
      }
      router.push(`/admin/quotes/${json.id}`)
    } catch {
      setSubmitError('Connection error — try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-6">
      {/* WhatsApp paste + AI parse */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="mb-1 text-base font-bold text-slate-900 dark:text-white">WhatsApp Import</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-gray-400">
          Paste the raw conversation — AI will extract name, date, service, and location automatically.
        </p>
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          rows={5}
          placeholder={`Ejemplo:\n"hola, quiero fotos de boda el 15 de junio en Punta Cana, somos 120 personas"`}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
        />
        {parseError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{parseError}</p>
        )}
        <button
          type="button"
          onClick={handleParse}
          disabled={parsing || !rawText.trim()}
          className="mt-3 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {parsing ? '⚡ Parsing…' : '⚡ Parse with AI'}
        </button>
      </div>

      {/* Client fields */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Client</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
              placeholder="María García"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">WhatsApp phone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
              placeholder="+1 809 000 0000"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
              placeholder="cliente@ejemplo.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">Company / event name <span className="font-normal text-slate-400">(optional)</span></label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
              placeholder="Pyhex Corp."
            />
          </div>
        </div>
      </div>

      {/* Service fields */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Service</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">Service type</label>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
            >
              <option value="">— Unknown yet —</option>
              {QUOTE_SERVICE_TYPES.map(s => (
                <option key={s.value} value={s.value}>{s.icon} {s.labelEn}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">Event date</label>
            <input
              type="date"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">City</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
              placeholder="Punta Cana"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">Country</label>
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
              placeholder="República Dominicana"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">Notes / description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
            placeholder="What the client wants…"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">Proposal language</label>
          <div className="flex gap-4 text-sm">
            {(['es', 'en'] as const).map(l => (
              <label key={l} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={locale === l} onChange={() => setLocale(l)} className="accent-sky-600" />
                <span className="text-slate-700 dark:text-gray-200">{l === 'es' ? 'Español' : 'English'}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
          {submitError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create Draft →'}
        </button>
        <a href="/admin/quotes" className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-400 dark:border-white/20 dark:text-gray-300">
          Cancel
        </a>
      </div>
    </form>
  )
}
