# Email Templates — Package-Aware Upgrade Plan

**Status**: Pre-Slice A readiness artifact #6
**Produced**: 2026-04-26
**Source of truth**: [BOOKING_REBUILD_BLUEPRINT.md](../BOOKING_REBUILD_BLUEPRINT.md) §1 commitment #8
**Scope**: implementation impact map only — no final copy. Final wording drafted during Slice A & E.

This document audits every email template currently sent by the application and identifies exactly where service-aware wording must become **family-aware + package-aware** under the new schema. Each entry lists the current input shape, the new input fields required, and the lines/sections inside the source file that need editing.

---

## 0 · Summary

| Source file | Functions | Slice A upgrade | Slice E upgrade | Status |
|---|---|---|---|---|
| `src/lib/email/bookings.ts` | 6 booking emails | ✅ ALL must be upgraded | — | **Slice A scope** |
| `src/lib/email/resend.ts` (quote/proposal flow) | 3 quote-flow emails | Optional | Recommended | **Slice E scope** |
| `src/lib/email/resend.ts` (contact + newsletter) | 3 generic emails | None | None | **Unchanged** |
| `src/lib/email/(new)` for `quote_requests` table | 2 NEW functions | — | ✅ NEW | **Slice E scope** |

**Total emails reviewed**: 11 existing + 2 new = 13.
**Slice A direct edits**: 6 (all in `bookings.ts`).
**Slice E direct edits**: 3 in `resend.ts` + 2 new functions = 5.

---

## 1 · `src/lib/email/bookings.ts` — 6 booking lifecycle emails (Slice A scope)

All 6 emails currently render the **service** name only (one of the 18 flat `booking_services` rows). After the rebuild they must render the **family** + **package** + **inclusions** so customers receive the exact context of what they bought.

### 1.1 Shared type — `BookingEmailContext` (line 58)

**Current shape** (`bookings.ts:58-71`):

```ts
export type BookingEmailContext = {
  bookingId: string
  customerName: string
  customerEmail: string
  locale: 'es' | 'en'
  serviceNameEs: string
  serviceNameEn: string
  serviceIcon: string
  durationMin: number
  startsAt: string
  endsAt: string
  staffName: string
  fullPriceUsd: number
  depositUsd: number
}
```

**Required new shape** (gain 7 fields, retain all existing for backwards compatibility):

```ts
export type BookingEmailContext = {
  bookingId: string
  customerName: string
  customerEmail: string
  locale: 'es' | 'en'

  // ── Family fields (NEW) ─────────────────────────────────────
  familySlug: string          // e.g. 'wedding-photography'
  familyTitleEs: string       // e.g. 'Bodas'
  familyTitleEn: string       // e.g. 'Wedding Photography'

  // ── Package fields (NEW; replace flat service*) ─────────────
  packageSlug: string          // e.g. 'full-day'
  packageNameEs: string        // e.g. 'Boda Día Completo'
  packageNameEn: string        // e.g. 'Full Day Wedding'
  inclusionsEs: string[]       // e.g. ['8h coverage', 'engagement session', ...]
  inclusionsEn: string[]
  photoCount: number | null    // optional, e.g. 200

  // ── Existing fields (preserved) ─────────────────────────────
  serviceIcon: string          // family.icon — stays for backwards compat
  durationMin: number
  startsAt: string
  endsAt: string
  staffName: string
  fullPriceUsd: number
  depositUsd: number

  // ── Deprecated (read from package_snapshot if present) ──────
  serviceNameEs?: string       // === packageNameEs; kept for transition
  serviceNameEn?: string       // === packageNameEn; kept for transition
}
```

**Helper update — `serviceName(ctx)` (line 95)**:
This 1-line helper currently returns `ctx.locale === 'es' ? ctx.serviceNameEs : ctx.serviceNameEn`. After the upgrade it returns `ctx.locale === 'es' ? ctx.packageNameEs : ctx.packageNameEn`. The `service*` aliases continue to work via the deprecated fields.

**Helper update — `appointmentCard(ctx)` (line 133)**:
The reusable card fragment that appears in every booking email currently shows:
```
Servicio: {icon} {serviceName}
Fecha:    ...
Hora:     ...
Duración: ...
Fotógrafo: ...
```

