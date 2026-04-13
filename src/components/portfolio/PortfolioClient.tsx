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
  const [lightbox, setLightbox] = useState<PortfolioImage | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, true>>({})

  const closeLightbox = useCallback(() => setLightbox(null), [])
  const markFailed = useCallback((id: string) => {
    setFailedImages((prev) => (prev[id] ? prev : { ...prev, [id]: true }))
  }, [])
  const getThumbSrc = useCallback((item: PortfolioImage) => {
    return failedImages[item.id] ? FALLBACK_IMAGE : cloudUrl(item.public_id)
  }, [failedImages])
  const getLargeSrc = useCallback((item: PortfolioImage) => {
    return failedImages[item.id] ? FALLBACK_IMAGE : cloudUrlLarge(item.public_id)
  }, [failedImages])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, closeLightbox])

  const categories = [
    { id: 'all',        label: locale === 'es' ? 'Todos'     : 'All' },
    { id: 'wedding',   label: locale === 'es' ? 'Bodas'     : 'Weddings' },
    { id: 'portrait',  label: locale === 'es' ? 'Retratos'  : 'Portraits' },
    { id: 'drone',     label: locale === 'es' ? 'Drones'    : 'Drone' },
    { id: 'event',     label: locale === 'es' ? 'Eventos'   : 'Events' },
    { id: 'commercial',label: locale === 'es' ? 'Comercial' : 'Commercial' },
  ]

  const categoryEmoji: Record<string, string> = {
    wedding: '💍', portrait: '👤', drone: '🚁', event: '🎉', commercial: '📸',
  }

  useEffect(() => {
    const category = searchParams.get('category')
    const valid = ['wedding', 'portrait', 'drone', 'event', 'commercial']
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
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative bg-gray-950 py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />
        <div className="relative container mx-auto px-4 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {locale === 'es' ? 'Nuestro Portafolio' : 'Our Portfolio'}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {locale === 'es'
              ? 'Descubre nuestra colección de momentos capturados con pasión y profesionalismo'
              : 'Discover our collection of moments captured with passion and professionalism'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              {locale === 'es' ? 'Solicitar Sesión' : 'Book a Session'}
            </a>
            <Link href={`/${locale}/services`} className="bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors">
              {locale === 'es' ? 'Ver Servicios' : 'View Services'}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-0 md:px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === 'es' ? 'Trabajos Destacados' : 'Featured Work'}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Una selección de nuestros proyectos más emblemáticos'
                : 'A selection of our most emblematic projects'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-8 mb-16">
            {featuredItems.map((item) => {
              const loc = resolveLocale(item, locale)
              return (
                <figure key={item.id} className="group cursor-pointer m-0" onClick={() => setLightbox(item)}>
                  <div className="relative overflow-hidden md:rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Image
                      src={getThumbSrc(item)}
                      alt={loc.alt}
                      title={loc.title}
                      width={item.width || 1200}
                      height={item.height || 800}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      priority
                      onError={() => markFailed(item.id)}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                        <p className="text-xl font-bold mb-2">{loc.title}</p>
                        <p className="text-sm">{item.location}</p>
                        <p className="text-xs mt-2 max-w-xs">{loc.description}</p>
                        <p className="text-xs mt-3 bg-white bg-opacity-20 px-3 py-1 rounded-full inline-block">
                          {locale === 'es' ? 'Ver a tamaño original →' : 'View full size →'}
                        </p>
                      </div>
                    </div>
                    {/* Category badge */}
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      {categories.find((c) => c.id === item.category)?.label}
                    </div>
                  </div>
                  {loc.caption && (
                    <figcaption className="text-sm text-gray-500 mt-2 italic px-1 hidden md:block">
                      {loc.caption}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-12 bg-gray-950">
        <div className="container mx-auto px-0 md:px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-12 px-4 md:px-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  activeFilter === category.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-6">
            {filteredItems.map((item, index) => {
              const loc = resolveLocale(item, locale)
              // First 2 items are above the fold — no lazy loading (better LCP)
              const isPriority = index < 2
              return (
                <figure key={item.id} className="group cursor-pointer m-0" onClick={() => setLightbox(item)}>
                  <div className="relative overflow-hidden md:rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <Image
                      src={getThumbSrc(item)}
                      alt={loc.alt}
                      title={loc.title}
                      width={item.width || 1200}
                      height={item.height || 800}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      loading={isPriority ? 'eager' : 'lazy'}
                      priority={isPriority}
                      onError={() => markFailed(item.id)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end">
                      <div className="text-white p-4 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-lg font-bold mb-1">{loc.title}</p>
                        <p className="text-sm opacity-90">{item.location}</p>
                      </div>
                    </div>
                  </div>
                  {loc.caption && (
                    <figcaption className="text-xs text-gray-500 mt-1 italic px-1 hidden md:block">
                      {loc.caption}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {locale === 'es' ? 'No hay trabajos en esta categoría aún.' : 'No work in this category yet.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gray-900 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-4xl md:text-5xl font-bold mb-2">500+</div><div className="text-gray-400">{locale === 'es' ? 'Bodas Cubiertas' : 'Weddings Covered'}</div></div>
            <div><div className="text-4xl md:text-5xl font-bold mb-2">10+</div><div className="text-gray-400">{locale === 'es' ? 'Años de Experiencia' : 'Years Experience'}</div></div>
            <div><div className="text-4xl md:text-5xl font-bold mb-2">20+</div><div className="text-gray-400">{locale === 'es' ? 'Ubicaciones' : 'Locations Served'}</div></div>
            <div><div className="text-4xl md:text-5xl font-bold mb-2">5★</div><div className="text-gray-400">{locale === 'es' ? 'Reseñas en Google' : 'Google Reviews'}</div></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'es' ? '¿Te gusta lo que ves?' : 'Like what you see?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {locale === 'es'
              ? 'Contáctanos para discutir tu proyecto fotográfico personalizado.'
              : 'Contact us to discuss your custom photography project.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              WhatsApp: {CONTACT_INFO.phone}
            </a>
            <Link href={`/${locale}/contact`} className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
              {locale === 'es' ? 'Enviar Mensaje' : 'Send Message'}
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (() => {
        const loc = resolveLocale(lightbox, locale)
        return (
          <div
            className="fixed inset-0 z-50 bg-black flex flex-col"
            onClick={closeLightbox}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-black bg-opacity-80 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors font-medium text-sm"
              >
                <span className="text-xl leading-none">←</span>
                {locale === 'es' ? 'Volver al portafolio' : 'Back to portfolio'}
              </button>
              <div className="text-white text-center flex-1 mx-4">
                <p className="font-semibold text-sm truncate">{loc.title}</p>
                {lightbox.location && (
                  <p className="text-xs text-gray-400">{lightbox.location}</p>
                )}
              </div>
              <button
                onClick={closeLightbox}
                className="text-white hover:text-gray-300 transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
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
            </div>
          </div>
        )
      })()}
    </main>
  )
}
