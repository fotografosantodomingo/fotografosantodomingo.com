import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import {
  LEGACY_SERVICE_SLUG_TO_FAMILY,
  resolveFamilySlug,
} from '@/lib/services/legacy-aliases'
import { getServiceContent } from '@/data/service-content'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string; service: string } }

type FamilyRow = {
  id: string
  slug: string
  title_es: string
  title_en: string
  tagline_es: string | null
  tagline_en: string | null
  icon: string
  bookable: boolean
  quoteable: boolean
}

type PackageRow = {
  id: string
  slug: string
  name_es: string
  name_en: string
  description_short_es: string | null
  description_short_en: string | null
  inclusions_es: string[]
  inclusions_en: string[]
  duration_min: number
  starting_price_usd: number
  deposit_percent: number
  photo_count: number | null
  minimum_billable_hours: number | null
  bookable_direct: boolean
  custom_quote_allowed: boolean
  featured: boolean
  popular_badge: 'most_booked' | 'best_value' | null
  sort_order: number
}

async function loadFamily(slug: string): Promise<{
  family: FamilyRow
  packages: PackageRow[]
} | null> {
  const supabase = createServiceClient()
  const { data: family } = await supabase
    .from('service_families')
    .select('id, slug, title_es, title_en, tagline_es, tagline_en, icon, bookable, quoteable')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()
  if (!family) return null
  const { data: packages } = await supabase
    .from('service_packages')
    .select('id, slug, name_es, name_en, description_short_es, description_short_en, inclusions_es, inclusions_en, duration_min, starting_price_usd, deposit_percent, photo_count, minimum_billable_hours, bookable_direct, custom_quote_allowed, featured, popular_badge, sort_order')
    .eq('family_id', family.id)
    .eq('active', true)
    .order('sort_order', { ascending: true })
  return {
    family: family as FamilyRow,
    packages: (packages ?? []) as PackageRow[],
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service } = params
  const isEs = locale === 'es'
  const canonicalSlug = resolveFamilySlug(service)
  const result = await loadFamily(canonicalSlug)
  if (!result) return {}
  const { family } = result
  const title = isEs
    ? `${family.title_es} — Babula Shots`
    : `${family.title_en} — Babula Shots`
  const description = (isEs ? family.tagline_es : family.tagline_en) ?? ''

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/services/${family.slug}`,
      languages: {
        es: `${BASE_URL}/es/services/${family.slug}`,
        en: `${BASE_URL}/en/services/${family.slug}`,
        'x-default': `${BASE_URL}/es/services/${family.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title,
      description,
      url: `${BASE_URL}/${locale}/services/${family.slug}`,
      locale: isEs ? 'es_DO' : 'en_US',
    },
    robots: { index: true, follow: true },
  }
}

