'use client'

import { usePathname } from 'next/navigation'
import { CONTACT_INFO } from '@/lib/utils/constants'

/**
 * Floating WhatsApp contact button.
 *
 * Phase B · B3.5 — restyled for Bugatti chrome consistency.
 *  - No box-shadow (forbidden by DESIGN.md §6).
 *  - No bg-green palette violation. Brand recognition is carried by the
 *    silhouette icon alone; chrome stays in the monochrome system.
 *  - On form-flow routes (/book, /get-quote, /contact), shifts to
 *    bottom-24 so it sits above the wizard submit pill on mobile rather
 *    than overlapping it.
 *  - Tooltip restyled to match Bugatti caption register.
 */

const FORM_ROUTES_RE = /^\/(?:en|es)\/(?:book|get-quote|contact)(?:\/|$)/

export default function WhatsAppButton() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'es'
  const isOnFormRoute = FORM_ROUTES_RE.test(pathname ?? '')

  const defaultMessage = locale === 'en'
    ? 'Hi! I am interested in a photo session.'
    : 'Hola! Me interesa una sesión de fotos.'
  const tooltipLabel = locale === 'en' ? 'WhatsApp' : 'WhatsApp'
  const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(CONTACT_INFO.whatsappMessage || defaultMessage)}`

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: 'whatsapp_click',
        source: 'floating_button',
        locale,
      })
    }
  }

  // Position: form-flow pages bump the button up by 72px so it clears any
  // bottom-aligned wizard submit pill on mobile portrait.
  const positionClass = isOnFormRoute
    ? 'bottom-24 right-5 md:bottom-24 md:right-6'
    : 'bottom-5 right-5 md:bottom-6 md:right-6'

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`fixed ${positionClass} z-40 group flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-canvas border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200`}
      aria-label="Contact us on WhatsApp"
    >
      <svg
        className="w-5 h-5 md:w-6 md:h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
      </svg>

      <span className="absolute right-full mr-3 hidden md:block px-2 py-1 bg-canvas border border-hairline-soft font-mono uppercase tracking-widest text-[10px] text-ink whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {tooltipLabel}
      </span>
    </a>
  )
}
