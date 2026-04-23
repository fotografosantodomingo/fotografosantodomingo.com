/**
 * ProposalGallery — full-bleed gallery for proposal photographer spoke pages
 *
 * Tells the story of the ninja mode proposal in sequence:
 *   1. Telephoto from distance — she has no idea
 *   2. Getting the perfect angle and position
 *   3. Full ninja mode — completely hidden
 *   4. In position, background clear, he's ready
 *   5. On one knee — the moment
 *   6. Ring on finger
 *   7. Hugs and kisses
 *   8. Still hidden — couple sitting, fully relaxed, unaware
 *
 * LAYOUT RULES (same as ZonaColonialGallery — do NOT change):
 *   - Zero gap between all rows and images
 *   - Natural aspect ratio — no cropping, no fixed height, no object-fit cover
 *   - Full bleed: no container/max-width padding
 *   - Standard <img> (not next/image fill) to preserve natural ratio
 *
 * DESKTOP:
 *   Row 1 — single full-width (telephoto ninja shot — hero of the story)
 *   Row 2 — two images 50/50 (getting position + angle)
 *   Row 3 — three images 33/33/33 (hidden mode + getting into position + on knees)
 *   Row 4 — two images 50/50 (ring + hugs/kisses)
 *   Row 5 — single full-width (still hidden, couple sitting after proposal)
 *
 * MOBILE: single column stack, all 10 images
 */

const BASE = 'https://res.cloudinary.com/dwewurxla/image/upload/f_auto,q_auto'

const IMAGES = {
  telephotoNinja: {
    id: 'fotografo_para_propuesta_de_matrimonio_santo_domingo_punta_cana_playa_fh3htf',
    altEn: 'Ninja mode — photographer invisible with telephoto lens from far distance, couple has no idea — Babula Shots',
    altEs: 'Modo ninja — fotógrafo invisible con teleobjetivo desde lejos, la pareja no tiene idea — Babula Shots',
  },
  gettingPosition: {
    id: 'Fotografo_para_pido_la_mano_propuesta_Republica_dominicana_playa_bavaro_punta_cana_ylwdgz',
    altEn: 'Getting perfect position and seaview angle for hidden proposal photography Dominican Republic — Babula Shots',
    altEs: 'Buscando posición perfecta y ángulo con vista al mar para fotografía de propuesta oculta República Dominicana — Babula Shots',
  },
  pc2: {
    id: 'fotografo_para_propuesta_de_matrimonio_en_Punta_Cana_Republica_Dominicana_buhrh3',
    altEn: 'Proposal photographer Punta Cana beach Dominican Republic — Babula Shots',
    altEs: 'Fotógrafo de propuesta playa Punta Cana República Dominicana — Babula Shots',
  },
  fullNinja: {
    id: 'fotografo_en_la_playa_servicio_propuesta_pido_la_mano_j0lrts',
    altEn: 'Full ninja mode — hidden beach photographer Dominican Republic, completely invisible — Babula Shots',
    altEs: 'Modo ninja completo — fotógrafo oculto en playa República Dominicana, completamente invisible — Babula Shots',
  },
  ninjaMode2: {
    id: 'propuersta_de_matrimonio_punta_cana_fofotgrafo_paparazzi_modo_ngunow',
    altEn: 'Hidden proposal photographer ninja mode Punta Cana beach — Babula Shots',
    altEs: 'Fotógrafo de propuesta oculto modo ninja playa Punta Cana — Babula Shots',
  },
  inPosition: {
    id: 'paquetes_de_propuesta_de_matrimonio_en_punta_cana_sqplka',
    altEn: 'In position — people walking naturally in background, he is ready to propose — Babula Shots',
    altEs: 'En posición — personas caminando naturalmente al fondo, él está listo para proponer — Babula Shots',
  },
  onKnees: {
    id: 'Session_de_fotos_fotografo_punta_cana_propuesta_de_matrimonio_sjrds4',
    altEn: 'On one knee asking the big question — surprise proposal Punta Cana beach — Babula Shots',
    altEs: 'De rodillas haciendo la gran pregunta — propuesta sorpresa playa Punta Cana — Babula Shots',
  },
  ring: {
    id: 'fotografo_punta_cana_para_propuesta_de_matrimonio_r9wkan',
    altEn: 'Putting the ring on her finger — captured secretly during beach proposal Dominican Republic — Babula Shots',
    altEs: 'Poniendo el anillo en su dedo — capturado secretamente durante propuesta en playa República Dominicana — Babula Shots',
  },
  hugKiss: {
    id: 'Propuesta_de_matrimonio_playa_privada_Punta_Cana_dz3wp2',
    altEn: 'Hugs and kisses after surprise beach proposal Punta Cana private beach — Babula Shots',
    altEs: 'Abrazos y besos después de propuesta sorpresa playa privada Punta Cana — Babula Shots',
  },
  stillHidden: {
    id: 'sorpresa_propuesta_de_matrimonio_en_la_playa_fotografo_en_republica_dominicana_punta_cana_jkyrry',
    altEn: 'Still in ninja mode — couple sitting on beach after proposal, fully relaxed, unaware of hidden photographer — Babula Shots',
    altEs: 'Aún en modo ninja — pareja sentada en la playa después de la propuesta, completamente relajada, sin saber del fotógrafo oculto — Babula Shots',
  },
}

