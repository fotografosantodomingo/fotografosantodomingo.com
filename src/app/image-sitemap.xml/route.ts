import { NextResponse } from 'next/server'
import { getPortfolioImages } from '@/lib/supabase/images'

const BASE_URL = 'https://fotografosantodomingo.com'
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

function cloudinaryUrl(publicId: string, transforms = 'f_auto,q_auto') {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

export async function GET() {
  const images = await getPortfolioImages()
  const locales = ['es', 'en']

  const pageImageGroups = locales.map((locale) => ({
    pageUrl: `${BASE_URL}/${locale}/portfolio`,
    images,
  }))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pageImageGroups
  .map(
    ({ pageUrl, images: imgs }) => `  <url>
    <loc>${pageUrl}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
${imgs
  .map((img) => {
    const title = img.title_es // Use Spanish as primary; both locales map to same image
    const caption = img.caption || img.description_es
    // Provide 3 aspect-ratio variants per image so Google can pick best for each context
    const variants = [
      cloudinaryUrl(img.public_id, `w_${img.width},h_${img.height},c_fill,g_auto,f_auto,q_90`),
      cloudinaryUrl(img.public_id, `w_1200,h_900,c_fill,g_auto,f_auto,q_85`),   // 4:3
      cloudinaryUrl(img.public_id, `w_1200,h_675,c_fill,g_auto,f_auto,q_85`),   // 16:9
      cloudinaryUrl(img.public_id, `w_800,h_800,c_fill,g_auto,f_auto,q_85`),    // 1:1
    ]
    return variants
      .map(
        (url) => `    <image:image>
      <image:loc>${url}</image:loc>
      <image:title>${escapeXml(title)}</image:title>
      <image:caption>${escapeXml(caption)}</image:caption>
      <image:geo_location>Santo Domingo, República Dominicana</image:geo_location>
      <image:license>${BASE_URL}/terms</image:license>
    </image:image>`
      )
      .join('\n')
  })
  .join('\n')}
  </url>`
  )
  .join('\n')}
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
