#!/usr/bin/env node
/**
 * Supabase data backup — JSON snapshot of every public table.
 *
 *   node scripts/backup-supabase.cjs
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
 * and dumps every table listed in TABLES below to a timestamped JSON file
 * under scripts/backups/.
 *
 * Note: this is a *data-only* backup. Schema (tables, indexes, functions,
 * RLS policies) lives in supabase/migrations/ which is already in git, so
 * you can recreate the DB by replaying migrations + restoring this JSON.
 *
 * For a true pg_dump-style backup (schema + data + roles), use
 *   `supabase db dump --linked --file backup.sql`
 * after providing the DB password.
 */

const fs = require('node:fs')
const path = require('node:path')

// ─── Tables to back up (one per CREATE TABLE in supabase/migrations/) ─────
const TABLES = [
  'admin_users',
  'automation_logs',
  'availability_overrides',
  'availability_rules',
  'blog_posts',
  'booking_email_log',
  'booking_services',
  'bookings',
  'contact_submissions',
  'newsletter_subscriptions',
  'portfolio_images',
  'quotes',
  'reviews',
  'staff_members',
]

// ─── Load credentials from .env.local ─────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local')
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=')
      let v = l.slice(idx + 1).trim()
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
      return [l.slice(0, idx).trim(), v]
    })
)

const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const PAGE = 1000

async function fetchTable(table) {
  const rows = []
  let offset = 0
  while (true) {
    const res = await fetch(
      `${URL}/rest/v1/${table}?select=*&limit=${PAGE}&offset=${offset}`,
      {
        headers: {
          apikey: KEY,
          authorization: `Bearer ${KEY}`,
          accept: 'application/json',
          prefer: 'count=exact',
        },
      }
    )
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`HTTP ${res.status} on ${table}: ${body.slice(0, 200)}`)
    }
    const batch = await res.json()
    rows.push(...batch)
    if (batch.length < PAGE) break
    offset += PAGE
  }
  return rows
}

// ─── Main ─────────────────────────────────────────────────────────────────
;(async () => {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) // 2026-04-25T20-30-00
  const outDir = path.join(__dirname, 'backups')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `supabase_full_${ts}.json`)

  const manifest = {
    backed_up_at: new Date().toISOString(),
    source_url: URL,
    tables: {},
  }
  const dump = { _manifest: manifest }
  let totalRows = 0
  const errors = []

  for (const table of TABLES) {
    process.stdout.write(`  ${table.padEnd(30)} `)
    try {
      const rows = await fetchTable(table)
      dump[table] = rows
      manifest.tables[table] = { rows: rows.length }
      totalRows += rows.length
      process.stdout.write(`${rows.length} rows\n`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      manifest.tables[table] = { error: msg }
      errors.push(`${table}: ${msg}`)
      process.stdout.write(`ERROR — ${msg.split('\n')[0]}\n`)
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(dump, null, 2))
  const sizeMb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2)

  console.log()
  console.log(`✓ Wrote ${outPath}`)
  console.log(`  ${TABLES.length} tables · ${totalRows} total rows · ${sizeMb} MB`)
  if (errors.length) {
    console.log(`\n⚠ ${errors.length} table(s) failed:`)
    for (const e of errors) console.log(`  - ${e}`)
    process.exit(2)
  }
})().catch(err => {
  console.error('\nBackup failed:', err)
  process.exit(1)
})
