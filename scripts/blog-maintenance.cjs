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
  const args = { _: [] }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]

    if (!token.startsWith('--')) {
      args._.push(token)
      continue
    }

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

function chunk(arr, size) {
  const result = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function printUsage() {
  console.log('Usage:')
  console.log('  node scripts/blog-maintenance.cjs count')
  console.log('  node scripts/blog-maintenance.cjs archive --all-published [--dry-run]')
  console.log('  node scripts/blog-maintenance.cjs archive --ids <id1,id2> [--dry-run]')
  console.log('  node scripts/blog-maintenance.cjs archive --slugs <slug1,slug2> [--dry-run]')
  console.log('  node scripts/blog-maintenance.cjs restore --backup-file <path> [--dry-run]')
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

async function statusCounts(supabase) {
  const statuses = ['published', 'draft', 'archived']
  const counts = {}

  for (const status of statuses) {
    const { count, error } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', status)

    if (error) throw error
    counts[status] = count || 0
  }

  return counts
}

async function fetchRowsToArchive(supabase, args) {
  if (args['all-published']) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  if (args.ids) {
    const ids = String(args.ids)
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)

    if (ids.length === 0) return []

    const rows = []
    for (const part of chunk(ids, 100)) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .in('id', part)

      if (error) throw error
      rows.push(...(data || []))
    }

    return rows
  }

  if (args.slugs) {
    const slugs = String(args.slugs)
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)

    if (slugs.length === 0) return []

    const rows = []
    for (const slug of slugs) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .or(`slug_es.eq.${slug},slug_en.eq.${slug}`)
        .limit(1)

      if (error) throw error
      rows.push(...(data || []))
    }

    const seen = new Set()
    return rows.filter((row) => {
      if (seen.has(row.id)) return false
      seen.add(row.id)
      return true
    })
  }

  throw new Error('Archive requires one selector: --all-published, --ids, or --slugs')
}

async function archive(supabase, args) {
  const dryRun = Boolean(args['dry-run'])
  const rows = await fetchRowsToArchive(supabase, args)

  const backupDir = path.join(process.cwd(), 'scripts', 'backups')
  fs.mkdirSync(backupDir, { recursive: true })

  const backupPayload = {
    created_at: new Date().toISOString(),
    mode: args['all-published'] ? 'all-published' : args.ids ? 'ids' : 'slugs',
    total: rows.length,
    rows,
  }

  const backupPath = path.join(backupDir, `blog_posts_backup_${stamp()}.json`)
  fs.writeFileSync(backupPath, JSON.stringify(backupPayload, null, 2), 'utf8')

  if (dryRun || rows.length === 0) {
    console.log(
      JSON.stringify({
        ok: true,
        action: 'archive',
        dryRun,
        selected: rows.length,
        archived: 0,
        backupPath,
      })
    )
    return
  }

  const ids = rows.map((r) => r.id).filter(Boolean)
  let archived = 0

  for (const part of chunk(ids, 100)) {
    const { error } = await supabase
      .from('blog_posts')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .in('id', part)

    if (error) throw error
    archived += part.length
  }

  console.log(
    JSON.stringify({
      ok: true,
      action: 'archive',
      dryRun,
      selected: rows.length,
      archived,
      backupPath,
      sample: rows.slice(0, 10).map((r) => ({ id: r.id, slug_es: r.slug_es, slug_en: r.slug_en, status_before: r.status })),
    })
  )
}

function loadBackupRows(backupFileArg) {
  const backupPath = path.isAbsolute(backupFileArg)
    ? backupFileArg
    : path.join(process.cwd(), backupFileArg)

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`)
  }

  const parsed = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
  const rows = Array.isArray(parsed) ? parsed : parsed.rows

  if (!Array.isArray(rows)) {
    throw new Error('Backup file must contain an array or { rows: [...] } shape')
  }

  return { rows, backupPath }
}

async function restore(supabase, args) {
  const dryRun = Boolean(args['dry-run'])
  const backupFile = args['backup-file']
  if (!backupFile) {
    throw new Error('Restore requires --backup-file <path>')
  }

  const { rows, backupPath } = loadBackupRows(String(backupFile))
  const ids = rows.map((r) => r.id).filter(Boolean)

  if (dryRun || ids.length === 0) {
    console.log(
      JSON.stringify({
        ok: true,
        action: 'restore',
        dryRun,
        selected: ids.length,
        restored: 0,
        backupPath,
      })
    )
    return
  }

  let restored = 0
  for (const part of chunk(ids, 100)) {
    const { error } = await supabase
      .from('blog_posts')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .in('id', part)

    if (error) throw error
    restored += part.length
  }

  console.log(
    JSON.stringify({
      ok: true,
      action: 'restore',
      dryRun,
      selected: ids.length,
      restored,
      backupPath,
    })
  )
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const command = args._[0]

  if (!command || args.help || args.h) {
    printUsage()
    process.exit(command ? 0 : 1)
  }

  const supabase = await getClient()

  if (command === 'count') {
    const counts = await statusCounts(supabase)
    console.log(JSON.stringify({ ok: true, action: 'count', counts }))
    return
  }

  if (command === 'archive') {
    await archive(supabase, args)
    return
  }

  if (command === 'restore') {
    await restore(supabase, args)
    return
  }

  throw new Error(`Unknown command: ${command}`)
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, message: error.message }))
  process.exit(1)
})
