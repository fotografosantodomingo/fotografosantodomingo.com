'use client'

/**
 * ObfuscatedEmail — renders the contact email address in a way that is
 * invisible to email-harvesting spiders while working perfectly for real users.
 *
 * HOW IT WORKS
 *   - Server HTML: renders a neutral placeholder ("Loading contact...")
 *   - After hydration: assembles the address from parts and renders a mailto link
 *   - Bots that only read static HTML never see a complete email string
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

  if (!email) {
    return (
      <span className={className} aria-label="email address">
        {locale === 'es' ? 'Cargando contacto...' : 'Loading contact...'}
      </span>
    )
  }

  return (
    <a
      href={`mailto:${email}`}
      className={className}
      onClick={(e) => {
        e.currentTarget.href = `mailto:${email}`
      }}
    >
      {label ?? email}
    </a>
  )
}
