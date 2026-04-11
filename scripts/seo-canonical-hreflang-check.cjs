#!/usr/bin/env node

const BASE_URL = (process.env.SEO_CHECK_BASE_URL || 'https://www.fotografosantodomingo.com').replace(/\/$/, '')
const MAX_URLS_PER_LOCALE = Number(process.env.SEO_CHECK_MAX_URLS || 12)
const EXTRA_URLS = (process.env.SEO_CHECK_EXTRA_URLS || '')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean)
const CHECK_BLOG = process.env.SEO_CHECK_INCLUDE_BLOG !== '0'
const CHECK_CORE_PAGES = process.env.SEO_CHECK_INCLUDE_CORE_PAGES !== '0'

const CORE_PAGE_SLUGS = [
  '',
  'blog',
  'services',
  'services/wedding-photography',
  'services/portrait-photography',
  'services/event-photography',
  'services/commercial-photography',
  'services/family-photography',
  'services/drone-services-photography-punta-cana',
  'portfolio',
  'about',
  'contact',
  'privacy',
  'terms',
]

function normalizeUrl(url) {
  return String(url || '').replace(/\/$/, '')
}

function unique(arr) {
  return [...new Set(arr)]
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'seo-canonical-hreflang-check/1.0',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`)
  }

  return {
    finalUrl: normalizeUrl(response.url || url),
    html: await response.text(),
  }
}

function extractCanonical(html) {
  const regex = /<link[^>]*rel=["']canonical["'][^>]*>/i
  const tag = html.match(regex)?.[0]
  if (!tag) return null

  const href = tag.match(/href=["']([^"']+)["']/i)?.[1]
  return href ? normalizeUrl(href) : null
}

function extractHrefLangMap(html) {
  const linkRegex = /<link[^>]*>/gi
  const tags = html.match(linkRegex) || []
  const map = {}

  for (const tag of tags) {
    const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1]?.toLowerCase()
    if (rel !== 'alternate') continue

    const hreflang = tag.match(/hreflang=["']([^"']+)["']/i)?.[1]?.toLowerCase()
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1]

    if (hreflang && href) {
      map[hreflang] = normalizeUrl(href)
    }
  }

  return map
}

function extractBlogLinks(listingHtml, locale) {
  const regex = new RegExp(`href=["'](${BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/${locale}\\/blog\\/[^"'#?]+)["']`, 'gi')
  const urls = []

  for (const match of listingHtml.matchAll(regex)) {
    const url = normalizeUrl(match[1])
    if (/\/(en|es)\/blog$/.test(url)) continue
    urls.push(url)
  }

  return unique(urls).slice(0, MAX_URLS_PER_LOCALE)
}

function localeFromUrl(url) {
  const path = new URL(url).pathname
  const match = path.match(/^\/(es|en)(?:\/|$)/)
  return match ? match[1] : null
}

async function getCandidateUrls() {
  const urls = []

  if (CHECK_BLOG) {
    const listingEn = await fetchHtml(`${BASE_URL}/en/blog`)
    const listingEs = await fetchHtml(`${BASE_URL}/es/blog`)

    urls.push(...extractBlogLinks(listingEn.html, 'en'))
    urls.push(...extractBlogLinks(listingEs.html, 'es'))
  }

  if (CHECK_CORE_PAGES) {
    for (const locale of ['es', 'en']) {
      for (const slug of CORE_PAGE_SLUGS) {
        const path = slug ? `/${locale}/${slug}` : `/${locale}`
        urls.push(`${BASE_URL}${path}`)
      }
    }
  }

  urls.push(...EXTRA_URLS.map(normalizeUrl))

  return unique(urls)
}

async function validateUrl(url) {
  const { finalUrl, html } = await fetchHtml(url)
  const canonical = extractCanonical(html)
  const hreflang = extractHrefLangMap(html)
  const locale = localeFromUrl(finalUrl)

  const issues = []

  if (!canonical) {
    issues.push('missing canonical')
  }

  if (!locale) {
    issues.push('unable to detect locale from URL')
  }

  const expectedFromHreflang = locale ? hreflang[locale] : null
  if (!expectedFromHreflang) {
    issues.push(`missing hreflang for locale: ${locale || 'unknown'}`)
  }

  if (canonical && expectedFromHreflang && canonical !== expectedFromHreflang) {
    issues.push(`canonical mismatch with hreflang ${locale}: canonical=${canonical}, hreflang=${expectedFromHreflang}`)
  }

  if (canonical && canonical !== finalUrl) {
    issues.push(`canonical mismatch with final URL: canonical=${canonical}, final=${finalUrl}`)
  }

  if (hreflang['x-default'] && !hreflang['x-default'].match(/\/es(?:\/|$)/)) {
    issues.push(`x-default should point to /es/ URL, got ${hreflang['x-default']}`)
  }

  return { url: finalUrl, canonical, hreflang, issues }
}

async function main() {
  const urls = await getCandidateUrls()

  if (urls.length === 0) {
    throw new Error('No blog URLs found to validate')
  }

  console.log(`[seo-check] Base URL: ${BASE_URL}`)
  console.log(`[seo-check] Validating ${urls.length} URLs (blog + core pages)`)

  const results = []
  for (const url of urls) {
    try {
      const result = await validateUrl(url)
      results.push(result)
    } catch (error) {
      results.push({ url, issues: [error instanceof Error ? error.message : String(error)] })
    }
  }

  const failed = results.filter((r) => (r.issues || []).length > 0)

  for (const result of failed) {
    console.error(`\n[seo-check][FAIL] ${result.url}`)
    for (const issue of result.issues) {
      console.error(`  - ${issue}`)
    }
  }

  const passedCount = results.length - failed.length
  console.log(`\n[seo-check] Passed: ${passedCount}/${results.length}`)

  if (failed.length > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('[seo-check][ERROR]', error instanceof Error ? error.message : String(error))
  process.exit(1)
})
