#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

function readEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const env = {}

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const idx = line.indexOf('=')
    if (idx === -1) continue

    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    const inlineComment = value.indexOf(' #')
    if (inlineComment >= 0) value = value.slice(0, inlineComment).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

function parseArgs(argv) {
  const args = {}

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) continue

    const [key, inlineValue] = token.slice(2).split('=')
    if (inlineValue !== undefined) {
      args[key] = inlineValue
      continue
    }

    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      i += 1
    }
  }

  return args
}

function isEmpty(v) {
  return v == null || String(v).trim() === ''
}

async function getClient() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('Missing .env.local at project root')
  }

  const env = readEnvFile(envPath)
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function makeMissingFlags(row) {
  return {
    alt_es: isEmpty(row.cover_image_alt_es),
    alt_en: isEmpty(row.cover_image_alt_en),
    title_es: isEmpty(row.cover_image_title_es),
    title_en: isEmpty(row.cover_image_title_en),
    caption_es: isEmpty(row.cover_image_caption_es),
    caption_en: isEmpty(row.cover_image_caption_en),
    description_es: isEmpty(row.cover_image_description_es),
    description_en: isEmpty(row.cover_image_description_en),
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const status = String(args.status || 'published').trim()
  const outputJson = Boolean(args.json)

  const supabase = await getClient()
  const fields = [
    'id',
    'slug_es',
    'slug_en',
    'status',
    'published_at',
    'cover_image_public_id',
    'cover_image_url',
    'cover_image_alt_es',
    'cover_image_title_es',
    'cover_image_caption_es',
    'cover_image_description_es',
    'cover_image_alt_en',
    'cover_image_title_en',
    'cover_image_caption_en',
    'cover_image_description_en',
  ].join(',')

  let query = supabase.from('blog_posts').select(fields)
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) {
    throw error
  }

  const rows = data || []
  const totals = {
    scope: status,
    total_rows: rows.length,
    missing_alt_es: 0,
    missing_alt_en: 0,
    missing_title_es: 0,
    missing_title_en: 0,
    missing_caption_es: 0,
    missing_caption_en: 0,
    missing_description_es: 0,
    missing_description_en: 0,
  }

  const missingRows = []

  for (const row of rows) {
    const miss = makeMissingFlags(row)

    totals.missing_alt_es += miss.alt_es ? 1 : 0
    totals.missing_alt_en += miss.alt_en ? 1 : 0
    totals.missing_title_es += miss.title_es ? 1 : 0
    totals.missing_title_en += miss.title_en ? 1 : 0
    totals.missing_caption_es += miss.caption_es ? 1 : 0
    totals.missing_caption_en += miss.caption_en ? 1 : 0
    totals.missing_description_es += miss.description_es ? 1 : 0
    totals.missing_description_en += miss.description_en ? 1 : 0

    if (Object.values(miss).some(Boolean)) {
      missingRows.push({
        id: row.id,
        slug_es: row.slug_es,
        slug_en: row.slug_en,
        status: row.status,
        cover_image_public_id: row.cover_image_public_id,
        ...miss,
      })
    }
  }

  const report = {
    ok: missingRows.length === 0,
    totals,
    missing_rows_count: missingRows.length,
    missing_rows_sample: missingRows.slice(0, 50),
  }

  if (outputJson) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(`[blog-image-seo-audit] scope: ${report.totals.scope}`)
    console.log(`[blog-image-seo-audit] total rows: ${report.totals.total_rows}`)
    console.log('[blog-image-seo-audit] missing counters:')
    console.log(`  alt_es: ${report.totals.missing_alt_es}`)
    console.log(`  alt_en: ${report.totals.missing_alt_en}`)
    console.log(`  title_es: ${report.totals.missing_title_es}`)
    console.log(`  title_en: ${report.totals.missing_title_en}`)
    console.log(`  caption_es: ${report.totals.missing_caption_es}`)
    console.log(`  caption_en: ${report.totals.missing_caption_en}`)
    console.log(`  description_es: ${report.totals.missing_description_es}`)
    console.log(`  description_en: ${report.totals.missing_description_en}`)
    console.log(`[blog-image-seo-audit] rows with any missing field: ${report.missing_rows_count}`)

    if (report.missing_rows_count > 0) {
      console.log('[blog-image-seo-audit] sample rows with gaps:')
      for (const row of report.missing_rows_sample) {
        console.log(`  - ${row.id} | ${row.slug_es || row.slug_en || '(no slug)'}`)
      }
    }
  }

  if (!report.ok) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('[blog-image-seo-audit][ERROR]', error instanceof Error ? error.message : String(error))
  process.exit(1)
})