type Props = {
  locale: string
}

export default function ProposalGallery({ locale }: Props) {
  const isEs = locale === 'es'
  const alt = (img: { altEn: string; altEs: string }) => isEs ? img.altEs : img.altEn
  const src = (img: { id: string }) => `${BASE}/${img.id}.webp`

  return (
    <section aria-labelledby="proposal-gallery-heading" className="w-full">
      {/* Section heading — contained */}
      <div className="bg-neutral-950 py-10 sm:py-16">
        <h2
          id="proposal-gallery-heading"
          className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          {isEs
            ? 'La secuencia completa — desde ninja oculto hasta el sí'
            : 'The full sequence — from hidden ninja to the yes'}
        </h2>
        <p className="mt-3 text-center text-base text-neutral-400 max-w-2xl mx-auto px-4">
          {isEs
            ? 'Estas fotos muestran exactamente cómo funciona el modo ninja: posicionamiento oculto, teleobjetivo, la propuesta capturada, y finalmente todavía ocultos mientras la pareja celebra.'
            : 'These shots show exactly how ninja mode works: hidden positioning, telephoto lens, the proposal captured, and finally still hidden while the couple celebrates.'}
        </p>
      </div>

      {/* Full-bleed gallery — zero gap */}
      <div className="flex flex-col" style={{ gap: 0, lineHeight: 0 }}>

        {/* ── Desktop Row 1 — full width telephoto ninja shot ─────────────── */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img src={src(IMAGES.telephotoNinja)} alt={alt(IMAGES.telephotoNinja)}
            className="w-full h-auto block" style={{ objectFit: 'unset' }} loading="lazy" decoding="async" />
        </div>

        {/* ── Desktop Row 2 — 50/50 getting position + PC shot ────────────── */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img src={src(IMAGES.gettingPosition)} alt={alt(IMAGES.gettingPosition)}
            className="h-auto block" style={{ width: '50%', objectFit: 'unset' }} loading="lazy" decoding="async" />
          <img src={src(IMAGES.pc2)} alt={alt(IMAGES.pc2)}
            className="h-auto block" style={{ width: '50%', objectFit: 'unset' }} loading="lazy" decoding="async" />
        </div>

        {/* ── Desktop Row 3 — 33/33/33 full ninja + ninja2 + in position ───── */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img src={src(IMAGES.fullNinja)} alt={alt(IMAGES.fullNinja)}
            className="h-auto block" style={{ width: '33.333%', objectFit: 'unset' }} loading="lazy" decoding="async" />
          <img src={src(IMAGES.ninjaMode2)} alt={alt(IMAGES.ninjaMode2)}
            className="h-auto block" style={{ width: '33.333%', objectFit: 'unset' }} loading="lazy" decoding="async" />
          <img src={src(IMAGES.inPosition)} alt={alt(IMAGES.inPosition)}
            className="h-auto block" style={{ width: '33.333%', objectFit: 'unset' }} loading="lazy" decoding="async" />
        </div>

        {/* ── Desktop Row 4 — full width on knees moment ──────────────────── */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img src={src(IMAGES.onKnees)} alt={alt(IMAGES.onKnees)}
            className="w-full h-auto block" style={{ objectFit: 'unset' }} loading="lazy" decoding="async" />
        </div>

        {/* ── Desktop Row 5 — 50/50 ring + hugs ──────────────────────────── */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img src={src(IMAGES.ring)} alt={alt(IMAGES.ring)}
            className="h-auto block" style={{ width: '50%', objectFit: 'unset' }} loading="lazy" decoding="async" />
          <img src={src(IMAGES.hugKiss)} alt={alt(IMAGES.hugKiss)}
            className="h-auto block" style={{ width: '50%', objectFit: 'unset' }} loading="lazy" decoding="async" />
        </div>

        {/* ── Desktop Row 6 — full width still hidden ─────────────────────── */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img src={src(IMAGES.stillHidden)} alt={alt(IMAGES.stillHidden)}
            className="w-full h-auto block" style={{ objectFit: 'unset' }} loading="lazy" decoding="async" />
        </div>

        {/* ── Mobile stack — all images single column ─────────────────────── */}
        <div className="flex flex-col md:hidden w-full" style={{ gap: 0 }}>
          {Object.values(IMAGES).map((img) => (
            <img key={img.id} src={src(img)} alt={alt(img)}
              className="w-full h-auto block" style={{ objectFit: 'unset' }} loading="lazy" decoding="async" />
          ))}
        </div>

      </div>
    </section>
  )
}
