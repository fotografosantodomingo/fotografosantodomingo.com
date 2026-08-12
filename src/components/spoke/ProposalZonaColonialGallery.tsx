/**
 * ProposalZonaColonialGallery — full-bleed gallery for proposal/zona-colonial-santo-domingo
 *
 * Tells the story of an organized (not hidden/telephoto) surprise proposal:
 *   1. On one knee — the moment, wide shot with the plaza as backdrop
 *   2. On one knee — side profile against the fortress wall
 *   3. The ring box — close up
 *   4. She sees the ring — laughing, celebrating
 *   5. Embracing on a colonial balcony
 *   6. Dancing under a stone archway
 *   7. Walking hand in hand through the streets
 *   8. Walking up the stone steps — closing shot
 *
 * LAYOUT RULES (same as ZonaColonialGallery / ProposalGallery — do NOT change):
 *   - Zero gap between all rows and images
 *   - Natural aspect ratio — no cropping, no fixed height, no object-fit cover
 *   - Full bleed: no container/max-width padding
 *   - Standard <img> (not next/image fill) to preserve natural ratio
 *
 * DESKTOP:
 *   Row 1 — single full-width (the proposal moment — hero of the story)
 *   Row 2 — two images 50/50 (proposal, two more angles)
 *   Row 3 — two images 50/50 (the reveal + the balcony)
 *   Row 4 — two images 50/50 (dance + walking street)
 *   Row 5 — single full-width (walking up the steps — closing shot)
 *
 * MOBILE: single column stack, all 8 images, same narrative order
 */

const BASE = 'https://res.cloudinary.com/dwewurxla/image/upload/f_auto,q_auto'

const IMAGES = {
  kneelWide: {
    id: 'v1786566174/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_4_cdwhj4',
    altEn: 'Marriage proposal in progress at a historic plaza, Zona Colonial Santo Domingo — Babula Shots',
    altEs: 'Propuesta de matrimonio en una plaza histórica, Zona Colonial Santo Domingo — Babula Shots',
  },
  kneelProfile: {
    id: 'v1786566174/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_3_zo2nyj',
    altEn: 'Man on one knee proposing beside a colonial fortress wall, Zona Colonial — Babula Shots',
    altEs: 'Hombre de rodillas proponiendo junto a una muralla colonial, Zona Colonial — Babula Shots',
  },
  ringBox: {
    id: 'v1786566174/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_5_jxymhz',
    altEn: 'Close-up of the ring box moment during a Zona Colonial marriage proposal — Babula Shots',
    altEs: 'Primer plano del anillo durante una propuesta de matrimonio en la Zona Colonial — Babula Shots',
  },
  reveal: {
    id: 'v1786566225/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_7_kzqtie',
    altEn: 'Bride-to-be laughing and showing her new ring in the Zona Colonial — Babula Shots',
    altEs: 'Futura novia riendo y mostrando su nuevo anillo en la Zona Colonial — Babula Shots',
  },
  balcony: {
    id: 'v1786566255/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_11_flashr',
    altEn: 'Couple embracing on a colonial balcony overlooking the Zona Colonial — Babula Shots',
    altEs: 'Pareja abrazada en un balcón colonial con vista a la Zona Colonial — Babula Shots',
  },
  dance: {
    id: 'v1786566255/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_9_j1nkyh',
    altEn: 'Couple dancing under a stone archway in the Zona Colonial — Babula Shots',
    altEs: 'Pareja bailando bajo un arco de piedra en la Zona Colonial — Babula Shots',
  },
  walkingStreet: {
    id: 'v1786566173/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_2_sifb58',
    altEn: 'Couple walking hand in hand through the streets of the Zona Colonial — Babula Shots',
    altEs: 'Pareja caminando de la mano por las calles de la Zona Colonial — Babula Shots',
  },
  steps: {
    id: 'v1786566254/Fotografo_Propuesta_de_Matrimonio_Republica_Dominicana_10_itjvis',
    altEn: 'Couple walking up historic stone steps in the Zona Colonial — Babula Shots',
    altEs: 'Pareja subiendo escalones históricos de piedra en la Zona Colonial — Babula Shots',
  },
}

type Img = { id: string; altEn: string; altEs: string }

type Props = {
  locale: string
}

