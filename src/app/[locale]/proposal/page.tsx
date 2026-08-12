import type { Metadata } from 'next'
import Link from 'next/link'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'
import BookingCTA from '@/components/spoke/BookingCTA'
import { getUsdToDopRate } from '@/lib/currency/exchange-rate'
import { formatServicePrice } from '@/lib/currency/format'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Fotografía de Propuesta de Matrimonio en República Dominicana | Babula Shots'
    : 'Proposal Photography in Dominican Republic | Babula Shots'
  const description = isEs
    ? 'Fotografía de propuesta de matrimonio en República Dominicana — modo ninja oculto con teleobjetivo 400–600 mm, Punta Cana, Santo Domingo, Samaná y toda la isla. Precio desde $270 USD + ITBIS.'
    : 'Proposal photography in Dominican Republic — hidden ninja mode with 400–600 mm telephoto lens, Punta Cana, Santo Domingo, Samaná and the entire island. Starting from $270 USD + tax.'
  return {
    title,
    description,
    keywords: isEs
      ? 'fotografo propuesta matrimonio republica dominicana, fotografo propuesta oculta punta cana, fotografo sorpresa pedida de mano RD, fotografo propuesta modo ninja, fotografia propuesta playa dominicana'
      : 'proposal photographer dominican republic, hidden proposal photography punta cana, surprise proposal photographer DR, ninja mode proposal photography, beach proposal photographer dominican republic',
    alternates: {
      canonical: `${BASE_URL}/${locale}/proposal`,
      languages: {
        es: `${BASE_URL}/es/proposal`,
        en: `${BASE_URL}/en/proposal`,
        'x-default': `${BASE_URL}/es/proposal`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Fotografía de Propuesta RD | Babula Shots' : 'Proposal Photography DR | Babula Shots',
      description,
      url: `${BASE_URL}/${locale}/proposal`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=${isEs ? 'Fotograf%C3%ADa+de+Propuesta' : 'Proposal+Photography'}&subtitle=${isEs ? 'Modo+Ninja+%E2%80%94+Rep%C3%BAblica+Dominicana' : 'Ninja+Mode+%E2%80%94+Dominican+Republic'}`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Fotografía de Propuesta República Dominicana — Babula Shots' : 'Proposal Photography Dominican Republic — Babula Shots',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Fotografía de Propuesta RD | Babula Shots' : 'Proposal Photography DR | Babula Shots',
      description,
      images: [`${BASE_URL}/api/og?title=${isEs ? 'Propuesta' : 'Proposal+Photography'}&subtitle=Babula+Shots`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

const PACKAGES = [
  {
    icon: '🥷',
    slugEn: 'proposal/proposal-hidden-mode-ninja-photographer',
    slugEs: 'propuesta/fotografo-propuesta-oculta-modo-ninja',
    labelEn: 'Hidden Mode — Ninja Photographer',
    labelEs: 'Modo Oculto — Fotógrafo Ninja',
    descEn: '400–600 mm telephoto from 50–80 m away. She never sees us. Island-wide.',
    descEs: 'Teleobjetivo 400–600 mm desde 50–80 m. Ella nunca nos ve. Toda la isla.',
    highlight: true as const,
    price: '$270 USD + ITBIS',
  },
  {
    icon: '🏖️',
    slugEn: 'weddings/proposal-photographer-punta-cana',
    slugEs: 'bodas/fotografo-propuesta-matrimonio-punta-cana',
    labelEn: 'Proposal Photographer Punta Cana',
    labelEs: 'Fotógrafo de Propuesta Punta Cana',
    descEn: 'Ninja mode at Bávaro, Juanillo, Macao, Cap Cana, and every resort beach.',
    descEs: 'Modo ninja en Bávaro, Juanillo, Macao, Cap Cana y todas las playas de resorts.',
    highlight: false as const,
    price: '$270 USD + ITBIS',
  },
  {
    icon: '🌴',
    slugEn: 'weddings/proposal-photographer-dominican-republic',
    slugEs: 'bodas/fotografo-propuesta-matrimonio-republica-dominicana',
    labelEn: 'Proposal Photographer — All of DR',
    labelEs: 'Fotógrafo de Propuesta — Toda la RD',
    descEn: 'Samaná, Santo Domingo, Puerto Plata, Casa de Campo, Las Terrenas and more.',
    descEs: 'Samaná, Santo Domingo, Puerto Plata, Casa de Campo, Las Terrenas y más.',
    highlight: false as const,
    price: '$270 USD + ITBIS',
  },
  {
    icon: '🏛️',
    slugEn: 'weddings/proposal-photographer-zona-colonial-santo-domingo',
    slugEs: 'bodas/fotografo-propuesta-matrimonio-zona-colonial-santo-domingo',
    labelEn: 'Surprise Proposal — Zona Colonial',
    labelEs: 'Propuesta Sorpresa — Zona Colonial',
    descEn: 'We help plan the whole surprise among the UNESCO-listed colonial architecture.',
    descEs: 'Te ayudamos a planear toda la sorpresa entre la arquitectura colonial Patrimonio de la Humanidad.',
    highlight: false as const,
    price: '$270 USD + ITBIS',
  },
]

const LOCATIONS_ES = [
  '🏖️ Playa Bávaro — Punta Cana',
  '🏖️ Playa Juanillo — Cap Cana',
  '🏖️ Playa Macao — Este Punta Cana',
  '🏖️ Playa Rincón — Samaná',
  '🏖️ Playa Dorada — Puerto Plata',
  '🏖️ Playa Dominicus — Bayahíbe',
  '🏖️ Playa Ancón — Las Terrenas',
  '🌆 Malecón — Santo Domingo',
  '🌆 Zona Colonial — Santo Domingo',
  '🌆 Parque Mirador — Santo Domingo',
  '🌴 Casa de Campo — La Romana',
  '🌴 Las Terrenas — Samaná',
  '✨ Restaurantes, terrazas, villas y más',
]

const LOCATIONS_EN = [
  '🏖️ Playa Bávaro — Punta Cana',
  '🏖️ Playa Juanillo — Cap Cana',
  '🏖️ Playa Macao — East Punta Cana',
  '🏖️ Playa Rincón — Samaná',
  '🏖️ Playa Dorada — Puerto Plata',
  '🏖️ Playa Dominicus — Bayahíbe',
  '🏖️ Playa Ancón — Las Terrenas',
  '🌆 Malecón — Santo Domingo',
  '🌆 Zona Colonial — Santo Domingo',
  '🌆 Mirador Park — Santo Domingo',
  '🌴 Casa de Campo — La Romana',
  '🌴 Las Terrenas — Samaná',
  '✨ Restaurants, terraces, villas and more',
]

export default async function ProposalHubPage({ params: { locale } }: Props) {
  const dopRate = await getUsdToDopRate()
  const proposalPrice = formatServicePrice(250, locale, dopRate.usdToDop)
  const isEs = locale === 'es'

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Fotografía de Propuesta' : 'Proposal Photography', url: `${BASE_URL}/${locale}/proposal` },
  ])

  const waMsg = isEs
    ? 'Hola! Quiero planear una fotografía de propuesta de matrimonio en República Dominicana. ¿Podemos coordinar?'
    : 'Hello! I want to plan a proposal photography session in Dominican Republic. Can we coordinate?'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />

      <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="bg-neutral-950 py-20 sm:py-32 px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-4">
            {isEs ? 'Modo Ninja — Teleobjetivo 400–600 mm' : 'Ninja Mode — 400–600 mm Telephoto Lens'}
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl max-w-4xl mx-auto">
            {isEs
              ? 'Fotografía de Propuesta de Matrimonio en República Dominicana'
              : 'Proposal Photography in Dominican Republic'}
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-neutral-300 leading-relaxed">
            {isEs
              ? 'Operamos en modo ninja completo: teleobjetivo de 400 a 600 mm, posicionamiento oculto, coordinación secreta solo por WhatsApp. Ella nunca sabe que estamos ahí — hasta ver las fotos la mañana siguiente.'
              : 'We operate in full ninja mode: 400 to 600 mm telephoto lens, hidden positioning, secret coordination via WhatsApp only. She never knows we are there — until she sees the photos the morning after.'}
          </p>
          <div className="mt-10">
            <BookingCTA locale={locale} waMessage={waMsg} layout="horizontal" />
          </div>
          <p className="mt-6 text-sm text-neutral-500">
            {isEs
              ? `📍 Toda República Dominicana · Desde ${proposalPrice.primary} + 18% ITBIS${proposalPrice.usdReference ? ` · ${proposalPrice.usdReference}` : ''}`
              : `📍 All of Dominican Republic · From ${proposalPrice.primary} ${proposalPrice.primarySuffix ?? ''} + 18% tax`}
          </p>
        </section>

        {/* ── Packages ──────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 bg-white dark:bg-neutral-900" aria-labelledby="packages-heading">
          <div className="mx-auto max-w-5xl">
            <h2 id="packages-heading" className="text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl mb-12">
              {isEs ? 'Todos Nuestros Servicios de Propuesta' : 'All Our Proposal Services'}
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {PACKAGES.map((pkg) => {
                const slug = isEs ? pkg.slugEs : pkg.slugEn
                const href = `/${locale}/${slug}`
                return (
                  <Link
                    key={pkg.slugEn}
                    href={href}
                    className={`group flex flex-col rounded-2xl border p-6 transition hover:shadow-lg ${
                      pkg.highlight
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-amber-300'
                    }`}
                  >
                    {pkg.highlight && (
                      <span className="mb-3 inline-block self-start rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold text-neutral-900 uppercase tracking-wide">
                        {isEs ? 'Más Popular' : 'Most Popular'}
                      </span>
                    )}
                    <span className="text-3xl mb-3">{pkg.icon}</span>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white group-hover:text-amber-500 transition-colors">
                      {isEs ? pkg.labelEs : pkg.labelEn}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {isEs ? pkg.descEs : pkg.descEn}
                    </p>
                    <p className="mt-4 text-sm font-bold text-amber-500">
                      {proposalPrice.primary}
                      {proposalPrice.primarySuffix && ` ${proposalPrice.primarySuffix}`}
                      {' + ITBIS'}
                      {proposalPrice.usdReference && (
                        <span className="block text-xs font-normal text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {proposalPrice.usdReference}
                        </span>
                      )}
                    </p>
                    <span className="mt-3 text-xs text-amber-500 group-hover:underline">
                      {isEs ? 'Ver más →' : 'Learn more →'}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 bg-neutral-50 dark:bg-neutral-950" aria-labelledby="how-heading">
          <div className="mx-auto max-w-4xl">
            <h2 id="how-heading" className="text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl mb-12">
              {isEs ? '¿Cómo funciona el modo ninja?' : 'How does ninja mode work?'}
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: '01',
                  en: 'You contact us via WhatsApp only. We coordinate location, date, and your signal word — completely private.',
                  es: 'Nos contactas solo por WhatsApp. Coordinamos locación, fecha y tu palabra de señal — completamente privado.',
                },
                {
                  step: '02',
                  en: 'We arrive 45 minutes early. Scout the terrain, find natural cover, set up the 400–600 mm telephoto.',
                  es: 'Llegamos 45 minutos antes. Reconocemos el terreno, encontramos cobertura natural, configuramos el teleobjetivo 400–600 mm.',
                },
                {
                  step: '03',
                  en: 'You send a WhatsApp signal when 10 minutes away. We confirm position. Radio silence until the ring is on.',
                  es: 'Envías señal por WhatsApp cuando estés a 10 minutos. Confirmamos posición. Silencio total hasta que el anillo esté puesto.',
                },
                {
                  step: '04',
                  en: 'Preview gallery delivered overnight. Full edited gallery in 48 h. Printed album at your hotel in 72 h.',
                  es: 'Galería de vista previa overnight. Galería editada completa en 48 h. Álbum impreso en tu hotel en 72 h.',
                },
              ].map(({ step, en, es }) => (
                <div key={step} className="flex flex-col">
                  <span className="text-4xl font-extrabold text-amber-300 dark:text-amber-400/50 leading-none mb-3">{step}</span>
                  <p className="text-sm text-neutral-700 dark:text-neutral-400 leading-relaxed">
                    {isEs ? es : en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Locations ─────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 bg-white dark:bg-neutral-900" aria-labelledby="locations-heading">
          <div className="mx-auto max-w-4xl">
            <h2 id="locations-heading" className="text-center text-2xl font-bold tracking-tight sm:text-3xl mb-4">
              {isEs ? '¿Dónde operamos?' : 'Where do we work?'}
            </h2>
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
              {isEs
                ? 'No es solo la playa — podemos trabajar en cualquier lugar donde vayas a proponer: resort, restaurante, terraza, villa, parque, azotea o barco.'
                : "It's not only the beach — we work anywhere you plan to propose: resort, restaurant, terrace, villa, park, rooftop, or boat."}
            </p>
            <div className="grid grid-cols-1 gap-y-2 gap-x-8 sm:grid-cols-2 text-sm text-neutral-700 dark:text-neutral-300">
              {(isEs ? LOCATIONS_ES : LOCATIONS_EN).map((loc) => (
                <span key={loc} className="py-0.5">{loc}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing table ─────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 bg-neutral-50 dark:bg-neutral-950" aria-labelledby="pricing-heading">
          <div className="mx-auto max-w-4xl">
            <h2 id="pricing-heading" className="text-center text-2xl font-bold tracking-tight sm:text-3xl mb-2">
              {isEs ? 'Precios desde' : 'Starting from'}
            </h2>
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mb-8">
              {isEs ? 'Precios transparentes. Sin cargos sorpresa.' : 'Transparent pricing. No surprise fees.'}
            </p>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-5 py-3">{isEs ? 'Paquete' : 'Package'}</th>
                    <th className="px-5 py-3">{isEs ? 'Precio' : 'Price'}</th>
                    <th className="px-5 py-3">{isEs ? 'Incluye' : 'Includes'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
                  <tr>
                    <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                      {isEs ? 'Estándar' : 'Standard'}
                    </td>
                    <td className="px-5 py-4 font-bold text-amber-500 whitespace-nowrap">
                      {proposalPrice.primary}
                      {proposalPrice.primarySuffix && ` ${proposalPrice.primarySuffix}`}
                      <span className="block text-xs font-normal text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {proposalPrice.usdReference
                          ? `${proposalPrice.usdReference} · + 18% ITBIS`
                          : '+ 18% ITBIS'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">
                      {isEs
                        ? 'Cobertura completa en modo ninja, teleobjetivo 400–600 mm, galería privada en 24 h, edición incluida'
                        : 'Full ninja mode coverage, 400–600 mm telephoto, private gallery in 24 h, editing included'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                      {isEs ? 'Personalizado' : 'Custom'}
                    </td>
                    <td className="px-5 py-4 font-bold text-amber-500 whitespace-nowrap">
                      {isEs ? 'Cotización' : 'Quote'}
                      <span className="block text-xs font-normal text-neutral-500 dark:text-neutral-400 mt-0.5">+ 18% ITBIS</span>
                    </td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">
                      {isEs
                        ? 'Propuesta en múltiples locaciones, segundo fotógrafo, coordinación especial, acceso a lugar privado, álbum impreso de lujo — todo adaptado a tu idea'
                        : 'Multi-location proposal, second photographer, special coordination, private venue access, luxury printed album — everything tailored to your idea'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 bg-neutral-950 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl max-w-2xl mx-auto">
            {isEs
              ? '¿Listo para planear la propuesta perfecta?'
              : 'Ready to plan the perfect proposal?'}
          </h2>
          <p className="mt-4 text-neutral-400 max-w-xl mx-auto">
            {isEs
              ? 'Contáctanos solo por WhatsApp. Coordinamos cada detalle en secreto — ella nunca se entera hasta ver las fotos.'
              : 'Contact us via WhatsApp only. We coordinate every detail in secret — she never finds out until the photos arrive.'}
          </p>
          <div className="mt-8">
            <BookingCTA locale={locale} waMessage={waMsg} layout="horizontal" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href={`/${locale}/${isEs ? 'propuesta/fotografo-propuesta-oculta-modo-ninja' : 'proposal/proposal-hidden-mode-ninja-photographer'}`}
              className="text-amber-400 hover:underline"
            >
              {isEs ? '🥷 Modo Oculto Ninja →' : '🥷 Hidden Ninja Mode →'}
            </Link>
            <Link
              href={`/${locale}/${isEs ? 'bodas/fotografo-propuesta-matrimonio-punta-cana' : 'weddings/proposal-photographer-punta-cana'}`}
              className="text-amber-400 hover:underline"
            >
              {isEs ? '🏖️ Propuesta Punta Cana →' : '🏖️ Punta Cana Proposal →'}
            </Link>
            <Link
              href={`/${locale}/${isEs ? 'bodas/fotografo-propuesta-matrimonio-republica-dominicana' : 'weddings/proposal-photographer-dominican-republic'}`}
              className="text-amber-400 hover:underline"
            >
              {isEs ? '🌴 Propuesta en toda la RD →' : '🌴 Proposal across DR →'}
            </Link>
            <Link
              href={`/${locale}/${isEs ? 'bodas/fotografo-propuesta-matrimonio-zona-colonial-santo-domingo' : 'weddings/proposal-photographer-zona-colonial-santo-domingo'}`}
              className="text-amber-400 hover:underline"
            >
              {isEs ? '🏛️ Propuesta Zona Colonial →' : '🏛️ Zona Colonial Proposal →'}
            </Link>
          </div>
        </section>

      </main>
    </>
  )
}
