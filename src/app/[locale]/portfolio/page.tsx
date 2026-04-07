'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CONTACT_INFO } from '@/lib/utils/constants'

type Props = {
  params: { locale: string }
}

export default function PortfolioPage({ params: { locale } }: Props) {
  const [activeFilter, setActiveFilter] = useState('all')

  const categories = [
    { id: 'all', label: locale === 'es' ? 'Todos' : 'All' },
    { id: 'wedding', label: locale === 'es' ? 'Bodas' : 'Weddings' },
    { id: 'portrait', label: locale === 'es' ? 'Retratos' : 'Portraits' },
    { id: 'drone', label: locale === 'es' ? 'Drones' : 'Drone' },
    { id: 'event', label: locale === 'es' ? 'Eventos' : 'Events' },
    { id: 'commercial', label: locale === 'es' ? 'Comercial' : 'Commercial' },
  ]

  const portfolioItems = [
    {
      id: 1,
      title: locale === 'es' ? 'Boda en Punta Cana' : 'Punta Cana Wedding',
      category: 'wedding',
      location: 'Punta Cana, RD',
      description: locale === 'es' ? 'Ceremonia íntima en la playa al atardecer' : 'Intimate beach ceremony at sunset',
      image: 'wedding-punta-cana-1',
      featured: true,
    },
    {
      id: 2,
      title: locale === 'es' ? 'Retrato Ejecutivo' : 'Executive Portrait',
      category: 'portrait',
      location: 'Santo Domingo',
      description: locale === 'es' ? 'Sesión corporativa para CEO de tecnología' : 'Corporate session for tech CEO',
      image: 'executive-portrait-1',
      featured: false,
    },
    {
      id: 3,
      title: locale === 'es' ? 'Vista Aérea de Hotel' : 'Hotel Aerial View',
      category: 'drone',
      location: 'Punta Cana',
      description: locale === 'es' ? 'Fotografía aérea para brochure turístico' : 'Aerial photography for tourism brochure',
      image: 'drone-hotel-1',
      featured: true,
    },
    {
      id: 4,
      title: locale === 'es' ? 'Fiesta de Cumpleaños' : 'Birthday Party',
      category: 'event',
      location: 'Santo Domingo',
      description: locale === 'es' ? 'Celebración de 50 años con amigos y familia' : '50th birthday celebration with friends and family',
      image: 'birthday-party-1',
      featured: false,
    },
    {
      id: 5,
      title: locale === 'es' ? 'Sesión Familiar' : 'Family Session',
      category: 'portrait',
      location: 'Los Cacicazgos',
      description: locale === 'es' ? 'Fotografía natural en parque nacional' : 'Natural photography in national park',
      image: 'family-session-1',
      featured: false,
    },
    {
      id: 6,
      title: locale === 'es' ? 'Producto de Joyería' : 'Jewelry Product',
      category: 'commercial',
      location: 'Studio SD',
      description: locale === 'es' ? 'Fotografía de producto para catálogo de joyería' : 'Product photography for jewelry catalog',
      image: 'jewelry-product-1',
      featured: false,
    },
    {
      id: 7,
      title: locale === 'es' ? 'Boda Elegante' : 'Elegant Wedding',
      category: 'wedding',
      location: 'Santo Domingo',
      description: locale === 'es' ? 'Boda de gala en salón histórico' : 'Gala wedding in historic hall',
      image: 'wedding-elegant-1',
      featured: true,
    },
    {
      id: 8,
      title: locale === 'es' ? 'Evento Corporativo' : 'Corporate Event',
      category: 'event',
      location: 'Centro de Convenciones',
      description: locale === 'es' ? 'Conferencia anual de empresa tecnológica' : 'Annual conference of tech company',
      image: 'corporate-event-1',
      featured: false,
    },
    {
      id: 9,
      title: locale === 'es' ? 'Retrato Artístico' : 'Artistic Portrait',
      category: 'portrait',
      location: 'Plaza España',
      description: locale === 'es' ? 'Sesión de retrato con luz natural' : 'Portrait session with natural light',
      image: 'artistic-portrait-1',
      featured: false,
    },
    {
      id: 10,
      title: locale === 'es' ? 'Restaurante Gourmet' : 'Gourmet Restaurant',
      category: 'commercial',
      location: 'Zona Colonial',
      description: locale === 'es' ? 'Fotografía de alimentos para menú digital' : 'Food photography for digital menu',
      image: 'restaurant-food-1',
      featured: false,
    },
    {
      id: 11,
      title: locale === 'es' ? 'Bautizo Tradicional' : 'Traditional Baptism',
      category: 'event',
      location: 'Iglesia Colonial',
      description: locale === 'es' ? 'Ceremonia religiosa con celebración familiar' : 'Religious ceremony with family celebration',
      image: 'baptism-traditional-1',
      featured: false,
    },
    {
      id: 12,
      title: locale === 'es' ? 'Propiedad Inmobiliaria' : 'Real Estate Property',
      category: 'drone',
      location: 'Punta Cana',
      description: locale === 'es' ? 'Fotografía aérea de villa de lujo' : 'Aerial photography of luxury villa',
      image: 'real-estate-drone-1',
      featured: true,
    },
  ]

  const filteredItems = activeFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeFilter)

  const featuredItems = portfolioItems.filter(item => item.featured)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {locale === 'es' ? 'Nuestro Portafolio' : 'Our Portfolio'}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {locale === 'es'
                ? 'Descubre nuestra colección de momentos capturados con pasión y profesionalismo'
                : 'Discover our collection of moments captured with passion and professionalism'
              }
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
                : 'A selection of our most emblematic projects'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredItems.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {/* Image Placeholder */}
                  <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="text-6xl opacity-30">
                      {item.category === 'wedding' && '💍'}
                      {item.category === 'portrait' && '👤'}
                      {item.category === 'drone' && '🚁'}
                      {item.category === 'event' && '🎉'}
                      {item.category === 'commercial' && '📸'}
                    </div>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-sm">{item.location}</p>
                      <p className="text-xs mt-2 max-w-xs">{item.description}</p>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                    {categories.find(cat => cat.id === item.category)?.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
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

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  {/* Image Placeholder */}
                  <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl opacity-30">
                      {item.category === 'wedding' && '💍'}
                      {item.category === 'portrait' && '👤'}
                      {item.category === 'drone' && '🚁'}
                      {item.category === 'event' && '🎉'}
                      {item.category === 'commercial' && '📸'}
                    </div>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end">
                    <div className="text-white p-4 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                      <p className="text-sm opacity-90">{item.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Stats Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-primary-100">
                {locale === 'es' ? 'Bodas Cubiertas' : 'Weddings Covered'}
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10+</div>
              <div className="text-primary-100">
                {locale === 'es' ? 'Años de Experiencia' : 'Years Experience'}
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">20+</div>
              <div className="text-primary-100">
                {locale === 'es' ? 'Ubicaciones' : 'Locations Served'}
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">5★</div>
              <div className="text-primary-100">
                {locale === 'es' ? 'Reseñas en Google' : 'Google Reviews'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'es' ? '¿Te gusta lo que ves?' : 'Like what you see?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {locale === 'es'
              ? 'Contáctanos para discutir tu proyecto fotográfico personalizado.'
              : 'Contact us to discuss your custom photography project.'
            }
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
            <Link
              href={`/${locale}/contact`}
              className="bg-primary-600 hover:bg-primary-700 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              {locale === 'es' ? 'Contáctanos' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}