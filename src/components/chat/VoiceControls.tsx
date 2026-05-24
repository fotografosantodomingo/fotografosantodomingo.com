'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// BCP-47 locale map — Web Speech API needs regional tags
export const LOCALE_TO_BCP47: Record<string, string> = {
  en: 'en-US',
  es: 'es-DO',
}

export function isVoiceSupported(): boolean {
  if (typeof window === 'undefined') return false
  const hasSR = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  const hasTTS = 'speechSynthesis' in window
  return hasSR && hasTTS
}

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking'

interface VoiceControlsProps {
  voiceLocale: string           // BCP-47 e.g. 'es-DO'
  onUserTranscript: (text: string) => void
  speakText: string             // when this changes, TTS plays it
  onSpeakDone: () => void
  disabled?: boolean
  onUnrecoverable?: (reason: 'unsupported' | 'permission_denied') => void
  copy: {
    tapToSpeak: string
    listening: string
    thinking: string
    speaking: string
    tapToStop: string
    tapToInterrupt: string
  }
}

export function VoiceControls({
  voiceLocale,
  onUserTranscript,
  speakText,
  onSpeakDone,
  disabled,
  onUnrecoverable,
  copy,
}: VoiceControlsProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef<any>(null)
  const lastSpokenRef = useRef('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialise SpeechRecognition
  useEffect(() => {
    if (!isVoiceSupported()) {
      onUnrecoverable?.('unsupported')
      return
    }
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1
    rec.lang = voiceLocale

    rec.onresult = (e: any) => {
      let interimText = ''
      let finalText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t
        else interimText += t
      }
      setInterim(interimText || finalText)
      if (finalText) {
        setInterim('')
        setPhase('thinking')
        onUserTranscript(finalText.trim())
      }
    }

    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') onUnrecoverable?.('permission_denied')
      setPhase('idle')
      setInterim('')
    }

    rec.onend = () => {
      setPhase((p) => (p === 'listening' ? 'idle' : p))
      setInterim('')
    }

    recognitionRef.current = rec
    return () => {
      try { rec.stop() } catch {}
    }
  }, [voiceLocale, onUnrecoverable, onUserTranscript])

  // Switch to idle when thinking resolves (parent sends new assistant message)
  useEffect(() => {
    if (phase === 'thinking' && speakText && speakText !== lastSpokenRef.current) {
      // speaking phase is set by the TTS useEffect below
    }
  }, [phase, speakText])

  // TTS when speakText changes
  useEffect(() => {
    if (!speakText || speakText === lastSpokenRef.current) return
    lastSpokenRef.current = speakText

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(speakText)
    utterance.lang = voiceLocale
    utterance.rate = 1.0

    // Pick the best matching voice asynchronously
    const applyVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      const langPrefix = voiceLocale.slice(0, 2).toLowerCase()
      const exact = voices.find((v) => v.lang.toLowerCase() === voiceLocale.toLowerCase())
      const fallback = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix))
      if (exact) utterance.voice = exact
      else if (fallback) utterance.voice = fallback
    }

    if (window.speechSynthesis.getVoices().length > 0) {
      applyVoice()
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', applyVoice, { once: true })
    }

    utterance.onstart = () => setPhase('speaking')
    utterance.onend = () => {
      setPhase('idle')
      onSpeakDone()
    }
    utterance.onerror = () => {
      setPhase('idle')
      onSpeakDone()
    }

    window.speechSynthesis.speak(utterance)
  }, [speakText, voiceLocale, onSpeakDone])

  // Mic permission timeout — if start() fires but no onstart after 8s, give up
  const handleTap = useCallback(() => {
    if (disabled) return

    if (phase === 'speaking') {
      window.speechSynthesis.cancel()
      setPhase('idle')
      return
    }
    if (phase === 'listening') {
      recognitionRef.current?.stop()
      setPhase('idle')
      return
    }
    if (phase === 'thinking') return

    // idle → start listening
    try {
      recognitionRef.current?.start()
      setPhase('listening')
      // Timeout fallback for dismissed permission prompt
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop() } catch {}
        }
        setPhase('idle')
      }, 10000)
    } catch {
      setPhase('idle')
    }
  }, [phase, disabled])

  // Clear the permission timeout when we actually start listening
  useEffect(() => {
    if (phase !== 'listening' && timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [phase])

  // Aria label for the button based on phase
  const ariaLabel =
    phase === 'listening'
      ? copy.tapToStop
      : phase === 'speaking'
      ? copy.tapToInterrupt
      : copy.tapToSpeak

  const phaseLabel =
    phase === 'listening'
      ? copy.listening
      : phase === 'thinking'
      ? copy.thinking
      : phase === 'speaking'
      ? copy.speaking
      : copy.tapToSpeak

  return (
    <div className="flex flex-col items-center gap-4 pb-2 pt-4">
      {/* Animated mic button */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring — animates per phase */}
        {phase === 'listening' && (
          <span className="absolute h-20 w-20 animate-ping rounded-full bg-red-400/30" />
        )}
        {phase === 'speaking' && (
          <span className="absolute h-20 w-20 animate-pulse rounded-full bg-emerald-400/30" />
        )}

        <button
          onClick={handleTap}
          aria-label={ariaLabel}
          disabled={disabled || phase === 'thinking'}
          className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
            phase === 'listening'
              ? 'bg-red-500 shadow-lg shadow-red-500/40'
              : phase === 'speaking'
              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40'
              : phase === 'thinking'
              ? 'bg-slate-400 dark:bg-gray-600'
              : 'bg-slate-900 shadow-md hover:bg-slate-700 dark:bg-white dark:hover:bg-gray-100'
          }`}
        >
          {phase === 'thinking' ? (
            // Spinner
            <svg
              className="h-7 w-7 animate-spin text-white dark:text-gray-900"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : phase === 'speaking' ? (
            // Waveform icon
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 text-white"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          ) : (
            // Microphone icon
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`h-7 w-7 ${
                phase === 'listening' ? 'text-white' : 'text-white dark:text-gray-900'
              }`}
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Phase label */}
      <p
        className={`text-sm font-medium ${
          phase === 'listening'
            ? 'text-red-500'
            : phase === 'speaking'
            ? 'text-emerald-500'
            : phase === 'thinking'
            ? 'text-slate-400 dark:text-gray-500'
            : 'text-slate-500 dark:text-gray-400'
        }`}
      >
        {phaseLabel}
      </p>

      {/* Live interim transcript */}
      {interim && (
        <p
          role="status"
          aria-live="polite"
          className="max-w-[90%] text-center text-xs italic text-slate-400 dark:text-gray-500"
        >
          "{interim}"
        </p>
      )}
    </div>
  )
}