export default async function FamilyPage({ params }: Props) {
  const { locale, service } = params
  const isEs = locale === 'es'

  // Legacy slug → 301 to canonical (preserves existing inbound links)
  if (service in LEGACY_SERVICE_SLUG_TO_FAMILY) {
    redirect(`/${locale}/services/${LEGACY_SERVICE_SLUG_TO_FAMILY[service]}`)
  }

  const result = await loadFamily(service)
  if (!result) notFound()
  const { family, packages } = result

  const title = isEs ? family.title_es : family.title_en
  const tagline = isEs ? family.tagline_es : family.tagline_en

  const directPackages = packages.filter(p => p.bookable_direct)
  const quoteOnlyPackages = packages.filter(p => !p.bookable_direct)

  // Optional rich SEO content for this family (recovered from pre-A6).
  // Falls back to null for families that haven't been backfilled yet.
  const content = getServiceContent(family.slug)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isEs ? 'Servicios' : 'Services', item: `${BASE_URL}/${locale}/services` },
      { '@type': 'ListItem', position: 3, name: title, item: `${BASE_URL}/${locale}/services/${family.slug}` },
    ],
  }

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: title,
    ...(content?.schemaAdditionalType ? { additionalType: content.schemaAdditionalType } : {}),
    ...(content?.knowsAbout
      ? { knowsAbout: isEs ? content.knowsAbout.es : content.knowsAbout.en }
      : {}),
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#business`,
      name: 'Fotografo Santo Domingo | Babula Shots',
      url: BASE_URL,
    },
    areaServed: { '@type': 'Country', name: 'Dominican Republic' },
    description: tagline ?? title,
    url: `${BASE_URL}/${locale}/services/${family.slug}`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: title,
      itemListElement: packages.map(p => ({
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: Number(p.starting_price_usd).toFixed(2),
        url: `${BASE_URL}/${locale}/services/${family.slug}/${p.slug}`,
        availability: 'https://schema.org/InStock',
        itemOffered: {
          '@type': 'Service',
          name: isEs ? p.name_es : p.name_en,
          description: (isEs ? p.description_short_es : p.description_short_en) ?? undefined,
        },
      })),
    },
  }

  // FAQPage JSON-LD — recovered. Drives Google's FAQ rich-result feature.
  const faqJsonLd = content?.faqs
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: content.faqs.map(f => ({
          '@type': 'Question',
          name: isEs ? f.question.es : f.question.en,
          acceptedAnswer: {
            '@type': 'Answer',
            text: isEs ? f.answer.es : f.answer.en,
          },
        })),
      }
    : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <main className="min-h-screen bg-canvas text-ink">
        {/* ── HEADER ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24 lg:py-28">
          <div className="container mx-auto px-4">
            <nav>
              <Link
                href={`/${locale}/services`}
                className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
              >
                ← {isEs ? 'Todos los servicios' : 'All services'}
              </Link>
            </nav>
            <div className="mt-10 flex items-start gap-6">
              <span className="text-5xl md:text-6xl shrink-0" aria-hidden="true">{family.icon}</span>
              <div>
                <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
                  {isEs ? 'Familia' : 'Family'}
                </p>
                <h1
                  className="font-display uppercase text-ink"
                  style={{
                    fontSize: 'clamp(36px, 7vw, 112px)',
                    lineHeight: '0.95',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {title}
                </h1>
                {tagline && (
                  <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-6">{tagline}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── DIFFERENTIATORS ── above the package grid: answers "why us"
             before the visitor sees the price. */}
        {content?.differentiators && content.differentiators.length > 0 && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-8">
                {isEs ? 'Por qué nosotros' : 'Why us'}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-hairline-soft">
                {content.differentiators.map((d, i) => (
                  <li key={i} className="border-r border-b border-hairline-soft p-7 md:p-8">
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className="font-display uppercase text-ink mt-3"
                      style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: '1.1' }}
                    >
                      {isEs ? d.title.es : d.title.en}
                    </h3>
                    <p className="text-ink-muted text-sm leading-relaxed mt-3">
                      {isEs ? d.proof.es : d.proof.en}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {directPackages.length > 0 && (
          <PackageGrid
            heading={isEs ? 'Paquetes para reservar online' : 'Packages bookable online'}
            packages={directPackages}
            family={family}
            locale={locale}
            isEs={isEs}
          />
        )}

        {quoteOnlyPackages.length > 0 && (
          <PackageGrid
            heading={isEs ? 'Solo por cotización personalizada' : 'Custom quote only'}
            packages={quoteOnlyPackages}
            family={family}
            locale={locale}
            isEs={isEs}
            quoteOnly
          />
        )}

        {/* ── LONG-FORM CONTENT ── the SEO ranking body. Editorial register:
             intro paragraph, numbered sections with paragraphs + bullets. */}
        {content?.longForm && (
          <section className="border-b border-hairline-soft py-20 md:py-28">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <p className="text-ink text-lg md:text-xl leading-relaxed">
                  {isEs ? content.longForm.intro.es : content.longForm.intro.en}
                </p>
              </div>
              <div className="max-w-3xl mt-16 md:mt-20 space-y-16 md:space-y-20">
                {content.longForm.sections.map((s, i) => (
                  <div key={i}>
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2
                      className="font-display uppercase text-ink mt-4 mb-6"
                      style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.05' }}
                    >
                      {isEs ? s.title.es : s.title.en}
                    </h2>
                    <div className="space-y-5 text-ink leading-relaxed">
                      {(isEs ? s.paragraphs.es : s.paragraphs.en).map((p, j) => (
                        <p key={j} className="text-base md:text-lg">{p}</p>
                      ))}
                    </div>
                    {s.bullets && (
                      <ul className="mt-7 space-y-3">
                        {(isEs ? s.bullets.es : s.bullets.en).map((b, j) => (
                          <li key={j} className="flex items-start gap-3 text-ink/85 text-base">
                            <span
                              className="mt-2.5 inline-block w-2 h-px bg-ink/60 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── PROCESS STEPS ── how it works */}
        {content?.processSteps && content.processSteps.length > 0 && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Proceso' : 'Process'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-12"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs ? 'Cómo trabajamos' : 'How we work'}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-hairline-soft">
                {content.processSteps.map((step, i) => (
                  <li key={i} className="border-r border-b border-hairline-soft p-6 md:p-7">
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className="font-display uppercase text-ink mt-3"
                      style={{ fontSize: 'clamp(17px, 1.6vw, 22px)', lineHeight: '1.15' }}
                    >
                      {isEs ? step.title.es : step.title.en}
                    </h3>
                    <p className="text-ink-muted text-sm leading-relaxed mt-3">
                      {isEs ? step.description.es : step.description.en}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── LOCATIONS ── geographic SEO + venue depth + portfolio links */}
        {content?.locations && content.locations.length > 0 && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Locaciones' : 'Locations'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-3"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs ? 'Dónde trabajamos' : 'Where we work'}
              </h2>
              <p className="text-ink-muted text-base md:text-lg max-w-2xl mb-12">
                {isEs
                  ? 'Venues curados en toda República Dominicana con notas de luz y estilo.'
                  : 'Curated venues across the Dominican Republic with light + style notes.'}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline-soft">
                {content.locations.map((loc, i) => (
                  <li key={i} className="border-r border-b border-hairline-soft">
                    <Link
                      href={`/${locale}${loc.href}`}
                      className="group flex flex-col h-full p-6 md:p-7 hover:bg-ink/5 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {loc.area}
                        </span>
                        <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3
                        className="font-display uppercase text-ink"
                        style={{ fontSize: 'clamp(17px, 1.6vw, 22px)', lineHeight: '1.15' }}
                      >
                        {loc.venue}
                      </h3>
                      <p className="text-ink-muted text-sm mt-3">
                        {isEs ? loc.style.es : loc.style.en}
                      </p>
                      <p className="text-ink/85 text-sm leading-relaxed mt-3 flex-1">
                        {isEs ? loc.detail.es : loc.detail.en}
                      </p>
                      <div className="mt-5 pt-4 border-t border-hairline-soft font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                        {isEs ? 'Mejor luz' : 'Best light'} ·{' '}
                        {isEs ? loc.bestLight.es : loc.bestLight.en}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── SAMPLE TIMELINE ── operational depth */}
        {content?.longForm?.timeline && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Timeline' : 'Timeline'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-12 max-w-3xl"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.05' }}
              >
                {isEs ? content.longForm.timeline.title.es : content.longForm.timeline.title.en}
              </h2>
              <ul className="border-t border-hairline-soft max-w-4xl">
                {content.longForm.timeline.rows.map((row, i) => (
                  <li
                    key={i}
                    className="border-b border-hairline-soft py-5 md:py-6 grid grid-cols-1 md:grid-cols-[160px_180px_1fr] gap-3 md:gap-6"
                  >
                    <div className="font-mono uppercase tracking-widest text-[10px] text-ink-muted md:pt-1">
                      {String(i + 1).padStart(2, '0')} · {isEs ? row.phase.es : row.phase.en}
                    </div>
                    <div className="text-ink text-sm md:text-base">
                      {isEs ? row.timing.es : row.timing.en}
                    </div>
                    <div className="text-ink-muted text-sm md:text-base leading-relaxed">
                      {isEs ? row.notes.es : row.notes.en}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── TRUST SIGNALS + TESTIMONIALS + CASE STUDY ── */}
        {content?.trust && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Confianza · Experiencia' : 'Trust · Experience'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-10"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs ? '10+ temporadas en RD' : '10+ seasons in DR'}
              </h2>

              <div className="grid gap-10 lg:grid-cols-[2fr_1fr] mb-12">
                <div>
                  <p className="text-ink text-base md:text-lg leading-relaxed">
                    {isEs ? content.trust.expertBio.es : content.trust.expertBio.en}
                  </p>
                  <ul className="mt-7 space-y-3">
                    {(isEs ? content.trust.authoritySignals.es : content.trust.authoritySignals.en).map((sig, i) => (
                      <li key={i} className="flex items-start gap-3 text-ink/85 text-base">
                        <span
                          className="mt-2.5 inline-block w-2 h-px bg-ink/60 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {content.trust.caseStudy && (
                  <div className="border border-hairline-soft p-6 md:p-7">
                    <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-3">
                      {isEs ? 'Caso real' : 'Case study'}
                    </p>
                    <h3
                      className="font-display uppercase text-ink mb-5"
                      style={{ fontSize: 'clamp(17px, 1.6vw, 20px)', lineHeight: '1.15' }}
                    >
                      {isEs ? content.trust.caseStudy.title.es : content.trust.caseStudy.title.en}
                    </h3>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {isEs ? 'Reto' : 'Challenge'}
                        </dt>
                        <dd className="text-ink mt-1">
                          {isEs ? content.trust.caseStudy.challenge.es : content.trust.caseStudy.challenge.en}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {isEs ? 'Solución' : 'Solution'}
                        </dt>
                        <dd className="text-ink mt-1">
                          {isEs ? content.trust.caseStudy.solution.es : content.trust.caseStudy.solution.en}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {isEs ? 'Resultado' : 'Result'}
                        </dt>
                        <dd className="text-ink mt-1">
                          {isEs ? content.trust.caseStudy.result.es : content.trust.caseStudy.result.en}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              {content.trust.testimonials.length > 0 && (
                <ul className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-hairline-soft">
                  {content.trust.testimonials.map((t, i) => (
                    <li key={i} className="border-r border-b border-hairline-soft p-6 md:p-7">
                      <p className="text-ink text-base leading-relaxed mb-5">
                        &ldquo;{isEs ? t.quote.es : t.quote.en}&rdquo;
                      </p>
                      <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                        {isEs ? t.role.es : t.role.en}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* ── SEASONALITY ── practical knowledge */}
        {content?.seasonality && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Temporada · Clima · Luz' : 'Season · Weather · Light'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-10"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.05' }}
              >
                {isEs ? 'Cuándo programar' : 'When to schedule'}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-hairline-soft max-w-5xl">
                {[
                  {
                    label: isEs ? 'Temporada ideal' : 'Best season',
                    value: isEs ? content.seasonality.bestMonths.es : content.seasonality.bestMonths.en,
                  },
                  {
                    label: isEs ? 'Precaución' : 'Caution',
                    value: isEs ? content.seasonality.cautionMonths.es : content.seasonality.cautionMonths.en,
                  },
                  {
                    label: isEs ? 'Luz · Golden hour' : 'Light · Golden hour',
                    value: isEs ? content.seasonality.daylightNote.es : content.seasonality.daylightNote.en,
                  },
                ].map(({ label, value }) => (
                  <li key={label} className="border-r border-b border-hairline-soft p-6 md:p-7">
                    <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-3">
                      {label}
                    </p>
                    <p className="text-ink text-base leading-relaxed">{value}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── FAQ ── drives Google FAQ rich-result snippet via FAQPage JSON-LD */}
        {content?.faqs && content.faqs.length > 0 && (
          <section className="border-b border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                  FAQ
                </p>
                <h2
                  className="font-display uppercase text-ink mb-12"
                  style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
                >
                  {isEs ? 'Preguntas frecuentes' : 'Frequently asked'}
                </h2>
                <ul className="border-t border-hairline-soft">
                  {content.faqs.map((faq, i) => (
                    <li key={i} className="border-b border-hairline-soft py-6 md:py-7">
                      <div className="flex items-start gap-4 md:gap-6">
                        <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 w-8 mt-1">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-ink text-base md:text-lg leading-snug font-medium">
                            {isEs ? faq.question.es : faq.question.en}
                          </h3>
                          <p className="text-ink-muted text-sm md:text-base leading-relaxed mt-3">
                            {isEs ? faq.answer.es : faq.answer.en}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* ── INTERNAL LINKS ── spoke navigation */}
        {content?.internalLinks && content.internalLinks.length > 0 && (
          <section className="border-b border-hairline-soft py-12 md:py-16">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-8">
                {isEs ? 'Continuar' : 'Continue'}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-hairline-soft">
                {content.internalLinks.map((link, i) => (
                  <li key={i} className="border-r border-b border-hairline-soft">
                    <Link
                      href={`/${locale}${link.href}`}
                      className="group flex flex-col p-6 md:p-7 hover:bg-ink/5 transition-colors duration-200"
                    >
                      <span className="font-mono uppercase tracking-widest text-[11px] text-ink inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                        {isEs ? link.label.es : link.label.en}
                        <span aria-hidden="true">→</span>
                      </span>
                      <p className="text-ink-muted text-sm leading-relaxed mt-3">
                        {isEs ? link.description.es : link.description.en}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── BOTTOM RFQ CTA ── */}
        <section className="border-t border-hairline-soft py-20 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Personalizado' : 'Custom'}
            </p>
            <h2
              className="font-display uppercase text-ink mx-auto max-w-3xl"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
            >
              {isEs ? '¿Tu visión no encaja?' : 'Vision off the menu?'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg mt-6 max-w-xl mx-auto">
              {isEs
                ? 'Cuéntanos los detalles y te enviamos un presupuesto a medida.'
                : "Tell us the details and we'll send a tailored quote."}
            </p>
            <Link
              href={`/${locale}/get-quote?family=${family.slug}&cta=family-page-bottom`}
              className="mt-10 inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
            >
              {isEs ? 'Solicitar presupuesto' : 'Request a quote'}
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}

function PackageGrid({
  heading,
  packages,
  family,
  locale,
  isEs,
  quoteOnly,
}: {
  heading: string
  packages: PackageRow[]
  family: FamilyRow
  locale: string
  isEs: boolean
  quoteOnly?: boolean
}) {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 font-mono uppercase tracking-widest text-[11px] text-ink-muted">
          {heading}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline-soft">
          {packages.map(p => {
            const name = isEs ? p.name_es : p.name_en
            const desc = isEs ? p.description_short_es : p.description_short_en
            const inclusions = isEs ? p.inclusions_es : p.inclusions_en
            const price = Number(p.starting_price_usd)
            return (
              <li key={p.id} className="border-r border-b border-hairline-soft">
                <Link
                  href={`/${locale}/services/${family.slug}/${p.slug}`}
                  className={`group flex flex-col h-full p-7 md:p-8 lg:p-10 hover:bg-ink/5 transition-colors duration-200 ${
                    p.featured ? 'bg-ink/[0.03]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-5 min-h-[24px]">
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {p.popular_badge
                        ? p.popular_badge.replace('_', ' ')
                        : p.featured
                          ? (isEs ? 'Destacado' : 'Featured')
                          : ''}
                    </span>
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {p.minimum_billable_hours
                        ? `${p.minimum_billable_hours}h ${isEs ? 'mín' : 'min'}`
                        : `${p.duration_min} min`}
                    </span>
                  </div>

                  <h3
                    className="font-display uppercase text-ink"
                    style={{ fontSize: 'clamp(22px, 2.2vw, 30px)', lineHeight: '1.05' }}
                  >
                    {name}
                  </h3>

                  <div className="mt-5 mb-1 flex items-baseline gap-2">
                    <span
                      className="font-display text-ink"
                      style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: '1.0' }}
                    >
                      ${price.toFixed(0)}
                    </span>
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {isEs ? 'USD desde' : 'USD start'}
                    </span>
                  </div>

                  {desc && <p className="mt-4 text-sm text-ink-muted leading-relaxed">{desc}</p>}

                  {inclusions.length > 0 && (
                    <ul className="mt-6 space-y-2 text-sm text-ink/80 flex-1">
                      {inclusions.slice(0, 4).map((inc, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-1.5 inline-block w-2 h-px bg-ink/60 shrink-0" aria-hidden="true" />
                          <span className="leading-snug">{inc}</span>
                        </li>
                      ))}
                      {inclusions.length > 4 && (
                        <li className="font-mono uppercase tracking-widest text-[10px] text-ink-muted pl-[18px]">
                          +{inclusions.length - 4} {isEs ? 'más' : 'more'}
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="mt-8 pt-6 border-t border-hairline-soft flex items-center justify-between">
                    <span className="font-mono uppercase tracking-widest text-[11px] text-ink inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                      {isEs ? 'Ver detalles' : 'View details'}
                      <span aria-hidden="true">→</span>
                    </span>
                    {!quoteOnly && p.bookable_direct && (
                      <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                        {p.deposit_percent}% {isEs ? 'depósito' : 'deposit'}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
