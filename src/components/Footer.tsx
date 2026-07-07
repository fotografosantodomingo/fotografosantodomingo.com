import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import NewsletterForm from './NewsletterForm'
import ThemeToggle from './ThemeToggle'
import { CONTACT_INFO, SOCIAL_LINKS } from '@/lib/utils/constants'
import ObfuscatedEmail from '@/components/ui/ObfuscatedEmail'

/**
 * Footer — Phase B · B4 polish.
 *
 * Bugatti chrome: bg-canvas / text-ink / hairline borders. Mono-caps
 * column headers replace bold sans-serif. Quick-link list is now a flat
 * list of mono-caps anchors. CTAs (Book Now, Trustpilot review profile)
 * use the established pill duo with two intentional palette breaks
 * preserved: WhatsApp #25D366 (already in B1 contract) + Trustpilot
 * #00B67A on the Trustpilot CTA (brand-recognition exception, same
 * justification as WhatsApp).
 *
 * The babulashotsrd cross-link strip uses ink-tone underline rather
 * than yellow.
 */
export default function Footer({ locale: localeProp }: { locale?: string } = {}) {
  const t = useTranslations('footer')
  const ctxLocale = useLocale()
  const locale = localeProp ?? ctxLocale
  const year = new Date().getFullYear()
  const isEs = locale === 'es'

  return (
    <footer className="bg-canvas text-ink border-t border-hairline-soft">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">

          {/* Company info */}
          <div className="md:col-span-2">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
              Babula Shots
            </p>
            <h3
              className="font-display uppercase text-ink mb-5"
              style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', lineHeight: '1.1' }}
            >
              Fotógrafo Santo Domingo
            </h3>
            <p className="text-ink-muted leading-relaxed mb-6 max-w-md">
              {t('description')}
            </p>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li className="flex gap-3">
                <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 w-12">
                  {isEs ? 'Oficina' : 'Office'}
                </span>
                <span>{t('contact.info.office')}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 w-12">
                  {isEs ? 'Tel' : 'Tel'}
                </span>
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-ink hover:opacity-70 transition-opacity">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 w-12">
                  Email
                </span>
                <ObfuscatedEmail locale={locale} className="text-ink hover:opacity-70 transition-opacity" />
              </li>
              <li className="flex gap-3">
                <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 w-12">
                  {isEs ? 'Resp.' : 'Reply'}
                </span>
                <span>{t('contact.info.response_time')}</span>
              </li>
            </ul>

            {/* Social — monochrome, hover signals via opacity only */}
            <div className="flex gap-5 mt-7">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ink-muted hover:text-ink transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-ink-muted hover:text-ink transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-ink-muted hover:text-ink transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.854 0-2.137 1.445-2.137 2.94v5.666H9.344V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.603 0 4.269 2.371 4.269 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href={SOCIAL_LINKS.pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="text-ink-muted hover:text-ink transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.017 0C5.396 0 0 5.392 0 12.01c0 4.93 2.983 9.166 7.244 11.03-.1-.936-.19-2.374.04-3.397.21-.925 1.347-5.887 1.347-5.887s-.343-.687-.343-1.703c0-1.596.925-2.788 2.077-2.788.98 0 1.453.736 1.453 1.62 0 .988-.63 2.466-.956 3.837-.274 1.156.58 2.098 1.72 2.098 2.064 0 3.652-2.176 3.652-5.316 0-2.779-1.997-4.724-4.85-4.724-3.304 0-5.244 2.478-5.244 5.04 0 .998.384 2.067.864 2.648a.35.35 0 01.08.334c-.09.368-.293 1.156-.332 1.317-.053.214-.173.26-.4.157-1.49-.694-2.42-2.876-2.42-4.63 0-3.77 2.739-7.234 7.9-7.234 4.147 0 7.373 2.956 7.373 6.907 0 4.123-2.6 7.44-6.21 7.44-1.213 0-2.353-.63-2.742-1.376l-.747 2.844c-.27 1.04-1.003 2.34-1.493 3.134 1.124.347 2.313.534 3.548.534C18.624 24 24 18.624 24 12.017 24 5.392 18.624 0 12.017 0z"/></svg>
              </a>
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-ink-muted hover:text-ink transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-ink-muted hover:text-ink transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-5">
              {isEs ? 'Enlaces' : 'Links'}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/book`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[11px] px-4 py-2 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity"
                >
                  {isEs ? 'Reservar' : 'Book'}
                </Link>
              </li>
              {[
                { href: `/${locale}/prices`, label: isEs ? 'Precios' : 'Pricing' },
                { href: `/${locale}/services`, label: isEs ? 'Servicios' : 'Services' },
                { href: `/${locale}/portfolio`, label: isEs ? 'Portafolio' : 'Portfolio' },
                { href: `/${locale}/about`, label: isEs ? 'Nosotros' : 'About' },
                { href: `/${locale}/blog`, label: 'Blog' },
                { href: `/${locale}/contact`, label: isEs ? 'Contacto' : 'Contact' },
                { href: `/${locale}/get-quote`, label: isEs ? 'Cotizar' : 'Get quote' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews block — Trustpilot brand exception (matches WhatsApp green policy) */}
          <div>
            <h4 className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-5">
              {isEs ? 'Reseñas' : 'Reviews'}
            </h4>
            <p className="text-sm text-ink-muted mb-4 leading-relaxed">
              {isEs ? 'Opiniones verificadas en Trustpilot.' : 'Verified opinions on Trustpilot.'}
            </p>
            <div className="border border-hairline-soft p-4">
              <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-3">
                {isEs ? 'Excelente' : 'Excellent'}
              </p>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className="inline-flex h-5 w-5 items-center justify-center bg-[#00B67A] text-[11px] font-bold leading-none text-white"
                    aria-hidden="true"
                  >
                    ★
                  </span>
                ))}
              </div>
              {/* Trustpilot brand-color exception. Black text on #00B67A
                   passes WCAG AA (~10.5:1) — white text was 2.63:1 (fail). */}
              <a
                href={SOCIAL_LINKS.trustpilot}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center font-mono uppercase tracking-widest text-[11px] font-semibold px-3 py-2.5 rounded-full bg-[#00B67A] text-black hover:opacity-90 transition-opacity"
              >
                {isEs ? 'Ver en Trustpilot' : 'View on Trustpilot'}
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-hairline-soft mt-14 md:mt-16 pt-10">
          <div className="max-w-md mx-auto text-center">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
              {t('newsletter.title')}
            </p>
            <p className="text-sm text-ink-muted mb-5 leading-relaxed">
              {t('newsletter.subtitle')}
            </p>
            <NewsletterForm locale={locale} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-hairline-soft mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-5">
          <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
            © {year} Fotografo Santo Domingo
          </p>
          <div className="flex items-center gap-6">
            <Link
              href={`/${locale}/privacy`}
              className="font-mono uppercase tracking-widest text-[10px] text-ink-muted hover:text-ink transition-opacity"
            >
              {isEs ? 'Privacidad' : 'Privacy'}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="font-mono uppercase tracking-widest text-[10px] text-ink-muted hover:text-ink transition-opacity"
            >
              {isEs ? 'Términos' : 'Terms'}
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Cross-site link */}
        <div className="text-center mt-10 pt-8 border-t border-hairline-soft">
          <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted leading-relaxed">
            {isEs ? (
              <>
                También en{' '}
                <a
                  href="https://www.babulashotsrd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-2 hover:opacity-70"
                >
                  babulashotsrd.com
                </a>
                {' '}— mismo fotógrafo, más servicios
              </>
            ) : (
              <>
                Also at{' '}
                <a
                  href="https://www.babulashotsrd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-2 hover:opacity-70"
                >
                  babulashotsrd.com
                </a>
                {' '}— same photographer, more services
              </>
            )}
          </p>
          <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted leading-relaxed mt-3">
            {isEs ? (
              <>
                También en{' '}
                <a
                  href="https://tourist.com/p/50187"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-2 hover:opacity-70"
                >
                  tourist.com
                </a>
                {' '}— reserva mi servicio en el portal
              </>
            ) : (
              <>
                Also on{' '}
                <a
                  href="https://tourist.com/p/50187"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-2 hover:opacity-70"
                >
                  tourist.com
                </a>
                {' '}— book my service on the portal
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  )
}
