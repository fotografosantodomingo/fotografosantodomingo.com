import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { getReviewStats } from '@/lib/supabase/images'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'
import { CONTACT_INFO } from '@/lib/utils/constants'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

// Families that already have a dedicated Punta Cana (Tier-1) geo page — link
// there; everything else links to the general service-family page. Add entries
// here as more Punta Cana geo pages get published.
const PUNTA_CANA_GEO: Record<string, { es: string; en: string }> = {
  'wedding-photography': { es: 'fotografo-de-bodas-en-punta-cana', en: 'punta-cana-wedding-photographer' },
  'real-estate-drone-photography': { es: 'fotografo-inmobiliario-en-punta-cana', en: 'punta-cana-real-estate-photographer' },
}

function familyHref(slug: string, locale: string): string {
  const geo = PUNTA_CANA_GEO[slug]
  if (geo) return `/${locale}/${locale === 'es' ? geo.es : geo.en}`
  return `/${locale}/services/${slug}`
}

const COVERAGE = ['Punta Cana', 'Bávaro', 'Cap Cana', 'Cabeza de Toro', 'Macao', 'Uvero Alto', 'Bayahíbe', 'La Romana']

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Fotógrafo en Punta Cana — Bodas, Drone, Retratos y Más | Babula Shots'
    : 'Photographer in Punta Cana — Weddings, Drone, Portraits & More | Babula Shots'
  const description = isEs
    ? 'Fotógrafo profesional en Punta Cana: bodas, sesiones familiares en la playa, retratos, fotografía aérea con drone, inmobiliaria y eventos corporativos. Cobertura en Bávaro, Cap Cana, Macao y toda la zona este.'
    : 'Professional photographer in Punta Cana: weddings, beach family sessions, portraits, aerial drone, real estate, and corporate events. Coverage across Bávaro, Cap Cana, Macao and the whole east coast.'
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/punta-cana`,
      languages: {
        es: `${BASE_URL}/es/punta-cana`,
        en: `${BASE_URL}/en/punta-cana`,
        'x-default': `${BASE_URL}/es/punta-cana`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Fotógrafo en Punta Cana — Babula Shots' : 'Photographer in Punta Cana — Babula Shots',
      description,
      url: `${BASE_URL}/${locale}/punta-cana`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=${encodeURIComponent(isEs ? 'Fotógrafo en Punta Cana' : 'Photographer in Punta Cana')}&subtitle=Babula+Shots`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Fotógrafo en Punta Cana — Babula Shots' : 'Photographer in Punta Cana — Babula Shots',
      }],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

type Family = {
  id: string
  slug: string
  title_es: string
  title_en: string
  tagline_es: string | null
  tagline_en: string | null
  icon: string
}

