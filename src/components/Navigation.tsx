'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navigation() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Get current locale from pathname
  const locale = pathname.startsWith('/en') ? 'en' : 'es'

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/services', label: t('services') },
    { href: '/portfolio', label: t('portfolio') },
    { href: '/about', label: t('about') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ]

  const switchLocale = locale === 'es' ? 'en' : 'es'
  const switchPath = pathname.replace(`/${locale}`, `/${switchLocale}`) || `/${switchLocale}`

  return (
    <nav className="bg-gray-950/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">
              Fotografo Santo Domingo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={`text-sm transition-colors ${
                  pathname === `/${locale}${item.href}`
                    ? 'text-sky-400 font-semibold'
                    : 'text-gray-300 hover:text-sky-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href={switchPath}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
            >
              {t('language_switch')}
            </Link>
            <a
              href="https://wa.me/18097209547"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {t('whatsapp')}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-5 border-t border-white/10">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={`px-3 py-2.5 rounded-lg transition-colors ${
                    pathname === `/${locale}${item.href}`
                      ? 'bg-sky-500/10 text-sky-400 font-semibold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex flex-col gap-2 pt-4 border-t border-white/10 mt-2">
                <a
                  href="https://wa.me/18097209547"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sky-500 hover:bg-sky-400 text-white font-semibold text-center px-4 py-3 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('whatsapp')}
                </a>
                <Link
                  href={`/${locale}/contact`}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-center px-4 py-3 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('book_now')}
                </Link>
                <Link
                  href={switchPath}
                  className="text-center text-gray-400 hover:text-white transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('language_switch')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}