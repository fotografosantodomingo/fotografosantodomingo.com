/**
 * SpokePageTemplate — 8-section full-page layout for all spoke pages
 *
 * SECTIONS:
 *   1. Hero — H1 + hook text + booking CTA + hero image
 *   2. What to Expect — 3 feature cards
 *   3. Gallery — 6–8 Cloudinary images
 *   4. Pricing — starting price + description
 *   5. Why Us — 3–4 icon+text blocks
 *   6. FAQ — accordions
 *   7. Related spokes — sibling location links
 *   8. Final CTA — strong close + all 3 booking buttons
 *
 * Server component. Receives fully-resolved locale data from page.tsx.
 * All copy comes from spoke-pages.ts; no Supabase or API calls here.
 */

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import BookingCTA from '@/components/spoke/BookingCTA'
import { type SpokePage, SPOKE_PAGES } from '@/data/spoke-pages'

const CLOUDINARY_BASE = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwewurxla'}/image/upload`
const BASE_URL = 'https://www.fotografosantodomingo.com'

function cloudinaryUrl(publicId: string, transform: string): string {
  if (!publicId || publicId.startsWith('[CONTENT')) {
    // Fallback: rendered placeholder so layout is visible in Sprint 1
    return `${BASE_URL}/api/og?title=Image+Coming+Soon&subtitle=Sprint+2`
  }
  return `${CLOUDINARY_BASE}/${transform}/${publicId}`
}

