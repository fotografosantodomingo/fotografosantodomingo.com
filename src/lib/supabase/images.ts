import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface PortfolioImage {
  id: string
  public_id: string
  alt_text: string
  title_attribute: string
  caption: string
  title_es: string
  title_en: string
  description_es: string
  description_en: string
  category: string
  location: string
  featured: boolean
  sort_order: number
  width: number
  height: number
}

export interface ReviewStats {
  review_count: number
  rating_value: number
}

// Static fallback data (used when Supabase is unavailable)
const STATIC_IMAGES: PortfolioImage[] = [
  { id: '1', public_id: 'wedding-punta-cana-1', alt_text: 'Fotografía de boda en la playa de Punta Cana al atardecer', title_attribute: 'Boda en Punta Cana - Fotografo Santo Domingo', caption: 'Ceremonia íntima en la playa al atardecer, Punta Cana RD', title_es: 'Boda en Punta Cana', title_en: 'Punta Cana Wedding', description_es: 'Ceremonia íntima en la playa al atardecer', description_en: 'Intimate beach ceremony at sunset', category: 'wedding', location: 'Punta Cana, RD', featured: true, sort_order: 1, width: 1200, height: 800 },
  { id: '2', public_id: 'executive-portrait-1', alt_text: 'Retrato ejecutivo profesional en Santo Domingo', title_attribute: 'Retrato Corporativo - Babula Shots SD', caption: 'Sesión corporativa para CEO de tecnología, Santo Domingo', title_es: 'Retrato Ejecutivo', title_en: 'Executive Portrait', description_es: 'Sesión corporativa para CEO de tecnología', description_en: 'Corporate session for tech CEO', category: 'portrait', location: 'Santo Domingo', featured: false, sort_order: 2, width: 800, height: 1000 },
  { id: '3', public_id: 'drone-hotel-1', alt_text: 'Fotografía aérea con dron de hotel resort en Punta Cana', title_attribute: 'Fotografía Aérea Punta Cana - Drone Photography RD', caption: 'Vista aérea de hotel resort, fotografía con dron Punta Cana', title_es: 'Vista Aérea de Hotel', title_en: 'Hotel Aerial View', description_es: 'Fotografía aérea para brochure turístico', description_en: 'Aerial photography for tourism brochure', category: 'drone', location: 'Punta Cana', featured: true, sort_order: 3, width: 1920, height: 1080 },
  { id: '4', public_id: 'birthday-party-1', alt_text: 'Fotografía de fiesta de cumpleaños número 50 en Santo Domingo', title_attribute: 'Fotografía de Eventos - Cumpleaños Santo Domingo', caption: 'Celebración de 50 años con amigos y familia en Santo Domingo', title_es: 'Fiesta de Cumpleaños', title_en: 'Birthday Party', description_es: 'Celebración de 50 años con amigos y familia', description_en: '50th birthday celebration with friends and family', category: 'event', location: 'Santo Domingo', featured: false, sort_order: 4, width: 1200, height: 800 },
  { id: '5', public_id: 'family-session-1', alt_text: 'Sesión fotográfica familiar en parque nacional Dominican Republic', title_attribute: 'Fotografía Familiar - Los Cacicazgos Santo Domingo', caption: 'Fotografía familiar natural al aire libre en Los Cacicazgos', title_es: 'Sesión Familiar', title_en: 'Family Session', description_es: 'Fotografía natural en parque nacional', description_en: 'Natural photography in national park', category: 'portrait', location: 'Los Cacicazgos', featured: false, sort_order: 5, width: 1200, height: 800 },
  { id: '6', public_id: 'jewelry-product-1', alt_text: 'Fotografía de producto de joyería para catálogo comercial Santo Domingo', title_attribute: 'Fotografía Comercial Joyería - Babula Shots', caption: 'Fotografía de producto para catálogo de joyería, estudio Santo Domingo', title_es: 'Producto de Joyería', title_en: 'Jewelry Product', description_es: 'Fotografía de producto para catálogo de joyería', description_en: 'Product photography for jewelry catalog', category: 'commercial', location: 'Studio SD', featured: false, sort_order: 6, width: 1200, height: 800 },
  { id: '7', public_id: 'wedding-elegant-1', alt_text: 'Boda elegante de gala en salón histórico Santo Domingo', title_attribute: 'Boda Elegante Santo Domingo - Fotografo de Bodas RD', caption: 'Boda de gala en salón histórico, Santo Domingo República Dominicana', title_es: 'Boda Elegante', title_en: 'Elegant Wedding', description_es: 'Boda de gala en salón histórico', description_en: 'Gala wedding in historic hall', category: 'wedding', location: 'Santo Domingo', featured: true, sort_order: 7, width: 1200, height: 800 },
  { id: '8', public_id: 'corporate-event-1', alt_text: 'Fotografía de evento corporativo conferencia empresarial Santo Domingo', title_attribute: 'Fotografía Corporativa - Eventos Empresariales RD', caption: 'Conferencia anual de empresa tecnológica en Centro de Convenciones', title_es: 'Evento Corporativo', title_en: 'Corporate Event', description_es: 'Conferencia anual de empresa tecnológica', description_en: 'Annual conference of tech company', category: 'event', location: 'Centro de Convenciones', featured: false, sort_order: 8, width: 1920, height: 1080 },
  { id: '9', public_id: 'artistic-portrait-1', alt_text: 'Retrato artístico con luz natural Plaza España Zona Colonial', title_attribute: 'Retrato Artístico - Fotografo Zona Colonial Santo Domingo', caption: 'Retrato artístico con luz natural, Plaza España Zona Colonial', title_es: 'Retrato Artístico', title_en: 'Artistic Portrait', description_es: 'Sesión de retrato con luz natural', description_en: 'Portrait session with natural light', category: 'portrait', location: 'Plaza España', featured: false, sort_order: 9, width: 800, height: 1000 },
  { id: '10', public_id: 'restaurant-food-1', alt_text: 'Fotografía de alimentos gourmet para menú restaurante Zona Colonial', title_attribute: 'Fotografía Gastronómica - Restaurantes Santo Domingo', caption: 'Fotografía de alimentos para menú digital, restaurante gourmet Zona Colonial', title_es: 'Restaurante Gourmet', title_en: 'Gourmet Restaurant', description_es: 'Fotografía de alimentos para menú digital', description_en: 'Food photography for digital menu', category: 'commercial', location: 'Zona Colonial', featured: false, sort_order: 10, width: 1200, height: 800 },
  { id: '11', public_id: 'baptism-traditional-1', alt_text: 'Fotografía de bautizo religioso ceremonia familiar Iglesia Colonial', title_attribute: 'Fotografía de Bautizo - Ceremonias Religiosas RD', caption: 'Bautizo tradicional con celebración familiar, Iglesia Colonial Santo Domingo', title_es: 'Bautizo Tradicional', title_en: 'Traditional Baptism', description_es: 'Ceremonia religiosa con celebración familiar', description_en: 'Religious ceremony with family celebration', category: 'event', location: 'Iglesia Colonial', featured: false, sort_order: 11, width: 1200, height: 800 },
  { id: '12', public_id: 'real-estate-drone-1', alt_text: 'Fotografía aérea drone de villa de lujo propiedad inmobiliaria Punta Cana', title_attribute: 'Fotografía Drone Inmobiliaria - Luxury Villa Punta Cana', caption: 'Fotografía aérea de villa de lujo para inmobiliaria en Punta Cana', title_es: 'Propiedad Inmobiliaria', title_en: 'Real Estate Property', description_es: 'Fotografía aérea de villa de lujo', description_en: 'Aerial photography of luxury villa', category: 'drone', location: 'Punta Cana', featured: true, sort_order: 12, width: 1920, height: 1080 },
]

const STATIC_REVIEW_STATS: ReviewStats = { review_count: 87, rating_value: 4.9 }

function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
}

export async function getPortfolioImages(): Promise<PortfolioImage[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) return STATIC_IMAGES
    return data as PortfolioImage[]
  } catch {
    return STATIC_IMAGES
  }
}

export async function getReviewStats(): Promise<ReviewStats> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('review_stats')
      .select('review_count, rating_value')
      .single()

    if (error || !data) return STATIC_REVIEW_STATS
    return {
      review_count: data.review_count ?? STATIC_REVIEW_STATS.review_count,
      rating_value: data.rating_value ?? STATIC_REVIEW_STATS.rating_value,
    }
  } catch {
    return STATIC_REVIEW_STATS
  }
}
