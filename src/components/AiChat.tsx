'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

// Session token — persisted in localStorage so the conversation survives
// page navigations. Generated once per browser.
function getOrCreateSessionToken(): string {
  try {
    const key = 'ai_chat_session'
    let token = localStorage.getItem(key)
    if (!token) {
      token = crypto.randomUUID()
      localStorage.setItem(key, token)
    }
    return token
  } catch {
    return crypto.randomUUID()
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  body: string
  created_at?: string
}

// Hidden on /book, /get-quote, /contact — same logic as WhatsAppButton
const FORM_ROUTES_RE = /^\/(?:en|es)\/(?:book|get-quote|contact)(?:\/|$)/
const POLL_INTERVAL_MS = 5000

export default function AiChat() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'es'
  const isOnFormRoute = FORM_ROUTES_RE.test(pathname ?? '')

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [lastPollCursor, setLastPollCursor] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionToken = useRef<string>('')

  useEffect(() => {
    sessionToken.current = getOrCreateSessionToken()
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const hasPendingDraft = false

  // Poll for approved assistant replies
  const poll = useCallback(async () => {
    if (!conversationId) return
    try {
      const url = new URL('/api/ai-chat/poll', window.location.origin)
      url.searchParams.set('conversationId', conversationId)
      url.searchParams.set('sessionToken', sessionToken.current)
      if (lastPollCursor) url.searchParams.set('since', lastPollCursor)

      const res = await fetch(url.toString())
      if (!res.ok) return
      const json = await res.json()
      const newMsgs: Array<{ id: string; body: string; sent_at: string; created_at: string }> =
        json.messages ?? []

      if (newMsgs.length > 0) {
        const cursor = newMsgs[newMsgs.length - 1].created_at
        setLastPollCursor(cursor)

        setMessages((prev) => {
            const withoutPending = prev.filter((m) => m.body !== '')
          const alreadyIds = new Set(withoutPending.map((m) => m.id))
          const incoming = newMsgs
            .filter((m) => !alreadyIds.has(m.id))
            .map((m) => ({
              id: m.id,
              role: 'assistant' as const,
              body: m.body,
              created_at: m.created_at,
            }))
          return [...withoutPending, ...incoming]
        })
      }
    } catch {
      // silent — poll will retry
    }
  }, [conversationId, lastPollCursor])

  // Start polling when we have a conversation; stop when unmounted
  useEffect(() => {
    if (!conversationId) return
    pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [conversationId, poll])

  async function sendMessage() {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      body: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userMessage: text,
          sessionToken: sessionToken.current,
          locale,
        }),
      })

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            body:
              locale === 'es'
                ? 'Algo salió mal. Por favor intenta de nuevo.'
                : 'Something went wrong. Please try again.',
          },
        ])
        return
      }

      // Read the header for conversationId on first message
      const convIdHeader = res.headers.get('x-conversation-id')
      if (convIdHeader && !conversationId) {
        setConversationId(convIdHeader)
      }

      // Stream typing indicator while SSE flows in
      const pendingId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: pendingId, role: 'assistant', body: '' },
      ])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let streamedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.type === 'text-delta') {
              streamedText += ev.text
              // Update the pending message body live so user sees typing
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === pendingId ? { ...m, body: streamedText } : m,
                ),
              )
            } else if (ev.type === 'done') {
              if (ev.conversationId && !conversationId) {
                setConversationId(ev.conversationId)
              }
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          body:
            locale === 'es'
              ? 'Error de conexión. Por favor intenta de nuevo.'
              : 'Connection error. Please try again.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const greeting =
    locale === 'es'
      ? '¡Hola! Soy el asistente de Babula Shots. ¿En qué puedo ayudarte hoy?'
      : "Hi! I'm the Babula Shots assistant. How can I help you today?"

  const placeholderText =
    locale === 'es' ? 'Escribe tu mensaje...' : 'Type your message...'

  const sendLabel = locale === 'es' ? 'Enviar' : 'Send'
  const openLabel = locale === 'es' ? 'Chat con nosotros' : 'Chat with us'
  const closeLabel = locale === 'es' ? 'Cerrar chat' : 'Close chat'

  if (isOnFormRoute) return null

  return (
    <>
      {/* Floating toggle button — sits to the LEFT of WhatsApp button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? closeLabel : openLabel}
        className="fixed bottom-5 right-[4.5rem] z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 active:scale-95 dark:bg-gray-900 dark:ring-white/10 md:bottom-6 md:right-20"
      >
        {open ? (
          // Close X
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5 text-slate-700 dark:text-gray-200"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Chat bubble icon
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-5 w-5 text-slate-700 dark:text-gray-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
        {/* Unread dot when there's a pending draft */}
        {!open && hasPendingDraft && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-white dark:ring-gray-900" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 flex w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900 md:right-6 md:w-96"
          style={{ maxHeight: 'min(520px, calc(100dvh - 96px))' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-gray-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm dark:bg-gray-700">
              📸
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                Babula Shots
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-gray-400">
                {locale === 'es' ? 'Asistente de Babula Shots' : 'Babula Shots Assistant'}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {/* Greeting */}
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800 dark:bg-gray-800 dark:text-gray-100">
                {greeting}
              </div>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'rounded-tr-sm bg-slate-900 text-white dark:bg-white dark:text-gray-900'
                      : 'rounded-tl-sm bg-slate-100 text-slate-800 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  {!m.body ? (
                    <span className="inline-flex gap-1 text-slate-400 dark:text-gray-500">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
                    </span>
                  ) : (
                    <span className="whitespace-pre-wrap">{m.body}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-3 dark:border-white/10">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                rows={1}
                className="min-h-[38px] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none dark:border-white/10 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                style={{ maxHeight: '100px' }}
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                aria-label={sendLabel}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-opacity disabled:opacity-40 dark:bg-white dark:text-gray-900"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