After the upgrade, it shows:
```
Familia:    {familyTitle}
Paquete:    {icon} {packageName}
{photoCount ? "Fotos: N" : ""}
Fecha:      ...
Hora:       ...
Duración:   ...
Fotógrafo:  ...
Incluye:    • inclusion 1
            • inclusion 2
            • ...
```

The bilingual labels ("Familia"/"Family", "Paquete"/"Package", "Incluye"/"Includes") are added inline in the helper.

### 1.2 Per-function impact

#### A. `sendBookingConfirmation` (line 167)
- **Trigger**: Stripe `payment_intent.succeeded` webhook
- **Recipient**: customer
- **Current copy refs**: lines 184 (subject `${serviceName(ctx)}`), 196 (body uses `appointmentCard`)
- **Upgrade**: subject becomes `✅ Tu reserva está confirmada — ${familyTitle} → ${packageName}`. Body uses upgraded `appointmentCard` (gains family + inclusions section). Deposit/balance breakdown stays.
- **No new fields beyond `BookingEmailContext`.**

#### B. `sendBookingAdminAlert` (line 255)
- **Trigger**: Stripe `payment_intent.succeeded` webhook (parallel to confirmation)
- **Recipient**: `info@fotografosantodomingo.com` + optional BCC
- **Current copy refs**: lines 269 (subject `${ctx.serviceNameEs}`), 280–298 (body)
- **Upgrade**: subject becomes `📅 Nueva reserva — ${familyTitleEs} → ${packageNameEs} · ${customerName}`. Body adds a "Family / Package" row pair to the customer info table.
- **No new fields beyond `BookingEmailContext & { customerPhone }`.**

#### C. `sendBookingReminder24h` (line 342)
- **Trigger**: cron `/api/cron/booking-reminders` (24h window)
- **Recipient**: customer
- **Current copy refs**: lines 358 (subject `${serviceName(ctx)}`), 370 (body uses `appointmentCard`)
- **Upgrade**: subject becomes `⏰ Tu sesión es mañana — ${packageName}`. Body uses upgraded `appointmentCard`. Add an "Inclusions reminder" section to reassure customers what's covered (taken from `inclusionsEs/En`).

#### D. `sendBookingReminderSameDay` (line 413)
- **Trigger**: cron (morning of session)
- **Recipient**: customer
- **Current copy refs**: lines 429 (subject), 441 (body uses `appointmentCard`)
- **Upgrade**: same pattern as 24h reminder. Subject `📸 Hoy es tu sesión — ${fmtTimeAst(ctx.startsAt)}` (no change needed; time-based subject works without package context). Body benefits from the upgraded card.

#### E. `sendBookingPostSession` (line 484)
- **Trigger**: cron (2-4h after session ends)
- **Recipient**: customer
- **Current copy refs**: lines 500 (subject — generic, no service refs), body refers to "the experience"
- **Upgrade**: subject can optionally become `🙏 Gracias por tu ${packageName.toLowerCase()}`. Body adds a brief recap line ("Esperamos que disfrutes tus fotos de ${packageName}") which gives the email more weight than a generic thank-you.

#### F. `sendBookingCancellation` (line 553)
- **Trigger**: admin cancel action (`/admin/bookings/[id]/actions.ts:cancelBooking`)
- **Recipient**: customer
- **Current copy refs**: lines 568 (subject `${serviceName(ctx)}`), body uses `appointmentCard`
- **Upgrade**: subject becomes `Reserva cancelada — ${packageName}`. Body uses upgraded card.
- **Note**: `cancelBooking` action in `src/app/admin/bookings/[id]/actions.ts` must also be updated to construct the new context fields when calling `sendBookingCancellation`. The booking row already has `package_snapshot` JSONB, so most fields can be read directly from there.

### 1.3 Source for the new fields — `package_snapshot` JSONB

The migration backfills `bookings.package_snapshot` for every booking. This JSONB column is the single source of truth for these emails post-rebuild:

