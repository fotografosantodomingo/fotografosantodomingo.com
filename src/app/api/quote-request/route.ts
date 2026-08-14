import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { sendQuoteRequestNotification } from '@/lib/email/quote-requests'
import { generateAndSendDualQuoteOptions } from '@/lib/quotes/auto-generate'

export const runtime = 'edge'

/**
 * POST /api/quote-request
 *
 * Public quote-request intake. Writes ONLY to public.quote_requests.
 * Server resolves family_slug + package_slug to family_id + package_id.
 *
 * Anti-spam:
 *   - honeypot field `_hp` must be empty/missing
 *   - `_form_started_at` (epoch ms) must be at least 3 seconds old if present
 *
 * Returns:
 *   201 { id }              on success
 *   400                     on validation / spam
 *   500                     on DB failure
 */

const HONEYPOT_FIELD = '_hp'
const MIN_FORM_DWELL_MS = 3_000

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const Body = z.object({
  family_slug: z.string().regex(SLUG_RE).optional(),
  package_slug: z.string().regex(SLUG_RE).optional(),
  client_name: z.string().trim().min(1).max(200),
  client_email: z.string().trim().email().max(200),
  client_phone: z.string().trim().max(50).optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  location_text: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(5000).optional(),
  locale: z.enum(['es', 'en']).default('es'),
  source_page: z.string().trim().max(200).optional(),
  source_cta: z.string().trim().max(100).optional(),
  // Geo-block attribution from /services/<family>#<city> CTAs.
  attribution_city: z.string().trim().min(1).max(100).optional(),
  // Anti-spam fields (clients should send empty honeypot + form-load timestamp)
  [HONEYPOT_FIELD]: z.string().max(0).optional(),
  _form_started_at: z.number().int().nonnegative().optional(),
})

/**
 * Stable error codes the client maps to localized user-facing messages
 * (see src/lib/quotes/error-messages.ts). When adding a new failure
 * mode, add an entry here AND to the error-messages map so ES users
 * get a translated message instead of an English string.
 */
type QuoteApiErrorCode =
  | 'invalid_json'
  | 'validation_failed'
  | 'spam_blocked'
  | 'unknown_family'
  | 'unknown_package'
  | 'family_lookup_failed'
  | 'package_lookup_failed'
  | 'insert_failed'

function errorResponse(code: QuoteApiErrorCode, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: code, ...extra }, { status })
}