type Props = {
  spoke: SpokePage
  locale: string
  /** When true the hero renders as a text-only section with no background image */
  noHeroImage?: boolean
  /** When provided, replaces the default GallerySection entirely */
  customGallery?: React.ReactNode
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 — Hero
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection({ spoke, locale, noHeroImage }: Props) {
  const isEs = locale === 'es'
  const h1 = isEs ? spoke.h1Es : spoke.h1En
  const hookLocalized = isEs ? spoke.hookEs : spoke.hookEn
  const waMessage = isEs ? spoke.waMessageEs : spoke.waMessageEn
  const heroSrc = cloudinaryUrl(spoke.heroImagePublicId, 'c_fill,w_1920,h_1080,f_auto,q_auto:good')
  const heroAlt = isEs ? spoke.heroImageAltEs : spoke.heroImageAltEn

  return (
    <section
      className={`relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden text-center ${
        noHeroImage ? 'bg-white dark:bg-neutral-900' : ''
      }`}
    >
      {/* Background — omitted when noHeroImage is true */}
      {!noHeroImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={heroSrc}
            alt={heroAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 sm:py-32">
        <h1 className={`text-4xl font-extrabold leading-tight drop-shadow-lg sm:text-5xl lg:text-6xl ${
          noHeroImage ? 'text-neutral-900 dark:text-white' : 'text-white'
        }`}>
          {h1}
        </h1>
        <p className={`mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed sm:text-xl ${
          noHeroImage ? 'text-neutral-700 dark:text-neutral-200' : 'text-neutral-200'
        }`}>
          {hookLocalized}
        </p>
        <div className="mt-10">
          <BookingCTA locale={locale} waMessage={waMessage} layout="horizontal" />
        </div>
        {/* Geo trust signal */}
        <p className={`mt-6 text-sm ${
          noHeroImage ? 'text-neutral-500 dark:text-neutral-300' : 'text-neutral-300'
        }`}>
          📍 {spoke.geoCity}, {spoke.geoRegion}
        </p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 — What to Expect
// ─────────────────────────────────────────────────────────────────────────────

function ExpectSection({ spoke, locale }: Props) {
  const isEs = locale === 'es'
  const heading = isEs ? '¿Qué incluye tu sesión?' : 'What to Expect'
  const subheading = isEs
    ? 'Cada detalle, desde la llegada hasta la entrega, está diseñado para que disfrutes el proceso.'
    : 'Every detail — from arrival to delivery — is designed so you can actually enjoy the process.'

  return (
    <section className="py-16 sm:py-24" aria-labelledby="expect-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2
            id="expect-heading"
            className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl"
          >
            {heading}
          </h2>
          <p className="mt-3 text-neutral-500 dark:text-neutral-400">{subheading}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {spoke.expectCards.map((card, i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <span className="text-3xl" aria-hidden="true">
                {card.icon}
              </span>
              <h3 className="mt-3 text-base font-semibold text-neutral-900 dark:text-white">
                {isEs ? card.titleEs : card.titleEn}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {isEs ? card.bodyEs : card.bodyEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 — Gallery
// ─────────────────────────────────────────────────────────────────────────────

function GallerySection({ spoke, locale }: Props) {
  const isEs = locale === 'es'
  const heading = isEs
    ? `Fotos reales de sesiones en ${spoke.geoCity}`
    : `Real Shots from ${spoke.geoCity} Sessions`

  return (
    <section className="bg-neutral-950 py-16 sm:py-24" aria-labelledby="gallery-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="gallery-heading"
          className="mb-10 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          {heading}
        </h2>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
          {spoke.gallery.map((item, i) => {
            const alt = isEs ? item.altEs : item.altEn
            const src = cloudinaryUrl(item.publicId, 'c_fill,w_800,h_600,f_auto,q_auto:good')
            const isLarge = i === 0 || i === 5
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-xl ${isLarge ? 'col-span-2 row-span-2 sm:col-span-2' : ''}`}
                style={{ aspectRatio: '4/3' }}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  loading={i < 2 ? 'eager' : 'lazy'}
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
                />
              </div>
            )
          })}
        </div>

        {/* Link to full portfolio */}
        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/portfolio`}
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 underline-offset-4 hover:underline"
          >
            {isEs ? 'Ver portafolio completo →' : 'View full portfolio →'}
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 4 — Pricing
// ─────────────────────────────────────────────────────────────────────────────

function PricingSection({ spoke, locale }: Props) {
  const isEs = locale === 'es'
  const heading = isEs ? 'Inversión' : 'Investment'
  const subheading = isEs
    ? 'Precios transparentes. Sin cargos sorpresa.'
    : 'Transparent pricing. No surprise fees.'
  const desc = isEs ? spoke.pricingDescEs : spoke.pricingDescEn
  const waMessage = isEs ? spoke.waMessageEs : spoke.waMessageEn

  return (
    <section className="py-16 sm:py-24" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2
          id="pricing-heading"
          className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl"
        >
          {heading}
        </h2>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{subheading}</p>

        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            {isEs ? 'Precios desde' : 'Starting from'}
          </p>
          <p className="mt-2 text-5xl font-extrabold tabular-nums text-neutral-900 dark:text-white">
            {spoke.priceFromUsd !== '[CONTENT — Sprint 2]' ? spoke.priceFromUsd : '—'}
            <span className="ml-1 text-xl font-normal text-neutral-400">USD</span>
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {desc !== '[CONTENT — Sprint 2]' ? desc : ''}
          </p>
          <div className="mt-8">
            <BookingCTA locale={locale} waMessage={waMessage} layout="horizontal" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 5 — Why Us
// ─────────────────────────────────────────────────────────────────────────────

function WhyUsSection({ spoke, locale }: Props) {
  const isEs = locale === 'es'
  const heading = isEs ? '¿Por qué Babula Shots?' : 'Why Babula Shots?'

  return (
    <section className="bg-neutral-50 py-16 sm:py-24 dark:bg-neutral-950" aria-labelledby="why-us-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="why-us-heading"
          className="mb-12 text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl"
        >
          {heading}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {spoke.whyUs.map((item, i) => (
            <div key={i} className="flex flex-col items-start">
              <span className="text-3xl" aria-hidden="true">
                {item.icon}
              </span>
              <h3 className="mt-3 text-base font-semibold text-neutral-900 dark:text-white">
                {isEs ? item.titleEs : item.titleEn}
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {isEs ? item.bodyEs : item.bodyEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 6 — FAQ
// ─────────────────────────────────────────────────────────────────────────────

function FaqSection({ spoke, locale }: Props) {
  const isEs = locale === 'es'
  const heading = isEs
    ? `Preguntas frecuentes — ${spoke.geoCity}`
    : `FAQ — ${spoke.geoCity}`

  const filledFaq = spoke.faq.filter(
    (f) => f.questionEn !== '[CONTENT — Sprint 2]' && f.questionEn !== '[CONTENT]'
  )

  if (filledFaq.length === 0) return null

  return (
    <section className="py-16 sm:py-24" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2
          id="faq-heading"
          className="mb-10 text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl"
        >
          {heading}
        </h2>

        <dl className="space-y-6">
          {filledFaq.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <dt className="text-sm font-semibold text-neutral-900 dark:text-white">
                {isEs ? item.questionEs : item.questionEn}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {isEs ? item.answerEs : item.answerEn}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 5b — Client Testimonial (after Why Us)
// ─────────────────────────────────────────────────────────────────────────────

function TestimonialSection({ spoke, locale }: Props) {
  const isEs = locale === 'es'
  const t = spoke.testimonial
  if (!t) return null

  return (
    <section className="py-14 sm:py-20" aria-label={isEs ? 'Testimonio de cliente' : 'Client testimonial'}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <figure className="rounded-2xl border border-amber-200 bg-amber-50 px-8 py-10 dark:border-amber-900/40 dark:bg-amber-950/20">
          <blockquote>
            <p className="text-base font-medium leading-relaxed text-neutral-800 before:content-['\u201c'] after:content-['\u201d'] dark:text-neutral-100 sm:text-lg">
              {isEs ? t.quoteEs : t.quoteEn}
            </p>
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-base font-bold text-white"
              aria-hidden="true"
            >
              {t.clientName.charAt(0)}
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{t.clientName}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.eventLabel}</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 6b — Author Bio (between FAQ and Final CTA)
// ─────────────────────────────────────────────────────────────────────────────

const ABOUT_URL = 'https://www.fotografosantodomingo.com'

function AuthorBioSection({ locale }: { locale: string }) {
  const isEs = locale === 'es'

  return (
    <section className="bg-neutral-50 py-12 dark:bg-neutral-950" aria-label={isEs ? 'Sobre el fotógrafo' : 'About the photographer'}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar placeholder — replace with real photo once available */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-3xl dark:bg-neutral-700"
            aria-hidden="true"
          >
            📷
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
              {isEs ? 'Sobre el fotógrafo' : 'About the photographer'}
            </p>
            <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
              Michal Babula
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {isEs
                ? 'Michal Babula es fotógrafo profesional con más de 10 años de experiencia documentando bodas, retratos y eventos en la República Dominicana. Fundador de Babula Shots, ha fotografiado más de 200 bodas en Santo Domingo, Punta Cana y destinos del Caribe.'
                : 'Michal Babula is a professional photographer with over 10 years documenting weddings, portraits, and events across the Dominican Republic. Founder of Babula Shots, he has photographed over 200 weddings in Santo Domingo, Punta Cana, and Caribbean destinations.'}
            </p>
            <Link
              href={`/${locale}/about`}
              className="mt-3 inline-block text-xs font-semibold text-amber-500 underline-offset-2 hover:underline"
            >
              {isEs ? 'Ver perfil completo →' : 'Full profile →'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 7 — Related Spokes
// ─────────────────────────────────────────────────────────────────────────────

function RelatedSection({ spoke, locale }: Props) {
  const isEs = locale === 'es'
  if (!spoke.relatedSpokeIds || spoke.relatedSpokeIds.length === 0) return null

  const related = SPOKE_PAGES.filter((p) =>
    spoke.relatedSpokeIds.includes(p.id) &&
    (p.status === 'approved' || p.status === 'published')
  )
  if (related.length === 0) return null

  const heading = isEs ? 'También en República Dominicana' : 'Also Serving'

  return (
    <section className="bg-neutral-50 py-12 dark:bg-neutral-950" aria-labelledby="related-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="related-heading"
          className="mb-8 text-center text-xl font-bold text-neutral-900 dark:text-white"
        >
          {heading}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {related.map((rel) => {
            const slug = isEs ? rel.esSlug : rel.enSlug
            const title =
              rel.titleEn !== '[CONTENT — Sprint 2]'
                ? isEs ? rel.titleEs : rel.titleEn
                : `${isEs ? 'Fotógrafo en' : 'Photographer in'} ${rel.geoCity}`
            return (
              <Link
                key={rel.id}
                href={`/${locale}/${slug}`}
                className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-amber-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
                  {rel.geoCity}
                </span>
                <p className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  {title}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 8 — Final CTA
// ─────────────────────────────────────────────────────────────────────────────

function FinalCTASection({ spoke, locale }: Props) {
  const isEs = locale === 'es'
  const headline = isEs ? spoke.ctaHeadlineEs : spoke.ctaHeadlineEn
  const valueProp = isEs ? spoke.ctaValuePropEs : spoke.ctaValuePropEn
  const waMessage = isEs ? spoke.waMessageEs : spoke.waMessageEn
  const hasContent =
    headline !== '[CONTENT — Sprint 2]' && headline !== '[CONTENT]'

  return (
    <section
      className="bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-300 py-20 sm:py-28"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2
          id="final-cta-heading"
          className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
        >
          {hasContent ? headline : `Book Your ${spoke.geoCity} Session`}
        </h2>
        {hasContent && valueProp && valueProp !== '[CONTENT — Sprint 2]' && (
          <p className="mx-auto mt-4 max-w-xl text-base font-light text-amber-900/80">
            {valueProp}
          </p>
        )}
        <div className="mt-10">
          <BookingCTA
            locale={locale}
            waMessage={waMessage}
            layout="horizontal"
            bookLabel={isEs ? 'Reservar fecha' : 'Book a date'}
            waLabel="WhatsApp"
            quoteLabel={isEs ? 'Solicitar cotización' : 'Get a quote'}
            className="[&_a:first-child]:bg-white [&_a:first-child]:text-amber-600 [&_a:first-child]:hover:bg-amber-50"
          />
        </div>
        {/* Trust signal */}
        <p className="mt-8 text-sm text-amber-900/70">
          {isEs
            ? '⭐ 4.9 en Google · +91 reseñas · bodas y sesiones en República Dominicana'
            : '⭐ 4.9 on Google · 91+ reviews · weddings and sessions across the Dominican Republic'}
        </p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function SpokePageTemplate({ spoke, locale, noHeroImage, customGallery }: Props) {
  return (
    <main>
      <HeroSection spoke={spoke} locale={locale} noHeroImage={noHeroImage} />
      <ExpectSection spoke={spoke} locale={locale} />
      {customGallery ?? <GallerySection spoke={spoke} locale={locale} />}
      <PricingSection spoke={spoke} locale={locale} />
      <WhyUsSection spoke={spoke} locale={locale} />
      <TestimonialSection spoke={spoke} locale={locale} />
      <FaqSection spoke={spoke} locale={locale} />
      <AuthorBioSection locale={locale} />
      <RelatedSection spoke={spoke} locale={locale} />
      <FinalCTASection spoke={spoke} locale={locale} />
    </main>
  )
}
