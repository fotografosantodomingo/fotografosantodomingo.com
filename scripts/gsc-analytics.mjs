#!/usr/bin/env node
// Deep SEO analysis over GSC Search Analytics API (service account, zero deps).
//   GSC_KEY=./fotografo-gsc-*.json GSC_SITE="https://www.fotografosantodomingo.com/" node scripts/gsc-analytics.mjs
// Pulls recent vs prior 28d windows and derives: low-hanging fruit, cannibalization,
// click/position drops, CTR-rewrite candidates, and intent clusters.

import { readFileSync } from 'node:fs'
import { createSign } from 'node:crypto'

const sa = JSON.parse(readFileSync(process.env.GSC_KEY || './gsc-service-account.json', 'utf8'))
const SITE = process.env.GSC_SITE || 'https://www.fotografosantodomingo.com/'
const b64 = (b) => Buffer.from(b).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

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

const TOK = await token()
async function query(body) {
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    method: 'POST', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`query ${r.status}: ${(await r.text()).slice(0, 200)}`)
  return (await r.json()).rows || []
}

// date helpers
const d = (offset) => { const x = new Date(); x.setUTCDate(x.getUTCDate() - offset); return x.toISOString().slice(0, 10) }
const REC = { start: d(30), end: d(3) }   // recent 28d (GSC lag ~2-3d)
const PRI = { start: d(58), end: d(31) }  // prior 28d
console.log(`# RANGE recent ${REC.start}..${REC.end} | prior ${PRI.start}..${PRI.end}\n`)

const [qRec, qPri, pRec, pPri, qpRec] = await Promise.all([
  query({ startDate: REC.start, endDate: REC.end, dimensions: ['query'], rowLimit: 25000 }),
  query({ startDate: PRI.start, endDate: PRI.end, dimensions: ['query'], rowLimit: 25000 }),
  query({ startDate: REC.start, endDate: REC.end, dimensions: ['page'], rowLimit: 25000 }),
  query({ startDate: PRI.start, endDate: PRI.end, dimensions: ['page'], rowLimit: 25000 }),
  query({ startDate: REC.start, endDate: REC.end, dimensions: ['query', 'page'], rowLimit: 25000 }),
])

const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0)
console.log(`## TOTALS (recent): clicks=${sum(qRec, 'clicks')} impressions=${sum(qRec, 'impressions')} queries=${qRec.length} pages=${pRec.length}`)
console.log(`## TOTALS (prior):  clicks=${sum(qPri, 'clicks')} impressions=${sum(qPri, 'impressions')} queries=${qPri.length}\n`)

const short = (u) => u.replace('https://www.fotografosantodomingo.com', '')
const fx = (n) => Number(n).toFixed(1)

// ── 1. LOW-HANGING FRUIT: position 8–20, sorted by impressions ───────────────
console.log('═══ 1. LOW-HANGING FRUIT (pozycja 8–20, dużo wyświetleń → szybkie wejście do TOP10) ═══')
const lhf = qRec.filter((r) => r.position >= 7.5 && r.position <= 20.5 && r.impressions >= 5)
  .sort((a, b) => b.impressions - a.impressions).slice(0, 25)
if (!lhf.length) console.log('  (brak fraz w tym przedziale z ≥5 wyświetleń)')
for (const r of lhf) console.log(`  impr=${r.impressions}  pos=${fx(r.position)}  clk=${r.clicks}  ctr=${fx(r.ctr * 100)}%  "${r.keys[0]}"`)

// ── 2. CANNIBALIZATION: same query ranking with 2+ pages ─────────────────────
console.log('\n═══ 2. KANIBALIZACJA (ta sama fraza, ≥2 URL-e konkurują) ═══')
const byQuery = {}
for (const r of qpRec) { (byQuery[r.keys[0]] ??= []).push({ page: r.keys[1], ...r }) }
const cann = Object.entries(byQuery)
  .filter(([, pages]) => pages.length >= 2 && pages.reduce((a, p) => a + p.impressions, 0) >= 8)
  .map(([q, pages]) => ({ q, pages: pages.sort((a, b) => b.impressions - a.impressions), tot: pages.reduce((a, p) => a + p.impressions, 0) }))
  .sort((a, b) => b.tot - a.tot).slice(0, 20)