export async function POST(request: NextRequest) {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return errorResponse('invalid_json', 400)
  }

  const parsed = Body.safeParse(raw)
  if (!parsed.success) {
    return errorResponse('validation_failed', 400, { details: parsed.error.flatten() })
  }

  const data = parsed.data

  // Spam: honeypot must be empty/missing — Zod already enforces max(0), so any
  // value here is a bot. Reject silently with a generic 400.
  if (data[HONEYPOT_FIELD]) {
    return errorResponse('spam_blocked', 400)
  }

  // Spam: dwell-time check. If client sent a start timestamp, require at
  // least MIN_FORM_DWELL_MS to have elapsed. If absent, accept (older clients).
  if (data._form_started_at !== undefined) {
    const dwell = Date.now() - data._form_started_at
    if (dwell < MIN_FORM_DWELL_MS) {
      return errorResponse('spam_blocked', 400)
    }
  }

  const supabase = createServiceClient()

  // Resolve family + package slugs to UUIDs.
  let familyId: string | null = null
  let packageId: string | null = null

  if (data.family_slug) {
    const { data: famRow, error: famErr } = await supabase
      .from('service_families')
      .select('id')
      .eq('slug', data.family_slug)
      .eq('active', true)
      .maybeSingle()

    if (famErr) {
      console.error('quote-request family lookup error:', famErr)
      return errorResponse('family_lookup_failed', 500)
    }
    if (!famRow) {
      return errorResponse('unknown_family', 400)
    }
    familyId = famRow.id

    if (data.package_slug) {
      const { data: pkgRow, error: pkgErr } = await supabase
        .from('service_packages')
        .select('id')
        .eq('family_id', familyId)
        .eq('slug', data.package_slug)
        .eq('active', true)
        .maybeSingle()

      if (pkgErr) {
        console.error('quote-request package lookup error:', pkgErr)
        return errorResponse('package_lookup_failed', 500)
      }
      if (!pkgRow) {
        return errorResponse('unknown_package', 400)
      }
      packageId = pkgRow.id
    }
  }

  // Compose the customer's free-text details — stored in quote_requests.details
  // (NOT NULL). Combine notes + location to fit the schema's single text field.
  const detailsParts: string[] = []
  if (data.notes) detailsParts.push(data.notes)
  if (data.location_text) detailsParts.push(`Location: ${data.location_text}`)
  const details = detailsParts.length > 0
    ? detailsParts.join('\n\n')
    : `Quote request from ${data.client_name}`

  const insertPayload = {
    family_id: familyId,
    package_id: packageId,
    customer_name: data.client_name,
    customer_email: data.client_email,
    customer_phone: data.client_phone ?? null,
    locale: data.locale,
    details,
    event_date: data.event_date ?? null,
    source_page: data.source_page ?? null,
    source_cta: data.source_cta ?? null,
    attribution_city: data.attribution_city ?? null,
    status: 'NEW' as const,
  }

  const { data: inserted, error: insErr } = await supabase
    .from('quote_requests')
    .insert(insertPayload)
    .select('id, created_at')
    .single()

  if (insErr) {
    console.error('quote-request insert error:', insErr)
    return errorResponse('insert_failed', 500)
  }

  // Best-effort context lookup for the admin notification email. If either
  // resolves to null we send what we have — never block the customer's
  // success response.
  let familyTitle: string | null = null
  if (familyId) {
    const { data: famRow } = await supabase
      .from('service_families')
      .select('title_es, title_en')
      .eq('id', familyId)
      .maybeSingle()
    if (famRow) {
      familyTitle = data.locale === 'es' ? famRow.title_es : famRow.title_en
    }
  }
  let packageName: string | null = null
  let packageStartingPriceUsd: number | null = null
  if (packageId) {
    const { data: pkgRow } = await supabase
      .from('service_packages')
      .select('name_es, name_en, starting_price_usd')
      .eq('id', packageId)
      .maybeSingle()
    if (pkgRow) {
      packageName = data.locale === 'es' ? pkgRow.name_es : pkgRow.name_en
      packageStartingPriceUsd = Number(pkgRow.starting_price_usd)
    }
  }

  // Fire and forget — admin notification failure never blocks the customer
  await sendQuoteRequestNotification({
    id: inserted.id,
    customerName: data.client_name,
    customerEmail: data.client_email,
    customerPhone: data.client_phone ?? null,
    locale: data.locale,
    details,
    eventDate: data.event_date ?? null,
    familyTitle,
    packageName,
    packageStartingPriceUsd,
    sourcePage: data.source_page ?? null,
    sourceCta: data.source_cta ?? null,
    submittedAt: inserted.created_at,
  }).catch(err => {
    console.error('quote-request admin notification dispatch failed:', err)
  })

  // Awaited (not truly fire-and-forget) — same reason as the notification
  // call above: this runs on Cloudflare's edge runtime, which can tear down
  // the execution context as soon as a response is returned, silently
  // killing any un-awaited promise (there's no ctx.waitUntil exposed here).
  // .catch() keeps a failure here from ever blocking or failing the
  // customer's response, separate from the plain lead alert above.
  await generateAndSendDualQuoteOptions({
    quoteRequestId: inserted.id,
    familyId,
    locale: data.locale,
    eventDate: data.event_date ?? null,
    customerName: data.client_name,
    customerEmail: data.client_email,
    customerPhone: data.client_phone ?? null,
  }).catch(err => {
    console.error('quote-request auto dual-quote pipeline failed:', err)
  })

  return NextResponse.json({ id: inserted.id }, { status: 201 })
}
