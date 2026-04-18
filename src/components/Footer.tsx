import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import NewsletterForm from './NewsletterForm'
import ThemeToggle from './ThemeToggle'
import { CONTACT_INFO, SOCIAL_LINKS } from '@/lib/utils/constants'

export default function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Fotografo Santo Domingo</h3>
            <p className="text-gray-300 mb-4">
              {t('description')}
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📍 {t('contact.info.office')}</p>
              <p>📞 {CONTACT_INFO.phone}</p>
              <p>✉️ {CONTACT_INFO.email}</p>
              <p>⏰ {t('contact.info.response_time')}</p>
            </div>

            {/* Social Media */}
            <div className="flex gap-4 mt-6">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-pink-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-sky-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.854 0-2.137 1.445-2.137 2.94v5.666H9.344V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.603 0 4.269 2.371 4.269 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href={SOCIAL_LINKS.pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="text-gray-400 hover:text-red-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 0 5.392 0 12.01c0 4.93 2.983 9.166 7.244 11.03-.1-.936-.19-2.374.04-3.397.21-.925 1.347-5.887 1.347-5.887s-.343-.687-.343-1.703c0-1.596.925-2.788 2.077-2.788.98 0 1.453.736 1.453 1.62 0 .988-.63 2.466-.956 3.837-.274 1.156.58 2.098 1.72 2.098 2.064 0 3.652-2.176 3.652-5.316 0-2.779-1.997-4.724-4.85-4.724-3.304 0-5.244 2.478-5.244 5.04 0 .998.384 2.067.864 2.648a.35.35 0 01.08.334c-.09.368-.293 1.156-.332 1.317-.053.214-.173.26-.4.157-1.49-.694-2.42-2.876-2.42-4.63 0-3.77 2.739-7.234 7.9-7.234 4.147 0 7.373 2.956 7.373 6.907 0 4.123-2.6 7.44-6.21 7.44-1.213 0-2.353-.63-2.742-1.376l-.747 2.844c-.27 1.04-1.003 2.34-1.493 3.134 1.124.347 2.313.534 3.548.534C18.624 24 24 18.624 24 12.017 24 5.392 18.624 0 12.017 0z"/></svg>
              </a>
              <a href={SOCIAL_LINKS.trustpilot} target="_blank" rel="noopener noreferrer" aria-label="Trustpilot" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.59 5.26L20.4 8.1l-4.2 4.09.99 5.78L12 15.2l-5.19 2.77.99-5.78L3.6 8.1l5.81-.84L12 2z"/></svg>
              </a>
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-400 hover:text-green-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
              </a>
            </div>

            <a
              href={SOCIAL_LINKS.trustpilot}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20 transition-colors"
            >
              <span aria-hidden="true">★★★★★</span>
              <span>
                {locale === 'es' ? 'Ver reseñas en Trustpilot' : 'See Trustpilot reviews'}
              </span>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {locale === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              <li><Link href={`/${locale}/services`} className="text-gray-300 hover:text-white transition-colors">{locale === 'es' ? 'Servicios' : 'Services'}</Link></li>
              <li><Link href={`/${locale}/portfolio`} className="text-gray-300 hover:text-white transition-colors">{locale === 'es' ? 'Portafolio' : 'Portfolio'}</Link></li>
              <li><Link href={`/${locale}/about`} className="text-gray-300 hover:text-white transition-colors">{locale === 'es' ? 'Nosotros' : 'About'}</Link></li>
              <li><Link href={`/${locale}/blog`} className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href={`/${locale}/contact`} className="text-gray-300 hover:text-white transition-colors">{locale === 'es' ? 'Contacto' : 'Contact'}</Link></li>
            </ul>
          </div>

        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-2">{t('newsletter.title')}</h4>
            <p className="text-gray-300 mb-4">{t('newsletter.subtitle')}</p>
            <NewsletterForm locale={locale} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {year} Fotografo Santo Domingo.
          </p>
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/privacy`} className="text-gray-400 hover:text-white text-sm transition-colors">
              {locale === 'es' ? 'Privacidad' : 'Privacy'}
            </Link>
            <Link href={`/${locale}/terms`} className="text-gray-400 hover:text-white text-sm transition-colors">
              {locale === 'es' ? 'Términos' : 'Terms'}
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t border-gray-800">
          <p>
            {locale === 'es' ? (
              <>
                También nos encuentras en{' '}
                <a
                  href="https://www.babulashotsrd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 font-semibold hover:text-yellow-300 transition-colors"
                >
                  babulashotsrd.com
                </a>
                {' '}— el mismo fotógrafo, más servicios.
              </>
            ) : (
              <>
                Also find us at{' '}
                <a
                  href="https://www.babulashotsrd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 font-semibold hover:text-yellow-300 transition-colors"
                >
                  babulashotsrd.com
                </a>
                {' '}— same photographer, more services.
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  )
}