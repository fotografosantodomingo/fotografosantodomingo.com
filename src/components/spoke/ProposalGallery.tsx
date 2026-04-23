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

      {/* ── Technique + locations + pricing — theme-aware ─────────────────── */}
      <div className="bg-neutral-100 dark:bg-neutral-950 py-12 sm:py-20 px-4">
        <div className="mx-auto max-w-4xl">

          {/* Heading */}
          <h2
            id="proposal-gallery-heading"
            className="text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl"
          >
            {isEs ? 'Modo Ninja — Teleobjetivo 400–600 mm' : 'Ninja Mode — 400–600 mm Telephoto Lens'}
          </h2>
          <p className="mt-4 text-center text-base leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {isEs
              ? 'Usamos lentes de teleobjetivo de 400 a 600 mm para capturar el momento desde muy lejos — la pareja nunca sabe que estamos ahí. Actuamos igual que un paparazzi profesional: invisibles, silenciosos, perfectamente posicionados antes de que él saque el anillo.'
              : 'We use 400 to 600 mm telephoto lenses to shoot from a long distance — the couple never knows we are there. We work exactly like a professional paparazzi: invisible, silent, perfectly positioned before he pulls out the ring.'}
          </p>

          {/* Locations */}
          <div className="mt-10 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 sm:p-8">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-3">
              {isEs ? '¿Dónde operamos?' : 'Where do we work?'}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
              {isEs
                ? 'No es solo la playa — podemos trabajar en cualquier lugar donde vayas a proponer: resort, restaurante, terraza, villa, parque, azotea. Aquí algunas de las ubicaciones donde más operamos:'
                : "It's not just the beach — we can work anywhere you plan to propose: resort, restaurant, terrace, villa, park, rooftop. Here are some of the locations we cover most:"}
            </p>
            <div className="grid gap-x-8 gap-y-1.5 grid-cols-1 sm:grid-cols-2 text-sm text-neutral-700 dark:text-neutral-300">
              {(isEs ? [
                '🏖️ Playa Bávaro — Punta Cana',
                '🏖️ Playa Juanillo — Cap Cana',
                '🏖️ Playa Macao — Este de Punta Cana',
                '🏖️ Playa Rincón — Samaná',
                '🏖️ Playa Limón — El Seibo',
                '🏖️ Playa Dorada — Puerto Plata',
                '🏖️ Playa Dominicus — Bayahíbe',
                '🏖️ Playa Ancón — Las Terrenas',
                '🌆 Malecón — Santo Domingo',
                '🌆 Parque Mirador — Santo Domingo',
                '🌆 Zona Colonial — Santo Domingo',
                '🌴 Casa de Campo — La Romana',
                '🌴 Hard Rock Beach — Punta Cana',
                '🌴 Las Terrenas — Samaná',
                '✨ Restaurantes privados, terrazas, villas y más',
              ] : [
                '🏖️ Playa Bávaro — Punta Cana',
                '🏖️ Playa Juanillo — Cap Cana',
                '🏖️ Playa Macao — East Punta Cana',
                '🏖️ Playa Rincón — Samaná',
                '🏖️ Playa Limón — El Seibo',
                '🏖️ Playa Dorada — Puerto Plata',
                '🏖️ Playa Dominicus — Bayahíbe',
                '🏖️ Playa Ancón — Las Terrenas',
                '🌆 Malecón — Santo Domingo',
                '🌆 Mirador Park — Santo Domingo',
                '🌆 Zona Colonial — Santo Domingo',
                '🌴 Casa de Campo — La Romana',
                '🌴 Hard Rock Beach — Punta Cana',
                '🌴 Las Terrenas — Samaná',
                '✨ Private restaurants, terraces, villas and more',
              ]).map((loc) => (
                <span key={loc} className="py-0.5">{loc}</span>
              ))}
            </div>
          </div>

          {/* Pricing table */}
          <div className="mt-8">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4 text-center">
              {isEs ? 'Precios desde' : 'Starting from'}
            </h3>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-widest">
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
                      $250 USD
                      <span className="block text-xs font-normal text-neutral-500 dark:text-neutral-400 mt-0.5">
                        + 18% ITBIS
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">
                      {isEs
                        ? 'Cobertura completa en modo ninja, posicionamiento oculto con teleobjetivo, galería privada en 24 h, edición incluida'
                        : 'Full ninja mode coverage, hidden positioning with telephoto, private gallery in 24 h, editing included'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                      {isEs ? 'Personalizado' : 'Custom'}
                    </td>
                    <td className="px-5 py-4 font-bold text-amber-500 whitespace-nowrap">
                      {isEs ? 'Cotización' : 'Quote'}
                      <span className="block text-xs font-normal text-neutral-500 dark:text-neutral-400 mt-0.5">
                        + 18% ITBIS
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">
                      {isEs
                        ? 'Propuesta en múltiples locaciones, coordinación especial de la sorpresa, segundo fotógrafo, acceso a lugares privados, álbum impreso de lujo — todo adaptado a tu idea'
                        : 'Multi-location proposal, special surprise coordination, second photographer, private venue access, luxury printed album — everything tailored to your idea'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Full-bleed gallery — every image full width, zero gap, no crop */}
      <div className="flex flex-col" style={{ gap: 0, lineHeight: 0 }}>
        {Object.values(IMAGES).map((img) => (
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
    </section>
  )
}
