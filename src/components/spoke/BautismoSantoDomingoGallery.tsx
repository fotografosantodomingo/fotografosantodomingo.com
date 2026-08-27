/**
 * BautismoSantoDomingoGallery — full-bleed gallery for events/baptism-photographer-santo-domingo
 *
 * Tells the story of a real baptism session in a Zona Colonial stone church:
 *   1–2. Arrival — family portraits at the church's historic stone doorway
 *   3.   A little one in white, waiting by the altar before the rite
 *   4–5. The ceremony begins — priest reading, family gathered at the lectern
 *   6–7. The blessing — priest's hand raised over the child
 *   8–9. The baptismal font — water poured, the moment itself
 *   10.  Wide nave shot — the full ceremony inside the colonial church
 *   11–12. Portraits at the gilded altar/retablo
 *   13–14. Family group portraits in front of the altar
 *
 * LAYOUT RULES — explicit client request: full width on BOTH desktop and mobile,
 * natural aspect ratio, no crop, no ratio change. Unlike the proposal/Zona Colonial
 * galleries, there is no desktop multi-column split — a single continuous full-bleed
 * stack renders identically at every breakpoint.
 *   - Zero gap between images
 *   - Natural aspect ratio — no cropping, no fixed height, no object-fit cover
 *   - Full bleed: no container/max-width padding
 *   - Standard <img> (not next/image fill) to preserve natural ratio
 */

const BASE = 'https://res.cloudinary.com/dwewurxla/image/upload/f_auto,q_auto'

const IMAGES = {
  arrivalFatherDaughter: {
    id: 'v1787789561/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_12_ic8dk0',
    altEn: 'Father and daughter in white christening dress arriving at a historic stone church doorway in the Zona Colonial, Santo Domingo — Babula Shots',
    altEs: 'Padre e hija con vestido de bautizo blanco llegando a la puerta de piedra de una iglesia histórica en la Zona Colonial, Santo Domingo — Babula Shots',
  },
  arrivalMotherDaughter: {
    id: 'v1787789563/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_13_mvmbzf',
    altEn: 'Mother and daughter in white dresses walking hand in hand at the colonial church entrance, Santo Domingo — Babula Shots',
    altEs: 'Madre e hija vestidas de blanco caminando tomadas de la mano en la entrada de la iglesia colonial, Santo Domingo — Babula Shots',
  },
  toddlerAtAltar: {
    id: 'v1787789560/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_11_oby1pm',
    altEn: 'Toddler in white christening suit standing before the gilded altar, moments before the baptism ceremony — Babula Shots',
    altEs: 'Niño con traje de bautizo blanco de pie frente al altar dorado, momentos antes de la ceremonia de bautizo — Babula Shots',
  },
  familyAtLecternClose: {
    id: 'v1787789554/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_1_gy4rkf',
    altEn: 'Godparents and priest with baby boy in white at the lectern, colonial stone church interior, Santo Domingo — Babula Shots',
    altEs: 'Padrinos y sacerdote con bebé vestido de blanco junto al atril, interior de iglesia colonial de piedra, Santo Domingo — Babula Shots',
  },
  familyAtLecternStainedGlass: {
    id: 'v1787789554/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_3_fu34xe',
    altEn: 'Priest reading the baptismal rite beside stained-glass windows in a Zona Colonial church — Babula Shots',
    altEs: 'Sacerdote leyendo el rito del bautizo junto a los vitrales de una iglesia de la Zona Colonial — Babula Shots',
  },
  blessingWithMic: {
    id: 'v1787789556/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_6_qiuaxk',
    altEn: 'Priest blessing a baby held by her parents inside a colonial stone church, Santo Domingo — Babula Shots',
    altEs: 'Sacerdote bendiciendo a una bebé en brazos de sus padres dentro de una iglesia colonial de piedra, Santo Domingo — Babula Shots',
  },
  blessingCloseUp: {
    id: 'v1787789560/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_9_tq0w0y',
    altEn: 'Close-up of a priest\'s blessing gesture over a baby during a baptism ceremony, Zona Colonial Santo Domingo — Babula Shots',
    altEs: 'Primer plano del gesto de bendición del sacerdote sobre un bebé durante el bautizo, Zona Colonial Santo Domingo — Babula Shots',
  },
  baptismalFontMoment: {
    id: 'v1787789555/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_4_cxhrje',
    altEn: 'The baptism moment — baby held over the baptismal font as holy water is poured, colonial church Santo Domingo — Babula Shots',
    altEs: 'El momento del bautizo — bebé sobre la fuente bautismal mientras se derrama el agua bendita, iglesia colonial de Santo Domingo — Babula Shots',
  },
  baptismalFontOil: {
    id: 'v1787789555/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_5_af3w37',
    altEn: 'Baby girl at the baptismal font with holy oil, family gathered around, red carpet altar area — Babula Shots',
    altEs: 'Bebé en la fuente bautismal con óleo sagrado, familia reunida alrededor, área del altar con alfombra roja — Babula Shots',
  },
  wideNaveCeremony: {
    id: 'v1787789554/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_2_hliana',
    altEn: 'Wide shot of the baptism ceremony inside a stone-arched colonial church nave, extended family in white, Santo Domingo — Babula Shots',
    altEs: 'Toma amplia de la ceremonia de bautizo dentro de la nave de piedra de una iglesia colonial, familia extendida de blanco, Santo Domingo — Babula Shots',
  },
  goldenAltarBlessing: {
    id: 'v1787789558/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_7_a9djog',
    altEn: 'Priest blessing the family before the gilded Baroque altarpiece with a Marian statue, Zona Colonial church — Babula Shots',
    altEs: 'Sacerdote bendiciendo a la familia frente al retablo barroco dorado con la imagen de la Virgen, iglesia de la Zona Colonial — Babula Shots',
  },
  goldenAltarFather: {
    id: 'v1787789559/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_8_ez7hm7',
    altEn: 'Father holding his baby as the priest blesses them before the gilded altar and floral arrangements — Babula Shots',
    altEs: 'Padre sosteniendo a su bebé mientras el sacerdote los bendice frente al altar dorado y los arreglos florales — Babula Shots',
  },
  familyPortraitAltarSmall: {
    id: 'v1787789560/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_10_ntmbpu',
    altEn: 'Family portrait in front of the gilded retablo after the baptism, Zona Colonial church, Santo Domingo — Babula Shots',
    altEs: 'Retrato familiar frente al retablo dorado después del bautizo, iglesia de la Zona Colonial, Santo Domingo — Babula Shots',
  },
  familyPortraitAltarLarge: {
    id: 'v1787789564/Fotografo_Bautismo_Santo_Domingo_Republiica_Dominicana_Babula_Shots_14_hs1rlx',
    altEn: 'Large extended family group portrait before the gilded altar after a baptism ceremony, Santo Domingo — Babula Shots',
    altEs: 'Retrato grupal de la familia extendida frente al altar dorado después de la ceremonia de bautizo, Santo Domingo — Babula Shots',
  },
}

