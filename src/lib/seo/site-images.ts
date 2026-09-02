/**
 * Single source of truth for "every real image on the site, and which
 * page it actually appears on" — used by /image-sitemap.xml.
 *
 * Walks all three places images live:
 *   1. portfolio_images (Supabase)              → /{locale}/portfolio
 *   2. service-content/*.ts image fields         → /{locale}/services/{family_slug}
 *   3. spoke-pages.ts gallery / custom galleries  → /{locale}/{spoke_slug}
 *
 * New images added through any of these existing fields show up here
 * automatically on the next request — nothing to register by hand. The
 * only manual step is for a brand-new *kind* of image field (not one of
 * the ones already walked below); see the comment above buildFromServiceContent.
 */

import { getPortfolioImages } from '@/lib/supabase/images'
import { ALL_SERVICE_FAMILY_SLUGS, getServiceContent } from '@/data/service-content'
import type { RichImage } from '@/data/service-content/types'
import { getPublishedSpokes } from '@/data/spoke-pages'
import { IMAGES as PROPOSAL_IMAGES } from '@/components/spoke/ProposalGallery'
import { IMAGES as PROPOSAL_ZC_IMAGES } from '@/components/spoke/ProposalZonaColonialGallery'
import { IMAGES as BAUTISMO_IMAGES } from '@/components/spoke/BautismoSantoDomingoGallery'
import { IMAGES as ZC_FAMILY_IMAGES } from '@/components/spoke/ZonaColonialFamilyGallery'

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwewurxla'
const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto`
const BASE_URL = 'https://www.fotografosantodomingo.com'

export type SitemapImage = { url: string; title: string; caption: string }
export type SitemapPageImages = { pageUrl: string; images: SitemapImage[] }

/** Cloudinary public_id (no extension) → full delivery URL. */
function cldFromId(publicId: string): string {
  return `${CLOUDINARY_BASE}/${publicId}.webp`
}

/** Sitemap image URLs must be absolute (Google rejects relative ones).
 *  Most RichImage.src values are already full Cloudinary URLs, but a few
 *  older entries store a site-relative /images/... path (valid in <img
 *  src>, invalid in a sitemap) — normalize those against BASE_URL here. */
function toAbsoluteUrl(url: string): string {
  return url.startsWith('http://') || url.startsWith('https://') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

/** ZonaColonialGallery.tsx renders its images inline in JSX (no exported
 *  IMAGES constant, unlike the other 4 custom galleries) — mirrored here
 *  by hand. If that file's image set changes, update this list too. */
const ZONA_COLONIAL_WEDDING_IMAGES: { path: string; altEn: string; altEs: string }[] = [
  { path: 'v1776954732/cobertura-eventos-sociales-santo-domingo_a69wba.webp', altEn: 'Social events coverage Santo Domingo — Babula Shots', altEs: 'Cobertura de eventos sociales Santo Domingo — Babula Shots' },
  { path: 'v1776954733/fotografo-bodas-destino-dominican-republic_h6syhy.webp', altEn: 'Destination wedding photographer Dominican Republic — Babula Shots', altEs: 'Fotógrafo de bodas destino República Dominicana — Babula Shots' },
  { path: 'v1776954733/fotografo_de_bodas_en_Republica_Dominicana_etbazw.webp', altEn: 'Wedding photographer in Dominican Republic — Babula Shots', altEs: 'Fotógrafo de bodas en República Dominicana — Babula Shots' },
  { path: 'v1776954733/pre-wedding-session-zona-colonial-santo-domingo_ojo8j2.webp', altEn: 'Pre-wedding session Zona Colonial Santo Domingo — Babula Shots', altEs: 'Sesión pre-boda Zona Colonial Santo Domingo — Babula Shots' },
  { path: 'v1776954735/wedding-photographer-zona-colonial-sunset_svubtx.webp', altEn: 'Wedding photographer Zona Colonial sunset Santo Domingo — Babula Shots', altEs: 'Fotógrafo de bodas Zona Colonial atardecer Santo Domingo — Babula Shots' },
  { path: 'v1776954733/sesion-de-fotos-post-boda-punta-cana_zgplqf.webp', altEn: 'Post-wedding photo session — Babula Shots', altEs: 'Sesión de fotos post-boda — Babula Shots' },
  { path: 'v1776955590/zona_colonial_fofografo_de_bodas_santo_domingo_republica_dominicana_cyic01.webp', altEn: 'Wedding photographer Zona Colonial Santo Domingo Dominican Republic — Babula Shots', altEs: 'Fotógrafo de bodas Zona Colonial Santo Domingo República Dominicana — Babula Shots' },
  { path: 'v1776955589/sesion_de_fotos_zona_colonial_boda_mlgi44.webp', altEn: 'Photo session Zona Colonial wedding Santo Domingo — Babula Shots', altEs: 'Sesión de fotos Zona Colonial boda Santo Domingo — Babula Shots' },
  { path: 'v1776955589/fotografo_de_bodas_santo_domingo_zona_collonial_x0mbky.webp', altEn: 'Wedding photographer Santo Domingo Zona Colonial — Babula Shots', altEs: 'Fotógrafo de bodas Santo Domingo Zona Colonial — Babula Shots' },
  { path: 'v1776955589/fotografo_de_bodas_profesional_servicio_santo_domingo_zona_colonial_republica_dominicana_vptc1j.webp', altEn: 'Professional wedding photographer Santo Domingo Zona Colonial Dominican Republic — Babula Shots', altEs: 'Fotógrafo de bodas profesional Santo Domingo Zona Colonial República Dominicana — Babula Shots' },
]

/** Spoke IDs that render a custom gallery component instead of spoke.gallery
 *  — must mirror the isX checks in [locale]/[hub]/[spoke]/page.tsx. */
const CUSTOM_GALLERY_BY_SPOKE_ID: Record<string, { id: string; altEn: string; altEs: string }[]> = {
  'weddings-proposal-photographer-dominican-republic': Object.values(PROPOSAL_IMAGES),
  'proposal-hidden-mode-ninja-photographer': Object.values(PROPOSAL_IMAGES),
  'weddings-proposal-photographer-zona-colonial-santo-domingo': Object.values(PROPOSAL_ZC_IMAGES),
  'events-baptism-sd': Object.values(BAUTISMO_IMAGES),
  'family-zona-colonial-santo-domingo': Object.values(ZC_FAMILY_IMAGES),
}

function richImageToSitemapImage(img: RichImage, locale: 'es' | 'en', fallbackTitle: string): SitemapImage {
  return {
    url: toAbsoluteUrl(img.src),
    title: (locale === 'es' ? img.alt.es : img.alt.en) || fallbackTitle,
    caption: img.caption ? (locale === 'es' ? img.caption.es : img.caption.en) : ((locale === 'es' ? img.alt.es : img.alt.en) || fallbackTitle),
  }
}

/** Normalizes a heroGallery/longFormGallery-style field (string[] or
 *  RichImage[]) into flat sitemap image entries. */
function extractGalleryField(
  field: string[] | RichImage[] | undefined,
  locale: 'es' | 'en',
  fallbackTitle: string,
): SitemapImage[] {
  if (!field) return []
  return field.map((item, i) =>
    typeof item === 'string'
      ? { url: toAbsoluteUrl(item), title: `${fallbackTitle} ${i + 1}`, caption: fallbackTitle }
      : richImageToSitemapImage(item, locale, fallbackTitle)
  )
}

async function buildFromPortfolio(locale: 'es' | 'en'): Promise<SitemapPageImages> {
  const images = await getPortfolioImages()
  return {
    pageUrl: `${BASE_URL}/${locale}/portfolio`,
    images: images.map((img) => ({
      url: cldFromId(img.public_id),
      title: locale === 'es' ? img.title_es : img.title_en,
      caption: (locale === 'es' ? img.caption_es : img.caption_en) || (locale === 'es' ? img.alt_es : img.alt_en),
    })),
  }
}

/**
 * To add a new image field to ServiceContent (types.ts) that should show
 * up here too, add one more `...extractGalleryField(...)` line below.
 */
function buildFromServiceContent(locale: 'es' | 'en'): SitemapPageImages[] {
  return ALL_SERVICE_FAMILY_SLUGS.map((slug) => {
    const content = getServiceContent(slug)
    const pageUrl = `${BASE_URL}/${locale}/services/${slug}`
    if (!content) return { pageUrl, images: [] }

    const fallbackTitle = (locale === 'es' ? content.seo?.title.es : content.seo?.title.en) ?? slug

    const images: SitemapImage[] = [
      ...extractGalleryField(content.heroGallery, locale, fallbackTitle),
      ...(content.mobileHeroImage
        ? typeof content.mobileHeroImage === 'string'
          ? [{ url: toAbsoluteUrl(content.mobileHeroImage), title: fallbackTitle, caption: fallbackTitle }]
          : [richImageToSitemapImage(content.mobileHeroImage, locale, fallbackTitle)]
        : []),
      ...extractGalleryField(content.longFormGallery, locale, fallbackTitle),
      ...(content.preProcessGallery ?? []).map((img) => richImageToSitemapImage(img, locale, fallbackTitle)),
      ...(content.cuisineGalleries ?? []).flatMap((gallery) =>
        gallery.images.map((img) => richImageToSitemapImage(img, locale, locale === 'es' ? gallery.title.es : gallery.title.en))
      ),
      ...(content.preGeoImage
        ? [
            richImageToSitemapImage(content.preGeoImage.desktop, locale, fallbackTitle),
            richImageToSitemapImage(content.preGeoImage.mobile, locale, fallbackTitle),
          ]
        : []),
      ...(content.geoCoverage ?? []).flatMap((geo) => {
        const geoTitle = locale === 'es' ? geo.cityName.es : geo.cityName.en
        const single = geo.image ? [richImageToSitemapImage(geo.image, locale, geoTitle)] : []
        const multi = extractGalleryField(geo.images, locale, geoTitle)
        return [...single, ...multi]
      }),
    ]

    return { pageUrl, images }
  })
}

function buildFromSpokes(locale: 'es' | 'en'): SitemapPageImages[] {
  return getPublishedSpokes().map((spoke) => {
    const slug = locale === 'es' ? spoke.esSlug : spoke.enSlug
    const pageUrl = `${BASE_URL}/${locale}/${slug}`
    const fallbackTitle = locale === 'es' ? spoke.titleEs : spoke.titleEn

    const customImages = CUSTOM_GALLERY_BY_SPOKE_ID[spoke.id]
    if (customImages) {
      return {
        pageUrl,
        images: customImages.map((img) => ({
          url: cldFromId(img.id),
          title: (locale === 'es' ? img.altEs : img.altEn) || fallbackTitle,
          caption: (locale === 'es' ? img.altEs : img.altEn) || fallbackTitle,
        })),
      }
    }

    if (spoke.id === 'weddings-zona-colonial-santo-domingo') {
      return {
        pageUrl,
        images: ZONA_COLONIAL_WEDDING_IMAGES.map((img) => ({
          url: `${CLOUDINARY_BASE}/${img.path}`,
          title: (locale === 'es' ? img.altEs : img.altEn) || fallbackTitle,
          caption: (locale === 'es' ? img.altEs : img.altEn) || fallbackTitle,
        })),
      }
    }

    const heroImage: SitemapImage[] =
      spoke.heroImagePublicId && !spoke.heroImagePublicId.startsWith('[CONTENT')
        ? [
            {
              url: cldFromId(spoke.heroImagePublicId),
              title: (locale === 'es' ? spoke.heroImageAltEs : spoke.heroImageAltEn) || fallbackTitle,
              caption: (locale === 'es' ? spoke.heroImageAltEs : spoke.heroImageAltEn) || fallbackTitle,
            },
          ]
        : []

    const galleryImages: SitemapImage[] = (spoke.gallery ?? [])
      .filter((img) => img.publicId && !img.publicId.startsWith('[CONTENT'))
      .map((img) => ({
        url: cldFromId(img.publicId),
        title: (locale === 'es' ? img.altEs : img.altEn) || fallbackTitle,
        caption: (locale === 'es' ? img.altEs : img.altEn) || fallbackTitle,
      }))

    return { pageUrl, images: [...heroImage, ...galleryImages] }
  })
}

export async function getAllSiteImages(locale: 'es' | 'en'): Promise<SitemapPageImages[]> {
  const [portfolio, serviceContent, spokes] = await Promise.all([
    buildFromPortfolio(locale),
    Promise.resolve(buildFromServiceContent(locale)),
    Promise.resolve(buildFromSpokes(locale)),
  ])

  return [portfolio, ...serviceContent, ...spokes].filter((page) => page.images.length > 0)
}
