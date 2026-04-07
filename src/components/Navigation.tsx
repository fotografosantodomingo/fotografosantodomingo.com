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
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">
              Fotografo Santo Domingo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={`text-gray-700 hover:text-primary-600 transition-colors ${
                  pathname === `/${locale}${item.href}` ? 'text-primary-600 font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="https://wa.me/18097209547"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {t('whatsapp')}
            </a>
            <Link href={`/${locale}/contact`} className="btn-secondary">
              {t('book_now')}
            </Link>

            {/* Language Switcher */}
            <Link
              href={switchPath}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              {t('language_switch')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
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
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={`text-gray-700 hover:text-primary-600 transition-colors ${
                    pathname === `/${locale}${item.href}` ? 'text-primary-600 font-semibold' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex flex-col space-y-2 pt-4 border-t">
                <a
                  href="https://wa.me/18097209547"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('whatsapp')}
                </a>
                <Link
                  href={`/${locale}/contact`}
                  className="btn-secondary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('book_now')}
                </Link>
                <Link
                  href={switchPath}
                  className="text-center text-gray-600 hover:text-primary-600 transition-colors"
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