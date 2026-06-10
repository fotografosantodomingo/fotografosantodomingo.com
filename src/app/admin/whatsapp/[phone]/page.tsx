import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import ReplyBox from './ReplyBox'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

type MsgRow = {
  id: string
  direction: string
  body: string | null
  media_type: string | null
  wa_timestamp: string
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString('es-DO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default async function WhatsAppConversationPage({
  params,
}: {
  params: { phone: string }
}) {
  const phone = decodeURIComponent(params.phone)
  const supabase = createServiceClient()

  const [{ data: msgData }, { data: nameData }, { data: quoteData }] = await Promise.all([
    supabase
      .from('whatsapp_messages')
      .select('id, direction, body, media_type, wa_timestamp')
      .eq('phone_number', phone)
      .order('wa_timestamp', { ascending: true })
      .limit(500),
    supabase
      .from('whatsapp_messages')
      .select('display_name')
      .eq('phone_number', phone)
      .not('display_name', 'is', null)
      .limit(1),
    supabase
      .from('whatsapp_messages')
      .select('quote_id')
      .eq('phone_number', phone)
      .eq('quote_generated', true)
      .not('quote_id', 'is', null)
      .limit(1),
  ])

  const messages    = (msgData as MsgRow[] | null) ?? []
  const displayName  = (nameData?.[0]?.display_name as string | undefined) ?? null
  const quoteId      = (quoteData?.[0]?.quote_id as string | undefined) ?? null
  const waLink       = `https://wa.me/${phone.replace(/\D/g, '')}`

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/whatsapp" className="text-sm text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white">
            ← WhatsApp
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            {(displayName ?? phone).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-white">{displayName ?? `+${phone.replace(/\D/g, '')}`}</h1>
            <p className="text-xs text-slate-400">+{phone.replace(/\D/g, '')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {quoteId && (
            <Link
              href={`/admin/quotes/${quoteId}`}
              className="rounded-full bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-200 dark:bg-violet-400/10 dark:text-violet-300"
            >
              Ver cotización →
            </Link>
          )}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Abrir WhatsApp
          </a>
        </div>
      </div>

      {/* Chat thread */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Sin mensajes.</p>
        ) : (
          messages.map(m => {
            const outbound = m.direction === 'outbound'
            return (
              <div key={m.id} className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm ${
                    outbound
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-900 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body ?? `(${m.media_type ?? 'media'})`}</p>
                  <p className={`mt-1 text-right text-[10px] ${outbound ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {fmtTime(m.wa_timestamp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Manual reply */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900">
        <ReplyBox phone={phone} />
        <p className="mt-2 text-xs text-slate-400">
          Respuesta manual del administrador. Solo funciona dentro de la ventana de 24h desde el último mensaje del cliente.
        </p>
      </div>
    </div>
  )
}
