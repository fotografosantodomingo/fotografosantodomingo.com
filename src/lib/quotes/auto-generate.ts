/**
 * Orchestrator for the auto dual-quote pipeline. Called (fire-and-forget,
 * independent of the existing plain lead alert) right after a new row lands
 * in public.quote_requests — see src/app/api/quote-request/route.ts.
 *
 * Prices two tiers straight from the real catalog (service_packages) — never
 * invents numbers — checks calendar availability for each, drafts both as
 * `quotes` rows, and emails the admin one alert with Approve/Deny per option.
 * Approval is handled by src/app/api/quote-option-action/route.ts.
 */

import { createServiceClient } from '@/lib/supabase/service'
import { generateProposalSlug } from './slug'
import { buildAutoQuoteActionLinks } from './action-links'
import { getPrimaryStaffId, findAvailableSlotOrAlternate } from './availability-check'
import { sendAdminDualQuoteAlert, type AdminQuoteOption } from '@/lib/email/quote-proposal'

export type GenerateDualQuoteInput = {
  quoteRequestId: string
  familyId: string | null
  locale: 'es' | 'en'
  eventDate: string | null
  customerName: string
  customerEmail: string
  customerPhone: string | null
}

type PackageRow = {
  id: string
  slug: string
  name_es: string
  name_en: string
  duration_min: number
  starting_price_usd: number
  inclusions_es: string[] | null
  inclusions_en: string[] | null
}

export async function generateAndSendDualQuoteOptions(input: GenerateDualQuoteInput): Promise<void> {
  if (!input.familyId) {
    // Generic "OTHER" RFQ — no catalog to price against. The plain lead
    // alert (sendQuoteRequestNotification) already went out; nothing more to do.
    return
  }

  const supabase = createServiceClient()

  const { data: packages, error: pkgErr } = await supabase
    .from('service_packages')
    .select('id, slug, name_es, name_en, duration_min, starting_price_usd, inclusions_es, inclusions_en')
    .eq('family_id', input.familyId)
    .eq('active', true)
    .eq('bookable_direct', true)
    .gt('starting_price_usd', 0)
    .order('starting_price_usd', { ascending: true })

  if (pkgErr) {
    console.error('generateAndSendDualQuoteOptions: package lookup failed:', pkgErr)
    return
  }
  if (!packages || packages.length === 0) {
    // No bookable priced packages for this family yet — nothing to auto-quote.
    return
  }

  const chosen: Array<{ pkg: PackageRow; label: 'cheaper' | 'premium' }> =
    packages.length === 1
      ? [{ pkg: packages[0], label: 'cheaper' }]
      : [{ pkg: packages[0], label: 'cheaper' }, { pkg: packages[1], label: 'premium' }]

  const staffId = await getPrimaryStaffId(supabase)
  if (!staffId) {
    console.error('generateAndSendDualQuoteOptions: no active staff member found')
    return
  }

  const isEs = input.locale === 'es'
  const adminOptions: AdminQuoteOption[] = []

  for (const { pkg, label } of chosen) {
    const availability = await findAvailableSlotOrAlternate(supabase, {
      staffId,
      requestedDateYmd: input.eventDate,
      durationMin: pkg.duration_min,
    })

    const packageName = isEs ? pkg.name_es : pkg.name_en
    const inclusions = (isEs ? pkg.inclusions_es : pkg.inclusions_en) ?? []
    const finalPriceUsd = Number(pkg.starting_price_usd)
    const depositUsd = Math.round(finalPriceUsd * 0.5 * 100) / 100
    const proposalSlug = generateProposalSlug(input.customerName)

    const { data: inserted, error: insErr } = await supabase
      .from('quotes')
      .insert({
        status: 'PENDING_REVIEW',
        auto_generated: true,
        quote_request_id: input.quoteRequestId,
        option_label: label,
        family_id: input.familyId,
        package_id: pkg.id,
        locale: input.locale,
        full_name: input.customerName,
        email: input.customerEmail,
        whatsapp_phone: input.customerPhone,
        event_date: input.eventDate,
        description: packageName,
        line_items: [{ description: packageName, amount_usd: finalPriceUsd }],
        final_price_usd: finalPriceUsd,
        deposit_amount_usd: depositUsd,
        payment_mode: 'DEPOSIT',
        proposal_slug: proposalSlug,
      })
      .select('id')
      .single()

    if (insErr || !inserted) {
      console.error(`generateAndSendDualQuoteOptions: insert failed for ${label} option:`, insErr)
      continue
    }

    const links = await buildAutoQuoteActionLinks(inserted.id)

    adminOptions.push({
      quoteId: inserted.id,
      label,
      packageName,
      durationMin: pkg.duration_min,
      inclusions,
      finalPriceUsd,
      depositUsd,
      availability,
      acceptUrl: links.acceptUrl,
      declineUrl: links.declineUrl,
    })
  }

  if (adminOptions.length === 0) return

  await sendAdminDualQuoteAlert({
    quoteRequestId: input.quoteRequestId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    eventDateRequested: input.eventDate,
    options: adminOptions,
  })

  await supabase.from('quote_requests').update({ status: 'QUOTED' }).eq('id', input.quoteRequestId)
}
