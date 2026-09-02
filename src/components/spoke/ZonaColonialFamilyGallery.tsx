/**
 * ZonaColonialFamilyGallery — full-bleed gallery for family/zona-colonial-santo-domingo
 *
 * Real family session shot in the Zona Colonial: stone archways, the
 * Catedral Primada facade, granite steps at dusk with string lights.
 *
 * LAYOUT RULES — explicit client request:
 *   - Desktop: the 2 vertical shots sit together in one row (50/50); the
 *     8 horizontal shots each render full-width, one per row.
 *   - Mobile: every image (verticals + horizontals) stacks full-width,
 *     single column.
 *   - No crop, no aspect-ratio change anywhere — natural ratio only,
 *     no Cloudinary width transform (full resolution, matches every
 *     other full-bleed gallery on this site).
 *   - Zero gap between images, no container/max-width padding.
 */

const BASE = 'https://res.cloudinary.com/dwewurxla/image/upload/f_auto,q_auto'

type Img = { id: string; altEn: string; altEs: string }

export const IMAGES = {
  archwayFamily: {
    id: 'v1788218696/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_1_a69rq4',
    altEn: 'Family portrait under a stone archway with an iron gate in the Zona Colonial, Santo Domingo — Babula Shots',
    altEs: 'Retrato familiar bajo un arco de piedra con reja de hierro en la Zona Colonial, Santo Domingo — Babula Shots',
  },
  corridorFamily: {
    id: 'v1788218695/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_2_vfgtsd',
    altEn: 'Family walking through a colonial colonnade, mother holding a newborn, in the Zona Colonial, Santo Domingo — Babula Shots',
    altEs: 'Familia caminando por un corredor colonial de columnas, madre con su bebé recién nacido en brazos, Zona Colonial, Santo Domingo — Babula Shots',
  },
  siblingsOnLedge: {
    id: 'v1788218695/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_3_fknonb',
    altEn: 'Two siblings sitting on a stone ledge against a colonial brick wall, Zona Colonial, Santo Domingo — Babula Shots',
    altEs: 'Dos hermanos sentados en un poyo de piedra contra un muro colonial de ladrillo, Zona Colonial, Santo Domingo — Babula Shots',
  },
  cathedralWalk: {
    id: 'v1788218696/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_4_iunguk',
    altEn: 'Family walking hand in hand in front of a grand colonial cathedral facade, Santo Domingo — Babula Shots',
    altEs: 'Familia caminando de la mano frente a la fachada de una gran catedral colonial, Santo Domingo — Babula Shots',
  },
  stepsMotherKids: {
    id: 'v1788218696/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_5_azyfeg',
    altEn: 'Pregnant mother in a pink dress with her two children on stone steps, Zona Colonial, Santo Domingo — Babula Shots',
    altEs: 'Madre embarazada en vestido rosa con sus dos hijos en una escalinata de piedra, Zona Colonial, Santo Domingo — Babula Shots',
  },
  stepsEmbrace: {
    id: 'v1788218696/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_6_cqsdne',
    altEn: 'Mother embracing her two children together on colonial stone steps, Santo Domingo — Babula Shots',
    altEs: 'Madre abrazando a sus dos hijos en una escalinata de piedra colonial, Santo Domingo — Babula Shots',
  },
  stepsPortrait: {
    id: 'v1788218696/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_7_dfss0z',
    altEn: 'Mother and two children portrait on granite steps in the Zona Colonial, Santo Domingo — Babula Shots',
    altEs: 'Retrato de madre e hijos en escalinata de granito en la Zona Colonial, Santo Domingo — Babula Shots',
  },
  boyPlayful: {
    id: 'v1788218696/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_8_vjqwlm',
    altEn: 'Young boy in a playful, candid pose on colonial stone steps, Santo Domingo — Babula Shots',
    altEs: 'Niño en una pose espontánea y juguetona en una escalinata colonial, Santo Domingo — Babula Shots',
  },
  girlEvening: {
    id: 'v1788218701/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_9_xdmfgg',
    altEn: 'Little girl sitting on stone steps at dusk with string lights and greenery, Zona Colonial, Santo Domingo — Babula Shots',
    altEs: 'Niña sentada en una escalinata de piedra al atardecer con luces cálidas y vegetación, Zona Colonial, Santo Domingo — Babula Shots',
  },
  siblingsRunning: {
    id: 'v1788218701/Fotografo_Zona_Colonial_Santo_Domingo_Republica_Dominicana_babula_SHots_10_jpu3ep',
    altEn: 'Two siblings running hand in hand toward the camera in front of a colonial stone archway, Santo Domingo — Babula Shots',
    altEs: 'Dos hermanos corriendo de la mano hacia la cámara frente a una portada de piedra colonial, Santo Domingo — Babula Shots',
  },
}

