#!/usr/bin/env node
// GSC Index Coverage check via URL Inspection API (service account auth, zero deps).
//
// Usage:
//   GSC_KEY=/path/to/service-account.json \
//   GSC_SITE="sc-domain:fotografosantodomingo.com" \   # or "https://www.fotografosantodomingo.com/"
//   node scripts/gsc-index-check.mjs
//
// Reads sitemap URLs from /tmp/urls.txt (or pass URLS_FILE). Outputs every URL's
// coverageState and a grouped summary of what is NOT indexed.

import { readFileSync } from 'node:fs'
import { createSign } from 'node:crypto'

const KEY_PATH  = process.env.GSC_KEY  || './gsc-service-account.json'
const SITE_URL  = process.env.GSC_SITE || 'sc-domain:fotografosantodomingo.com'
const URLS_FILE = process.env.URLS_FILE || '/tmp/urls.txt'
const SCOPE     = 'https://www.googleapis.com/auth/webmasters.readonly'

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000)
  const header  = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${payload}`)
  const sig = b64url(signer.sign(sa.private_key))
  const jwt = `${header}.${payload}.${sig}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const json = await res.json()
  if (!json.access_token) throw new Error('Auth failed: ' + JSON.stringify(json))
  return json.access_token
}

async function inspect(token, url) {
  const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL, languageCode: 'es' }),
  })
  if (!res.ok) {
    const t = await res.text()
    return { url, error: `${res.status} ${t.slice(0, 200)}` }
  }
  const j = await res.json()
  const r = j.inspectionResult?.indexStatusResult ?? {}
  return {
    url,
    verdict: r.verdict ?? 'UNKNOWN',           // PASS / NEUTRAL / FAIL
    coverage: r.coverageState ?? 'unknown',     // "Submitted and indexed", "Crawled - currently not indexed", ...
    lastCrawl: r.lastCrawlTime ?? null,
    robots: r.robotsTxtState ?? null,
    canonical: r.googleCanonical ?? null,
  }
}

const sa = JSON.parse(readFileSync(KEY_PATH, 'utf8'))
const urls = readFileSync(URLS_FILE, 'utf8').split('\n').map(s => s.trim()).filter(Boolean)
console.error(`Property: ${SITE_URL}\nSA: ${sa.client_email}\nURLs: ${urls.length}\n`)

const token = await getAccessToken(sa)
console.error('Auth OK. Inspecting (rate-limited ~5/s)...\n')

const results = []
for (let i = 0; i < urls.length; i++) {
  const r = await inspect(token, urls[i])
  results.push(r)
  process.stderr.write(`\r${i + 1}/${urls.length}`)
  await new Promise(res => setTimeout(res, 180)) // stay well under 600/min
}
console.error('\n')

const indexed   = results.filter(r => r.coverage === 'Submitted and indexed' || r.coverage === 'Indexed, not submitted in sitemap')
const errors    = results.filter(r => r.error)
const notIndexed = results.filter(r => !r.error && !indexed.includes(r))

console.log('═══════════════════════════════════════════════════════')
console.log(`INDEXED:      ${indexed.length}`)
console.log(`NOT INDEXED:  ${notIndexed.length}`)
console.log(`ERRORS:       ${errors.length}`)
console.log('═══════════════════════════════════════════════════════\n')

if (notIndexed.length) {
  // group by coverage reason
  const byReason = {}
  for (const r of notIndexed) (byReason[r.coverage] ??= []).push(r.url)
  for (const [reason, list] of Object.entries(byReason).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n### ${reason} (${list.length})`)
    for (const u of list) console.log('  - ' + u)
  }
}
if (errors.length) {
  console.log('\n### ERRORS')
  for (const r of errors) console.log(`  - ${r.url} → ${r.error}`)
}
