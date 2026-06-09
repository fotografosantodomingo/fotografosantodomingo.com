'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  savePrice,
  saveLineItems,
  updateChecklistItem,
  updateClientFields,
  rejectQuote,
  reopenQuote,
  generateProposalLink,
  sendProposal,
  type LineItem,
} from './actions'
import type { ChecklistItem } from '@/lib/quotes/checklist'

const SERVICE_TYPES = [
  'WEDDINGS', 'ENGAGEMENT_SESSION', 'QUINCEANERAS', 'MATERNITY', 'FAMILY',
  'BIRTHDAY_PARTY', 'BAPTISMS', 'GRADUATION', 'CHILDRENS_SESSIONS',
  'ARCHITECTURE', 'PORTRAITS', 'CORPORATE_PORTRAITS', 'FOOD_AND_BEVERAGE',
  'VIDEO_PRODUCTION', 'DRONE_AERIAL', 'OTHER',
]

// ─── Client / Event Edit Card ─────────────────────────────────────────────────

type ClientQuote = {
  id: string
  full_name: string | null
  client_company: string | null
  whatsapp_phone: string | null
  email: string | null
  service_type: string | null
  event_date: string | null
  event_time: string | null
  city: string | null
  country: string | null
  locale: string | null
  description: string | null
}

