#!/usr/bin/env node
// Weekly GSC indexation snapshot + diff vs previous run (service account, zero deps).
//   GSC_KEY=./fotografo-gsc-*.json GSC_SITE="https://www.fotografosantodomingo.com/" node scripts/gsc-snapshot.mjs
// Inspects every sitemap URL, writes a dated JSON to scripts/gsc-snapshots/, and
// prints what changed since the prior snapshot (newly indexed / newly dropped / moved).

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { createSign } from 'node:crypto'

const sa = JSON.parse(readFileSync(process.env.GSC_KEY || './gsc-service-account.json', 'utf8'))
const SITE = process.env.GSC_SITE || 'https://www.fotografosantodomingo.com/'
const SNAP_DIR = new URL('./gsc-snapshots/', import.meta.url).pathname
const b64 = (b) => Buffer.from(b).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

const INDEXED = new Set(['Enviada e indexada', 'Submitted and indexed', 'Indexed, not submitted in sitemap', 'Indexada, aunque no se envió en ningún sitemap'])

async function token() {
  const now = Math.floor(Date.now() / 1000)
  const h = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const p = b64(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }))
  const s = createSign('RSA-SHA256'); s.update(`${h}.${p}`)
  const jwt = `${h}.${p}.${b64(s.sign(sa.private_key))}`
  const tr = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) })).json()
  if (!tr.access_token) throw new Error('auth: ' + JSON.stringify(tr))
  return tr.access_token
}

async function sitemapUrls() {
  const xml = await (await fetch('https://www.fotografosantodomingo.com/sitemap.xml')).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

const TOK = await token()
async function inspect(url) {
  for (let a = 0; a < 3; a++) {
    const r = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { method: 'POST', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE, languageCode: 'es' }) })
    if (r.status === 429) { await new Promise((x) => setTimeout(x, 2000 * (a + 1))); continue }
    if (!r.ok) return { url, coverage: 'ERROR ' + r.status }
    const c = (await r.json()).inspectionResult?.indexStatusResult ?? {}
    return { url, coverage: c.coverageState ?? 'unknown' }
  }
  return { url, coverage: 'ERROR 429' }
}

const urls = await sitemapUrls()
const CONC = 8; let i = 0; const res = []
await Promise.all(Array.from({ length: CONC }, async () => { while (i < urls.length) { const k = i++; res[k] = await inspect(urls[k]); process.stderr.write('\r' + res.filter(Boolean).length + '/' + urls.length) } }))
process.stderr.write('\n')

const today = new Date().toISOString().slice(0, 10)
const byUrl = Object.fromEntries(res.map((r) => [r.url, r.coverage]))
const indexed = res.filter((r) => INDEXED.has(r.coverage)).length
const snap = { date: today, total: res.length, indexed, notIndexed: res.length - indexed, byUrl }

if (!existsSync(SNAP_DIR)) mkdirSync(SNAP_DIR, { recursive: true })
const priorFiles = readdirSync(SNAP_DIR).filter((f) => f.endsWith('.json')).sort()
const prior = priorFiles.length ? JSON.parse(readFileSync(SNAP_DIR + priorFiles[priorFiles.length - 1], 'utf8')) : null
writeFileSync(`${SNAP_DIR}${today}.json`, JSON.stringify(snap, null, 2))

const short = (u) => u.replace('https://www.fotografosantodomingo.com', '')
console.log(`\n═══ GSC SNAPSHOT ${today} ═══`)
console.log(`Indexed: ${indexed}/${res.length}  |  Not indexed: ${res.length - indexed}`)

if (!prior) { console.log('\n(brak wcześniejszej migawki — to jest baseline)'); }
else {
  console.log(`\nPoprzednia migawka: ${prior.date} (indexed ${prior.indexed}/${prior.total})`)
  console.log(`Zmiana indexed: ${prior.indexed} → ${indexed}  (${indexed - prior.indexed >= 0 ? '+' : ''}${indexed - prior.indexed})`)
  const gained = [], lost = [], changed = []
  for (const r of res) {
    const was = prior.byUrl[r.url]; const now = r.coverage
    if (was === undefined) continue
    const wasIx = INDEXED.has(was), nowIx = INDEXED.has(now)
    if (!wasIx && nowIx) gained.push(r.url)
    else if (wasIx && !nowIx) lost.push(`${short(r.url)} (→ ${now})`)
    else if (was !== now) changed.push(`${short(r.url)}: ${was} → ${now}`)
  }
  const newUrls = res.filter((r) => prior.byUrl[r.url] === undefined).map((r) => short(r.url))
  console.log(`\n✅ NOWO ZINDEKSOWANE (${gained.length}):`); gained.forEach((u) => console.log('  + ' + short(u)))
  console.log(`\n❌ WYPADŁY Z INDEKSU (${lost.length}):`); lost.forEach((u) => console.log('  - ' + u))
  console.log(`\n🔄 ZMIANA STATUSU (${changed.length}):`); changed.forEach((u) => console.log('  ~ ' + u))
  console.log(`\n🆕 NOWE URL-e w sitemapie (${newUrls.length}):`); newUrls.forEach((u) => console.log('  * ' + u))
}
console.log('\n# DONE')