type Img = { id: string; altEn: string; altEs: string }

type Props = {
  locale: string
}

export default function BautismoSantoDomingoGallery({ locale }: Props) {
  const isEs = locale === 'es'
  const alt = (img: Img) => (isEs ? img.altEs : img.altEn)
  const src = (img: Img) => `${BASE}/${img.id}.webp`

  const order: Img[] = [
    IMAGES.arrivalFatherDaughter,
    IMAGES.arrivalMotherDaughter,
    IMAGES.toddlerAtAltar,
    IMAGES.familyAtLecternClose,
    IMAGES.familyAtLecternStainedGlass,
    IMAGES.blessingWithMic,
    IMAGES.blessingCloseUp,
    IMAGES.baptismalFontMoment,
    IMAGES.baptismalFontOil,
    IMAGES.wideNaveCeremony,
    IMAGES.goldenAltarBlessing,
    IMAGES.goldenAltarFather,
    IMAGES.familyPortraitAltarSmall,
    IMAGES.familyPortraitAltarLarge,
  ]

  return (
    <section aria-labelledby="bautismo-sd-gallery-heading" className="w-full">
      {/* ── Intro — the Zona Colonial churches angle — theme-aware ── */}
      <div className="bg-neutral-100 dark:bg-neutral-950 py-12 sm:py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h2
            id="bautismo-sd-gallery-heading"
            className="text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl"
          >
            {isEs ? 'Bautizos en las Iglesias de la Zona Colonial' : 'Baptisms in the Churches of the Zona Colonial'}
          </h2>
          <p className="mt-4 text-center text-base leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {isEs
              ? 'Las iglesias históricas de piedra de la Zona Colonial de Santo Domingo — con sus retablos dorados, vitrales y patios centenarios — son el escenario más solicitado para un bautizo en República Dominicana. Documentamos cada etapa: la llegada, el rito en la fuente bautismal, la bendición y el retrato familiar frente al altar.'
              : "The historic stone churches of Santo Domingo's Zona Colonial — with their gilded altarpieces, stained glass, and centuries-old courtyards — are the most requested setting for a baptism in the Dominican Republic. We document every stage: the arrival, the rite at the baptismal font, the blessing, and the family portrait in front of the altar."}
          </p>
        </div>
      </div>

      {/* Full-bleed gallery — single column, full width on every breakpoint, no crop */}
      <div className="flex flex-col w-full" style={{ gap: 0, lineHeight: 0 }}>
        {order.map((img) => (
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
