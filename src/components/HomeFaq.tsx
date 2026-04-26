'use client'

import { useState } from 'react'
import { getFaqData } from '@/lib/faq-data'
import { CONTACT_INFO } from '@/lib/utils/constants'

/**
 * HomeFaq — Phase B · B4 polish.
 *
 * Bugatti accordion. No primary-blue accents, no rotated chips. Each item
 * is a hairline-divided row with a mono-caps index, an ink question, and
 * a +/− toggle. Open state rotates the toggle to a − glyph (no color
 * change), drops the answer below in body text.
 *
 * The bottom WhatsApp link keeps mono-caps treatment matching the rest
 * of B-phase. Brand-green icon is small enough to read as a known
 * silhouette without disrupting the monochrome canvas.
 */
export default function HomeFaq({ locale }: { locale: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqs = getFaqData(locale)
  const isEs = locale === 'es'

  return (
    <section className="py-24 md:py-28 bg-canvas border-t border-hairline-soft">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
            FAQ
          </p>
          <h2
            className="font-display uppercase text-ink mb-6"
            style={{
              fontSize: 'clamp(36px, 7vw, 96px)',
              lineHeight: '0.95',
              letterSpacing: '-0.01em',
            }}
          >
            {isEs ? 'Preguntas frecuentes' : 'Frequently asked'}
          </h2>
          <p className="text-ink-muted text-base md:text-lg leading-relaxed mb-12 max-w-2xl">
            {isEs
              ? 'Todo lo que necesitas saber antes de reservar tu sesión en Santo Domingo.'
              : 'Everything you need to know before booking your session in Santo Domingo.'}
          </p>

          <ul className="border-t border-hairline-soft">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <li key={index} className="border-b border-hairline-soft">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-start gap-4 md:gap-6 py-5 md:py-6 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 w-6 mt-1.5">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-ink text-base md:text-lg leading-snug group-hover:opacity-70 transition-opacity">
                      {faq.question}
                    </span>
                    <span
                      className="font-mono text-ink text-xl shrink-0 ml-2 mt-0.5 select-none"
                      aria-hidden="true"
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pb-6 pl-10 md:pl-12 pr-2">
                      <p className="text-ink-muted leading-relaxed text-[15px]">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-14 text-center">
            <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-5">
              {isEs ? '¿Otra pregunta?' : 'Another question?'}
            </p>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(isEs ? 'Hola! Tengo una pregunta sobre sus servicios.' : 'Hi! I have a question about your services.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              {isEs ? 'Pregúntanos por WhatsApp' : 'Ask on WhatsApp'}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
