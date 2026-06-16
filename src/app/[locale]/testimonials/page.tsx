import type { Metadata } from 'next'
import Link from 'next/link'
import { getReviews, REVIEW_PLATFORM_LINKS, type Review } from '@/lib/reviews/reviews'
import { getReviewStats } from '@/lib/supabase/images'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'

export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Testimonios y Reseñas — Fotógrafo Santo Domingo | Babula Shots'
    : 'Testimonials & Reviews — Photographer Santo Domingo | Babula Shots'
  const description = isEs
    ? 'Reseñas verificadas de clientes de Babula Shots en Google y Trustpilot. Lee lo que dicen parejas, empresas y familias sobre el fotógrafo profesional en Santo Domingo.'
    : 'Verified client reviews of Babula Shots on Google and Trustpilot. Read what couples, businesses and families say about the professional photographer in Santo Domingo.'
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/testimonials`,
      languages: {
        es: `${BASE_URL}/es/testimonials`,
        en: `${BASE_URL}/en/testimonials`,
        'x-default': `${BASE_URL}/es/testimonials`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Testimonios y Reseñas — Babula Shots' : 'Testimonials & Reviews — Babula Shots',
      description,
      url: `${BASE_URL}/${locale}/testimonials`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=${encodeURIComponent(isEs ? 'Testimonios' : 'Testimonials')}&subtitle=Babula+Shots+·+Santo+Domingo`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Testimonios — Babula Shots' : 'Testimonials — Babula Shots',
      }],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="text-ink" aria-label={`${rating} / 5`}>
      {'★'.repeat(full)}<span className="text-ink-muted">{'★'.repeat(Math.max(0, 5 - full))}</span>
    </span>
  )
}

function SourceBadge({ source, isEs }: { source: Review['source']; isEs: boolean }) {
  const isTp = source === 'trustpilot'
  return (
    <span className="font-mono uppercase tracking-widest text-[10px] inline-flex items-center gap-1.5 text-ink-muted">
      <span aria-hidden="true">{isTp ? '★' : 'G'}</span>
      {isTp ? 'Trustpilot' : (isEs ? 'Google' : 'Google')}
    </span>
  )
}

export default async function TestimonialsPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const [reviews, stats] = await Promise.all([getReviews(), getReviewStats()])

  const ratingDisplay = stats.rating_value.toFixed(1)
  const countDisplay = stats.review_count.toString()

  // JSON-LD: LocalBusiness w/ AggregateRating + embedded individual reviews.
  const businessSchema = {
    ...schemaGenerators.localBusinessWithRating(stats),
    review: reviews.slice(0, 12).map((r) => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: r.rating.toString(), bestRating: '5', worstRating: '1' },
      author: { '@type': 'Person', name: r.author },
      reviewBody: r.text,
      ...(r.date ? { datePublished: r.date.slice(0, 10) } : {}),
    })),
  }
  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Testimonios' : 'Testimonials', url: `${BASE_URL}/${locale}/testimonials` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(businessSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />

      <main className="min-h-screen bg-canvas text-ink">
        {/* Header */}
        <section className="py-20 md:py-24 border-b border-hairline-soft">
          <div className="container mx-auto px-4 text-center">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-5">
              {isEs ? 'Reseñas verificadas' : 'Verified reviews'}
            </p>
            <h1 className="font-display uppercase font-normal text-ink mb-6" style={{ fontSize: 'clamp(34px, 6vw, 76px)', lineHeight: '0.97', letterSpacing: '-0.01em' }}>
              {isEs ? 'Lo que dicen los clientes' : 'What clients say'}
            </h1>
            <div className="inline-flex items-center gap-3 mt-2">
              <span className="font-display text-3xl md:text-4xl text-ink">{ratingDisplay}</span>
              <span className="text-xl text-ink" aria-hidden="true">★★★★★</span>
              <span className="font-mono uppercase tracking-widest text-[11px] text-ink-muted">
                {isEs ? `${countDisplay} reseñas en Google` : `${countDisplay} Google reviews`}
              </span>
            </div>
          </div>
        </section>

        {/* Review grid */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline-soft border border-hairline-soft">
              {reviews.map((r) => (
                <li key={r.id} className="bg-canvas p-7 md:p-8 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Stars rating={r.rating} />
                    <SourceBadge source={r.source} isEs={isEs} />
                  </div>
                  <p className="text-ink-muted text-[15px] leading-relaxed flex-1">
                    “{r.text}”
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-hairline-soft">
                    {r.avatarUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={r.avatarUrl} alt={r.author} width={32} height={32} className="rounded-full" loading="lazy" />
                      : <span className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline-soft font-mono text-[12px] text-ink-muted">{r.author.charAt(0)}</span>}
                    <span className="font-mono uppercase tracking-widest text-[11px] text-ink">{r.author}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Leave a review */}
        <section className="py-16 md:py-20 border-t border-hairline-soft">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display uppercase text-ink mb-4" style={{ fontSize: 'clamp(24px, 4vw, 44px)', lineHeight: '1' }}>
              {isEs ? '¿Trabajamos juntos? Cuéntalo' : 'Worked together? Tell the world'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mx-auto mb-9">
              {isEs
                ? 'Tu reseña ayuda a otras parejas, empresas y familias a elegir con confianza. Déjala en Google o Trustpilot — toma menos de un minuto.'
                : 'Your review helps other couples, businesses and families choose with confidence. Leave one on Google or Trustpilot — it takes under a minute.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={REVIEW_PLATFORM_LINKS.google}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:bg-ink/90 transition-colors duration-200"
              >
                {isEs ? 'Reseñar en Google' : 'Review on Google'}
              </a>
              <a
                href={REVIEW_PLATFORM_LINKS.trustpilot}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
              >
                {isEs ? 'Reseñar en Trustpilot' : 'Review on Trustpilot'}
              </a>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-20 border-t border-hairline-soft">
          <div className="container mx-auto px-4 text-center">
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mx-auto mb-7">
              {isEs
                ? 'Reserva tu sesión con un fotógrafo con más de 500 clientes satisfech@s en toda República Dominicana.'
                : 'Book your session with a photographer trusted by 500+ satisfied clients across the Dominican Republic.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${locale}/get-quote`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:bg-ink/90 transition-colors duration-200"
              >
                {isEs ? 'Solicitar cotización' : 'Get a quote'}
              </Link>
              <Link
                href={`/${locale}/portfolio`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
              >
                {isEs ? 'Ver portafolio' : 'View portfolio'}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
