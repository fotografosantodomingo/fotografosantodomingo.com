'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updateQuoteRequestNotes, updateQuoteRequestStatus } from './actions'

const STATUSES = ['NEW', 'REVIEWING', 'QUOTED', 'WON', 'LOST'] as const

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
    >
      {pending ? 'Saving…' : label}
    </button>
  )
}

export function StatusSelect({ id, current }: { id: string; current: string }) {
  const [state, action] = useFormState(updateQuoteRequestStatus, { error: null, success: false })
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={current}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/20 dark:bg-gray-800 dark:text-white"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <Submit label="Update" />
      {state.error && <span className="text-xs text-red-600 dark:text-red-300">{state.error}</span>}
    </form>
  )
}

export function NotesEditor({ id, current }: { id: string; current: string }) {
  const [state, action] = useFormState(updateQuoteRequestNotes, { error: null, success: false })
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="admin_notes"
        rows={6}
        defaultValue={current}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-gray-800 dark:text-white"
        placeholder="Internal notes — not shown to the customer"
      />
      <div className="flex items-center justify-between">
        {state.error ? (
          <span className="text-xs text-red-600 dark:text-red-300">{state.error}</span>
        ) : state.success ? (
          <span className="text-xs text-emerald-600 dark:text-emerald-300">Saved</span>
        ) : (
          <span />
        )}
        <Submit label="Save notes" />
      </div>
    </form>
  )
}