export default async function PuntaCanaHubPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const supabase = createServiceClient()
  const [familiesRes, stats] = await Promise.all([
    supabase
      .from('service_families')
      .select('id, slug, title_es, title_en, tagline_es, tagline_en, icon, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true }),
    getReviewStats(),
  ])
  const families = (familiesRes.data ?? []) as Family[]

  const ratingDisplay = stats.rating_value.toFixed(1)
  const countDisplay = stats.review_count.toString()

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: 'Punta Cana', url: `${BASE_URL}/${locale}/punta-cana` },
  ])
  const businessSchema = schemaGenerators.localBusinessWithRating(stats)
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: isEs ? 'Fotografía profesional en Punta Cana' : 'Professional photography in Punta Cana',
    provider: { '@type': 'LocalBusiness', '@id': `${BASE_URL}/#business`, name: 'Babula Shots', url: BASE_URL },
    areaServed: { '@type': 'City', name: 'Punta Cana', containedInPlace: { '@type': 'Country', name: 'Dominican Republic' } },
    url: `${BASE_URL}/${locale}/punta-cana`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isEs ? 'Servicios fotográficos en Punta Cana' : 'Photography services in Punta Cana',
      itemListElement: families.map((f) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: isEs ? f.title_es : f.title_en, url: `${BASE_URL}${familyHref(f.slug, locale)}` },
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(businessSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(serviceSchema)} />

      <main className="min-h-screen bg-canvas text-ink">
        {/* Hero */}
        <section className="py-20 md:py-28 border-b border-hairline-soft">
          <div className="container mx-auto px-4 text-center">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-5">
              {isEs ? 'Costa Este · República Dominicana' : 'East Coast · Dominican Republic'}
            </p>
            <h1 className="font-display uppercase font-normal text-ink mb-6" style={{ fontSize: 'clamp(38px, 7vw, 92px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}>
              {isEs ? 'Fotógrafo en Punta Cana' : 'Photographer in Punta Cana'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mx-auto mb-9 leading-relaxed">
              {isEs
                ? 'Bodas, sesiones en la playa, retratos, drone, inmobiliaria y eventos — la misma calidad profesional de Babula Shots, ahora en Punta Cana y toda la zona este.'
                : 'Weddings, beach sessions, portraits, drone, real estate and events — the same Babula Shots professional quality, now in Punta Cana and across the east coast.'}
            </p>
            <div className="inline-flex items-center gap-3 mb-9">
              <span className="font-display text-2xl md:text-3xl text-ink">{ratingDisplay}</span>
              <span className="text-lg text-ink" aria-hidden="true">★★★★★</span>
              <span className="font-mono uppercase tracking-widest text-[11px] text-ink-muted">
                {isEs ? `${countDisplay} reseñas en Google` : `${countDisplay} Google reviews`}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/${locale}/get-quote`} className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:bg-ink/90 transition-colors duration-200">
                {isEs ? 'Solicitar cotización' : 'Get a quote'}
              </Link>
              <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200">
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Services grid */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-10 md:mb-14">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
                {isEs ? 'Servicios en Punta Cana' : 'Services in Punta Cana'}
              </p>
              <h2 className="font-display uppercase text-ink" style={{ fontSize: 'clamp(24px, 4vw, 48px)', lineHeight: '1' }}>
                {isEs ? 'Todo lo que ofrecemos aquí' : 'Everything we offer here'}
              </h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline-soft">
              {families.map((f) => {
                const title = isEs ? f.title_es : f.title_en
                const tagline = isEs ? f.tagline_es : f.tagline_en
                return (
                  <li key={f.id} className="border-r border-b border-hairline-soft">
                    <Link href={familyHref(f.slug, locale)} className="group flex flex-col gap-3 p-7 md:p-8 lg:p-10 h-full hover:bg-ink/5 transition-colors duration-200">
                      <span className="text-2xl mb-1" aria-hidden="true">{f.icon}</span>
                      <h3 className="font-display uppercase text-ink text-lg md:text-xl">{title}</h3>
                      {tagline && <p className="text-ink-muted text-sm leading-relaxed flex-1">{tagline}</p>}
                      <span className="font-mono uppercase tracking-widest text-[11px] text-ink mt-4 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                        {isEs ? 'Ver más' : 'Learn more'} →
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Coverage area */}
        <section className="py-16 md:py-20 border-t border-hairline-soft">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
              {isEs ? 'Zona de cobertura' : 'Coverage area'}
            </p>
            <h2 className="font-display uppercase text-ink mb-8" style={{ fontSize: 'clamp(24px, 4vw, 44px)', lineHeight: '1' }}>
              {isEs ? 'Dónde trabajamos en el este' : 'Where we shoot in the east'}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {COVERAGE.map((area) => (
                <span key={area} className="font-mono uppercase tracking-widest text-[11px] text-ink border border-hairline-soft rounded-full px-4 py-2">
                  {area}
                </span>
              ))}
            </div>
            <p className="text-ink-muted text-sm md:text-base max-w-2xl mt-8 leading-relaxed">
              {isEs
                ? 'Traslado incluido dentro del corredor Punta Cana–Bávaro–Cap Cana. Para Bayahíbe, La Romana y Uvero Alto, escríbenos y te confirmamos disponibilidad y logística.'
                : 'Travel included within the Punta Cana–Bávaro–Cap Cana corridor. For Bayahíbe, La Romana and Uvero Alto, message us and we’ll confirm availability and logistics.'}
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-20 border-t border-hairline-soft">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display uppercase text-ink mb-5" style={{ fontSize: 'clamp(24px, 4vw, 48px)', lineHeight: '1' }}>
              {isEs ? '¿Tienes una fecha en Punta Cana?' : 'Have a date in Punta Cana?'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mx-auto mb-8">
              {isEs
                ? 'Las fechas en temporada alta se agotan rápido. Verifica disponibilidad y reserva hoy.'
                : 'Peak-season dates fill up fast. Check availability and book today.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/${locale}/book`} className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:bg-ink/90 transition-colors duration-200">
                {isEs ? 'Reservar ahora' : 'Book now'}
              </Link>
              <Link href={`/${locale}/portfolio`} className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200">
                {isEs ? 'Ver portafolio' : 'View portfolio'}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
