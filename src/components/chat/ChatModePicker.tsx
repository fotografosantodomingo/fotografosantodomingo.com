'use client'

import { isVoiceSupported } from './VoiceControls'

interface ChatModePickerProps {
  onPick: (mode: 'text' | 'voice') => void
  locale: 'en' | 'es'
}

export function ChatModePicker({ onPick, locale }: ChatModePickerProps) {
  const voiceOk = isVoiceSupported()

  const copy = {
    heading: locale === 'es' ? '¿Cómo prefieres chatear?' : 'How would you like to chat?',
    text: locale === 'es' ? 'Texto' : 'Text',
    textDesc: locale === 'es' ? 'Escribe tu pregunta' : 'Type your question',
    voice: locale === 'es' ? 'Voz' : 'Voice',
    voiceDesc: locale === 'es' ? 'Habla y escucha la respuesta' : 'Speak and hear the reply',
    voiceUnsupported:
      locale === 'es'
        ? 'No disponible en este navegador'
        : 'Not available in this browser',
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6">
      <p className="text-center text-sm font-medium text-slate-700 dark:text-gray-200">
        {copy.heading}
      </p>

      <div className="grid w-full grid-cols-2 gap-3">
        {/* Text tile */}
        <button
          onClick={() => onPick('text')}
          className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 transition-all hover:border-slate-400 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-gray-800 dark:hover:border-white/30 dark:hover:bg-gray-700"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-gray-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-6 w-6 text-slate-700 dark:text-gray-200"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5h18M3 10h18M3 15h12"
              />
            </svg>
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {copy.text}
          </span>
          <span className="text-xs text-slate-500 dark:text-gray-400">{copy.textDesc}</span>
        </button>

        {/* Voice tile */}
        <button
          onClick={() => voiceOk && onPick('voice')}
          disabled={!voiceOk}
          className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 transition-all ${
            voiceOk
              ? 'border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-gray-800 dark:hover:border-white/30 dark:hover:bg-gray-700'
              : 'cursor-not-allowed border-slate-100 bg-slate-50/50 opacity-50 dark:border-white/5 dark:bg-gray-800/50'
          }`}
        >
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              voiceOk ? 'bg-slate-200 dark:bg-gray-700' : 'bg-slate-100 dark:bg-gray-800'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`h-6 w-6 ${
                voiceOk ? 'text-slate-700 dark:text-gray-200' : 'text-slate-400 dark:text-gray-600'
              }`}
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {copy.voice}
          </span>
          <span className="text-xs text-slate-500 dark:text-gray-400">
            {voiceOk ? copy.voiceDesc : copy.voiceUnsupported}
          </span>
        </button>
      </div>
    </div>
  )
}
