import { NextResponse } from 'next/server'
import { getPortfolioImages } from '@/lib/supabase/images'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwewurxla'

function cloudinaryUrl(publicId: string, transforms = 'f_auto,q_auto,w_1200') {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

// Pages where portfolio images appear, keyed by locale
const IMAGE_PAGES = [
  { path: '/es/portfolio', lang: 'es' },
  { path: '/en/portfolio', lang: 'en' },
  { path: '/es',           lang: 'es' },
  { path: '/en',           lang: 'en' },
]

export async function GET() {
  const images = await getPortfolioImages()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${IMAGE_PAGES.map(({ path, lang }) => {
    const isEs = lang === 'es'
    const imageBlocks = images
      .map((img) => {
        const title   = isEs ? img.title_es   : img.title_en
        const caption = isEs ? img.caption_es : img.caption_en
        return `    <image:image>
      <image:loc>${escapeXml(cloudinaryUrl(img.public_id))}</image:loc>
      <image:title>${escapeXml(title)}</image:title>
      <image:caption>${escapeXml(caption)}</image:caption>
      <image:geo_location>Santo Domingo, República Dominicana</image:geo_location>
    </image:image>`
      })
      .join('\n')

    return `  <url>
    <loc>${BASE_URL}${path}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
${imageBlocks}
  </url>`
  }).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
