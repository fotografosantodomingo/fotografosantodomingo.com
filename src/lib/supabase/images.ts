import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Re-export types and pure helpers so consumers can import from one place.
// NOTE: Do NOT import this file from client components — use @/lib/types/portfolio instead.
export type { PortfolioImage, ReviewStats } from '@/lib/types/portfolio'
export { resolveLocale } from '@/lib/types/portfolio'

import type { PortfolioImage, ReviewStats } from '@/lib/types/portfolio'

// Static fallback data (used when Supabase is unavailable)
const STATIC_IMAGES: PortfolioImage[] = [
  { id: '1',  public_id: 'wedding-punta-cana-1',   alt_es: 'Fotografía de boda en la playa de Punta Cana al atardecer República Dominicana', alt_en: 'Wedding photography on the beach at Punta Cana at sunset', caption_es: 'Ceremonia íntima en la playa al atardecer, Punta Cana RD', caption_en: 'Intimate beach ceremony at sunset, Punta Cana DR', title_es: 'Boda en Punta Cana', title_en: 'Punta Cana Wedding', description_es: 'Ceremonia íntima en la playa al atardecer', description_en: 'Intimate beach ceremony at sunset', category: 'wedding',   location: 'Punta Cana, RD',         featured: true,  sort_order: 1,  width: 1200, height: 800  },
  { id: '2',  public_id: 'executive-portrait-1',   alt_es: 'Fotografía de retrato ejecutivo corporativo profesional Santo Domingo RD',           alt_en: 'Professional executive portrait photography in Santo Domingo', caption_es: 'Sesión corporativa para CEO de tecnología, Santo Domingo', caption_en: 'Corporate session for tech CEO, Santo Domingo DR', title_es: 'Retrato Ejecutivo', title_en: 'Executive Portrait', description_es: 'Sesión corporativa para CEO de tecnología', description_en: 'Corporate session for tech CEO', category: 'portrait',  location: 'Santo Domingo',           featured: false, sort_order: 2,  width: 800,  height: 1000 },
  { id: '3',  public_id: 'drone-hotel-1',           alt_es: 'Fotografía aérea con dron de hotel resort Punta Cana República Dominicana',           alt_en: 'Drone aerial photography of hotel resort in Punta Cana Dominican Republic', caption_es: 'Vista aérea de hotel resort, fotografía con dron Punta Cana', caption_en: 'Aerial view of luxury hotel resort, drone photography Punta Cana', title_es: 'Vista Aérea de Hotel', title_en: 'Hotel Aerial View', description_es: 'Fotografía aérea para brochure turístico', description_en: 'Aerial photography for tourism brochure', category: 'drone',    location: 'Punta Cana',              featured: true,  sort_order: 3,  width: 1920, height: 1080 },
  { id: '4',  public_id: 'birthday-party-1',        alt_es: 'Fotografía de fiesta de cumpleaños 50 años Santo Domingo República Dominicana',        alt_en: 'Birthday party photography 50th celebration in Santo Domingo', caption_es: 'Celebración de 50 años con amigos y familia en Santo Domingo', caption_en: '50th birthday celebration with friends and family, Santo Domingo', title_es: 'Fiesta de Cumpleaños', title_en: 'Birthday Party', description_es: 'Celebración de 50 años con amigos y familia', description_en: '50th birthday celebration with friends and family', category: 'event',    location: 'Santo Domingo',           featured: false, sort_order: 4,  width: 1200, height: 800  },
  { id: '5',  public_id: 'family-session-1',        alt_es: 'Sesión fotográfica familiar al aire libre Los Cacicazgos Santo Domingo',               alt_en: 'Family photography session in national park Dominican Republic', caption_es: 'Fotografía familiar natural al aire libre en Los Cacicazgos', caption_en: 'Outdoor family photography at Los Cacicazgos, Santo Domingo', title_es: 'Sesión Familiar', title_en: 'Family Session', description_es: 'Fotografía natural en parque nacional', description_en: 'Natural photography in national park', category: 'portrait', location: 'Los Cacicazgos',          featured: false, sort_order: 5,  width: 1200, height: 800  },
  { id: '6',  public_id: 'jewelry-product-1',       alt_es: 'Fotografía de producto joyería para catálogo comercial estudio Santo Domingo',          alt_en: 'Jewelry product photography for commercial catalog Santo Domingo', caption_es: 'Fotografía de producto para catálogo de joyería, estudio Santo Domingo', caption_en: 'Product photography for jewelry catalog, studio Santo Domingo DR', title_es: 'Producto de Joyería', title_en: 'Jewelry Product', description_es: 'Fotografía de producto para catálogo de joyería', description_en: 'Product photography for jewelry catalog', category: 'commercial',location: 'Studio SD',              featured: false, sort_order: 6,  width: 1200, height: 800  },
  { id: '7',  public_id: 'wedding-elegant-1',       alt_es: 'Fotografía de boda elegante de gala en salón histórico Santo Domingo RD',               alt_en: 'Elegant gala wedding photography in historic hall Santo Domingo', caption_es: 'Boda de gala en salón histórico, Santo Domingo República Dominicana', caption_en: 'Gala wedding in historic hall, Santo Domingo Dominican Republic', title_es: 'Boda Elegante', title_en: 'Elegant Wedding', description_es: 'Boda de gala en salón histórico', description_en: 'Gala wedding in historic hall', category: 'wedding',   location: 'Santo Domingo',           featured: true,  sort_order: 7,  width: 1200, height: 800  },
  { id: '8',  public_id: 'corporate-event-1',       alt_es: 'Fotografía de evento corporativo conferencia empresarial Centro Convenciones Santo Domingo', alt_en: 'Corporate event conference photography in Santo Domingo convention center', caption_es: 'Conferencia anual de empresa tecnológica en Centro de Convenciones', caption_en: 'Annual tech company conference at the Convention Center, Santo Domingo', title_es: 'Evento Corporativo', title_en: 'Corporate Event', description_es: 'Conferencia anual de empresa tecnológica', description_en: 'Annual conference of tech company', category: 'event',    location: 'Centro de Convenciones', featured: false, sort_order: 8,  width: 1920, height: 1080 },
  { id: '9',  public_id: 'artistic-portrait-1',     alt_es: 'Retrato artístico con luz natural Plaza España Zona Colonial Santo Domingo',             alt_en: 'Artistic portrait with natural light Plaza España Colonial Zone', caption_es: 'Retrato artístico con luz natural, Plaza España Zona Colonial', caption_en: 'Artistic portrait with natural light, Plaza España Colonial Zone Santo Domingo', title_es: 'Retrato Artístico', title_en: 'Artistic Portrait', description_es: 'Sesión de retrato con luz natural', description_en: 'Portrait session with natural light', category: 'portrait', location: 'Plaza España',            featured: false, sort_order: 9,  width: 800,  height: 1000 },
  { id: '10', public_id: 'restaurant-food-1',       alt_es: 'Fotografía gastronómica alimentos gourmet restaurante menú digital Zona Colonial',      alt_en: 'Gourmet food photography for restaurant menu in Colonial Zone', caption_es: 'Fotografía de alimentos para menú digital, restaurante gourmet Zona Colonial', caption_en: 'Food photography for digital menu, gourmet restaurant Colonial Zone', title_es: 'Restaurante Gourmet', title_en: 'Gourmet Restaurant', description_es: 'Fotografía de alimentos para menú digital', description_en: 'Food photography for digital menu', category: 'commercial',location: 'Zona Colonial',          featured: false, sort_order: 10, width: 1200, height: 800  },
  { id: '11', public_id: 'baptism-traditional-1',   alt_es: 'Fotografía de bautizo religioso ceremonia familiar Iglesia Colonial Santo Domingo',     alt_en: 'Baptism religious ceremony family photography Colonial Church Santo Domingo', caption_es: 'Bautizo tradicional con celebración familiar, Iglesia Colonial Santo Domingo', caption_en: 'Traditional baptism with family celebration, Colonial Church Santo Domingo', title_es: 'Bautizo Tradicional', title_en: 'Traditional Baptism', description_es: 'Ceremonia religiosa con celebración familiar', description_en: 'Religious ceremony with family celebration', category: 'event',    location: 'Iglesia Colonial',       featured: false, sort_order: 11, width: 1200, height: 800  },
  { id: '12', public_id: 'real-estate-drone-1',     alt_es: 'Fotografía aérea drone villa de lujo inmobiliaria Punta Cana República Dominicana',     alt_en: 'Aerial drone photography of luxury villa real estate Punta Cana', caption_es: 'Fotografía aérea de villa de lujo para inmobiliaria en Punta Cana', caption_en: 'Aerial photography of luxury villa for real estate, Punta Cana DR', title_es: 'Propiedad Inmobiliaria', title_en: 'Real Estate Property', description_es: 'Fotografía aérea de villa de lujo', description_en: 'Aerial photography of luxury villa', category: 'drone',    location: 'Punta Cana',              featured: true,  sort_order: 12, width: 1920, height: 1080 },
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

/** Update localized SEO fields for a single image. Used by the admin UI. */
export async function updateImageSeo(
  id: string,
  fields: {
    alt_es?: string; alt_en?: string
    caption_es?: string; caption_en?: string
    title_es?: string; title_en?: string
    description_es?: string; description_en?: string
  }
): Promise<{ error: string | null }> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('portfolio_images')
      .update(fields)
      .eq('id', id)
    return { error: error?.message ?? null }
  } catch (e: any) {
    return { error: e.message ?? 'Unknown error' }
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
