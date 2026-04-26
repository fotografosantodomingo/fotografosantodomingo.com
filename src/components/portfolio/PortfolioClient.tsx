'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { CONTACT_INFO } from '@/lib/utils/constants'
import type { PortfolioImage } from '@/lib/types/portfolio'
import { resolveLocale } from '@/lib/types/portfolio'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'dwewurxla'
const FALLBACK_IMAGE = `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/samples/landscapes/nature-mountains`
function cloudUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/${publicId}`
}
function cloudUrlLarge(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_2400/${publicId}`
}

interface PortfolioClientProps {
  images: PortfolioImage[]
  locale: string
}

export default function PortfolioClient({ images, locale }: PortfolioClientProps) {
  const searchParams = useSearchParams()
  const [activeFilter, setActiveFilter] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, true>>({})

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const openLightbox = useCallback((item: PortfolioImage) => {
    const idx = images.findIndex((img) => img.id === item.id)
    setLightboxIndex(idx >= 0 ? idx : null)
  }, [images])
  const showPrev = useCallback(() => {
    if (lightboxIndex === null || images.length === 0) return
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
  }, [lightboxIndex, images.length])
  const showNext = useCallback(() => {
    if (lightboxIndex === null || images.length === 0) return
    setLightboxIndex((lightboxIndex + 1) % images.length)
  }, [lightboxIndex, images.length])
  const markFailed = useCallback((id: string) => {
    setFailedImages((prev) => (prev[id] ? prev : { ...prev, [id]: true }))
  }, [])
  const getThumbSrc = useCallback((item: PortfolioImage) => {
    return failedImages[item.id] ? FALLBACK_IMAGE : cloudUrl(item.public_id)
  }, [failedImages])
  const getLargeSrc = useCallback((item: PortfolioImage) => {
    return failedImages[item.id] ? FALLBACK_IMAGE : cloudUrlLarge(item.public_id)
  }, [failedImages])

  const lightbox = lightboxIndex !== null ? images[lightboxIndex] ?? null : null

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, closeLightbox, showPrev, showNext])

  const categories = [
    { id: 'all',        label: locale === 'es' ? 'Todos'     : 'All' },
    { id: 'wedding',   label: locale === 'es' ? 'Bodas'     : 'Weddings' },
    { id: 'birthday',  label: locale === 'es' ? 'Cumpleanos' : 'Birthdays' },
    { id: 'portrait',  label: locale === 'es' ? 'Retratos'  : 'Portraits' },
    { id: 'drone',     label: locale === 'es' ? 'Drones'    : 'Drone' },
    { id: 'event',     label: locale === 'es' ? 'Eventos'   : 'Events' },
    { id: 'commercial',label: locale === 'es' ? 'Comercial' : 'Commercial' },
  ]

  const categoryEmoji: Record<string, string> = {
    wedding: '💍', birthday: '🎂', portrait: '👤', drone: '🚁', event: '🎉', commercial: '📸',
  }

  useEffect(() => {
    const category = searchParams.get('category')
    const valid = ['wedding', 'birthday', 'portrait', 'drone', 'event', 'commercial']
    if (category && valid.includes(category)) {
      setActiveFilter(category)
      return
    }
    setActiveFilter('all')
  }, [searchParams])

  const filteredItems = activeFilter === 'all'
    ? images
    : images.filter((img) => img.category === activeFilter)

  const featuredItems = images.filter((img) => img.featured)

  return (
    <main className="min-h-screen bg-canvas text-ink">
      {/* Hero */}
      <section className="border-b border-hairline-soft py-20 md:py-28 lg:py-32">
        <div className="container mx-auto px-4">
          <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
            {locale === 'es' ? 'Portafolio · Selección' : 'Portfolio · Selection'}
          </p>
          <h1
            className="font-display uppercase text-ink max-w-5xl"
            style={{
              fontSize: 'clamp(40px, 9vw, 144px)',
              lineHeight: '0.95',
              letterSpacing: '-0.01em',
            }}
          >
            {locale === 'es' ? 'Nuestro portafolio' : 'Our portfolio'}
          </h1>
          <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-8 leading-relaxed">
            {locale === 'es'
              ? 'Descubre nuestra colección de momentos capturados con pasión y profesionalismo.'
              : 'Discover our collection of moments captured with passion and professionalism.'}
          </p>
          <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
            >
              {locale === 'es' ? 'Reservar sesión' : 'Book a session'}
            </a>
            <Link
              href={`/${locale}/services`}
              className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
            >
              {locale === 'es' ? 'Ver servicios' : 'View services'}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Work — full-bleed photograph */}
      <section className="border-b border-hairline-soft py-12 md:py-16 bg-black">
        <div className="container mx-auto px-0 md:px-4">
          <figure className="m-0">
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
              <Image
                src="https://res.cloudinary.com/dwewurxla/image/upload/f_auto,q_auto,w_2400/photo_sessions_dominican_republic_Photographer_in_santo_domingo_laidus"
                alt={locale === 'es'
                  ? 'Fotografo en Santo Domingo Republica Dominicana sesion de fotos profesional'
                  : 'Photographer in Santo Domingo Dominican Republic professional photo session'}
                title={locale === 'es'
                  ? 'Sesion de fotos en Santo Domingo Republica Dominicana'
                  : 'Photo session in Santo Domingo Dominican Republic'}
                width={2400}
                height={1350}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </figure>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="border-b border-hairline-soft py-16 md:py-20">
        <div className="container mx-auto px-0 md:px-4">
          <div className="px-4 md:px-0 mb-10">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {locale === 'es' ? 'Filtrar' : 'Filter'}
            </p>
            <ul className="flex flex-wrap gap-2 md:gap-3">
              {categories.map((category) => {
                const active = activeFilter === category.id
                return (
                  <li key={category.id}>
                    <button
                      onClick={() => setActiveFilter(category.id)}
                      aria-pressed={active}
                      className={`inline-flex items-center justify-center font-mono uppercase tracking-widest text-[11px] px-5 py-2.5 rounded-full border transition-colors duration-200 ${
                        active
                          ? 'bg-ink text-canvas border-ink'
                          : 'border-hairline text-ink hover:bg-ink hover:text-canvas'
                      }`}
                    >
                      {category.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-2">
            {filteredItems.map((item, index) => {
              const loc = resolveLocale(item, locale)
              // First 2 items are above the fold — no lazy loading (better LCP)
              const isPriority = index < 2
              return (
                <figure key={item.id} className="group cursor-pointer m-0" onClick={() => openLightbox(item)}>
                  <div className="relative overflow-hidden">
                    <Image
                      src={getThumbSrc(item)}
                      alt={loc.alt}
                      title={loc.title}
                      width={item.width || 1200}
                      height={item.height || 800}
                      className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading={isPriority ? 'eager' : 'lazy'}
                      priority={isPriority}
                      onError={() => markFailed(item.id)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                      <div className="px-4 py-3 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="font-mono uppercase tracking-widest text-[11px] text-white">
                          {loc.title}
                        </p>
                        {item.location && (
                          <p className="font-mono uppercase tracking-widest text-[10px] text-white/70 mt-1">
                            {item.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </figure>
              )
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16 md:py-20 px-4">
              <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
                {locale === 'es' ? 'Vacío' : 'Empty'}
              </p>
              <p className="text-base text-ink-muted">
                {locale === 'es' ? 'No hay trabajos en esta categoría aún.' : 'No work in this category yet.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-hairline-soft py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-hairline-soft max-w-4xl">
            {[
              { value: '500+', label: locale === 'es' ? 'Clientes' : 'Clients' },
              { value: '10+', label: locale === 'es' ? 'Años' : 'Years' },
              { value: '20+', label: locale === 'es' ? 'Ubicaciones' : 'Locations' },
              { value: '5★', label: locale === 'es' ? 'Google' : 'Google' },
            ].map(({ value, label }) => (
              <div key={label} className="border-r border-b border-hairline-soft p-5 md:p-7">
                <div
                  className="font-display text-ink"
                  style={{ fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: '1' }}
                >
                  {value}
                </div>
                <div className="mt-3 font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {locale === 'es' ? 'Contacto' : 'Contact'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-5"
              style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '1.0' }}
            >
              {locale === 'es' ? '¿Te gusta lo que ves?' : 'Like what you see?'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg mb-10 leading-relaxed max-w-xl">
              {locale === 'es'
                ? 'Contáctanos para discutir tu proyecto fotográfico personalizado.'
                : 'Contact us to discuss your custom photography project.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-[#25D366] text-black hover:opacity-90 transition-opacity duration-200"
              >
                WhatsApp
              </a>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
              >
                {locale === 'es' ? 'Enviar mensaje' : 'Send message'}
              </Link>
              <Link
                href={`/${locale}/get-quote`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
              >
                {locale === 'es' ? 'Cotizar' : 'Get quote'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (() => {
        const loc = resolveLocale(lightbox, locale)
        return (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={closeLightbox}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-black/80 border-b border-slate-200 dark:border-hairline-soft flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="flex items-center gap-2 text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-ink-muted transition-colors font-medium text-sm"
              >
                <span className="text-xl leading-none">←</span>
                {locale === 'es' ? 'Volver al portafolio' : 'Back to portfolio'}
              </button>
              <div className="text-slate-900 dark:text-white text-center flex-1 mx-4">
                <p className="font-semibold text-sm truncate">{loc.title}</p>
                {lightbox.location && (
                  <p className="text-xs text-slate-500 dark:text-ink-muted">{lightbox.location}</p>
                )}
                <p className="text-xs text-slate-500 dark:text-ink-muted mt-0.5">
                  {(lightboxIndex ?? 0) + 1} / {images.length}
                </p>
              </div>
              <button
                onClick={closeLightbox}
                className="text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-ink-muted transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Image — fills remaining space */}
            <div
              className="flex-1 flex items-center justify-center overflow-hidden"
              onClick={closeLightbox}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  showPrev()
                }}
                className="absolute left-3 md:left-6 z-10 h-11 w-11 rounded-full bg-white/90 text-slate-900 hover:bg-white dark:bg-black/60 dark:text-white dark:hover:bg-black/80 flex items-center justify-center text-2xl shadow-lg"
                aria-label={locale === 'es' ? 'Foto anterior' : 'Previous photo'}
              >
                ‹
              </button>
              <Image
                src={getLargeSrc(lightbox)}
                alt={loc.alt}
                title={loc.title}
                width={lightbox.width || 2400}
                height={lightbox.height || 1600}
                className="max-w-full max-h-full object-contain"
                priority
                onError={() => markFailed(lightbox.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  showNext()
                }}
                className="absolute right-3 md:right-6 z-10 h-11 w-11 rounded-full bg-white/90 text-slate-900 hover:bg-white dark:bg-black/60 dark:text-white dark:hover:bg-black/80 flex items-center justify-center text-2xl shadow-lg"
                aria-label={locale === 'es' ? 'Siguiente foto' : 'Next photo'}
              >
                ›
              </button>
            </div>
          </div>
        )
      })()}
    </main>
  )
}
