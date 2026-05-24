'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type PendingDraft = {
  id: string
  body: string
  intent: string | null
  risk_flags: string[]
  confidence: number | null
  created_at: string
  channel: string
  conversation: {
    id: string
    buyer_locale: string
    buyer_email: string | null
    first_message_at: string
    last_message_at: string
  }
  user_message: string | null
  email_subject: string | null
}

const RISK_COLORS: Record<string, string> = {
  price_commitment: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  date_commitment: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
  legal_or_financial: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  competitor_mention: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300',
  personal_contact_sharing: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('es-DO', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DraftCard({
  draft,
  onActioned,
}: {
  draft: PendingDraft
  onActioned: (id: string) => void
}) {
  const [editedBody, setEditedBody] = useState(draft.body)
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function approve(withEdit: boolean) {
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/admin/ai-inbox/approve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messageId: draft.id,
          editedBody: withEdit && editedBody !== draft.body ? editedBody : undefined,
        }),
      })
      if (res.ok) {
        onActioned(draft.id)
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Failed to approve')
      }
    })
  }

  async function reject() {
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/admin/ai-inbox/reject', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messageId: draft.id }),
      })
      if (res.ok) {
        onActioned(draft.id)
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Failed to reject')
      }
    })
  }

  const hasRisk = draft.risk_flags.length > 0

  return (
    <div
      className={`rounded-2xl border bg-white p-5 dark:bg-gray-900 ${
        hasRisk
          ? 'border-red-200 dark:border-red-400/20'
          : 'border-slate-200 dark:border-white/10'
      }`}
    >
      {/* Meta row */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
        <span className={`rounded-full px-2 py-0.5 font-medium ${
          draft.channel === 'email'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
            : 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {draft.channel === 'email' ? '✉ email' : '💬 chat'}
        </span>
        <span>·</span>
        <span className="font-mono">{draft.conversation.id.slice(0, 8)}</span>
        <span>·</span>
        <span>{draft.conversation.buyer_locale.toUpperCase()}</span>
        {draft.conversation.buyer_email && (
          <>
            <span>·</span>
            <span>{draft.conversation.buyer_email}</span>
          </>
        )}
        {draft.email_subject && (
          <>
            <span>·</span>
            <span className="italic">{draft.email_subject}</span>
          </>
        )}
        <span>·</span>
        <span>{formatTime(draft.created_at)}</span>
        {draft.intent && (
          <>
            <span>·</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600 dark:bg-gray-800 dark:text-gray-300">
              {draft.intent}
            </span>
          </>
        )}
        {draft.confidence != null && (
          <span className="text-slate-400">
            {Math.round(draft.confidence * 100)}% conf
          </span>
        )}
      </div>

      {/* Risk flags */}
      {hasRisk && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {draft.risk_flags.map((flag) => (
            <span
              key={flag}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                RISK_COLORS[flag] ?? 'bg-slate-100 text-slate-600'
              }`}
            >
              ⚠ {flag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* User message that triggered this draft */}
      {draft.user_message && (
        <div className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-gray-800 dark:text-gray-300">
          <span className="mr-1 font-semibold text-slate-400 dark:text-gray-500">Client:</span>
          {draft.user_message}
        </div>
      )}

      {/* Draft body — editable */}
      {editing ? (
        <textarea
          value={editedBody}
          onChange={(e) => setEditedBody(e.target.value)}
          rows={5}
          className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-white/10 dark:bg-gray-800 dark:text-white"
        />
      ) : (
        <p className="whitespace-pre-wrap text-sm text-slate-800 dark:text-gray-100">
          {draft.body}
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Action row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => approve(editing)}
          disabled={isPending}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-emerald-700 disabled:opacity-50"
        >
          {editing ? 'Save & Send' : 'Approve & Send'}
        </button>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            disabled={isPending}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Edit first
          </button>
        )}

        {editing && (
          <button
            onClick={() => { setEditing(false); setEditedBody(draft.body) }}
            disabled={isPending}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel edit
          </button>
        )}

        <button
          onClick={reject}
          disabled={isPending}
          className="ml-auto rounded-xl px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Reject
        </button>
      </div>
    </div>
  )
}

export default function AiInboxClient({ drafts: initial }: { drafts: PendingDraft[] }) {
  const [drafts, setDrafts] = useState(initial)
  const router = useRouter()

  function handleActioned(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
    // Revalidate in background to pick up any new ones
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Inbox</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-gray-400">
            Review AI drafts before they reach clients
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
          {drafts.length} pending
        </span>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-white/10">
          <p className="text-3xl">✅</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">All caught up — no pending drafts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((d) => (
            <DraftCard key={d.id} draft={d} onActioned={handleActioned} />
          ))}
        </div>
      )}
    </div>
  )
}
