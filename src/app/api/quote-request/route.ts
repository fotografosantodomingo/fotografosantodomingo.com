import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { sendQuoteRequestNotification } from '@/lib/email/quote-requests'

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

export async function POST(request: NextRequest) {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = Body.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Spam: honeypot must be empty/missing — Zod already enforces max(0), so any
  // value here is a bot. Reject silently with a generic 400.
  if (data[HONEYPOT_FIELD]) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  // Spam: dwell-time check. If client sent a start timestamp, require at
  // least MIN_FORM_DWELL_MS to have elapsed. If absent, accept (older clients).
  if (data._form_started_at !== undefined) {
    const dwell = Date.now() - data._form_started_at
    if (dwell < MIN_FORM_DWELL_MS) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
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
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    if (!famRow) {
      return NextResponse.json({ error: 'Unknown family_slug' }, { status: 400 })
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
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
      if (!pkgRow) {
        return NextResponse.json(
          { error: 'Unknown package_slug for this family' },
          { status: 400 }
        )
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
    return NextResponse.json({ error: 'Failed to create quote request' }, { status: 500 })
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

  return NextResponse.json({ id: inserted.id }, { status: 201 })
}
