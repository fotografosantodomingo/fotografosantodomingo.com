/**
 * HUB & SPOKE — Spoke Page Template
 *
 * Copy this file to create a new spoke page, e.g.:
 *   src/app/[locale]/weddings/punta-cana/page.tsx
 *
 * Replace every PLACEHOLDER_ value with real content before publishing.
 * Never publish with placeholder text intact.
 *
 * Section order (must not be changed):
 *   1. Hero (H1 + hook + CTAs)
 *   2. What to expect — location-specific copy
 *   3. Gallery  — 6–8 real Cloudinary images for this location
 *   4. Pricing  — price range + link to full pricing page
 *   5. Why Babula Shots for [Location]
 *   6. FAQ  — location-specific questions (4–5 items)
 *   7. Related spokes  — 2–3 sibling pages
 *   8. Final CTA block
 *
 * Schema required:
 *   - BreadcrumbList
 *   - Service (specific to this location)
 *   - FAQPage
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'
import { CONTACT_INFO } from '@/lib/utils/constants'

const BASE_URL = 'https://www.fotografosantodomingo.com'

// ─── EDIT: spoke identity ────────────────────────────────────────────────────
// These values drive metadata, schema, and all dynamic copy on the page.
const SPOKE = {
  // EN/ES URL slugs (used in canonical + hreflang)
  enPath: 'PLACEHOLDER_EN_PATH',   // e.g. 'weddings/punta-cana'
  esPath: 'PLACEHOLDER_ES_PATH',   // e.g. 'weddings/punta-cana'

  // Hub page it belongs to (EN service slug)
  hubSlug: 'PLACEHOLDER_HUB_SLUG', // e.g. 'wedding-photography'

  // Breadcrumb labels  (EN then ES)
  hubLabelEn: 'PLACEHOLDER Hub',   // e.g. 'Wedding Photography'
  hubLabelEs: 'PLACEHOLDER Hub',   // e.g. 'Fotografía de Bodas'

  spokeLabelEn: 'PLACEHOLDER Location', // e.g. 'Punta Cana Weddings'
  spokeLabelEs: 'PLACEHOLDER Ubicación',

  // H1 and title (target the exact long-tail keyword)
  titleEn: 'PLACEHOLDER — Wedding Photographer Punta Cana | Babula Shots',
  titleEs: 'PLACEHOLDER — Fotógrafo de Bodas Punta Cana | Babula Shots',

  // Meta description (140–160 chars, unique per page)
  descriptionEn: 'PLACEHOLDER description targeting the search intent.',
  descriptionEs: 'PLACEHOLDER descripción de 140-160 caracteres, única para esta página.',

  // Keywords (4–6 comma-separated long-tail phrases)
  keywordsEn: 'PLACEHOLDER keyword 1, PLACEHOLDER keyword 2',
  keywordsEs: 'PLACEHOLDER palabra clave 1, PLACEHOLDER palabra clave 2',

  // OG image (use /api/og for dynamic or a Cloudinary URL for a real photo)
  ogImageEn: `${BASE_URL}/api/og?title=PLACEHOLDER+Title&subtitle=PLACEHOLDER+Location`,
  ogImageEs: `${BASE_URL}/api/og?title=PLACEHOLDER+Titulo&subtitle=PLACEHOLDER+Ubicacion`,

  // Hero image (real Cloudinary image for this location/service)
  heroImageUrl: 'https://res.cloudinary.com/dwewurxla/image/upload/PLACEHOLDER',
  heroImageAltEn: 'PLACEHOLDER descriptive alt text in English',
  heroImageAltEs: 'PLACEHOLDER texto alt descriptivo en español',

  // Geo for LocalBusiness schema — use coordinates for the SPOKE location, not Santo Domingo
  geo: { latitude: 0.0, longitude: 0.0 }, // e.g. Punta Cana: { latitude: 18.5601, longitude: -68.3725 }
  geoCity: 'PLACEHOLDER City',
  geoRegion: 'PLACEHOLDER Region',         // e.g. 'La Altagracia'

  // Price range shown in Pricing section
  priceFromUsd: 'PLACEHOLDER',             // e.g. '$499'

  // WA pre-filled message (keep short, in relevant language)
  waMessageEn: 'Hello! I am interested in a wedding photoshoot in Punta Cana.',
  waMessageEs: 'Hola! Me interesa una sesión de fotos de bodas en Punta Cana.',
}

// ─── EDIT: gallery images ─────────────────────────────────────────────────────
// 6–8 real Cloudinary images specific to this location + service. No stock photos.
const GALLERY_IMAGES: { url: string; altEn: string; altEs: string }[] = [
  {
    url: 'https://res.cloudinary.com/dwewurxla/image/upload/PLACEHOLDER_1',
    altEn: 'PLACEHOLDER alt 1',
    altEs: 'PLACEHOLDER alt 1 ES',
  },
  {
    url: 'https://res.cloudinary.com/dwewurxla/image/upload/PLACEHOLDER_2',
    altEn: 'PLACEHOLDER alt 2',
    altEs: 'PLACEHOLDER alt 2 ES',
  },
  // Add at least 4–6 more
]

// ─── EDIT: FAQ items ──────────────────────────────────────────────────────────
// 4–5 questions specific to this location + service type. Not generic FAQs.
const FAQ_ITEMS: { questionEn: string; questionEs: string; answerEn: string; answerEs: string }[] = [
  {
    questionEn: 'PLACEHOLDER specific question about this location?',
    questionEs: 'PLACEHOLDER pregunta específica sobre esta ubicación?',
    answerEn: 'PLACEHOLDER answer with real location-specific information.',
    answerEs: 'PLACEHOLDER respuesta con información concreta sobre la ubicación.',
  },
  // Add 3–4 more
]

// ─── EDIT: related spoke pages (2–3 sibling links) ───────────────────────────
const RELATED_SPOKES: { enPath: string; esPath: string; labelEn: string; labelEs: string; descEn: string; descEs: string }[] = [
  {
    enPath: 'PLACEHOLDER_SIBLING_PATH',
    esPath: 'PLACEHOLDER_SIBLING_ES_PATH',
    labelEn: 'PLACEHOLDER Sibling Spoke',
    labelEs: 'PLACEHOLDER Enlace Hermano',
    descEn: 'PLACEHOLDER one-line description.',
    descEs: 'PLACEHOLDER descripción de una línea.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs ? SPOKE.titleEs : SPOKE.titleEn
  const description = isEs ? SPOKE.descriptionEs : SPOKE.descriptionEn
  const spokedPath = isEs ? SPOKE.esPath : SPOKE.enPath
  const ogImage = isEs ? SPOKE.ogImageEs : SPOKE.ogImageEn

  return {
    title,
    description,
    keywords: isEs ? SPOKE.keywordsEs : SPOKE.keywordsEn,
    alternates: {
      canonical: `${BASE_URL}/${locale}/${spokedPath}`,
      languages: {
        en: `${BASE_URL}/en/${SPOKE.enPath}`,
        es: `${BASE_URL}/es/${SPOKE.esPath}`,
        'x-default': `${BASE_URL}/en/${SPOKE.enPath}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title,
      description,
      url: `${BASE_URL}/${locale}/${spokedPath}`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: isEs ? SPOKE.heroImageAltEs : SPOKE.heroImageAltEn }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

export default function SpokePage({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const spokedPath = isEs ? SPOKE.esPath : SPOKE.enPath
  const pageUrl = `${BASE_URL}/${locale}/${spokedPath}`
  const waMsg = encodeURIComponent(isEs ? SPOKE.waMessageEs : SPOKE.waMessageEn)
  const waUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${waMsg}`

  // ─── Schema ───────────────────────────────────────────────────────────────
  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home',     url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Servicios' : 'Services', url: `${BASE_URL}/${locale}/services` },
    { name: isEs ? SPOKE.hubLabelEs : SPOKE.hubLabelEn, url: `${BASE_URL}/${locale}/services/${SPOKE.hubSlug}` },
    { name: isEs ? SPOKE.spokeLabelEs : SPOKE.spokeLabelEn, url: pageUrl },
  ])

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${pageUrl}#service`,
    name: isEs ? SPOKE.spokeLabelEs : SPOKE.spokeLabelEn,
    description: isEs ? SPOKE.descriptionEs : SPOKE.descriptionEn,
    provider: { '@id': `${BASE_URL}/#business` },
    url: pageUrl,
    areaServed: {
      '@type': 'City',
      name: SPOKE.geoCity,
      address: {
        '@type': 'PostalAddress',
        addressLocality: SPOKE.geoCity,
        addressRegion: SPOKE.geoRegion,
        addressCountry: 'DO',
      },
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
        minPrice: SPOKE.priceFromUsd.replace(/[^0-9.]/g, ''),
      },
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: isEs ? item.questionEs : item.questionEn,
      acceptedAnswer: { '@type': 'Answer', text: isEs ? item.answerEs : item.answerEn },
    })),
  }

  const heroImageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: SPOKE.heroImageUrl,
    name: isEs ? SPOKE.heroImageAltEs : SPOKE.heroImageAltEn,
    description: isEs ? SPOKE.descriptionEs : SPOKE.descriptionEn,
    width: 1200,
    height: 800,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(serviceSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(faqSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(heroImageSchema)} />

      <main className="min-h-screen bg-gray-950 text-white">

        {/* ── SECTION 1: Hero ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 md:py-28">
          {/* Background hero image */}
          <div className="pointer-events-none absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SPOKE.heroImageUrl}
              alt={isEs ? SPOKE.heroImageAltEs : SPOKE.heroImageAltEn}
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
          </div>
          <div className="relative container mx-auto px-4 text-center">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-6 flex justify-center gap-2 text-sm text-gray-400">
              <Link href={`/${locale}`} className="hover:text-white">{isEs ? 'Inicio' : 'Home'}</Link>
              <span>/</span>
              <Link href={`/${locale}/services/${SPOKE.hubSlug}`} className="hover:text-white">
                {isEs ? SPOKE.hubLabelEs : SPOKE.hubLabelEn}
              </Link>
              <span>/</span>
              <span className="text-white">{isEs ? SPOKE.spokeLabelEs : SPOKE.spokeLabelEn}</span>
            </nav>

            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
              {/* PLACEHOLDER: exact target keyword in H1 */}
              {isEs ? 'PLACEHOLDER H1 en español' : 'PLACEHOLDER H1 in English'}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300 md:text-xl">
              {/* PLACEHOLDER: 2-sentence hook — who this is for and what they get */}
              {isEs ? 'PLACEHOLDER gancho en español.' : 'PLACEHOLDER hook in English.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={`/${locale}/get-quote`}
                className="rounded-full bg-sky-500 px-7 py-3 font-bold text-white transition hover:bg-sky-400"
              >
                {isEs ? 'Reservar sesión' : 'Book this session'}
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-green-500 px-7 py-3 font-bold text-green-300 transition hover:bg-green-500/20"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: What to expect ─────────────────────────────────── */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-6 text-3xl font-extrabold">
            {isEs ? 'PLACEHOLDER: Qué esperar de tu sesión en [Ubicación]' : 'PLACEHOLDER: What to Expect at Your [Location] Session'}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* PLACEHOLDER: 3 benefit/experience cards. Mention real venues and landmarks. */}
            {[
              {
                icon: '📍',
                titleEn: 'PLACEHOLDER Venue Knowledge',
                titleEs: 'PLACEHOLDER Conocimiento del Lugar',
                bodyEn: 'PLACEHOLDER: mention real venues in this location.',
                bodyEs: 'PLACEHOLDER: menciona lugares reales en esta ubicación.',
              },
              {
                icon: '🌅',
                titleEn: 'PLACEHOLDER Light & Timing',
                titleEs: 'PLACEHOLDER Luz y Horario',
                bodyEn: 'PLACEHOLDER: best light time for this specific location.',
                bodyEs: 'PLACEHOLDER: mejor hora de luz en esta ubicación concreta.',
              },
              {
                icon: '📸',
                titleEn: 'PLACEHOLDER Style & Direction',
                titleEs: 'PLACEHOLDER Estilo y Dirección',
                bodyEn: 'PLACEHOLDER: creative direction style description.',
                bodyEs: 'PLACEHOLDER: descripción del estilo y dirección creativa.',
              },
            ].map((card) => (
              <article key={card.icon} className="rounded-2xl border border-white/10 bg-gray-900 p-6">
                <div className="mb-3 text-3xl">{card.icon}</div>
                <h3 className="mb-2 text-xl font-bold">{isEs ? card.titleEs : card.titleEn}</h3>
                <p className="text-gray-300">{isEs ? card.bodyEs : card.bodyEn}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── SECTION 3: Gallery ────────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-10">
          <h2 className="mb-6 text-3xl font-extrabold">
            {isEs ? 'PLACEHOLDER: Galería — [Servicio] en [Ubicación]' : 'PLACEHOLDER: Gallery — [Service] in [Location]'}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {GALLERY_IMAGES.map((img, i) => (
              <figure key={i} className="overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${img.url.replace('/upload/', '/upload/f_auto,q_auto,w_600/')}`}
                  alt={isEs ? img.altEs : img.altEn}
                  title={isEs ? img.altEs : img.altEn}
                  loading="lazy"
                  className="h-56 w-full object-cover transition duration-300 hover:scale-105"
                />
              </figure>
            ))}
          </div>
        </section>

        {/* ── SECTION 4: Pricing ────────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-16">
          <div className="rounded-2xl border border-sky-400/30 bg-sky-950/30 p-8">
            <h2 className="mb-3 text-3xl font-extrabold">
              {isEs ? 'PLACEHOLDER: Precios — [Servicio] en [Ubicación]' : 'PLACEHOLDER: Pricing — [Service] in [Location]'}
            </h2>
            <p className="mb-2 text-2xl font-bold text-sky-300">
              {isEs ? `Desde ${SPOKE.priceFromUsd} USD` : `From ${SPOKE.priceFromUsd} USD`}
            </p>
            <p className="mb-6 text-gray-300">
              {/* PLACEHOLDER: 2–3 sentences about what's included. Be specific to this location + service. */}
              {isEs
                ? 'PLACEHOLDER: descripción de lo incluido, específica para esta sesión y ubicación.'
                : 'PLACEHOLDER: description of what is included, specific to this session and location.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/get-quote`} className="rounded-full bg-sky-500 px-6 py-2 font-bold text-white hover:bg-sky-400">
                {isEs ? 'Ver paquetes completos' : 'See full packages'}
              </Link>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-green-500 px-6 py-2 font-bold text-green-300 hover:bg-green-500/20">
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: Why Babula Shots for [Location] ───────────────── */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-6 text-3xl font-extrabold">
            {isEs
              ? `PLACEHOLDER: Por qué Babula Shots para [Servicio] en [Ubicación]`
              : `PLACEHOLDER: Why Babula Shots for [Service] in [Location]`}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* PLACEHOLDER: 3–4 specific, differentiating reasons. NOT generic. */}
            {[
              { icon: '🗺️', en: 'PLACEHOLDER reason 1 — specific to location', es: 'PLACEHOLDER razón 1 — específica para la ubicación' },
              { icon: '🌤️', en: 'PLACEHOLDER reason 2 — lighting / timing knowledge', es: 'PLACEHOLDER razón 2 — conocimiento de luz y horarios' },
              { icon: '🤝', en: 'PLACEHOLDER reason 3 — venue relationships if applicable', es: 'PLACEHOLDER razón 3 — relaciones con venues si aplica' },
              { icon: '🏆', en: 'PLACEHOLDER reason 4 — results / track record', es: 'PLACEHOLDER razón 4 — resultados o trayectoria' },
            ].map((item) => (
              <div key={item.icon} className="flex gap-4 rounded-xl bg-gray-900 p-5">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-gray-200">{isEs ? item.es : item.en}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 6: FAQ ────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-6 text-3xl font-extrabold">
            {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="rounded-xl border border-white/10 bg-gray-900 p-5">
                <summary className="cursor-pointer text-lg font-semibold">
                  {isEs ? item.questionEs : item.questionEn}
                </summary>
                <p className="mt-3 text-gray-300 leading-relaxed">
                  {isEs ? item.answerEs : item.answerEn}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── SECTION 7: Related spokes ─────────────────────────────────── */}
        {RELATED_SPOKES.length > 0 && (
          <section className="container mx-auto px-4 py-10">
            <h2 className="mb-4 text-2xl font-extrabold">
              {isEs ? 'También fotografiamos en:' : 'Also shooting in:'}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {RELATED_SPOKES.map((spoke) => (
                <Link
                  key={spoke.enPath}
                  href={`/${locale}/${isEs ? spoke.esPath : spoke.enPath}`}
                  className="rounded-xl border border-white/10 bg-gray-900 p-5 hover:border-sky-400 transition-colors"
                >
                  <h3 className="mb-1 font-bold">{isEs ? spoke.labelEs : spoke.labelEn}</h3>
                  <p className="text-sm text-gray-400">{isEs ? spoke.descEs : spoke.descEn}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 8: Final CTA ──────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-20">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-100 via-cyan-50 to-slate-100 p-10 text-center dark:border-white/15 dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900">
            <h2 className="mb-3 text-3xl font-extrabold text-slate-900 dark:text-white">
              {/* PLACEHOLDER: "Ready to book your [session] in [location]?" */}
              {isEs
                ? 'PLACEHOLDER: ¿Listo para reservar tu [sesión] en [ubicación]?'
                : 'PLACEHOLDER: Ready to book your [session] in [location]?'}
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {/* PLACEHOLDER: one sentence urgency/value line */}
              {isEs ? 'PLACEHOLDER: línea de urgencia o valor.' : 'PLACEHOLDER: urgency or value line.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/${locale}/get-quote`} className="rounded-full bg-sky-500 px-7 py-3 font-bold text-white hover:bg-sky-400">
                {isEs ? 'Reservar ahora' : 'Book online'}
              </Link>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-green-500 px-7 py-3 font-bold text-green-700 dark:text-green-200 hover:bg-green-500/10">
                WhatsApp
              </a>
              <Link href={`/${locale}/get-quote`} className="rounded-full border border-sky-400/50 px-7 py-3 font-bold text-sky-700 dark:text-sky-200 hover:bg-sky-400/10">
                {isEs ? 'Obtener cotización' : 'Get a quote'}
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