export function ClientEditCard({ quote }: { quote: ClientQuote }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [open, setOpen] = useState(false)

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateClientFields({ error: null, success: false }, fd)
      if (result.error) setError(result.error)
      else { setSuccess(true); setOpen(false) }
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">Edit client / event info</span>
        <span className="text-xs text-slate-400">{open ? '▲ collapse' : '▼ expand'}</span>
      </button>

      {open && (
        <form onSubmit={handleSave} className="border-t border-slate-100 px-6 pb-6 pt-4 space-y-4 dark:border-white/10">
          <input type="hidden" name="quoteId" value={quote.id} />
          {success && <Alert type="success">Client fields updated.</Alert>}
          {error && <Alert type="error">{error}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input name="full_name" type="text" defaultValue={quote.full_name ?? ''} className={inputCls} />
            </Field>
            <Field label="Company">
              <input name="client_company" type="text" defaultValue={quote.client_company ?? ''} className={inputCls} />
            </Field>
            <Field label="WhatsApp">
              <input name="whatsapp_phone" type="text" defaultValue={quote.whatsapp_phone ?? ''} className={inputCls} placeholder="+1809…" />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={quote.email ?? ''} className={inputCls} />
            </Field>
            <Field label="Service type">
              <select name="service_type" defaultValue={quote.service_type ?? ''} className={inputCls}>
                <option value="">— none —</option>
                {SERVICE_TYPES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </Field>
            <Field label="Event date">
              <input name="event_date" type="date" defaultValue={quote.event_date ?? ''} className={inputCls} />
            </Field>
            <Field label="Event time">
              <input name="event_time" type="time" defaultValue={quote.event_time ?? ''} className={inputCls} />
            </Field>
            <Field label="City">
              <input name="city" type="text" defaultValue={quote.city ?? ''} className={inputCls} />
            </Field>
            <Field label="Country">
              <input name="country" type="text" defaultValue={quote.country ?? ''} className={inputCls} />
            </Field>
            <Field label="Locale">
              <select name="locale" defaultValue={quote.locale ?? 'es'} className={inputCls}>
                <option value="es">ES — Español</option>
                <option value="en">EN — English</option>
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea name="description" rows={3} defaultValue={quote.description ?? ''} className={inputCls} placeholder="Brief summary of what the client wants…" />
          </Field>

          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}
    </div>
  )
}

// ─── Pricing form (legacy — single price field for website-originated quotes) ─

type LegacyQuote = {
  id: string
  final_price_usd: number | null
  admin_note_customer: string | null
  admin_internal_notes: string | null
  status: string
}

export function PricingForm({ quote }: { quote: LegacyQuote }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setPending(true)
    try {
      const fd = new FormData(e.currentTarget)
      const result = await savePrice({ error: null, success: false }, fd)
      if (result.error) setError(result.error)
      else setSuccess(true)
    } catch {
      setError('Unexpected error. Try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="quoteId" value={quote.id} />
      {success && <Alert type="success">Price saved successfully.</Alert>}
      {error && <Alert type="error">{error}</Alert>}
      <Field label="Price (USD)" hint="+ 18% ITBIS shown to client">
        <input
          id="finalPriceUsd" name="finalPriceUsd" type="number" min={1} step={0.01}
          defaultValue={quote.final_price_usd ?? ''}
          className={inputCls + ' md:max-w-[200px]'}
        />
      </Field>
      <Field label="Note to client" hint="(included in proposal email)">
        <textarea id="adminNoteCustomer" name="adminNoteCustomer" rows={3} defaultValue={quote.admin_note_customer ?? ''} className={inputCls} />
      </Field>
      <Field label="Internal notes" hint="(not visible to client)">
        <textarea id="adminInternalNotes" name="adminInternalNotes" rows={2} defaultValue={quote.admin_internal_notes ?? ''} className={inputCls} />
      </Field>
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? 'Saving…' : 'Save price'}
      </button>
    </form>
  )
}

// ─── Line Items editor (Phase 2 quotes) ───────────────────────────────────────

type LineItemsQuote = {
  id: string
  line_items: LineItem[] | null
  payment_mode: string | null
  final_price_usd: number | null
  deposit_amount_usd: number | null
  admin_note_customer: string | null
  admin_internal_notes: string | null
  description: string | null
}

export function LineItemsEditor({ quote }: { quote: LineItemsQuote }) {
  const router = useRouter()
  const [items, setItems] = useState<LineItem[]>(
    Array.isArray(quote.line_items) && quote.line_items.length > 0
      ? quote.line_items
      : [{ description: '', amount_usd: 0 }]
  )
  const [paymentMode, setPaymentMode] = useState<'FULL' | 'DEPOSIT'>(
    quote.payment_mode === 'DEPOSIT' ? 'DEPOSIT' : 'FULL'
  )
  const [serviceDescription, setServiceDescription] = useState(quote.description ?? '')
  const [adminNote, setAdminNote] = useState(quote.admin_note_customer ?? '')
  const [internalNotes, setInternalNotes] = useState(quote.admin_internal_notes ?? '')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const total = items.reduce((s, i) => s + Number(i.amount_usd || 0), 0)
  const deposit = Math.round(total * 100 * 0.5) / 100

  function addItem() {
    setItems(prev => [...prev, { description: '', amount_usd: 0 }])
  }
  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }
  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function handleSave() {
    setError(null)
    setSuccess(false)
    const fd = new FormData()
    fd.set('quoteId', quote.id)
    fd.set('lineItems', JSON.stringify(items))
    fd.set('paymentMode', paymentMode)
    fd.set('adminNoteCustomer', adminNote)
    fd.set('adminInternalNotes', internalNotes)
    fd.set('serviceDescription', serviceDescription)
    startTransition(async () => {
      const result = await saveLineItems({ error: null, success: false }, fd)
      if (result.error) setError(result.error)
      else { setSuccess(true); router.refresh() }
    })
  }

  return (
    <div className="space-y-4">
      {success && <Alert type="success">Line items saved — total: ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <Field label="Service description" hint="(client sees this on the proposal)">
        <textarea rows={3} value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} className={inputCls} placeholder="Describe the session scope for the client…" />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">Line items</p>
          <button type="button" onClick={addItem} className="text-xs font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400">+ Add item</button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={item.description}
                onChange={e => updateItem(idx, 'description', e.target.value)}
                placeholder="Description"
                className={inputCls + ' flex-1'}
              />
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-400">$</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.amount_usd || ''}
                  onChange={e => updateItem(idx, 'amount_usd', parseFloat(e.target.value) || 0)}
                  className={inputCls + ' w-28'}
                />
              </div>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-500">✕</button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/10">
          <span className="text-sm text-slate-500 dark:text-gray-400">Total</span>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-gray-200">Payment mode</p>
        <div className="flex gap-4 text-sm">
          {(['FULL', 'DEPOSIT'] as const).map(mode => (
            <label key={mode} className="flex cursor-pointer items-center gap-2">
              <input type="radio" checked={paymentMode === mode} onChange={() => setPaymentMode(mode)} className="accent-sky-600" />
              <span className="text-slate-700 dark:text-gray-200">
                {mode === 'FULL' ? `Full — $${total.toFixed(2)}` : `50% Deposit — $${deposit.toFixed(2)} now`}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Field label="Note to client" hint="(shown on proposal page)">
        <textarea rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Internal notes" hint="(not visible to client)">
        <textarea rows={2} value={internalNotes} onChange={e => setInternalNotes(e.target.value)} className={inputCls} />
      </Field>

      <button type="button" onClick={handleSave} disabled={pending || total === 0} className={btnPrimary}>
        {pending ? 'Saving…' : 'Save line items'}
      </button>
    </div>
  )
}

// ─── Scoping Checklist ────────────────────────────────────────────────────────

export function ChecklistCard({
  quoteId,
  items,
}: {
  quoteId: string
  items: ChecklistItem[]
}) {
  const router = useRouter()
  const [list, setList] = useState<ChecklistItem[]>(items)
  const [pending, startTransition] = useTransition()

  function toggle(id: string, checked: boolean) {
    const next = list.map(i => i.id === id ? { ...i, checked } : i)
    setList(next)
    const fd = new FormData()
    fd.set('quoteId', quoteId)
    fd.set('itemId', id)
    fd.set('checked', String(checked))
    const allDone = next.every(i => i.checked)
    startTransition(async () => {
      await updateChecklistItem({ error: null, success: false }, fd)
      if (allDone) router.refresh()
    })
  }

  const doneCount = list.filter(i => i.checked).length
  const allDone = doneCount === list.length

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
          Scoping checklist
        </p>
        <span className={`text-xs font-semibold ${allDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {doneCount}/{list.length} {allDone ? '✓ Ready' : 'pending'}
        </span>
      </div>
      <ul className="space-y-2">
        {list.map(item => (
          <li key={item.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={e => toggle(item.id, e.target.checked)}
              disabled={pending}
              className="h-4 w-4 rounded accent-emerald-600"
            />
            <span className={`text-sm ${item.checked ? 'text-slate-400 line-through dark:text-gray-500' : 'text-slate-700 dark:text-gray-200'}`}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      {!allDone && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          Complete all items before generating the proposal link.
        </p>
      )}
    </div>
  )
}

// ─── Cover letter template ────────────────────────────────────────────────────

const FOOTER = `Michal Babula — Sales Dept
Email: info@fotografosantodomingo.com
Tel./WP: +1 (809) 720-9547
www.fotografosantodomingo.com`

function coverLetter(locale: 'es' | 'en', url: string, clientName: string | null): string {
  const name = clientName ?? (locale === 'es' ? 'estimado/a cliente' : 'valued client')
  if (locale === 'es') {
    return `Estimado/a ${name},

Espero que se encuentre muy bien. Me comunico con usted para informarle que hemos preparado su cotización personalizada y ya se encuentra disponible.

Puede acceder a ella en el siguiente enlace:
${url}

La propuesta detalla el servicio, los precios y las condiciones de contratación. Le invito a revisarla con calma y, si tiene alguna pregunta o desea ajustar algún detalle, no dude en contactarnos.

Quedo a su disposición.

Saludos cordiales,
${FOOTER}`
  }
  return `Dear ${name},

I hope this message finds you well. I am reaching out to let you know that your personalized quotation has been prepared and is now available for your review.

You can access it at the following link:
${url}

The proposal outlines the service scope, pricing, and terms. Please take your time reviewing it, and feel free to reach out if you have any questions or would like to discuss any details.

Looking forward to hearing from you.

Best regards,
${FOOTER}`
}

// ─── Generate Proposal Link button (Phase 2) ─────────────────────────────────

export function GenerateLinkButton({
  quoteId,
  canGenerate,
  existingUrl,
  clientName,
}: {
  quoteId: string
  canGenerate: boolean
  existingUrl: string | null
  clientName?: string | null
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(existingUrl)
  const [copied, setCopied] = useState(false)
  const [letterLocale, setLetterLocale] = useState<'es' | 'en'>('es')
  const [letterCopied, setLetterCopied] = useState(false)
  const [expiryDays, setExpiryDays] = useState(7)

  async function handleGenerate() {
    setError(null)
    setPending(true)
    try {
      const fd = new FormData()
      fd.set('quoteId', quoteId)
      fd.set('expiryDays', String(expiryDays))
      const result = await generateProposalLink({ error: null, success: false }, fd)
      if (result.error) setError(result.error)
      else if (result.url) setUrl(result.url)
    } catch {
      setError('Unexpected error. Try again.')
    } finally {
      setPending(false)
    }
  }

  async function handleCopyLink() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleCopyLetter() {
    if (!url) return
    await navigator.clipboard.writeText(coverLetter(letterLocale, url, clientName ?? null))
    setLetterCopied(true)
    setTimeout(() => setLetterCopied(false), 2000)
  }

  if (url) {
    return (
      <div className="space-y-4">
        {/* Link row */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-400/20 dark:bg-emerald-500/10">
          <p className="mb-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Proposal link — sent to client</p>
          <p className="break-all font-mono text-xs text-emerald-900 dark:text-emerald-200">{url}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleCopyLink} className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:border-slate-400 dark:border-white/20 dark:text-gray-300">
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Send on WhatsApp ↗
          </a>
          <button
            onClick={() => { setUrl(null); setError(null) }}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Regenerate
          </button>
        </div>

        {/* Cover letter */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Cover letter</p>
            <div className="flex gap-1">
              {(['es', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLetterLocale(l)}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
                    letterLocale === l
                      ? 'bg-slate-800 text-white dark:bg-white dark:text-gray-900'
                      : 'border border-slate-300 text-slate-500 hover:border-slate-400 dark:border-white/20 dark:text-gray-400'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <textarea
            readOnly
            value={coverLetter(letterLocale, url, clientName ?? null)}
            rows={14}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs leading-relaxed text-slate-700 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300"
          />
          <button
            onClick={handleCopyLetter}
            className="mt-2 rounded-full bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            {letterCopied ? '✓ Copied!' : 'Copy cover letter'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && <Alert type="error">{error}</Alert>}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-700 dark:text-gray-200">Expires in</label>
        <select
          value={expiryDays}
          onChange={e => setExpiryDays(Number(e.target.value))}
          className="rounded-lg border border-slate-400 px-3 py-1.5 text-sm text-slate-900 dark:border-slate-500 dark:bg-gray-800 dark:text-white"
        >
          {[3, 7, 14, 30].map(d => (
            <option key={d} value={d}>{d} days</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending || !canGenerate}
        title={!canGenerate ? 'Save line items and complete the checklist first' : undefined}
        className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? 'Generating…' : '🔗 Generate proposal link'}
      </button>
      {!canGenerate && (
        <p className="text-xs text-slate-500 dark:text-gray-400">
          Save line items and complete the scoping checklist first.
        </p>
      )}
    </div>
  )
}

// ─── Legacy Send Proposal button (website-originated quotes only) ─────────────

export function SendProposalButton({ quoteId, canSend }: { quoteId: string; canSend: boolean }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (success) {
    return <Alert type="success">✅ Proposal sent to customer — status updated to <strong>Sent</strong>.</Alert>
  }

  async function handleSend() {
    setError(null)
    setPending(true)
    try {
      const fd = new FormData()
      fd.set('quoteId', quoteId)
      const result = await sendProposal({ error: null, success: false }, fd)
      if (result.error) setError(result.error)
      else setSuccess(true)
    } catch {
      setError('Unexpected error. Try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      {error && <Alert type="error">{error}</Alert>}
      <button
        type="button"
        onClick={handleSend}
        disabled={pending || !canSend}
        className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        title={!canSend ? 'Save a price first before sending the proposal' : undefined}
      >
        {pending ? 'Sending…' : '📧 Send proposal to client'}
      </button>
      {!canSend && <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">Set a price above before sending.</p>}
    </div>
  )
}

// ─── Reject / Reopen buttons ──────────────────────────────────────────────────

export function RejectReopenButtons({
  quoteId,
  status,
  whatsappPhone,
}: {
  quoteId: string
  status: string
  whatsappPhone: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAction(action: typeof rejectQuote | typeof reopenQuote) {
    setError(null)
    const fd = new FormData()
    fd.set('quoteId', quoteId)
    startTransition(async () => {
      const result = await action({ error: null, success: false }, fd)
      if (result.error) setError(result.error)
      else router.refresh()
    })
  }

  const waPhone = whatsappPhone?.replace(/\D/g, '') ?? null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && <span className="text-xs text-red-500">{error}</span>}

      {waPhone && (
        <a
          href={`https://wa.me/${waPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.215a.75.75 0 0 0 .928.928l5.357-1.47A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.52-5.162-1.426l-.37-.22-3.827 1.05 1.05-3.826-.22-.37A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
          Open chat
        </a>
      )}

      {status !== 'ACCEPTED' && status !== 'REJECTED' && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm('Mark this quote as rejected?')) handleAction(rejectQuote)
          }}
          className="rounded-full border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
        >
          {pending ? '…' : 'Reject'}
        </button>
      )}

      {status === 'REJECTED' && (
        <button
          type="button"
          disabled={pending}
          onClick={() => handleAction(reopenQuote)}
          className="rounded-full border border-violet-300 bg-violet-50 px-4 py-1.5 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
        >
          {pending ? '…' : 'Reopen as Draft'}
        </button>
      )}
    </div>
  )
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-lg border border-slate-400 px-3 py-2 text-sm text-slate-900 dark:border-slate-500 dark:bg-gray-800 dark:text-white'
const btnPrimary = 'rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-100">
        {label}{hint && <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function Alert({ type, children }: { type: 'success' | 'error'; children: React.ReactNode }) {
  const cls = type === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300'
    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300'
  return <div className={`rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>
}