```jsonc
{
  "family_slug":     "wedding-photography",
  "package_slug":    "full-day",
  "name_es":         "Boda Día Completo",
  "name_en":         "Full Day Wedding",
  "price_usd":       1800.00,
  "deposit_percent": 50,
  "duration_min":    480,
  "photo_count":     200,
  "inclusions_es":   ["8h cobertura", "Sesión de compromiso", "..."],
  "inclusions_en":   ["8h coverage", "Engagement session", "..."],
  "snapshotted_at":  "2026-04-26T15:00:00Z"
}
```

The webhook (`/api/stripe/booking-webhook/route.ts`) and the cron handler (`/api/cron/booking-reminders/route.ts`) both build the `BookingEmailContext` by joining `bookings + service_families + service_packages` AND/OR by reading directly from `package_snapshot`. Recommended approach: **always read from `package_snapshot`** so the email reflects what the customer actually purchased even if the package details change later.

---

## 2 · `src/lib/email/resend.ts` — quote/proposal flow (3 emails, Slice E scope)

The quote/proposal flow uses a separate set of types built around the legacy `serviceType` enum (e.g. `'WEDDINGS'`, `'ENGAGEMENT_SESSION'`). The `formatServiceLabel(serviceType, locale)` helper at line 256 maps these to localized strings.

### 2.1 Recommended approach — additive, not replacement

The existing `quotes` table (different from the new `quote_requests`) and its proposal flow are **not in scope for the family/package rebuild**. They serve a different use case (formal pricing proposals tied to Stripe checkout). Decision:

- **Keep** `quotes` table + the 3 emails below working unchanged in Slice A.
- **Defer** to Slice E whether to retire the `quotes` flow entirely OR keep both flows side-by-side.

If the user wants the quote-flow emails to ALSO show family/package context, the upgrade is straightforward (add optional fields, fall back to `serviceType` if not provided). Below is the impact map IF that's chosen.

### 2.2 Per-function impact (Slice E if selected)

#### A. `sendQuoteSubmissionNotification` (line 282)
- **Trigger**: `/api/quotes` POST (current /get-quote flow — to be retired in Slice E in favor of `/api/quote-requests`)
- **Recipient**: admin
- **Current shape**: `QuoteEmailPayload` with `serviceType` enum
- **Upgrade IF kept**: add optional `familySlug` + `packageSlug` fields. Subject gains family context. Body adds a "Selected service" section that links to the family/package pages.
- **Recommendation**: don't upgrade this function. Replace with new `sendQuoteRequestAdminAlert` for the new `quote_requests` table — see §3.

#### B. `sendQuoteSubmissionConfirmation` (line 344)
- **Trigger**: same as above
- **Recipient**: customer
- **Upgrade IF kept**: same pattern as A — add optional family/package fields, default to legacy `serviceType` rendering when absent.
- **Recommendation**: replace, not upgrade. See §3.

#### C. `sendProposalEmail` (line 391)
- **Trigger**: admin "Send Proposal" action in `/admin/quotes/[id]`
- **Recipient**: customer
- **Current shape**: `ProposalEmailData` includes `serviceType`, `finalPriceUsd`, `proposalUrl`
- **Status**: this email serves the proposal payment flow (where customer pays via Stripe Checkout from a unique URL). It is NOT replaced by the new quote_requests flow.
- **Upgrade**: Optional. If the quote was created from a family/package context, optionally show `${familyTitle} → ${packageName}` in the subject + body. If no context, fall back to `serviceLabel`.
- **Recommendation**: **upgrade in Slice E** (low effort, high value for customer clarity).

---

## 3 · NEW emails for `quote_requests` table (Slice E scope)

These don't exist today. They're added in Slice E when `/get-quote` is rebuilt to write to the new `quote_requests` table.

### 3.1 `sendQuoteRequestAdminAlert(supabase, ctx)` — NEW

**Trigger**: `/api/quote-requests` POST (new /get-quote backend)
**Recipient**: admin (`info@fotografosantodomingo.com`)

**Required input shape**:

```ts
type QuoteRequestEmailContext = {
  requestId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  locale: 'es' | 'en'

  // Optional context — may be null if generic RFQ
  familySlug?: string
  familyTitleEs?: string
  familyTitleEn?: string
  packageSlug?: string
  packageNameEs?: string
  packageNameEn?: string

  // Customer's free-text customization needs
  details: string
  eventDate?: string | null
  budgetUsd?: number | null

  // Provenance
  sourcePage?: string
  sourceCta?: string
}
```

