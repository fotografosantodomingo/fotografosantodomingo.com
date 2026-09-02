import { NextResponse } from 'next/server'
import { getAllSiteImages } from '@/lib/seo/site-images'

export const runtime = 'edge'

export async function GET() {
  const [esPages, enPages] = await Promise.all([
    getAllSiteImages('es'),
    getAllSiteImages('en'),
  ])
  const pages = [...esPages, ...enPages]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages
    .map(({ pageUrl, images }) => {
      const imageBlocks = images
        .map(
          (img) => `    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
      <image:geo_location>Santo Domingo, República Dominicana</image:geo_location>
    </image:image>`
        )
        .join('\n')

      return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
${imageBlocks}
  </url>`
    })
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
