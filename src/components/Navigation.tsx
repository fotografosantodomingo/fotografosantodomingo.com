'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { findSpokeByRoute } from '@/data/spoke-pages'
import ThemeToggle from '@/components/ThemeToggle'

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

  const locale = pathname.startsWith('/en') ? 'en' : 'es'

  const megaMenuCategories: MenuCategory[] = useMemo(() => {
    const serviceItems = [
      { href: '/services/wedding-photography', labelKey: 'items.weddingPhotography', descriptionKey: 'descriptions.weddingPhotography' },
      { href: '/services/birthday-photographer', labelKey: 'items.birthdayPhotography', descriptionKey: 'descriptions.birthdayPhotography' },
      { href: '/services/portrait-photography', labelKey: 'items.portraitPhotography', descriptionKey: 'descriptions.portraitPhotography' },
      { href: '/services/event-photography', labelKey: 'items.eventPhotography', descriptionKey: 'descriptions.eventPhotography' },
      { href: '/services/commercial-photography', labelKey: 'items.commercialPhotography', descriptionKey: 'descriptions.commercialPhotography' },
      { href: '/services/family-photography', labelKey: 'items.familyPhotography', descriptionKey: 'descriptions.familyPhotography' },
      { href: '/services/drone-services-photography-punta-cana', labelKey: 'items.droneServices', descriptionKey: 'descriptions.droneServices' },
      { href: '/services/proposal-photography', labelKey: 'items.proposalPhotography', descriptionKey: 'descriptions.proposalPhotography' },
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
      { href: '/portfolio?category=birthday', labelKey: 'items.galleryBirthdays', descriptionKey: 'descriptions.galleryBirthdays' },
      { href: '/portfolio?category=portrait', labelKey: 'items.galleryPortraits', descriptionKey: 'descriptions.galleryPortraits' },
      { href: '/portfolio?category=event', labelKey: 'items.galleryEvents', descriptionKey: 'descriptions.galleryEvents' },
      { href: '/portfolio?category=drone', labelKey: 'items.galleryRealEstate', descriptionKey: 'descriptions.galleryRealEstate' },
      { href: '/portfolio?category=commercial', labelKey: 'items.galleryCommercial', descriptionKey: 'descriptions.galleryCommercial' },
    ]

    const infoItems = [
      { href: '/about', labelKey: 'items.aboutMe', descriptionKey: 'descriptions.aboutMe' },
      { href: '/services', labelKey: 'items.pricing', descriptionKey: 'descriptions.pricing' },
      { href: '/contact#faq', labelKey: 'items.faq', descriptionKey: 'descriptions.faq' },
      { href: '/testimonials', labelKey: 'items.testimonials', descriptionKey: 'descriptions.testimonials' },
    ]

    return [
      { key: 'services', labelKey: 'services', items: serviceItems },
      { key: 'my_work', labelKey: 'my_work', items: myWorkItems },
      { key: 'portfolio', labelKey: 'portfolio_menu', items: portfolioItems },
      { key: 'info', labelKey: 'info', items: infoItems },
    ]
  }, [])

  const baseNavItems = [
    { href: '/', label: t('home') },
    { href: '/punta-cana', label: 'Punta Cana' },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ]

  const switchLocale = locale === 'es' ? 'en' : 'es'

  const buildSwitchPath = (): string => {
    const pathAfterLocale = pathname.replace(`/${locale}`, '')
    const parts = pathAfterLocale.split('/').filter(Boolean)
    if (parts.length === 2) {
      const [hub, spoke] = parts
      const spokeData = findSpokeByRoute(locale, hub, spoke)
      if (spokeData) {
        const targetSlug = switchLocale === 'es' ? spokeData.esSlug : spokeData.enSlug
        return `/${switchLocale}/${targetSlug}`
      }
    }
    return pathname.replace(`/${locale}`, `/${switchLocale}`) || `/${switchLocale}`
  }

  const switchPath = buildSwitchPath()

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

  // Bugatti class atoms — declared once for readability
  const navLinkBase =
    'font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink/80 hover:text-ink transition-opacity'
  const navLinkActive = 'text-ink'
  const pillCtaBase =
    'inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-5 py-2.5 rounded-full border border-hairline text-ink transition-colors duration-200 hover:bg-ink hover:text-canvas'
  const pillSecondary =
    'inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-3 py-1.5 rounded-md border border-hairline-soft text-ink/80 hover:text-ink hover:border-hairline transition-colors duration-200'

  return (
    <nav className="bg-canvas text-ink border-b border-hairline-soft sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 gap-2">
          {/* Logo — unified to "Babula Shots" across desktop + mobile */}
          <Link
            href={`/${locale}`}
            className="font-mono uppercase tracking-[0.18em] text-[13px] md:text-[14px] text-ink hover:opacity-70 transition-opacity shrink-0"
            aria-label="Babula Shots — Fotógrafo Santo Domingo"
          >
            Babula Shots
          </Link>

          {/* Mobile-only header utilities — theme toggle + locale switcher next to logo.
              Visible on mobile only (md:hidden). Desktop has its own theme toggle and
              locale switcher slot further to the right. Spacing tuned for thumb-reach
              on small screens — generous gap between items and a hairline separator
              before the hamburger so the locale link doesn't visually merge with it. */}
          <div className="md:hidden flex items-center gap-5 ml-auto mr-4 pr-4 border-r border-hairline-soft">
            <ThemeToggle />
            <Link
              href={switchPath}
              className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity py-2 px-1 -mx-1"
              aria-label={`Switch language to ${switchLocale.toUpperCase()}`}
            >
              {switchLocale.toUpperCase()}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div ref={desktopMenuRef} className="hidden md:flex items-center gap-2 lg:gap-4" role="menubar" aria-label={t('services')}>
            {baseNavItems.map((item) => (
              <Link
                key={item.href}
                href={getLocalizedHref(item.href)}
                role="menuitem"
                aria-current={isHrefActive(item.href) ? 'page' : undefined}
                className={`${navLinkBase} ${isHrefActive(item.href) ? navLinkActive + ' underline underline-offset-[6px] decoration-1' : ''} px-1 py-2`}
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
                    className={`${navLinkBase} ${
                      isActive || isOpen ? navLinkActive : ''
                    } inline-flex items-center gap-1.5 px-1 py-2`}
                    data-menu-category={category.key}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-controls={`mega-panel-${category.key}`}
                    onFocus={() => setOpenDesktopCategory(category.key)}
                    onKeyDown={(event) => handleCategoryKeyDown(event, category.key)}
                  >
                    {t(category.labelKey)}
                    <svg
                      className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
                    className={`absolute left-1/2 top-full -translate-x-1/2 w-[min(1100px,90vw)] pt-3 transition-opacity duration-200 ease-out ${
                      isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
                    role="menu"
                    aria-label={t(category.labelKey)}
                  >
                    {/* Bugatti panel: bg-canvas, hairline border, no shadow, no radius */}
                    <div className="bg-canvas border border-hairline-soft p-8">
                      <div className="grid grid-cols-4 gap-x-8 gap-y-2">
                        {getColumns(category.items).map((column, colIndex) => (
                          <div key={`${category.key}-col-${colIndex}`} className="space-y-1">
                            {column.map((item) => (
                              <Link
                                key={item.href}
                                href={getLocalizedHref(item.href)}
                                role="menuitem"
                                data-menu-category={category.key}
                                data-menu-panel-category={category.key}
                                aria-current={isHrefActive(item.href) ? 'page' : undefined}
                                className="block py-2.5 group"
                                onClick={() => setOpenDesktopCategory(null)}
                                onKeyDown={(event) => handlePanelItemKeyDown(event, category.key)}
                              >
                                <p className="font-mono uppercase tracking-widest text-[12px] text-ink group-hover:opacity-70 transition-opacity">
                                  {t(item.labelKey)}
                                </p>
                                {item.descriptionKey && (
                                  <p className="text-xs text-ink-muted mt-1 leading-snug">
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
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={switchPath}
              className={pillSecondary}
              aria-label={`Switch language to ${switchLocale.toUpperCase()}`}
            >
              {switchLocale.toUpperCase()}
            </Link>
            <a
              href="https://wa.me/18097789547"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono uppercase tracking-widest text-[12px] text-ink/80 hover:text-ink transition-opacity hidden lg:inline-block"
            >
              {t('whatsapp')}
            </a>
            <Link href={getLocalizedHref('/book')} className={pillCtaBase}>
              {t('book_now')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-ink"
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
          <div
            id="mobile-main-menu"
            ref={mobileMenuRef}
            className="md:hidden py-5 border-t border-hairline-soft"
            role="dialog"
            aria-modal="true"
            aria-label={t('services')}
          >
            <div className="flex flex-col gap-1">
              {baseNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={getLocalizedHref(item.href)}
                  aria-current={isHrefActive(item.href) ? 'page' : undefined}
                  className={`${navLinkBase} ${
                    isHrefActive(item.href) ? navLinkActive : ''
                  } py-3 min-h-[44px] flex items-center`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {megaMenuCategories.map((category) => {
                const isOpen = !!openMobileCategories[category.key]

                return (
                  <div key={category.key} className="border-t border-hairline-soft">
                    <button
                      type="button"
                      className="w-full min-h-[44px] py-3 flex items-center justify-between font-mono uppercase tracking-widest text-[12px] text-ink"
                      onClick={() => toggleMobileCategory(category.key)}
                      aria-expanded={isOpen}
                      aria-controls={`mobile-category-${category.key}`}
                      data-menu-category={category.key}
                    >
                      <span>{t(category.labelKey)}</span>
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
                      id={`mobile-category-${category.key}`}
                      className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="overflow-hidden">
                        <div className="pb-3 pl-2 space-y-1">
                          {category.items.map((item) => (
                            <Link
                              key={item.href}
                              href={getLocalizedHref(item.href)}
                              data-menu-category={category.key}
                              aria-current={isHrefActive(item.href) ? 'page' : undefined}
                              className="block min-h-[40px] py-2 font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
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

              <div className="flex flex-col gap-3 pt-5 mt-2 border-t border-hairline-soft">
                <a
                  href="https://wa.me/18097789547"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={pillSecondary + ' w-full'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('whatsapp')}
                </a>
                <Link
                  href={getLocalizedHref('/book')}
                  className={pillCtaBase + ' w-full'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('book_now')}
                </Link>
                {/* Locale switcher moved to mobile header (next to logo). */}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
