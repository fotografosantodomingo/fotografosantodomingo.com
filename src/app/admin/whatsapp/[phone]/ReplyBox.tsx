'use client'

import { useActionState } from 'react'
import { sendManualReply, type ReplyState } from './actions'

const initial: ReplyState = { error: null, success: false }

export default function ReplyBox({ phone }: { phone: string }) {
  const [state, action, pending] = useActionState(sendManualReply, initial)

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="phone" value={phone} />
      <div className="flex items-end gap-2">
        <textarea
          name="body"
          rows={2}
          required
          placeholder="Escribe una respuesta manual…"
          className="flex-1 resize-none rounded-xl border border-slate-400 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-500 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {pending ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Mensaje enviado ✓</p>
      )}
    </form>
  )
}
