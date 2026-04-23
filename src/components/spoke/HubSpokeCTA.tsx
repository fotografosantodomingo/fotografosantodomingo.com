/**
 * HubSpokeCTA — "Also serving..." grid shown on service hub pages
 *
 * Renders a 2–4 column grid of spoke location cards.
 * Only shows spokes that are `approved` or `published` for the given hub.
 * Used inside src/app/[locale]/services/[service]/page.tsx.
 *
 * Server component — no 'use client' directive needed.
 */

import Link from 'next/link'
import { getSpokesByHub, getSpokeDisplayLabel, type SpokePage } from '@/data/spoke-pages'

type HubSpokeCTAProps = {
  hubSlug: string
  locale: string
}

function SpokeCard({ spoke, locale }: { spoke: SpokePage; locale: string }) {
  const isEs = locale === 'es'
  const slug = isEs ? spoke.esSlug : spoke.enSlug
  const href = `/${locale}/${slug}`
  const label = getSpokeDisplayLabel(spoke, locale)
  const city = spoke.geoCity

  // Pick a brief location-specific tagline when heading content is filled
  const hasTitle =
    spoke.titleEn !== '[CONTENT — Sprint 2]' && spoke.titleEn !== '[CONTENT]'
  const titleDisplay = hasTitle
    ? isEs
      ? spoke.titleEs
      : spoke.titleEn
    : `${isEs ? 'Fotógrafo en' : 'Photographer in'} ${city}`

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-amber-500"
    >
      <span className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-amber-500">
        {city}
      </span>
      <span className="text-sm font-medium leading-snug text-neutral-800 group-hover:text-amber-600 dark:text-neutral-100 dark:group-hover:text-amber-400">
        {titleDisplay}
      </span>
      <span
        className="mt-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-amber-500 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      >
        {isEs ? 'Ver más' : 'Learn more'} →
      </span>
    </Link>
  )
}

export default function HubSpokeCTA({ hubSlug, locale }: HubSpokeCTAProps) {
  const isEs = locale === 'es'
  const spokes = getSpokesByHub(hubSlug)

  if (spokes.length === 0) return null

  return (
    <section className="bg-neutral-50 py-16 dark:bg-neutral-950" aria-labelledby="hub-spoke-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2
            id="hub-spoke-heading"
            className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl"
          >
            {isEs ? 'Zonas de cobertura' : 'Coverage Areas'}
          </h2>
          <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
            {isEs
              ? 'Viajamos a todo el país. Elige tu destino para ver disponibilidad, precios y lo que incluye cada sesión.'
              : 'We travel island-wide. Choose your destination for availability, pricing, and what each session includes.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {spokes.map((spoke) => (
            <SpokeCard key={spoke.id} spoke={spoke} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
