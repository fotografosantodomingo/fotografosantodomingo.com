#!/usr/bin/env node
// Submit URLs to Google Web Search Indexing API (service account auth, zero deps).
// NOTE: Indexing API is officially only for JobPosting/BroadcastEvent. For regular
// pages it is unofficial — it commonly nudges Googlebot to (re)crawl, but does NOT
// guarantee indexation. Requires indexing.googleapis.com enabled + SA = site owner.
//
// Usage:
//   GSC_KEY=./fotografo-gsc-*.json node scripts/gsc-request-indexing.mjs <urls-file>
//   GSC_KEY=./fotografo-gsc-*.json node scripts/gsc-request-indexing.mjs https://site/a https://site/b

import { readFileSync } from 'node:fs'
import { createSign } from 'node:crypto'

const sa = JSON.parse(readFileSync(process.env.GSC_KEY || './gsc-service-account.json', 'utf8'))
const b64 = (b) => Buffer.from(b).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

const arg = process.argv[2]
let urls = []
if (arg && (arg.startsWith('http'))) urls = process.argv.slice(2)
else if (arg) urls = readFileSync(arg, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)
else { console.error('Pass a urls file path or URLs as args.'); process.exit(1) }

const now = Math.floor(Date.now() / 1000)
const h = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
const p = b64(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/indexing', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }))
const s = createSign('RSA-SHA256'); s.update(`${h}.${p}`)
const jwt = `${h}.${p}.${b64(s.sign(sa.private_key))}`
const tr = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) })).json()
if (!tr.access_token) { console.error('AUTH FAIL', JSON.stringify(tr)); process.exit(1) }
const tok = 'Bearer ' + tr.access_token

let ok = 0, fail = 0
for (const url of urls) {
  const r = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', { method: 'POST', headers: { Authorization: tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ url, type: 'URL_UPDATED' }) })
  if (r.status === 200) { ok++; console.log('OK   ' + url) }
  else { fail++; console.log(`FAIL ${r.status} ${url} :: ${(await r.text()).slice(0, 160)}`) }
  await new Promise((x) => setTimeout(x, 150))
}
console.log(`\nDONE ok=${ok} fail=${fail}  (quota: 200 URLs/day)`)
