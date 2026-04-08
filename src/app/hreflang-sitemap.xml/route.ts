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
import { getAllPosts } from '@/lib/blog/posts'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const LOCALES = ['es', 'en'] as const

interface HreflangPage {
  /** Path without leading slash, e.g. "" for home, "portfolio" for portfolio */
  path: string
  /** Optional change frequency */
  changefreq?: string
  /** 0.1 – 1.0 */
  priority?: number
}

/** All static pages that exist in both locales */
const PAGES: HreflangPage[] = [
  { path: '',          changefreq: 'weekly',  priority: 1.0  },
  { path: 'portfolio', changefreq: 'weekly',  priority: 0.9  },
  { path: 'services',  changefreq: 'monthly', priority: 0.85 },
  { path: 'about',     changefreq: 'monthly', priority: 0.8  },
  { path: 'contact',   changefreq: 'monthly', priority: 0.8  },
  { path: 'blog',      changefreq: 'weekly',  priority: 0.75 },
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

function buildEntry(page: HreflangPage, locale: string): string {
  const canonicalUrl = buildUrl(locale, page.path)

  const alternateLinks = LOCALES.map(
    (altLocale) =>
      `      <xhtml:link\n        rel="alternate"\n        hreflang="${altLocale}"\n        href="${escapeXml(buildUrl(altLocale, page.path))}"/>`,
  ).join('\n')

  const xDefault = `      <xhtml:link\n        rel="alternate"\n        hreflang="x-default"\n        href="${escapeXml(buildUrl('es', page.path))}"/>`

  return [
    `  <url>`,
    `    <loc>${escapeXml(canonicalUrl)}</loc>`,
    alternateLinks,
    xDefault,
    page.changefreq ? `    <changefreq>${page.changefreq}</changefreq>` : '',
    page.priority !== undefined ? `    <priority>${page.priority}</priority>` : '',
    `  </url>`,
  ].filter(Boolean).join('\n')
}

export async function GET() {
  const posts = getAllPosts()

  // Add blog post pages dynamically
  const blogPages: HreflangPage[] = posts.map((post) => ({
    path: `blog/${post.slug}`,
    changefreq: 'monthly',
    priority: 0.7,
  }))

  const allPages = [...PAGES, ...blogPages]
  const urlEntries: string[] = []

  for (const page of allPages) {
    for (const locale of LOCALES) {
      urlEntries.push(buildEntry(page, locale))
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
