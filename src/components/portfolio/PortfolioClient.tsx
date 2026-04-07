'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CONTACT_INFO } from '@/lib/utils/constants'
import type { PortfolioImage } from '@/lib/supabase/images'

interface PortfolioClientProps {
  images: PortfolioImage[]
  locale: string
}

export default function PortfolioClient({ images, locale }: PortfolioClientProps) {
  const [activeFilter, setActiveFilter] = useState('all')

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

  const filteredItems = activeFilter === 'all'
    ? images
    : images.filter((img) => img.category === activeFilter)

  const featuredItems = images.filter((img) => img.featured)

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl mx-auto">
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
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              {locale === 'es' ? 'Solicitar Sesión' : 'Book a Session'}
            </a>
            <Link href={`/${locale}/services`} className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {locale === 'es' ? 'Ver Servicios' : 'View Services'}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'es' ? 'Trabajos Destacados' : 'Featured Work'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Una selección de nuestros proyectos más emblemáticos'
                : 'A selection of our most emblematic projects'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredItems.map((item, index) => {
              const title = locale === 'es' ? item.title_es : item.title_en
              const description = locale === 'es' ? item.description_es : item.description_en
              return (
                <figure key={item.id} className="group cursor-pointer m-0">
                  <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {/* Image placeholder — replaced with CloudinaryImage once Cloudinary has the photos */}
                    <div
                      className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                      role="img"
                      aria-label={item.alt_text}
                      title={item.title_attribute}
                    >
                      <div className="text-6xl opacity-30">
                        {categoryEmoji[item.category] ?? '📷'}
                      </div>
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xl font-bold mb-2">{title}</p>
                        <p className="text-sm">{item.location}</p>
                        <p className="text-xs mt-2 max-w-xs">{description}</p>
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                      {categories.find((c) => c.id === item.category)?.label}
                    </div>
                  </div>
                  {/* Semantic figcaption — crawlable by Google */}
                  {item.caption && (
                    <figcaption className="text-sm text-gray-500 mt-2 italic px-1">
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  activeFilter === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => {
              const title = locale === 'es' ? item.title_es : item.title_en
              // First 2 items are above the fold — no lazy loading (better LCP)
              const isPriority = index < 2
              return (
                <figure key={item.id} className="group cursor-pointer m-0">
                  <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div
                      className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                      role="img"
                      aria-label={item.alt_text}
                      title={item.title_attribute}
                      // When real Cloudinary images are connected, replace this div with:
                      // <CloudinaryImage publicId={item.public_id} alt={item.alt_text}
                      //   title={item.title_attribute} priority={isPriority} ... />
                    >
                      <div className="text-4xl opacity-30">
                        {categoryEmoji[item.category] ?? '📷'}
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end">
                      <div className="text-white p-4 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-lg font-bold mb-1">{title}</p>
                        <p className="text-sm opacity-90">{item.location}</p>
                      </div>
                    </div>
                  </div>
                  {item.caption && (
                    <figcaption className="text-xs text-gray-500 mt-1 italic px-1 truncate">
                      {item.caption}
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
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-4xl md:text-5xl font-bold mb-2">500+</div><div className="text-primary-100">{locale === 'es' ? 'Bodas Cubiertas' : 'Weddings Covered'}</div></div>
            <div><div className="text-4xl md:text-5xl font-bold mb-2">10+</div><div className="text-primary-100">{locale === 'es' ? 'Años de Experiencia' : 'Years Experience'}</div></div>
            <div><div className="text-4xl md:text-5xl font-bold mb-2">20+</div><div className="text-primary-100">{locale === 'es' ? 'Ubicaciones' : 'Locations Served'}</div></div>
            <div><div className="text-4xl md:text-5xl font-bold mb-2">5★</div><div className="text-primary-100">{locale === 'es' ? 'Reseñas en Google' : 'Google Reviews'}</div></div>
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
            <Link href={`/${locale}/contact`} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
              {locale === 'es' ? 'Enviar Mensaje' : 'Send Message'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
