'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

type MenuItem = {
  href: string
  labelKey: string
  descriptionKey?: string
}

type MenuCategory = {
  key: string
  labelKey: string
  items: MenuItem[]
}

export default function Navigation() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDesktopCategory, setOpenDesktopCategory] = useState<string | null>(null)
  const [openMobileCategories, setOpenMobileCategories] = useState<Record<string, boolean>>({})
  const desktopMenuRef = useRef<HTMLDivElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)

  // Get current locale from pathname
  const locale = pathname.startsWith('/en') ? 'en' : 'es'

  const megaMenuCategories: MenuCategory[] = useMemo(() => {
    const serviceItems = [
      { href: '/services/wedding-photography', labelKey: 'items.weddingPhotography', descriptionKey: 'descriptions.weddingPhotography' },
      { href: '/services/portrait-photography', labelKey: 'items.portraitPhotography', descriptionKey: 'descriptions.portraitPhotography' },
      { href: '/services/event-photography', labelKey: 'items.eventPhotography', descriptionKey: 'descriptions.eventPhotography' },
      { href: '/services/commercial-photography', labelKey: 'items.commercialPhotography', descriptionKey: 'descriptions.commercialPhotography' },
      { href: '/services/family-photography', labelKey: 'items.familyPhotography', descriptionKey: 'descriptions.familyPhotography' },
      { href: '/services/portrait-photography', labelKey: 'items.studioPhotography', descriptionKey: 'descriptions.studioPhotography' },
      { href: '/portfolio', labelKey: 'items.travelPhotography', descriptionKey: 'descriptions.travelPhotography' },
      { href: '/services/drone-services-photography-punta-cana', labelKey: 'items.droneServices', descriptionKey: 'descriptions.droneServices' },
      { href: '/services', labelKey: 'items.additionalServices', descriptionKey: 'descriptions.additionalServices' },
    ]

    const myWorkItems = [
      { href: '/portfolio?category=wedding', labelKey: 'items.workWeddings', descriptionKey: 'descriptions.workWeddings' },
      { href: '/portfolio?category=portrait', labelKey: 'items.workSessions', descriptionKey: 'descriptions.workSessions' },
      { href: '/portfolio?category=event', labelKey: 'items.workEvents', descriptionKey: 'descriptions.workEvents' },
      { href: '/portfolio?category=commercial', labelKey: 'items.workCommercialProjects', descriptionKey: 'descriptions.workCommercialProjects' },
      { href: '/portfolio', labelKey: 'items.workHighlights', descriptionKey: 'descriptions.workHighlights' },
    ]

    const portfolioItems = [
      { href: '/portfolio?category=wedding', labelKey: 'items.galleryWeddings', descriptionKey: 'descriptions.galleryWeddings' },
      { href: '/portfolio?category=portrait', labelKey: 'items.galleryPortraits', descriptionKey: 'descriptions.galleryPortraits' },
      { href: '/portfolio?category=event', labelKey: 'items.galleryEvents', descriptionKey: 'descriptions.galleryEvents' },
      { href: '/portfolio?category=drone', labelKey: 'items.galleryRealEstate', descriptionKey: 'descriptions.galleryRealEstate' },
      { href: '/portfolio?category=commercial', labelKey: 'items.galleryCommercial', descriptionKey: 'descriptions.galleryCommercial' },
    ]

    const infoItems = [
      { href: '/about', labelKey: 'items.aboutMe', descriptionKey: 'descriptions.aboutMe' },
      { href: '/services', labelKey: 'items.pricing', descriptionKey: 'descriptions.pricing' },
      { href: '/contact#faq', labelKey: 'items.faq', descriptionKey: 'descriptions.faq' },
      { href: '/portfolio', labelKey: 'items.testimonials', descriptionKey: 'descriptions.testimonials' },
    ]

    return [
      { key: 'services', labelKey: 'services', items: serviceItems },
      { key: 'my_work', labelKey: 'my_work', items: myWorkItems },
      { key: 'portfolio', labelKey: 'portfolio_menu', items: portfolioItems },
      { key: 'info', labelKey: 'info', items: infoItems },
    ]
  }, [locale])

  const baseNavItems = [
    { href: '/', label: t('home') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ]

  const switchLocale = locale === 'es' ? 'en' : 'es'
  const switchPath = pathname.replace(`/${locale}`, `/${switchLocale}`) || `/${switchLocale}`

  const getLocalizedHref = (href: string) => {
    if (href === '/') return `/${locale}`
    return `/${locale}${href}`
  }

  const getPathOnly = (href: string) => getLocalizedHref(href).split(/[?#]/)[0]

  const isHrefActive = (href: string) => {
    const pathOnly = getPathOnly(href)
    if (pathOnly === `/${locale}`) return pathname === pathOnly
    return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`)
  }

  const isCategoryActive = (category: MenuCategory) => {
    return category.items.some((item) => isHrefActive(item.href))
  }

  const getColumns = (items: MenuItem[]) => {
    const columns: MenuItem[][] = [[], [], [], []]
    items.forEach((item, index) => {
      columns[index % 4].push(item)
    })
    return columns
  }

  const toggleMobileCategory = (categoryKey: string) => {
    setOpenMobileCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }))
  }

  const focusDesktopCategory = (categoryKey: string) => {
    const target = desktopMenuRef.current?.querySelector<HTMLButtonElement>(`button[data-menu-category="${categoryKey}"]`)
    target?.focus()
  }

  const categoryKeys = megaMenuCategories.map((category) => category.key)

  const focusFirstPanelItem = (categoryKey: string) => {
    const target = desktopMenuRef.current?.querySelector<HTMLAnchorElement>(`a[data-menu-panel-category="${categoryKey}"]`)
    target?.focus()
  }

  const handleCategoryKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, categoryKey: string) => {
    const currentIndex = categoryKeys.indexOf(categoryKey)

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      const nextIndex = (currentIndex + 1) % categoryKeys.length
      focusDesktopCategory(categoryKeys[nextIndex])
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      const prevIndex = (currentIndex - 1 + categoryKeys.length) % categoryKeys.length
      focusDesktopCategory(categoryKeys[prevIndex])
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpenDesktopCategory(categoryKey)
      requestAnimationFrame(() => focusFirstPanelItem(categoryKey))
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpenDesktopCategory(null)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpenDesktopCategory((prev) => (prev === categoryKey ? null : categoryKey))
    }
  }

  const handlePanelItemKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>, categoryKey: string) => {
    const links = Array.from(desktopMenuRef.current?.querySelectorAll<HTMLAnchorElement>(`a[data-menu-panel-category="${categoryKey}"]`) || [])
    const currentIndex = links.findIndex((link) => link === event.currentTarget)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = links[(currentIndex + 1) % links.length]
      next?.focus()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prev = links[(currentIndex - 1 + links.length) % links.length]
      prev?.focus()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpenDesktopCategory(null)
      focusDesktopCategory(categoryKey)
    }
  }

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDesktopCategory(null)
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!desktopMenuRef.current) return
      if (!desktopMenuRef.current.contains(event.target as Node)) {
        setOpenDesktopCategory(null)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = ''
      return
    }

    const previousActive = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'

    const focusables = mobileMenuRef.current?.querySelectorAll<HTMLElement>('a,button,[tabindex]:not([tabindex="-1"])')
    focusables?.[0]?.focus()

    const trapTab = (event: KeyboardEvent) => {
      if (!isMenuOpen || !mobileMenuRef.current) return

      if (event.key === 'Escape') {
        event.preventDefault()
        setIsMenuOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const interactive = Array.from(mobileMenuRef.current.querySelectorAll<HTMLElement>('a,button,[tabindex]:not([tabindex="-1"])'))
      if (interactive.length === 0) return

      const first = interactive[0]
      const last = interactive[interactive.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', trapTab)
    return () => {
      window.removeEventListener('keydown', trapTab)
      document.body.style.overflow = ''
      previousActive?.focus()
    }
  }, [isMenuOpen])

  return (
    <nav className="bg-white/95 text-gray-900 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 dark:bg-gray-950/95 dark:text-white dark:border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 gap-2">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Fotografo Santo Domingo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div ref={desktopMenuRef} className="hidden md:flex items-center gap-1" role="menubar" aria-label={t('services')}>
            {baseNavItems.map((item) => (
              <Link
                key={item.href}
                href={getLocalizedHref(item.href)}
                role="menuitem"
                aria-current={isHrefActive(item.href) ? 'page' : undefined}
                className={`text-sm transition-colors px-3 py-2 rounded-lg ${
                  isHrefActive(item.href)
                    ? 'text-sky-500 dark:text-sky-400 font-semibold bg-sky-500/10'
                    : 'text-gray-700 hover:text-sky-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-sky-400 dark:hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {megaMenuCategories.map((category) => {
              const isOpen = openDesktopCategory === category.key
              const isActive = isCategoryActive(category)

              return (
                <div
                  key={category.key}
                  className="relative"
                  onMouseEnter={() => setOpenDesktopCategory(category.key)}
                  onMouseLeave={() => setOpenDesktopCategory(null)}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className={`inline-flex items-center gap-2 text-sm transition-colors px-3 py-2 rounded-lg ${
                      isActive || isOpen
                        ? 'text-sky-500 dark:text-sky-400 font-semibold bg-sky-500/10'
                        : 'text-gray-700 hover:text-sky-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-sky-400 dark:hover:bg-white/5'
                    }`}
                    data-menu-category={category.key}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-controls={`mega-panel-${category.key}`}
                    onFocus={() => setOpenDesktopCategory(category.key)}
                    onKeyDown={(event) => handleCategoryKeyDown(event, category.key)}
                  >
                    {t(category.labelKey)}
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <div
                    id={`mega-panel-${category.key}`}
                    className={`absolute left-1/2 top-full -translate-x-1/2 w-[min(1100px,90vw)] pt-3 transition-all duration-300 ease-in-out ${
                      isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
                    }`}
                    role="menu"
                    aria-label={t(category.labelKey)}
                  >
                    <div className="rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-2xl p-6 dark:border-white/10 dark:bg-gray-900/95">
                      <div className="grid grid-cols-4 gap-4">
                        {getColumns(category.items).map((column, colIndex) => (
                          <div key={`${category.key}-col-${colIndex}`} className="space-y-2">
                            {column.map((item) => (
                              <Link
                                key={item.href}
                                href={getLocalizedHref(item.href)}
                                role="menuitem"
                                data-menu-category={category.key}
                                data-menu-panel-category={category.key}
                                aria-current={isHrefActive(item.href) ? 'page' : undefined}
                                className="block rounded-xl px-3 py-2.5 min-h-[44px] transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                                onClick={() => setOpenDesktopCategory(null)}
                                onKeyDown={(event) => handlePanelItemKeyDown(event, category.key)}
                              >
                                <p className="text-sm font-semibold text-gray-900 hover:text-sky-700 dark:text-gray-100 dark:hover:text-sky-300">
                                  {t(item.labelKey)}
                                </p>
                                {item.descriptionKey && (
                                  <p className="text-xs text-gray-600 mt-1 leading-snug dark:text-gray-400">
                                    {t(item.descriptionKey)}
                                  </p>
                                )}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href={switchPath}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 dark:text-gray-400 dark:hover:text-white dark:border-white/10 dark:hover:border-white/20"
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
            className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-main-menu"
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
          <div id="mobile-main-menu" ref={mobileMenuRef} className="md:hidden py-5 border-t border-gray-200 dark:border-white/10" role="dialog" aria-modal="true" aria-label={t('services')}>
            <div className="flex flex-col space-y-2">
              {baseNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={getLocalizedHref(item.href)}
                  aria-current={isHrefActive(item.href) ? 'page' : undefined}
                  className={`px-3 py-2.5 rounded-lg transition-colors ${
                    isHrefActive(item.href)
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {megaMenuCategories.map((category) => {
                const isOpen = !!openMobileCategories[category.key]

                return (
                  <div key={category.key} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden dark:border-white/10 dark:bg-white/5">
                    <button
                      type="button"
                      className="w-full min-h-[44px] px-3 py-3 text-left flex items-center justify-between text-gray-800 dark:text-gray-200"
                      onClick={() => toggleMobileCategory(category.key)}
                      aria-expanded={isOpen}
                      aria-controls={`mobile-category-${category.key}`}
                      data-menu-category={category.key}
                    >
                      <span className="font-semibold">{t(category.labelKey)}</span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-[250ms] ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    <div
                      id={`mobile-category-${category.key}`}
                      className={`grid transition-all duration-[250ms] ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="overflow-hidden">
                        <div className="pb-2 px-2 space-y-1">
                          {category.items.map((item) => (
                            <Link
                              key={item.href}
                              href={getLocalizedHref(item.href)}
                              data-menu-category={category.key}
                              aria-current={isHrefActive(item.href) ? 'page' : undefined}
                              className="block min-h-[44px] rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {t(item.labelKey)}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 mt-2 dark:border-white/10">
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
                  href={getLocalizedHref('/get-quote')}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold text-center px-4 py-3 rounded-lg transition-colors dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('book_now')}
                </Link>
                <Link
                  href={switchPath}
                  className="text-center text-gray-600 hover:text-gray-900 transition-colors py-2 dark:text-gray-400 dark:hover:text-white"
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