**Body sections** (high-level):
1. New RFQ alert header (Spanish, since this goes to admin)
2. Customer info table (name, email, phone, locale)
3. Context block — IF family present, show "Solicitando: {family} → {package}"; if generic, "Solicitud genérica"
4. The customer's `details` text in a card
5. Optional event_date + budget if provided
6. Provenance footer (source page, CTA) — useful for analytics correlation
7. CTA button → `/admin/quote-requests/[id]`

### 3.2 `sendQuoteRequestConfirmation(supabase, ctx)` — NEW

**Trigger**: same as above
**Recipient**: customer (locale-aware)

**Body sections**:
1. "Recibimos tu solicitud" / "We received your request" header
2. Recap of what they were asking about (family + package if specified, or generic)
3. Their submitted details echoed back
4. Expected response time (e.g., "responderemos dentro de 4 horas")
5. WhatsApp escape hatch
6. Footer

### 3.3 Logging

Both functions should write to a similar audit log as `booking_email_log`. Either:
- **Option A**: extend the existing `booking_email_log` with a nullable `quote_request_id` column (one log table for everything)
- **Option B**: create `quote_request_email_log` mirror table

**Recommendation**: Option A — one unified log table covers both booking and quote-request emails, with FK to whichever entity. This keeps the audit story simple and admin-queryable.

If Option A: add to migration 015 (or a new 017):
```sql
ALTER TABLE public.booking_email_log
  ALTER COLUMN booking_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  ADD CONSTRAINT booking_email_log_one_target
    CHECK ((booking_id IS NOT NULL) OR (quote_request_id IS NOT NULL));
```

This decision can be made in Slice E; no impact on Slice A.

---

## 4 · `src/lib/email/resend.ts` — emails NOT requiring upgrade

| Function | Line | Why no upgrade |
|---|---|---|
| `sendContactNotification` | 36 | Generic contact form → admin alert. Not service-specific. |
| `sendContactConfirmation` | 117 | Generic "we got your message" → customer. Not service-specific. |
| `sendNewsletterWelcome` | 179 | Newsletter opt-in. Not service-specific. |

These three functions are unchanged across the entire rebuild.

---

## 5 · Implementation order (Slice A)

1. Update the `BookingEmailContext` type (line 58 of `bookings.ts`) — add 7 new fields, retain old as deprecated optionals.
2. Update `serviceName(ctx)` helper (line 95) — read from new fields, fall back to deprecated.
3. Update `appointmentCard(ctx)` helper (line 133) — render family + package + inclusions.
4. Per email function (A-F above): update subject string, add inclusion-list section where applicable.
5. Update both call sites to populate the new fields:
   - `src/app/api/stripe/booking-webhook/route.ts` — when sending confirmation + admin alert
   - `src/app/api/cron/booking-reminders/route.ts` — when sending 24h, same-day, post-session
   - `src/app/admin/bookings/[id]/actions.ts:cancelBooking` — when sending cancellation
6. Each of these call sites already loads the booking via the legacy view in Slice A; they must be updated to also read `package_snapshot` JSONB and project its fields into `BookingEmailContext`.

**Estimated effort**: ~2 hours for type + helpers + 6 functions + 3 call sites. All of it lives behind static type-checking, so the TS compiler will surface any missed call sites.

---

## 6 · Open decisions (deferred to user)

1. **Quote-flow upgrade scope**: keep `/admin/quotes` proposal flow unchanged forever (recommended), or upgrade `sendProposalEmail` to mention family/package when applicable in Slice E?
2. **Email log unification**: Option A (one log table) vs Option B (parallel tables)?
3. **Should email subjects show `{family} → {package}` always**, or only when the family/package is non-default? (e.g., a single-package family like "Drone Aerial" might just say "Drone Aerial" instead of "Drone Services → Drone Aerial".)

Default answers if no input:
1. → Upgrade `sendProposalEmail` only when an explicit `familySlug` is passed (additive optional)
2. → Option A (unified log)
3. → Always show full path; visual hierarchy in the email body keeps it scannable

---

**End of email upgrade plan. 6 emails to upgrade in Slice A. 2 new emails + 1 optional upgrade in Slice E.**
