'use client'

import { useRef, useState } from 'react'
import { savePrice, sendProposal } from './actions'

type Quote = {
  id: string
  final_price_usd: number | null
  admin_note_customer: string | null
  admin_internal_notes: string | null
  status: string
}

// ─── Save Price form ──────────────────────────────────────────────────────────

export function PricingForm({ quote }: { quote: Quote }) {
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

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          Price saved successfully.
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="finalPriceUsd" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">
          Price (USD) <span className="text-slate-400 font-normal">+ 18% ITBIS shown to client</span>
        </label>
        <input
          id="finalPriceUsd"
          name="finalPriceUsd"
          type="number"
          min={1}
          step={0.01}
          defaultValue={quote.final_price_usd ?? ''}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:max-w-[200px] dark:border-white/15 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="adminNoteCustomer" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">
          Note to client <span className="text-slate-400 font-normal">(included in proposal email)</span>
        </label>
        <textarea
          id="adminNoteCustomer"
          name="adminNoteCustomer"
          rows={3}
          defaultValue={quote.admin_note_customer ?? ''}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="adminInternalNotes" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-gray-200">
          Internal notes <span className="text-slate-400 font-normal">(not visible to client)</span>
        </label>
        <textarea
          id="adminInternalNotes"
          name="adminInternalNotes"
          rows={2}
          defaultValue={quote.admin_internal_notes ?? ''}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/15 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save price'}
      </button>
    </form>
  )
}

// ─── Send Proposal button ─────────────────────────────────────────────────────

export function SendProposalButton({ quoteId, canSend }: { quoteId: string; canSend: boolean }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
        ✅ Proposal sent to customer — status updated to <strong>Sent</strong>.
      </div>
    )
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
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleSend}
        disabled={pending || !canSend}
        className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        title={!canSend ? 'Save a price first before sending the proposal' : undefined}
      >
        {pending ? 'Sending…' : '📧 Send proposal to client'}
      </button>
      {!canSend && (
        <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">Set a price above before sending.</p>
      )}
    </div>
  )
}
