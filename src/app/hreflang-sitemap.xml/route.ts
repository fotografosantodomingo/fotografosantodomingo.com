/**
 * Hreflang Sitemap — /hreflang-sitemap.xml
 *
 * Generates an XML sitemap with xhtml:link alternate annotations for every
 * page that exists in both ES and EN. This is the most explicit signal Google
 * accepts for multilingual duplicate content handling.
 *
 * Google docs: https://developers.google.com/search/docs/specialty/international/localized-versions#sitemap
 */

import { NextResponse } from 'next/server'

const BASE_URL = 'https://fotografosantodomingo.com'
const LOCALES = ['es', 'en'] as const

interface HreflangPage {
  /** Path without leading slash, e.g. "" for home, "portfolio" for portfolio */
  path: string
  /** Lower lastmod priority — ISO date string */
  lastmod?: string
  /** Optional change frequency */
  changefreq?: string
  /** 0.1 – 1.0 */
  priority?: number
}

/** All pages that exist in both locales */
const PAGES: HreflangPage[] = [
  { path: '',          changefreq: 'weekly',  priority: 1.0,  lastmod: '2025-01-01' },
  { path: 'portfolio', changefreq: 'weekly',  priority: 0.9,  lastmod: '2025-01-01' },
  { path: 'services',  changefreq: 'monthly', priority: 0.85, lastmod: '2025-01-01' },
  { path: 'about',     changefreq: 'monthly', priority: 0.8,  lastmod: '2025-01-01' },
  { path: 'contact',   changefreq: 'monthly', priority: 0.8,  lastmod: '2025-01-01' },
  { path: 'gallery',   changefreq: 'weekly',  priority: 0.85, lastmod: '2025-01-01' },
  { path: 'blog',      changefreq: 'weekly',  priority: 0.75, lastmod: '2025-01-01' },
]

function buildUrl(locale: string, path: string): string {
  return path
    ? `${BASE_URL}/${locale}/${path}`
    : `${BASE_URL}/${locale}`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const urlEntries: string[] = []

  for (const page of PAGES) {
    for (const locale of LOCALES) {
      const canonicalUrl = buildUrl(locale, page.path)

      // Build xhtml:link alternates for all locales + x-default
      const alternateLinks = LOCALES.map(
        (altLocale) =>
          `      <xhtml:link\n        rel="alternate"\n        hreflang="${altLocale}"\n        href="${escapeXml(buildUrl(altLocale, page.path))}"/>`,
      ).join('\n')

      // x-default points to the canonical ES version (default locale)
      const xDefault = `      <xhtml:link\n        rel="alternate"\n        hreflang="x-default"\n        href="${escapeXml(buildUrl('es', page.path))}"/>`

      urlEntries.push(
        `  <url>\n    <loc>${escapeXml(canonicalUrl)}</loc>\n${alternateLinks}\n${xDefault}${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''}${page.changefreq ? `\n    <changefreq>${page.changefreq}</changefreq>` : ''}${page.priority !== undefined ? `\n    <priority>${page.priority}</priority>` : ''}\n  </url>`,
      )
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="https://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cache 1 hour in CDN, revalidate in background
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