export default function ProposalZonaColonialGallery({ locale }: Props) {
  const isEs = locale === 'es'
  const alt = (img: Img) => (isEs ? img.altEs : img.altEn)
  const src = (img: Img) => `${BASE}/${img.id}.webp`

  const mobileOrder: Img[] = [
    IMAGES.kneelWide,
    IMAGES.kneelProfile,
    IMAGES.ringBox,
    IMAGES.reveal,
    IMAGES.balcony,
    IMAGES.dance,
    IMAGES.walkingStreet,
    IMAGES.steps,
  ]

  return (
    <section aria-labelledby="proposal-zc-gallery-heading" className="w-full">
      {/* ── How it works — organized surprise, not hidden mode — theme-aware ── */}
      <div className="bg-neutral-100 dark:bg-neutral-950 py-12 sm:py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h2
            id="proposal-zc-gallery-heading"
            className="text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl"
          >
            {isEs ? 'Una Sorpresa Organizada, No Escondida' : 'An Organized Surprise, Not a Hidden One'}
          </h2>
          <p className="mt-4 text-center text-base leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {isEs
              ? 'No nos escondemos con teleobjetivo a 80 metros — te acompañamos de cerca, como si fuéramos tu fotógrafo de pareja para el día. Planeamos el recorrido, el arco o la plaza exacta, y el momento en que caes de rodillas, para que la única sorpresa sea la de ella.'
              : "We don't hide with a telephoto lens 80 meters away — we walk with you, up close, posing as your regular couple's photographer for the day. We plan the route, the exact archway or plaza, and the moment you kneel, so the only surprise is hers."}
          </p>

          {/* Where we work */}
          <div className="mt-10 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 sm:p-8">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-3">
              {isEs ? '¿Dónde en la Zona Colonial?' : 'Where in the Zona Colonial?'}
            </h3>
            <div className="grid gap-x-8 gap-y-1.5 grid-cols-1 sm:grid-cols-2 text-sm text-neutral-700 dark:text-neutral-300">
              {(isEs
                ? [
                    '🏛️ Alcázar de Colón — patio y plaza',
                    '🏯 Fortaleza Ozama — arcos y murallas',
                    '⛪ Catedral Primada de América',
                    '🌆 Calle Las Damas — balcones y fachadas',
                    '🐴 Plaza España',
                    '🌊 Paseo Presidente Billini — río Ozama',
                    '🪜 Escalinatas de piedra junto al malecón',
                    '✨ Restaurantes, terrazas y azoteas privadas',
                  ]
                : [
                    '🏛️ Alcázar de Colón — courtyard and plaza',
                    '🏯 Fortaleza Ozama — archways and ramparts',
                    '⛪ Cathedral of Santa María la Menor',
                    '🌆 Calle Las Damas — balconies and facades',
                    '🐴 Plaza España',
                    '🌊 Paseo Presidente Billini — Ozama riverfront',
                    '🪜 Stone stairways near the seawall',
                    '✨ Private restaurants, terraces and rooftops',
                  ]
              ).map((loc) => (
                <span key={loc} className="py-0.5">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-bleed gallery — desktop rows: full / 2-col / 2-col / 2-col / full */}
      <div className="flex flex-col" style={{ gap: 0, lineHeight: 0 }}>
        {/* Desktop Row 1 — full width (hidden on mobile) */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img
            src={src(IMAGES.kneelWide)}
            alt={alt(IMAGES.kneelWide)}
            className="w-full h-auto block"
            style={{ objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Desktop Row 2 — 50/50 (hidden on mobile) */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img
            src={src(IMAGES.kneelProfile)}
            alt={alt(IMAGES.kneelProfile)}
            className="h-auto block"
            style={{ width: '50%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          <img
            src={src(IMAGES.ringBox)}
            alt={alt(IMAGES.ringBox)}
            className="h-auto block"
            style={{ width: '50%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Desktop Row 3 — 50/50 (hidden on mobile) */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img
            src={src(IMAGES.reveal)}
            alt={alt(IMAGES.reveal)}
            className="h-auto block"
            style={{ width: '50%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          <img
            src={src(IMAGES.balcony)}
            alt={alt(IMAGES.balcony)}
            className="h-auto block"
            style={{ width: '50%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Desktop Row 4 — 50/50 (hidden on mobile) */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img
            src={src(IMAGES.dance)}
            alt={alt(IMAGES.dance)}
            className="h-auto block"
            style={{ width: '50%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          <img
            src={src(IMAGES.walkingStreet)}
            alt={alt(IMAGES.walkingStreet)}
            className="h-auto block"
            style={{ width: '50%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Desktop Row 5 — full width closing shot (hidden on mobile) */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img
            src={src(IMAGES.steps)}
            alt={alt(IMAGES.steps)}
            className="w-full h-auto block"
            style={{ objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Mobile stack — all 8 images full width, no gap (hidden on desktop) */}
        <div className="flex flex-col md:hidden w-full" style={{ gap: 0 }}>
          {mobileOrder.map((img) => (
            <img
              key={img.id}
              src={src(img)}
              alt={alt(img)}
              className="w-full h-auto block"
              style={{ objectFit: 'unset' }}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </div>

      {/* Portfolio link — contained */}
      <div className="bg-white dark:bg-neutral-950 pb-10 sm:pb-16">
        <div className="text-center pt-8">
          <a
            href={`/${locale}/portfolio`}
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-500 dark:text-amber-400 underline-offset-4 hover:underline"
          >
            {isEs ? 'Ver portafolio completo →' : 'View full portfolio →'}
          </a>
        </div>
      </div>
    </section>
  )
}
