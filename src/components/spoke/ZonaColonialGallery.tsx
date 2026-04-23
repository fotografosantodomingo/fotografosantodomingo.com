/**
 * ZonaColonialGallery — custom full-bleed gallery for weddings/zona-colonial-santo-domingo
 *
 * LAYOUT RULES (enforced here, do NOT change):
 *   - Zero gap between all rows and between all images
 *   - All images use natural aspect ratio — no cropping, no fixed height, no object-fit cover
 *   - Full bleed: no container/max-width padding on the gallery wrapper
 *   - Uses standard <img> (not next/image fill) to preserve natural ratio
 *   - f_auto,q_auto Cloudinary transformations on every URL
 *
 * DESKTOP:
 *   Row 1 — single full-width image
 *   Row 2 — two images, 50% / 50%
 *   Row 3 — three images, 33.333% each
 *
 * MOBILE (≤768px):
 *   All images stack single column, full width, no gaps
 *   Mobile-only images (2–5 in the mobile stack) are hidden on desktop
 */

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dwewurxla/image/upload/f_auto,q_auto'

type Props = {
  locale: string
}

export default function ZonaColonialGallery({ locale }: Props) {
  const isEs = locale === 'es'

  return (
    <section aria-labelledby="gallery-heading" className="w-full">
      {/* Section heading — contained */}
      <div className="bg-neutral-950 py-10 sm:py-16">
        <h2
          id="gallery-heading"
          className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          {isEs
            ? 'Fotos reales de bodas en la Zona Colonial'
            : 'Real Wedding Shots from the Zona Colonial'}
        </h2>
      </div>

      {/* Full-bleed gallery — no padding, no max-width, zero gap */}
      <div className="flex flex-col" style={{ gap: 0, lineHeight: 0 }}>

        {/* ── Desktop Row 1 — full width (hidden on mobile) ─────────────────── */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img
            src={`${CLOUDINARY_BASE}/v1776954732/cobertura-eventos-sociales-santo-domingo_a69wba.webp`}
            alt={
              isEs
                ? 'Cobertura de eventos sociales Santo Domingo — Babula Shots'
                : 'Social events coverage Santo Domingo — Babula Shots'
            }
            className="w-full h-auto block"
            style={{ objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* ── Desktop Row 2 — two images 50/50 (hidden on mobile) ───────────── */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img
            src={`${CLOUDINARY_BASE}/v1776954733/fotografo-bodas-destino-dominican-republic_h6syhy.webp`}
            alt={
              isEs
                ? 'Fotógrafo de bodas destino República Dominicana — Babula Shots'
                : 'Destination wedding photographer Dominican Republic — Babula Shots'
            }
            className="h-auto block"
            style={{ width: '50%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          <img
            src={`${CLOUDINARY_BASE}/v1776954733/fotografo_de_bodas_en_Republica_Dominicana_etbazw.webp`}
            alt={
              isEs
                ? 'Fotógrafo de bodas en República Dominicana — Babula Shots'
                : 'Wedding photographer in Dominican Republic — Babula Shots'
            }
            className="h-auto block"
            style={{ width: '50%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* ── Desktop Row 3 — three images 33/33/33 (hidden on mobile) ─────── */}
        <div className="hidden md:flex w-full" style={{ gap: 0 }}>
          <img
            src={`${CLOUDINARY_BASE}/v1776954733/pre-wedding-session-zona-colonial-santo-domingo_ojo8j2.webp`}
            alt={
              isEs
                ? 'Sesión pre-boda Zona Colonial Santo Domingo — Babula Shots'
                : 'Pre-wedding session Zona Colonial Santo Domingo — Babula Shots'
            }
            className="h-auto block"
            style={{ width: '33.333%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          <img
            src={`${CLOUDINARY_BASE}/v1776954735/wedding-photographer-zona-colonial-sunset_svubtx.webp`}
            alt={
              isEs
                ? 'Fotógrafo de bodas Zona Colonial atardecer Santo Domingo — Babula Shots'
                : 'Wedding photographer Zona Colonial sunset Santo Domingo — Babula Shots'
            }
            className="h-auto block"
            style={{ width: '33.333%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          <img
            src={`${CLOUDINARY_BASE}/v1776954733/sesion-de-fotos-post-boda-punta-cana_zgplqf.webp`}
            alt={
              isEs
                ? 'Sesión de fotos post-boda — Babula Shots'
                : 'Post-wedding photo session — Babula Shots'
            }
            className="h-auto block"
            style={{ width: '33.333%', objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* ── Mobile stack — all images full width, no gap (hidden on desktop) */}
        <div className="flex flex-col md:hidden w-full" style={{ gap: 0 }}>
          {/* Mobile image 1 */}
          <img
            src={`${CLOUDINARY_BASE}/v1776954733/fotografo-bodas-destino-dominican-republic_h6syhy.webp`}
            alt={
              isEs
                ? 'Fotógrafo de bodas destino República Dominicana — Babula Shots'
                : 'Destination wedding photographer Dominican Republic — Babula Shots'
            }
            className="w-full h-auto block"
            style={{ objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          {/* Mobile image 2 — desktop-only excluded */}
          <img
            src={`${CLOUDINARY_BASE}/v1776955590/zona_colonial_fofografo_de_bodas_santo_domingo_republica_dominicana_cyic01.webp`}
            alt={
              isEs
                ? 'Fotógrafo de bodas Zona Colonial Santo Domingo República Dominicana — Babula Shots'
                : 'Wedding photographer Zona Colonial Santo Domingo Dominican Republic — Babula Shots'
            }
            className="w-full h-auto block"
            style={{ objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          {/* Mobile image 3 */}
          <img
            src={`${CLOUDINARY_BASE}/v1776955589/sesion_de_fotos_zona_colonial_boda_mlgi44.webp`}
            alt={
              isEs
                ? 'Sesión de fotos Zona Colonial boda Santo Domingo — Babula Shots'
                : 'Photo session Zona Colonial wedding Santo Domingo — Babula Shots'
            }
            className="w-full h-auto block"
            style={{ objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          {/* Mobile image 4 */}
          <img
            src={`${CLOUDINARY_BASE}/v1776955589/fotografo_de_bodas_santo_domingo_zona_collonial_x0mbky.webp`}
            alt={
              isEs
                ? 'Fotógrafo de bodas Santo Domingo Zona Colonial — Babula Shots'
                : 'Wedding photographer Santo Domingo Zona Colonial — Babula Shots'
            }
            className="w-full h-auto block"
            style={{ objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          {/* Mobile image 5 */}
          <img
            src={`${CLOUDINARY_BASE}/v1776955589/fotografo_de_bodas_profesional_servicio_santo_domingo_zona_colonial_republica_dominicana_vptc1j.webp`}
            alt={
              isEs
                ? 'Fotógrafo de bodas profesional Santo Domingo Zona Colonial República Dominicana — Babula Shots'
                : 'Professional wedding photographer Santo Domingo Zona Colonial Dominican Republic — Babula Shots'
            }
            className="w-full h-auto block"
            style={{ objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
          {/* Mobile image 6 */}
          <img
            src={`${CLOUDINARY_BASE}/v1776954733/fotografo_de_bodas_en_Republica_Dominicana_etbazw.webp`}
            alt={
              isEs
                ? 'Fotógrafo de bodas en República Dominicana — Babula Shots'
                : 'Wedding photographer in Dominican Republic — Babula Shots'
            }
            className="w-full h-auto block"
            style={{ objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {/* Portfolio link — contained */}
      <div className="bg-neutral-950 pb-10 sm:pb-16">
        <div className="text-center pt-8">
          <a
            href={`/${locale}/portfolio`}
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 underline-offset-4 hover:underline"
          >
            {isEs ? 'Ver portafolio completo →' : 'View full portfolio →'}
          </a>
        </div>
      </div>
    </section>
  )
}
