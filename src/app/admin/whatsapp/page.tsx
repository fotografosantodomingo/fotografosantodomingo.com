import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

type MsgRow = {
  phone_number: string
  display_name: string | null
  direction: string
  body: string | null
  wa_timestamp: string
  quote_generated: boolean
  quote_id: string | null
}

type Conversation = {
  phone: string
  displayName: string | null
  lastBody: string
  lastDirection: string
  lastAt: string
  count: number
  inboundCount: number
  quoteId: string | null
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `hace ${hr} h`
  const d = Math.floor(hr / 24)
  return `hace ${d} d`
}

export default async function AdminWhatsAppPage() {
  const supabase = createServiceClient()

  // Pull recent messages and group by phone client-side (small volume).
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('phone_number, display_name, direction, body, wa_timestamp, quote_generated, quote_id')
    .order('wa_timestamp', { ascending: false })
    .limit(1000)

  const rows = (data as MsgRow[] | null) ?? []

  // Group: first row per phone is the most recent (already sorted desc).
  const byPhone = new Map<string, Conversation>()
  for (const r of rows) {
    const existing = byPhone.get(r.phone_number)
    if (!existing) {
      byPhone.set(r.phone_number, {
        phone: r.phone_number,
        displayName: r.display_name,
        lastBody: r.body ?? '(media)',
        lastDirection: r.direction,
        lastAt: r.wa_timestamp,
        count: 1,
        inboundCount: r.direction === 'inbound' ? 1 : 0,
        quoteId: r.quote_generated ? r.quote_id : null,
      })
    } else {
      existing.count += 1
      if (r.direction === 'inbound') existing.inboundCount += 1
      if (!existing.displayName && r.display_name) existing.displayName = r.display_name
      if (!existing.quoteId && r.quote_generated && r.quote_id) existing.quoteId = r.quote_id
    }
  }

  const conversations = Array.from(byPhone.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">💬 WhatsApp</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
          {conversations.length} conversación(es). El bot responde automáticamente; tras 5 mensajes se genera una cotización.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
          {error.message}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500 dark:border-white/10 dark:bg-gray-900 dark:text-gray-400">
          Aún no hay conversaciones de WhatsApp.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-gray-900">
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {conversations.map(c => (
              <li key={c.phone}>
                <Link
                  href={`/admin/whatsapp/${encodeURIComponent(c.phone)}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {(c.displayName ?? c.phone).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-slate-900 dark:text-white">
                        {c.displayName ?? c.phone}
                      </span>
                      <span className="text-xs text-slate-400">+{c.phone.replace(/\D/g, '')}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-gray-400">
                      {c.lastDirection === 'outbound' && <span className="text-slate-400">Bot: </span>}
                      {c.lastBody}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-slate-400">{timeAgo(c.lastAt)}</span>
                    <div className="flex items-center gap-1.5">
                      {c.quoteId && (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                          Cotización
                        </span>
                      )}
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-white/5 dark:text-gray-400">
                        {c.count} msg
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
