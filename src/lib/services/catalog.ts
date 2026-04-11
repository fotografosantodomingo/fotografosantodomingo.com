type ServicePricing = {
  starting: string
  includes: string
}

export type ServiceCatalogItem = {
  id: 'wedding' | 'portrait' | 'drone' | 'event' | 'family' | 'commercial'
  title: string
  subtitle: string
  description: string
  features: string[]
  pricing: ServicePricing
  icon: string
  gradientClass: string
  popular?: boolean
}

export const serviceSlugById: Record<ServiceCatalogItem['id'], string> = {
  wedding: 'wedding-photography',
  portrait: 'portrait-photography',
  drone: 'drone-services-photography-punta-cana',
  event: 'event-photography',
  family: 'family-photography',
  commercial: 'commercial-photography',
}

export const serviceIdBySlug: Record<string, ServiceCatalogItem['id']> = Object.fromEntries(
  Object.entries(serviceSlugById).map(([id, slug]) => [slug, id])
) as Record<string, ServiceCatalogItem['id']>

export const serviceLandingSlugs = Object.values(serviceSlugById)

export function getServiceCatalog(locale: string): ServiceCatalogItem[] {
  const isEs = locale === 'es'

  return [
    {
      id: 'wedding',
      title: isEs ? 'Fotografia de Bodas' : 'Wedding Photography',
      subtitle: isEs ? 'El dia mas importante de tu vida' : 'Your most important day',
      description: isEs
        ? 'Capturamos cada momento magico de tu boda con estilo artistico y atencion al detalle. Desde la preparacion hasta el ultimo baile, documentamos la historia de amor unica de tu pareja.'
        : 'We capture every magical moment of your wedding with artistic style and attention to detail. From preparation to the last dance, we document your couple\'s unique love story.',
      features: [
        isEs ? 'Cobertura completa del dia de la boda' : 'Full wedding day coverage',
        isEs ? 'Sesion de compromiso incluida' : 'Engagement session included',
        isEs ? 'Album profesional de alta calidad' : 'Professional high-quality album',
        isEs ? 'Todas las fotos editadas en alta resolucion' : 'All photos edited in high resolution',
        isEs ? 'Galeria online privada para compartir' : 'Private online gallery for sharing',
        isEs ? 'Impresiones de regalo' : 'Complimentary prints',
      ],
      pricing: {
        starting: isEs ? 'Desde $2,500' : 'Starting at $2,500',
        includes: isEs ? '8 horas de cobertura + edicion completa' : '8 hours coverage + full editing',
      },
      icon: '💍',
      gradientClass: 'bg-gradient-to-br from-rose-400 to-pink-600',
      popular: true,
    },
    {
      id: 'portrait',
      title: isEs ? 'Retratos Corporativos' : 'Corporate Portraits',
      subtitle: isEs ? 'Profesionalismo y elegancia' : 'Professionalism and elegance',
      description: isEs
        ? 'Fotografia ejecutiva y corporativa que refleja la personalidad y profesionalismo de tu marca. Ideal para LinkedIn, sitios web corporativos y material de marketing.'
        : 'Executive and corporate photography that reflects your brand\'s personality and professionalism. Perfect for LinkedIn, corporate websites, and marketing materials.',
      features: [
        isEs ? 'Sesion en estudio o ubicacion personalizada' : 'Studio session or custom location',
        isEs ? 'Multiples looks y estilos' : 'Multiple looks and styles',
        isEs ? 'Edicion profesional para redes sociales' : 'Professional editing for social media',
        isEs ? 'Entrega rapida (24-48 horas)' : 'Fast delivery (24-48 hours)',
        isEs ? 'Uso comercial autorizado' : 'Authorized commercial use',
        isEs ? 'Archivos en alta resolucion' : 'High-resolution files',
      ],
      pricing: {
        starting: isEs ? 'Desde $150' : 'Starting at $150',
        includes: isEs ? 'Por sesion individual' : 'Per individual session',
      },
      icon: '👔',
      gradientClass: 'bg-gradient-to-br from-blue-500 to-indigo-700',
    },
    {
      id: 'drone',
      title: isEs ? 'Fotografia con Dron' : 'Drone Photography',
      subtitle: isEs ? 'Perspectivas unicas desde el cielo' : 'Unique perspectives from the sky',
      description: isEs
        ? 'Capturamos vistas aereas espectaculares para bodas, eventos corporativos, propiedades inmobiliarias y proyectos comerciales. Licencia FAA certificada.'
        : 'We capture spectacular aerial views for weddings, corporate events, real estate properties, and commercial projects. FAA certified license.',
      features: [
        isEs ? 'Licencia FAA certificada' : 'FAA certified license',
        isEs ? 'Cobertura de hasta 500 acres' : 'Coverage up to 500 acres',
        isEs ? 'Video 4K y fotos de alta resolucion' : '4K video and high-resolution photos',
        isEs ? 'Edicion profesional incluida' : 'Professional editing included',
        isEs ? 'Entrega digital completa' : 'Complete digital delivery',
        isEs ? 'Permisos legales gestionados' : 'Legal permissions managed',
      ],
      pricing: {
        starting: isEs ? 'Desde $500' : 'Starting at $500',
        includes: isEs ? 'Por ubicacion + edicion' : 'Per location + editing',
      },
      icon: '🚁',
      gradientClass: 'bg-gradient-to-br from-sky-400 to-cyan-600',
    },
    {
      id: 'event',
      title: isEs ? 'Fotografia de Eventos' : 'Event Photography',
      subtitle: isEs ? 'Capturamos el ambiente y la energia' : 'We capture the atmosphere and energy',
      description: isEs
        ? 'Documentacion completa de eventos corporativos, fiestas privadas, bautizos, cumpleanos y celebraciones especiales. Capturamos no solo las personas, sino tambien el ambiente unico de tu evento.'
        : 'Complete documentation of corporate events, private parties, baptisms, birthdays, and special celebrations. We capture not only the people, but also the unique atmosphere of your event.',
      features: [
        isEs ? 'Cobertura completa del evento' : 'Full event coverage',
        isEs ? 'Entrega el mismo dia (opcion express)' : 'Same-day delivery (express option)',
        isEs ? 'Galeria online para invitados' : 'Online gallery for guests',
        isEs ? 'Fotos grupales organizadas' : 'Organized group photos',
        isEs ? 'Edicion de color y estilo consistente' : 'Consistent color and style editing',
        isEs ? 'Paquete de impresiones disponible' : 'Print package available',
      ],
      pricing: {
        starting: isEs ? 'Desde $300' : 'Starting at $300',
        includes: isEs ? 'Por hora de cobertura' : 'Per hour of coverage',
      },
      icon: '🎉',
      gradientClass: 'bg-gradient-to-br from-amber-400 to-orange-600',
    },
    {
      id: 'family',
      title: isEs ? 'Sesiones Familiares' : 'Family Sessions',
      subtitle: isEs ? 'Momentos preciosos para toda la vida' : 'Precious moments for life',
      description: isEs
        ? 'Sesiones fotograficas familiares naturales y divertidas. Capturamos la esencia de tu familia en locaciones hermosas alrededor de Santo Domingo y Punta Cana.'
        : 'Natural and fun family photography sessions. We capture the essence of your family in beautiful locations around Santo Domingo and Punta Cana.',
      features: [
        isEs ? 'Sesion de 1-2 horas en locacion' : '1-2 hour session on location',
        isEs ? 'Hasta 10 personas incluidas' : 'Up to 10 people included',
        isEs ? 'Multiples locaciones disponibles' : 'Multiple locations available',
        isEs ? 'Album familiar personalizado' : 'Custom family album',
        isEs ? 'Fotos en alta resolucion' : 'High-resolution photos',
        isEs ? 'Sesion de recien nacido disponible' : 'Newborn session available',
      ],
      pricing: {
        starting: isEs ? 'Desde $200' : 'Starting at $200',
        includes: isEs ? 'Sesion + 20 fotos editadas' : 'Session + 20 edited photos',
      },
      icon: '👨‍👩‍👧‍👦',
      gradientClass: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    },
    {
      id: 'commercial',
      title: isEs ? 'Fotografia Comercial' : 'Commercial Photography',
      subtitle: isEs ? 'Para negocios y marcas' : 'For businesses and brands',
      description: isEs
        ? 'Fotografia publicitaria y comercial para restaurantes, hoteles, productos, arquitectura y branding. Creamos imagenes que venden y conectan con tu audiencia.'
        : 'Advertising and commercial photography for restaurants, hotels, products, architecture, and branding. We create images that sell and connect with your audience.',
      features: [
        isEs ? 'Fotografia de productos y alimentos' : 'Product and food photography',
        isEs ? 'Arquitectura e inmuebles' : 'Architecture and real estate',
        isEs ? 'Branding y marketing visual' : 'Branding and visual marketing',
        isEs ? 'Estudio profesional equipado' : 'Professional equipped studio',
        isEs ? 'Derechos de uso comercial' : 'Commercial usage rights',
        isEs ? 'Entrega rapida para deadlines' : 'Fast delivery for deadlines',
      ],
      pricing: {
        starting: isEs ? 'Desde $250' : 'Starting at $250',
        includes: isEs ? 'Por hora + edicion' : 'Per hour + editing',
      },
      icon: '📸',
      gradientClass: 'bg-gradient-to-br from-violet-500 to-purple-700',
    },
  ]
}

export function getServiceById(locale: string, id: ServiceCatalogItem['id']) {
  return getServiceCatalog(locale).find((service) => service.id === id) || null
}

export function getServiceBySlug(locale: string, slug: string) {
  const serviceId = serviceIdBySlug[slug]
  if (!serviceId) return null
  return getServiceById(locale, serviceId)
}
