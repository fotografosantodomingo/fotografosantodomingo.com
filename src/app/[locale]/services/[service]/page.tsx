import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import {
  LEGACY_SERVICE_SLUG_TO_FAMILY,
  resolveFamilySlug,
} from '@/lib/services/legacy-aliases'
import { getServiceContent } from '@/data/service-content'
import { GEO_PAGES } from '@/data/geo-pages'
import { getUsdToDopRate } from '@/lib/currency/exchange-rate'
import { formatServicePrice } from '@/lib/currency/format'
import { getRelatedPostsForFamily } from '@/lib/supabase/blog'

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

type FamilyTileRow = {
  slug: string
  title_es: string
  title_en: string
  tagline_es: string | null
  tagline_en: string | null
  icon: string
}

/**
 * Load all active families (slug + title + tagline + icon) for the
 * sibling-families internal-link block at the bottom of each family
 * page. Falls back to [] on error so the page never 500s.
 */
async function loadAllFamilyTitles(): Promise<FamilyTileRow[]> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('service_families')
      .select('slug, title_es, title_en, tagline_es, tagline_en, icon')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    return (data ?? []) as unknown as FamilyTileRow[]
  } catch {
    return []
  }
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
  const seo = getServiceContent(family.slug)?.seo

  // seo block (when authored) wins; falls back to DB title + tagline so a
  // family without a content module still gets reasonable metadata.
  const title = seo
    ? (isEs ? seo.title.es : seo.title.en)
    : isEs
      ? `${family.title_es} — Babula Shots`
      : `${family.title_en} — Babula Shots`
  const description = seo
    ? (isEs ? seo.description.es : seo.description.en)
    : (isEs ? family.tagline_es : family.tagline_en) ?? ''
  const keywords = seo ? (isEs ? seo.keywords.es : seo.keywords.en) : undefined

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
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

  const canonicalForRelated = LEGACY_SERVICE_SLUG_TO_FAMILY[service] ?? service
  const [result, dopRate, relatedPosts, allFamilies] = await Promise.all([
    loadFamily(service),
    getUsdToDopRate(),
    getRelatedPostsForFamily(canonicalForRelated, isEs ? 'es' : 'en'),
    loadAllFamilyTitles(),
  ])
  if (!result) notFound()
  const { family, packages } = result
  // Sibling families = other active families excluding the current one,
  // for the "Explore other services" cross-family internal link block.
  const siblingFamilies = allFamilies
    .filter((f) => f.slug !== family.slug)
    .slice(0, 6)

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
    // areaServed expands when geoCoverage is present: country + each city
    // becomes its own Place node, giving Google explicit per-city signals
    // alongside the country-level reference.
    areaServed: content?.geoCoverage && content.geoCoverage.length > 0
      ? [
          { '@type': 'Country', name: 'Dominican Republic' },
          ...content.geoCoverage.map(geo => ({
            '@type': 'City',
            name: isEs ? geo.cityName.es : geo.cityName.en,
            containedInPlace: { '@type': 'Country', name: 'Dominican Republic' },
          })),
        ]
      : { '@type': 'Country', name: 'Dominican Republic' },
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
  // Includes both family-level FAQs and per-geo mini-FAQs so each city's
  // questions surface in Search.
  const allFaqs = [
    ...(content?.faqs ?? []),
    ...(content?.geoCoverage ?? []).flatMap(g => g.miniFaq ?? []),
  ]
  const faqJsonLd = allFaqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: allFaqs.map(f => ({
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

        {/* ── MOBILE HERO IMAGE ── Single full-bleed shot rendered ONLY on
             phones (md:hidden). Desktop visitors see the typographic hero
             alone since their viewport already supports it; phone screens
             benefit from a vertical/landscape image to fill the gap below
             the hero copy. Source: ServiceContent.mobileHeroImage —
             accepts plain string or rich {src, alt, width, height}. */}
        {content?.mobileHeroImage && (
          <section className="md:hidden border-b border-hairline-soft bg-canvas">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={typeof content.mobileHeroImage === 'string' ? content.mobileHeroImage : content.mobileHeroImage.src}
              alt={
                typeof content.mobileHeroImage === 'string'
                  ? (isEs
                      ? `${title} — fotografía profesional en República Dominicana`
                      : `${title} — professional photography in the Dominican Republic`)
                  : (isEs ? content.mobileHeroImage.alt.es : content.mobileHeroImage.alt.en)
              }
              {...(typeof content.mobileHeroImage !== 'string' && content.mobileHeroImage.width
                ? { width: content.mobileHeroImage.width } : {})}
              {...(typeof content.mobileHeroImage !== 'string' && content.mobileHeroImage.height
                ? { height: content.mobileHeroImage.height } : {})}
              className="block h-auto w-full"
              loading="eager"
              fetchPriority="high"
            />
          </section>
        )}

        {/* ── STUDIO SUBPAGE CTA ── only on luxury-portrait-photography.
             Drives traffic to /{locale}/photo-studio-santo-domingo, the
             dedicated fashion-editorial / fine-art studio landing page.
             Hero image is responsive: desktop vs mobile crop served via
             Tailwind hidden classes (no <picture> needed since both files
             are already viewport-tuned). */}
        {family.slug === 'real-estate-drone-photography' && (
          <section className="border-b border-hairline-soft bg-canvas">
            <div className="container mx-auto px-4 py-12 md:py-16">
              <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/dwewurxla/image/upload/v1777428637/Foto%CC%81grafo_Inmobiliario_en_Punta_Cana_Drone_xdv4io.webp"
                  alt={isEs ? 'Inspección aérea de obra con drone profesional en República Dominicana' : 'Professional drone construction inspection in the Dominican Republic'}
                  width={1600}
                  height={900}
                  className="block w-full md:w-80 lg:w-96 h-auto object-cover rounded-md shrink-0"
                  loading="lazy"
                />
                <div className="flex-1">
                  <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
                    {isEs ? 'Página dedicada' : 'Dedicated page'}
                  </p>
                  <h2
                    className="font-display uppercase text-ink"
                    style={{ fontSize: 'clamp(24px, 3.2vw, 40px)', lineHeight: '1.05' }}
                  >
                    {isEs ? 'Supervisión de Obras con Drone' : 'Drone Construction Supervision'}
                  </h2>
                  <p className="text-ink-muted text-sm md:text-base leading-relaxed mt-4 max-w-2xl">
                    {isEs
                      ? 'Inspección aérea técnica para obras: reportes de avance, evidencia georreferenciada y documentación recurrente para constructoras y desarrolladores. Criterio de ingeniería civil, no sólo cobertura visual.'
                      : 'Technical aerial inspection for construction projects: progress reports, geo-tagged evidence, and recurring documentation for builders and developers. Civil-engineering criterion, not just visual coverage.'}
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/${locale}/drone-construction-supervision`}
                      className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 font-mono uppercase tracking-widest text-[12px] text-canvas hover:opacity-90 transition-opacity"
                    >
                      {isEs ? 'Ver supervisión de obras →' : 'See construction supervision →'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {family.slug === 'commercial-branding-photography' && (
          <section className="border-b border-hairline-soft bg-canvas">
            {/* Compact layout: small fixed-width portrait on the left, copy
                + CTA on the right. Image is no longer half-screen. */}
            <div className="container mx-auto px-4 py-12 md:py-16">
              <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/dwewurxla/image/upload/v1777564250/Babula_Shots_Rd_-3_atumo9.webp"
                  alt={isEs ? 'Retratos corporativos y LinkedIn en Santo Domingo, República Dominicana' : 'Corporate and LinkedIn portraits in Santo Domingo, Dominican Republic'}
                  width={1200}
                  height={1500}
                  className="block w-40 sm:w-52 md:w-64 h-auto object-cover rounded-md shrink-0"
                  loading="lazy"
                />
                <div className="flex-1">
                  <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-3">
                    {isEs ? 'Página dedicada' : 'Dedicated page'}
                  </p>
                  <h2
                    className="font-display uppercase text-ink"
                    style={{ fontSize: 'clamp(24px, 3.2vw, 40px)', lineHeight: '1.05' }}
                  >
                    {isEs ? 'Retratos Corporativos · LinkedIn · Marca Personal' : 'Corporate · LinkedIn · Personal Brand Portraits'}
                  </h2>
                  <p className="text-ink-muted text-sm md:text-base leading-relaxed mt-4 max-w-2xl">
                    {isEs
                      ? 'Headshots para LinkedIn, retratos para ejecutivos y sesiones de marca personal. En estudio o servicio in-house en tu oficina con kit completo de iluminación.'
                      : 'LinkedIn headshots, executive portraits, and personal-branding sessions. In studio or on-site at your office with a full lighting kit.'}
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/${locale}/business-portraits-santo-domingo`}
                      className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 font-mono uppercase tracking-widest text-[12px] text-canvas hover:opacity-90 transition-opacity"
                    >
                      {isEs ? 'Ver retratos corporativos →' : 'See corporate portraits →'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {family.slug === 'luxury-portrait-photography' && (
          <section className="border-b border-hairline-soft bg-canvas">
            <div className="grid md:grid-cols-2">
              <div className="bg-canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/dwewurxla/image/upload/v1777431039/editorial_sesioon_de_fotos_santoo_domingo_fotografo_profesional_republica_dominicana_neupwn.webp"
                  alt={isEs ? 'Sesión editorial en estudio fotográfico Santo Domingo, República Dominicana' : 'Editorial studio photo session, Santo Domingo, Dominican Republic'}
                  className="hidden md:block h-full w-full object-cover"
                  loading="lazy"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/dwewurxla/image/upload/v1777431069/sesion_de_fotos_en_estudio_fotografico_santo_domingo_h0b3ap.webp"
                  alt={isEs ? 'Sesión de fotos en estudio fotográfico Santo Domingo' : 'Photo studio session, Santo Domingo'}
                  className="block md:hidden h-auto w-full"
                  loading="lazy"
                />
              </div>
              <div className="px-6 md:px-12 py-16 md:py-24 flex flex-col justify-center">
                <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                  {isEs ? 'Página dedicada' : 'Dedicated page'}
                </p>
                <h2
                  className="font-display uppercase text-ink"
                  style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
                >
                  {isEs ? 'Estudio · Fashion Editorial' : 'Studio · Fashion Editorial'}
                </h2>
                <p className="text-ink-muted text-base md:text-lg leading-relaxed mt-6 max-w-md">
                  {isEs
                    ? 'Sesiones controladas en estudio en Santo Domingo: fashion editorial, retrato creativo y fotografía artística. Iluminación profesional, fondos editoriales y dirección de arte.'
                    : 'Controlled studio sessions in Santo Domingo: fashion editorial, creative portraiture, and fine-art photography. Pro lighting, editorial backdrops, and art direction.'}
                </p>
                <div className="mt-8">
                  <Link
                    href={`/${locale}/photo-studio-santo-domingo`}
                    className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-canvas hover:opacity-90 transition-opacity"
                  >
                    {isEs ? 'Conocer el estudio →' : 'Discover the studio →'}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── HERO GALLERY ── Optional full-bleed photos rendered just before
             the "Why us" section. Edge-to-edge, no crop, same on desktop and
             mobile. Source: ServiceContent.heroGallery in src/data/service-content/. */}
        {content?.heroGallery && content.heroGallery.length > 0 && (
          <section className="border-b border-hairline-soft bg-canvas">
            {content.heroGallery.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${src}-${i}`}
                src={src}
                alt={isEs
                  ? `${title} — galería ${i + 1}`
                  : `${title} — gallery ${i + 1}`}
                className="block h-auto w-full"
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
              />
            ))}
          </section>
        )}

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
            dopRate={dopRate.usdToDop}
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
            dopRate={dopRate.usdToDop}
          />
        )}

        {/* ── LONG-FORM GALLERY ── Optional full-bleed photo grid between
             the package grids and the long-form intro paragraph. 2 cols on
             desktop, 1 col on mobile, single set of <img> tags so crawlers
             see N photos not 2N (same lesson as /beach-photo-sessions).
             Source: ServiceContent.longFormGallery — accepts string[] or
             RichImage[]; rich form gives per-photo bilingual alt for SEO. */}
        {content?.longFormGallery && content.longFormGallery.length > 0 && (
          <section className="border-b border-hairline-soft bg-canvas">
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid grid-cols-1 md:grid-cols-2 gap-0">
              {(content.longFormGallery as Array<string | { src: string; alt: { es: string; en: string }; caption?: { es: string; en: string }; width?: number; height?: number }>).map((item, i) => {
                const src = typeof item === 'string' ? item : item.src
                const altText = typeof item === 'string'
                  ? (isEs ? `${title} — galería ${i + 1}` : `${title} — gallery ${i + 1}`)
                  : (isEs ? item.alt.es : item.alt.en)
                const titleAttr = typeof item === 'string' || !item.caption
                  ? undefined
                  : (isEs ? item.caption.es : item.caption.en)
                const w = typeof item === 'string' ? 1600 : (item.width ?? 1600)
                const h = typeof item === 'string' ? 900 : (item.height ?? 900)
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={altText}
                    title={titleAttr}
                    width={w}
                    height={h}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-contain block"
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* ── LONG-FORM CONTENT ── the SEO ranking body. Editorial register:
             intro paragraph, numbered sections with paragraphs + bullets. */}
        {content?.longForm && (
          <section className="border-b border-hairline-soft py-20 md:py-28">
            <div className="container mx-auto px-4">
              {content.longForm.introImage && (
                <div className="mb-10 w-full overflow-hidden">
                  <img
                    src={content.longForm.introImage}
                    alt={title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              )}
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

        {/* ── GEO COVERAGE ── Tier-2 SEO geo capture: per-city H2 anchors,
             named venues, mini-FAQ, and per-geo CTAs that flow `?city=`
             into the booking + quote wizards for attribution. */}
        {content?.geoCoverage && content.geoCoverage.length > 0 && (
          <section className="border-b border-hairline-soft py-20 md:py-28">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Cobertura Geográfica' : 'Geographic Coverage'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-6"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs ? `Dónde cubrimos ${family.title_es.toLowerCase()}` : `Where we cover ${family.title_en.toLowerCase()}`}
              </h2>
              <p className="text-ink-muted text-base md:text-lg max-w-2xl mb-12">
                {isEs
                  ? 'Cobertura concentrada en las ciudades y resorts donde más bodas, eventos y producciones ocurren. Cada ciudad tiene su propio flujo, venues y notas de coordinación.'
                  : 'Coverage focused on the cities and resorts where most weddings, events, and productions happen. Each city has its own flow, venues, and coordination notes.'}
              </p>

              {/* City quick-jump nav */}
              <nav className="mb-12 flex flex-wrap gap-2">
                {content.geoCoverage.map((geo) => (
                  <a
                    key={geo.citySlug}
                    href={`#${geo.citySlug}`}
                    className="inline-flex items-center font-mono uppercase tracking-widest text-[11px] px-4 py-2 rounded-full border border-hairline-soft text-ink-muted hover:text-ink hover:border-hairline transition-colors duration-200"
                  >
                    {isEs ? geo.cityName.es : geo.cityName.en}
                  </a>
                ))}
              </nav>

              <div className="space-y-20 md:space-y-24">
                {content.geoCoverage.map((geo) => {
                  const cityName = isEs ? geo.cityName.es : geo.cityName.en
                  const familyTitle = isEs ? family.title_es : family.title_en
                  const familyTitleLower = familyTitle.toLowerCase()
                  const heading = isEs
                    ? `${familyTitle} en ${cityName}`
                    : `${familyTitle} in ${cityName}`
                  return (
                    <article key={geo.citySlug} id={geo.citySlug} className="scroll-mt-24">
                      <h3
                        className="font-display uppercase text-ink mb-6"
                        style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.05' }}
                      >
                        {heading}
                      </h3>

                      <div className="max-w-3xl">
                        <p className="text-ink text-base md:text-lg leading-relaxed">
                          {isEs ? geo.intro.es : geo.intro.en}
                        </p>
                      </div>

                      {geo.bestSeasonNote && (
                        <p className="mt-6 max-w-3xl font-mono uppercase tracking-widest text-[11px] text-ink-muted leading-relaxed">
                          {isEs ? geo.bestSeasonNote.es : geo.bestSeasonNote.en}
                        </p>
                      )}

                      {/* Named venues */}
                      <div className="mt-10">
                        <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                          {isEs ? 'Venues que conocemos' : 'Venues we know'}
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                          {(isEs ? geo.venues.es : geo.venues.en).map((venue, vi) => (
                            <li key={vi} className="flex items-start gap-3 text-ink/85 text-sm leading-relaxed">
                              <span
                                className="mt-2 inline-block w-2 h-px bg-ink/60 shrink-0"
                                aria-hidden="true"
                              />
                              <span>{venue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Mini-FAQ for this geo */}
                      {geo.miniFaq && geo.miniFaq.length > 0 && (
                        <div className="mt-10 max-w-3xl">
                          <ul className="border-t border-hairline-soft">
                            {geo.miniFaq.map((q, qi) => (
                              <li key={qi} className="border-b border-hairline-soft py-5">
                                <h4 className="text-ink text-base md:text-lg leading-snug font-medium">
                                  {isEs ? q.question.es : q.question.en}
                                </h4>
                                <p className="text-ink-muted text-sm md:text-base leading-relaxed mt-3">
                                  {isEs ? q.answer.es : q.answer.en}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Per-geo CTAs — carry ?city= for attribution */}
                      <div className="mt-10 flex flex-col sm:flex-row gap-3 flex-wrap">
                        {family.bookable && (
                          <Link
                            href={`/${locale}/book?service=${family.slug}&city=${geo.citySlug}&cta=geo-block-${geo.citySlug}`}
                            className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                          >
                            {isEs ? `Reservar en ${cityName}` : `Book in ${cityName}`}
                          </Link>
                        )}
                        {family.quoteable && (
                          <Link
                            href={`/${locale}/get-quote?family=${family.slug}&city=${geo.citySlug}&cta=geo-block-${geo.citySlug}`}
                            className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
                          >
                            {isEs ? `Cotizar ${familyTitleLower} en ${cityName}` : `Get quote for ${familyTitleLower} in ${cityName}`}
                          </Link>
                        )}
                        {/* Tier-1 dedicated geo URL deep-link — passes link
                             equity to the standalone landing page when one
                             exists for this (family, city) combo. */}
                        {(() => {
                          const dedicatedGeo = GEO_PAGES.find(
                            (g) => g.familySlug === family.slug && g.citySlug === geo.citySlug
                          )
                          if (!dedicatedGeo) return null
                          const slug = isEs ? dedicatedGeo.esSlug : dedicatedGeo.enSlug
                          return (
                            <Link
                              href={`/${locale}/${slug}`}
                              className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline-soft text-ink-muted hover:text-ink hover:border-hairline transition-colors duration-200"
                            >
                              {isEs ? `Página dedicada de ${cityName} →` : `${cityName} dedicated page →`}
                            </Link>
                          )
                        })()}
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── PRE-PROCESS GALLERY ── full-bleed strip before Proceso section */}
        {content?.preProcessGallery && content.preProcessGallery.length > 0 && (
          <>
            <section className="border-b border-hairline-soft bg-canvas" aria-hidden="true">
              <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid grid-cols-1 md:grid-cols-2 gap-0">
                {content.preProcessGallery.filter((img) => !img.mobileOnly).map((img, i) => (
                  <figure key={img.src} className="m-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={isEs ? img.alt.es : img.alt.en}
                      title={img.caption ? (isEs ? img.caption.es : img.caption.en) : undefined}
                      width={img.width ?? 1600}
                      height={img.height ?? 900}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-cover block"
                    />
                    {img.caption && (
                      <figcaption className="sr-only">{isEs ? img.caption.es : img.caption.en}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
            {content.preProcessGallery.some((img) => img.mobileOnly) && (
              <section className="border-b border-hairline-soft bg-canvas md:hidden">
                {content.preProcessGallery.filter((img) => img.mobileOnly).map((img) => (
                  <figure key={img.src} className="m-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={isEs ? img.alt.es : img.alt.en}
                      title={img.caption ? (isEs ? img.caption.es : img.caption.en) : undefined}
                      width={img.width ?? 800}
                      height={img.height ?? 1000}
                      sizes="100vw"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-cover block"
                    />
                    {img.caption && (
                      <figcaption className="sr-only">{isEs ? img.caption.es : img.caption.en}</figcaption>
                    )}
                  </figure>
                ))}
              </section>
            )}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'ImageGallery',
                  image: content.preProcessGallery.map((img) => ({
                    '@type': 'ImageObject',
                    contentUrl: img.src,
                    url: img.src,
                    name: isEs ? img.alt.es : img.alt.en,
                    caption: img.caption ? (isEs ? img.caption.es : img.caption.en) : undefined,
                    creator: { '@type': 'Person', name: 'Michal Babula' },
                  })),
                }),
              }}
            />
          </>
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

        {/* ── RELATED BLOG POSTS ── pulls 3 most-recent posts whose
             service_type matches one of the family's blog tag variants
             (see FAMILY_SLUG_TO_BLOG_SERVICE_TYPES). Renders only when
             at least one post exists — silently hidden if the family
             has no blog content yet. */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Del blog' : 'From the blog'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-12"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs
                  ? `Historias y guías de ${(isEs ? family.title_es : family.title_en).toLowerCase()}`
                  : `${family.title_en} stories and guides`}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="group block border border-hairline-soft p-6 h-full hover:bg-ink/5 transition-colors duration-200"
                    >
                      {post.location && (
                        <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-3">
                          {post.location}
                        </p>
                      )}
                      <h3
                        className="font-display uppercase text-ink"
                        style={{ fontSize: 'clamp(18px, 1.8vw, 24px)', lineHeight: '1.15' }}
                      >
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-ink-muted text-sm leading-relaxed mt-3 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="mt-5 pt-4 border-t border-hairline-soft font-mono uppercase tracking-widest text-[10px] text-ink-muted group-hover:text-ink transition-colors">
                        {isEs ? 'Leer →' : 'Read →'}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/blog`}
                className="mt-10 inline-flex items-center font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
              >
                {isEs ? 'Ver todo el blog →' : 'See all blog posts →'}
              </Link>
            </div>
          </section>
        )}

        {/* ── EXPLORE OTHER SERVICES ── cross-family internal links.
             Lifts family-page total href count significantly + helps
             Google understand the topical cluster around photography. */}
        {siblingFamilies.length > 0 && (
          <section className="border-t border-hairline-soft py-16 md:py-20">
            <div className="container mx-auto px-4">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Explorar' : 'Explore'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-12"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs ? 'Otros servicios fotográficos' : 'Other photography services'}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline-soft">
                {siblingFamilies.map((f) => (
                  <li key={f.slug} className="border-r border-b border-hairline-soft">
                    <Link
                      href={`/${locale}/services/${f.slug}`}
                      className="group block p-7 md:p-8 hover:bg-ink/5 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-2xl" aria-hidden="true">{f.icon}</span>
                        <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted group-hover:text-ink transition-colors">
                          →
                        </span>
                      </div>
                      <h3
                        className="font-display uppercase text-ink"
                        style={{ fontSize: 'clamp(18px, 1.8vw, 24px)', lineHeight: '1.15' }}
                      >
                        {isEs ? f.title_es : f.title_en}
                      </h3>
                      {(isEs ? f.tagline_es : f.tagline_en) && (
                        <p className="text-ink-muted text-sm leading-relaxed mt-3">
                          {isEs ? f.tagline_es : f.tagline_en}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
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
  dopRate,
}: {
  heading: string
  packages: PackageRow[]
  family: FamilyRow
  locale: string
  isEs: boolean
  quoteOnly?: boolean
  /** USD→DOP rate (per 1 USD) for ES locale price display. */
  dopRate: number
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

                  {(() => {
                    const formatted = formatServicePrice(price, locale, dopRate)
                    return (
                      <div className="mt-5 mb-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            className="font-display text-ink"
                            style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: '1.0' }}
                          >
                            {formatted.primary}
                          </span>
                          <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                            {isEs ? 'desde' : 'start'}
                            {formatted.primarySuffix ? ` · ${formatted.primarySuffix}` : ''}
                          </span>
                        </div>
                        {formatted.usdReference && (
                          <p className="mt-1 font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                            {formatted.usdReference}
                          </p>
                        )}
                      </div>
                    )
                  })()}

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