const HORIZONTALS: Img[] = [
  IMAGES.cathedralWalk,
  IMAGES.siblingsRunning,
  IMAGES.siblingsOnLedge,
  IMAGES.stepsMotherKids,
  IMAGES.stepsEmbrace,
  IMAGES.stepsPortrait,
  IMAGES.boyPlayful,
  IMAGES.girlEvening,
]

const MOBILE_ORDER: Img[] = [
  IMAGES.archwayFamily,
  IMAGES.corridorFamily,
  ...HORIZONTALS,
]

type Props = { locale: string }

export default function ZonaColonialFamilyGallery({ locale }: Props) {
  const isEs = locale === 'es'
  const alt = (img: Img) => (isEs ? img.altEs : img.altEn)
  const src = (img: Img) => `${BASE}/${img.id}.webp`

  return (
    <section aria-labelledby="family-zc-gallery-heading" className="w-full">
      {/* Intro — theme-aware */}
      <div className="bg-neutral-100 dark:bg-neutral-950 py-12 sm:py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h2
            id="family-zc-gallery-heading"
            className="text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl"
          >
            {isEs ? 'Sesiones Familiares en la Zona Colonial' : 'Family Sessions in the Zona Colonial'}
          </h2>
          <p className="mt-4 text-center text-base leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {isEs
              ? 'Arcos de piedra centenarios, la fachada de la Catedral Primada, escalinatas de granito al atardecer — la Zona Colonial ofrece el mejor telón de fondo de Santo Domingo para una sesión familiar, sin necesidad de viajar a la playa. Ritmo pensado para niños pequeños, luz natural, y rutas cortas entre cada locación.'
              : "Centuries-old stone archways, the Catedral Primada facade, granite steps at golden hour — the Zona Colonial is Santo Domingo's best backdrop for a family session, no beach trip required. Paced for young kids, natural light, short walks between each location."}
          </p>
        </div>
      </div>

      {/* Full-bleed gallery */}
      <div className="flex flex-col w-full" style={{ gap: 0, lineHeight: 0 }}>
        {/* Desktop: the 2 verticals paired in one row (hidden on mobile) */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img
            src={src(IMAGES.archwayFamily)}
            alt={alt(IMAGES.archwayFamily)}
            className="h-auto block"
            style={{ width: '50%', objectFit: 'unset' }}
            loading="eager"
            decoding="async"
          />
          <img
            src={src(IMAGES.corridorFamily)}
            alt={alt(IMAGES.corridorFamily)}
            className="h-auto block"
            style={{ width: '50%', objectFit: 'unset' }}
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Desktop: horizontals, each full-width (hidden on mobile) */}
        <div className="hidden md:flex md:flex-col w-full" style={{ gap: 0 }}>
          {HORIZONTALS.map((img) => (
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

        {/* Mobile: every image stacked full-width (hidden on desktop) */}
        <div className="flex flex-col md:hidden w-full" style={{ gap: 0 }}>
          {MOBILE_ORDER.map((img, i) => (
            <img
              key={img.id}
              src={src(img)}
              alt={alt(img)}
              className="w-full h-auto block"
              style={{ objectFit: 'unset' }}
              loading={i === 0 ? 'eager' : 'lazy'}
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
