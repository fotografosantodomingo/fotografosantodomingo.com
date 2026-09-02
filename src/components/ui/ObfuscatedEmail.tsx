'use client'

/**
 * ObfuscatedEmail — renders the contact email address in a way that is
 * invisible to email-harvesting spiders while working perfectly for real users.
 *
 * HOW IT WORKS
 *   - Server HTML: renders a clickable <a> with the dictionary label "Email"
 *     (or the user-supplied `label` prop) and an inert href. Looks polished
 *     to humans and to crawlers — never the awkward "Loading contact..." flash
 *     it used to show before hydration.
 *   - After hydration: useEffect rewrites the href to mailto:info@... and
 *     swaps the visible text to the assembled address (unless `label` is set).
 *   - Bots that only read static HTML never see a complete email string.
 *
 * USAGE
 *   <ObfuscatedEmail locale={locale} />
 *   <ObfuscatedEmail locale={locale} label="Email us" className="text-sky-400" />
 *
 * RULE: Never hardcode the email address anywhere in JSX or JSON-LD.
 *       Always use this component for any user-facing email display.
 */

import { useEffect, useState } from 'react'

type Props = {
  className?: string
  /** Optional custom link text — defaults to the assembled email address */
  label?: string
  locale?: string
}

export default function ObfuscatedEmail({ className, label, locale = 'en' }: Props) {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    // Assembled client-side only — never present in server-rendered HTML
    const user = 'info'
    const domain = 'fotografosantodomingo'
    const tld = 'com'
    setEmail(`${user}@${domain}.${tld}`)
  }, [])

  // Pre-hydration fallback — bots and the SSR pass see this. Rendering as
  // an <a> (rather than the old "Loading contact..." span) keeps the visual
  // continuity through hydration: same tag, same classes, no layout shift.
  const fallbackLabel = label ?? (locale === 'es' ? 'Correo' : 'Email')

  // aria-label only makes sense for the generic pre-hydration fallback text
  // ("Correo"/"Email"). Once the real address (or a custom label) is shown,
  // dropping it lets the accessible name derive from the visible text —
  // overriding it here would otherwise mismatch WCAG's
  // label-content-name-mismatch rule as soon as email !== null.
  return (
    <a
      href={email ? `mailto:${email}` : '#contact'}
      className={className}
      aria-label={email ? undefined : (locale === 'es' ? 'enviar correo' : 'email address')}
      onClick={(e) => {
        if (email) e.currentTarget.href = `mailto:${email}`
      }}
    >
      {email ? (label ?? email) : fallbackLabel}
    </a>
  )
}