if (!cann.length) console.log('  (brak wykrytej kanibalizacji)')
for (const c of cann) {
  console.log(`  "${c.q}" — ${c.pages.length} URL-e (impr=${c.tot}):`)
  for (const p of c.pages.slice(0, 4)) console.log(`      pos=${fx(p.position)} impr=${p.impressions} clk=${p.clicks}  ${short(p.page)}`)
}

// ── 3. DROPS: recent vs prior, by query and page ─────────────────────────────
console.log('\n═══ 3. SPADKI (recent vs poprzednie 28 dni) ═══')
function deltas(rec, pri, keyName) {
  const m = {}
  for (const r of pri) m[r.keys[0]] = r
  const out = []
  for (const r of rec) {
    const p = m[r.keys[0]]
    if (!p) continue
    out.push({ key: r.keys[0], dClicks: r.clicks - p.clicks, dPos: r.position - p.position, recC: r.clicks, priC: p.clicks, recP: r.position, priP: p.position, impr: r.impressions })
  }
  return out
}
const qd = deltas(qRec, qPri).filter((x) => x.priC + x.recC >= 3)
const clickDrops = qd.filter((x) => x.dClicks < 0).sort((a, b) => a.dClicks - b.dClicks).slice(0, 12)
const posDrops = qd.filter((x) => x.dPos >= 1.5 && x.impr >= 5).sort((a, b) => b.dPos - a.dPos).slice(0, 12)
console.log('  ↓ Spadki kliknięć (fraza):')
if (!clickDrops.length) console.log('     (brak)')
for (const x of clickDrops) console.log(`     ${x.dClicks} clk (${x.priC}→${x.recC})  pos ${fx(x.priP)}→${fx(x.recP)}  "${x.key}"`)
console.log('  ↓ Spadki pozycji (fraza, ≥5 impr):')
if (!posDrops.length) console.log('     (brak)')
for (const x of posDrops) console.log(`     pos ${fx(x.priP)}→${fx(x.recP)} (+${fx(x.dPos)})  impr=${x.impr}  "${x.key}"`)

const pd = deltas(pRec, pPri).filter((x) => x.priC + x.recC >= 3).filter((x) => x.dClicks < 0).sort((a, b) => a.dClicks - b.dClicks).slice(0, 10)
console.log('  ↓ Spadki kliknięć (URL):')
if (!pd.length) console.log('     (brak)')
for (const x of pd) console.log(`     ${x.dClicks} clk (${x.priC}→${x.recC})  ${short(x.key)}`)

// ── 4. CTR REWRITE CANDIDATES: top positions, low CTR, high impressions ──────
console.log('\n═══ 4. KANDYDACI DO PRZEPISANIA TITLE/META (pozycja 1–10, niski CTR, dużo impr) ═══')
const ctrCand = qRec.filter((r) => r.position <= 10.5 && r.impressions >= 10 && r.ctr < 0.04)
  .sort((a, b) => b.impressions - a.impressions).slice(0, 15)
if (!ctrCand.length) console.log('  (brak — albo mało danych, albo CTR zdrowy)')
for (const r of ctrCand) console.log(`  impr=${r.impressions} pos=${fx(r.position)} ctr=${fx(r.ctr * 100)}% clk=${r.clicks}  "${r.keys[0]}"`)

// ── 5. INTENT CLUSTERS ───────────────────────────────────────────────────────
console.log('\n═══ 5. KLASTRY INTENCJI (udział wyświetleń) ═══')
const brand = /babula|fotografosantodomingo/i
const local = /santo domingo|punta cana|cap cana|casa de campo|saona|samana|zona colonial|republica|dominican|bavaro|bayahibe/i
const trans = /precio|costo|cuanto|paquete|reserva|contratar|book|hire|cost|price|cerca|near me/i
const buckets = { brand: 0, transactional: 0, local: 0, informational: 0 }
for (const r of qRec) {
  const q = r.keys[0]
  if (brand.test(q)) buckets.brand += r.impressions
  else if (trans.test(q)) buckets.transactional += r.impressions
  else if (local.test(q)) buckets.local += r.impressions
  else buckets.informational += r.impressions
}
const totImpr = sum(qRec, 'impressions') || 1
for (const [k, v] of Object.entries(buckets).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(15)} ${fx(v / totImpr * 100)}%  (${v} impr)`)

console.log('\n# DONE')
