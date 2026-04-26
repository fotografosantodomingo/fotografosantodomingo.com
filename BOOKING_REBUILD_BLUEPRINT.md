# Booking System Rebuild — Canonical Implementation Blueprint

**Status**: LOCKED — implementation begins on receipt of canonical package matrix.
**Approved**: 2026-04-26
**Supersedes**: ad-hoc Sprint 1–5 plans, the master file dated 2026-04-25, my 8 senior corrections, the user's 10 architectural corrections.

---

## 0 · Governing Principle — Customer Decision States

Every page, component, and CTA on the site exists to serve **exactly one** of these six customer states. If a surface doesn't map to a state, it shouldn't exist.

| # | State | What the customer is doing | What we must give them |
|---|---|---|---|
| 1 | **Discovery / Browsing** | Arriving from search or social, scanning what's offered | A premium first impression + intent routing (3 paths: Prices / Services / Custom Quote) |
| 2 | **Comparing options** | Inside a service family, weighing packages | Package compare with "most booked" / "best value" badges, included items, deposit |
| 3 | **Validating trust** | Reading SEO content, checking testimonials, FAQ | Authority content + commercial decision block embedded in-page |
| 4 | **Selecting package** | Decided on a family, picking the SKU | Single-click reserve from compare page or SEO page commercial block |
| 5 | **Booking exact package** | Arrived at /book with `?family=X&package=Y` | Reassurance-rich checkout: package summary, deposit, remaining, reschedule policy, security, WhatsApp escape hatch |
| 6 | **Requesting custom package** | None of the SKUs fit | Service-aware RFQ that preloads family + package context, asks targeted customization questions |

Every CTA on the site is graded by which state it serves. State transitions must be deterministic — no orphan paths, no generic fallbacks.

---

## 1 · Architectural Commitments (10 non-negotiables)

| # | Commitment | Source |
|---|---|---|
| 1 | **Additive migration** — `booking_services` becomes a backwards-compat view over `service_packages`. Old code keeps running during transition. No flag day. | User-approved |
| 2 | **Single source of truth** — package data lives in `service_packages` only. Homepage, /services, /prices, SEO pages, /book, /get-quote, emails all read from this. Zero hardcoded prices anywhere. | User Correction #6 |
| 3 | **Family slugs = existing SEO URLs** — `/services/wedding-photography` is the indexed URL; family slug must be `wedding-photography` so internal linking and breadcrumbs preserve equity. | My recommendation #8 |
| 4 | **No URL loss** — every currently indexed URL keeps its 200 OK. New URLs are additive. Any rename ships with a 301 in `next.config.js` redirects. | Master file Section 2A |
| 5 | **Schema preservation** — existing FAQPage, LocalBusiness, Service, BreadcrumbList stay rendered. New commercial block injects AFTER FAQPage schema, never inside or above it. | Master file Section 2B |
| 6 | **Bilingual + theme parity** — every new surface ships with ES + EN copy from day one and renders correctly in light + dark. No "we'll translate later". | Master file Sections 2D + 2E |
| 7 | **Admin parity** — every new entity (families, packages, pricing, active flags) is manageable from `/admin/*` without dev intervention. | User Correction #5 |
| 8 | **Package-aware emails** — confirmation, admin alert, reminders, post-session, cancellation all show family + package + inclusions. | User Correction #9 |
| 9 | **Data-driven scarcity** — any "fills fast" / "weekends booking up" copy reads live availability. No static dark patterns. | My recommendation #6 |
| 10 | **Live bookings preserved** — the 3 confirmed bookings + 4 email_log entries currently in production survive the migration with no data loss and no manual cleanup. | Hard requirement |

---

## 2 · Pre-Slice A Deliverables (artifacts that must exist before code is written)

These four artifacts gate the start of Slice A. Two of them are mine to produce; two are shared with the user.

### 2.1 Canonical Package Matrix (USER-PROVIDED — awaited)
The XLS-equivalent spreadsheet of every family + package row with: family, slug, name_es, name_en, duration, price_usd, deposit_percent, photo_count, deliverables (ES + EN), bookable_direct, custom_quote_allowed.
**Status**: awaited from user.

### 2.2 Master CTA Destination Audit (USER CORRECTION #8 — I produce, user reviews)
A single document mapping **every** CTA currently rendered on the site to:
- Current href
- Future deterministic href (with `?family=…&package=…` params where applicable)
- Customer Decision State served
- Page where it appears
This audit ships as `docs/cta-audit.md` and is reviewed before Slice B begins.

### 2.3 Analytics Event Plan (USER CORRECTION #10)
The seven canonical events, with property schemas, fired through Vercel Analytics + GA4 from Slice A onward:

```ts
view_family            { family_slug, locale }
view_package_compare   { family_slug, locale, source: 'services' | 'prices' | 'seo_page' }
click_book_package     { family_slug, package_slug, locale, source }
start_checkout         { family_slug, package_slug, locale, deposit_usd }
complete_deposit       { family_slug, package_slug, locale, deposit_usd, booking_id }
start_custom_quote     { family_slug?, package_slug?, locale, source }
submit_custom_quote    { family_slug?, package_slug?, locale }
```

A `lib/analytics/booking-events.ts` helper exposes typed wrappers. All booking-related components use it; no `gtag` calls outside this module.

### 2.4 `package_snapshot` Schema (My recommendation #5)
The frozen audit trail saved to `bookings.package_snapshot` at booking time:

```json
{
  "family_slug": "wedding-photography",
  "package_slug": "full-day",
  "name_es": "Boda Día Completo",
  "name_en": "Full Day Wedding",
  "price_usd": 1800.00,
  "deposit_percent": 50,
  "duration_min": 480,
  "photo_count": 200,
  "inclusions_es": ["..."],
  "inclusions_en": ["..."],
  "snapshotted_at": "2026-04-26T15:00:00Z"
}
```

Used by refunds, dispute resolution, accounting reports — and by the Stripe metadata so we never lose the context of what was sold.

---

## 3 · Database Architecture

### 3.1 New canonical tables

```sql
-- service_families: parent SEO + commercial entity
CREATE TABLE public.service_families (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,           -- = existing /services/<slug>
  title_es        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  tagline_es      TEXT,
  tagline_en      TEXT,
  icon            TEXT NOT NULL DEFAULT '📷',
  seo_parent_url  TEXT NOT NULL,                  -- /services/<slug>
  bookable        BOOLEAN NOT NULL DEFAULT true,
  quoteable       BOOLEAN NOT NULL DEFAULT true,
  active          BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- service_packages: child SKUs (the bookable units)
CREATE TABLE public.service_packages (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id              UUID NOT NULL REFERENCES public.service_families(id) ON DELETE RESTRICT,
  slug                   TEXT NOT NULL,
  name_es                TEXT NOT NULL,
  name_en                TEXT NOT NULL,
  description_short_es   TEXT,
  description_short_en   TEXT,
  inclusions_es          TEXT[] NOT NULL DEFAULT '{}',
  inclusions_en          TEXT[] NOT NULL DEFAULT '{}',
  duration_min           INTEGER NOT NULL CHECK (duration_min > 0),
  starting_price_usd     NUMERIC(10,2) NOT NULL CHECK (starting_price_usd >= 0),
  deposit_percent        INTEGER NOT NULL DEFAULT 50 CHECK (deposit_percent BETWEEN 0 AND 100),
  photo_count            INTEGER,
  bookable_direct        BOOLEAN NOT NULL DEFAULT true,
  custom_quote_allowed   BOOLEAN NOT NULL DEFAULT true,
  featured               BOOLEAN NOT NULL DEFAULT false,
  popular_badge          TEXT,                      -- 'most_booked' | 'best_value' | NULL
  active                 BOOLEAN NOT NULL DEFAULT true,
  sort_order             INTEGER NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (family_id, slug)
);

-- bookings: gains family + package + snapshot + provenance
ALTER TABLE public.bookings ADD COLUMN family_id        UUID REFERENCES public.service_families(id);
ALTER TABLE public.bookings ADD COLUMN package_id       UUID REFERENCES public.service_packages(id);
ALTER TABLE public.bookings ADD COLUMN package_snapshot JSONB;
ALTER TABLE public.bookings ADD COLUMN source_page      TEXT;        -- '/services/wedding-photography', '/prices', '/'
ALTER TABLE public.bookings ADD COLUMN source_locale    TEXT;        -- 'es' | 'en'
ALTER TABLE public.bookings ADD COLUMN source_cta       TEXT;        -- 'compare_reserve', 'seo_block_reserve', etc.

-- quote_requests: brand-new (replaces /get-quote's flat submission)
CREATE TABLE public.quote_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id       UUID REFERENCES public.service_families(id),
  package_id      UUID REFERENCES public.service_packages(id),  -- nullable: customer may request without a package context
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT,
  locale          TEXT NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'en')),
  details         TEXT NOT NULL,                    -- the customer's customization needs
  event_date      DATE,                              -- optional
  budget_usd      NUMERIC(10,2),                     -- optional
  source_page     TEXT,
  source_cta      TEXT,
  status          TEXT NOT NULL DEFAULT 'NEW',       -- NEW | REVIEWING | QUOTED | WON | LOST
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- backwards-compat view: lets Sprint 1-4 code keep working during migration
CREATE OR REPLACE VIEW public.booking_services AS
  SELECT
    p.id,
    p.slug,
    p.name_es,
    p.name_en,
    p.description_short_es AS description_es,
    p.description_short_en AS description_en,
    f.icon,
    f.slug AS category,                              -- maps to old `category` field
    p.duration_min,
    p.starting_price_usd AS price_usd,
    p.deposit_percent,
    p.bookable_direct AS bookable,
    p.active,
    p.sort_order
  FROM public.service_packages p
  JOIN public.service_families f ON f.id = p.family_id
  WHERE p.active = true AND f.active = true;
```

### 3.2 Migration of the 3 live bookings

For each existing booking in production:
1. Look up its `service_id` in old `booking_services`
2. Resolve the matching family + package in the new tables
3. `UPDATE bookings SET family_id = ?, package_id = ?, package_snapshot = ? WHERE id = ?`

This runs inside a single transaction in the migration so either all 3 update or none.

---

## 4 · Slice Plan (revised to absorb the 10 corrections)

### Slice A — Data layer + admin parity + email packaging
**Phases covered**: 1, 2, parts of 3, parts of 9 (analytics from day 1).
**Deliverables**:
- Migration `015_service_families_and_packages.sql` — new tables, view, FK additions, live booking back-fill (transactional)
- Seed migration `016_seed_packages.sql` — populated from canonical package matrix (awaiting user)
- `src/lib/services/data.ts` — typed accessors (`getFamilies`, `getPackagesByFamily`, `getPackageBySlug`)
- `src/lib/analytics/booking-events.ts` — typed Vercel Analytics + GA4 wrapper for the 7 events
- `/admin/booking-services` REPLACED with `/admin/families` + `/admin/families/[slug]/packages` (CRUD)
- Email templates extended: `BookingEmailContext` gains `packageName` / `packageInclusions` / `familyTitle`; all 6 functions updated
- Confirmation email shows: "Wedding Photography → Full Day, 8h coverage, 200 photos"
- Admin alert email shows package + family
- `bookings.package_snapshot` populated on every new booking (via webhook update)

**Verification gate**: I produce a before/after dump of the DB and a list of every booking row showing the new family/package/snapshot fields populated. User approves before Slice B.

### Slice B — Catalog UI + package compare (both forms)
**Phases covered**: 4, 5, 6.
**Deliverables**:
- `src/app/[locale]/services/[family]/packages/page.tsx` — standalone compare page per family (SEO-indexed, full content, breadcrumbs, hreflang)
- `src/components/booking/PackageCompareModule.tsx` — embeddable version of the same UI, used by SEO pages and homepage
- `/services` rebuilt as **family navigator** — premium family blocks with dual CTA (Ver detalles / Ver paquetes)
- `/prices` rebuilt as **transactional catalog** — family cards with "starting from", package count, duration range, dual CTA (Ver paquetes / Paquete personalizado)
- "Most booked" / "Best value" badges driven by `service_packages.popular_badge`

**Verification gate**: visual review on Cloudflare preview URL, ES + EN, light + dark.

### Slice C — SEO page injection + commercial blocks
**Phases covered**: 7.
**Deliverables**:
- `src/components/booking/CommercialDecisionBlock.tsx` — drop-in component for SEO pages
- Injected into all `/services/<slug>` pages AFTER the trust/expertise section, BEFORE long guide content, AFTER FAQ schema
- Internal linking from each commercial block into the family's compare page
- Schema validator pass: existing FAQPage, LocalBusiness, Service all still parse correctly

**Verification gate**: Google Rich Results Test pass on 3 representative pages (wedding, drone, proposal).

### Slice D — Homepage full rebuild
**Phases covered**: 8.
**Deliverables**:
- New `/[locale]/page.tsx` — intent router with above-fold 3-CTA split (Prices / Services / Custom Quote)
- Trust strip (10+ years, bilingual, 50% deposit, fast response, islandwide)
- Featured family blocks (each with dual CTA)
- Real testimonials carousel (existing data)
- "How booking works in 3 steps"
- Data-driven urgency module (reads live availability — only renders when <20% weekend slots free)
- Final CTA split

**Verification gate**: visual review + analytics events firing on every CTA click.

### Slice E — Smart RFQ + checkout reassurance + global CTA rewire
**Phases covered**: parts of 3 (deferred from Slice A), parts of 9, 10–13.
**Deliverables**:
- `/get-quote` — full rebuild as service-aware RFQ. Query params `?family=…&package=…` preload context (visible card showing what they're customizing). Form fields adapt to family. Inserts into `quote_requests`. Admin notification email package-aware.
- `/book` — reassurance layer added: package summary, included items, total price, deposit due now, remaining due on session day, reschedule policy, payment security, WhatsApp escape hatch. Renders when `?family=…&package=…` params present.
- Master CTA Audit executed: every `<Link>` and `<a>` re-pointed per audit document
- Footer reduced to family pages + quote (per Section 14)
- ES/EN diff sweep
- Light/dark sweep
- Schema/rich snippet QA
- Full funnel E2E test: every Customer Decision State path works, in both locales, with analytics events firing correctly

---

## 5 · Single Source of Truth Operationalization (Correction #6)

To enforce zero hardcoded prices:

1. **Lint rule**: a regex-based check in CI that fails if files outside `src/lib/services/data.ts` and `supabase/migrations/*` contain `\$\d{2,5}` followed by a service-related word. Catches future drift.
2. **Build-time data fetch**: SEO pages, /prices, /services, /book all `await getFamilies()` from Supabase at request time (already runtime='edge' compatible).
3. **Email templates** read package fields from the booking row's `package_snapshot` JSONB, not hardcoded strings.
4. **Constants file** `src/lib/bookings/constants.ts` keeps non-pricing constants only (timezone, intervals, advance windows). Any pricing constant gets removed and read from DB.

---

## 6 · CTA Audit Framework (Correction #8 / Master Section 14)

Output: `docs/cta-audit.md` — produced before Slice B begins.

Format per row:

| Surface | Element | Current href | New href | State served | Notes |
|---|---|---|---|---|---|
| Homepage hero | "Ver Servicios" | `/[locale]/services` | `/[locale]/services` (unchanged) | Discovery | Family navigator already correct |
| `/services` cards | "Reservar" | `/[locale]/book?service=<slug>` | `/[locale]/book?family=<family>&package=<default-package>` | Selecting | Use the family's `featured: true` package as default |
| `/prices` cards | "Reservar" | `/[locale]/book?service=<slug>` | `/[locale]/services/<family>/packages` | Comparing | Route to compare, NOT directly to book — give them the SKU choice |
| `/prices` cards | "Cotizar" | `/[locale]/get-quote` | `/[locale]/get-quote?family=<family>` | Custom | Preserves family context |
| Nav (desktop + mobile + footer) | "Reservar Ahora" | `/[locale]/book` | `/[locale]/services` | Discovery | Without context, route to the navigator |
| Email CTA "Reschedule" | `mailto:` | `https://wa.me/...` with prefilled msg | Selecting | WhatsApp is the existing reschedule path |
| Footer "Book Now" | `/[locale]/book` | `/[locale]/services` | Discovery | Same as nav |

Every CTA on every surface, both locales. ~80–120 rows expected.

---

## 7 · Admin UI Specification (Correction #5)

Replaces `/admin/booking-services` (flat CRUD) with a 2-level hierarchical UI:

- `/admin/families` — list view, drag-to-reorder, toggle active, edit family meta (titles, taglines, icon, slug)
- `/admin/families/[slug]` — family detail with embedded packages list
- `/admin/families/[slug]/packages/[id]` — package edit (name ES/EN, duration, price, deposit %, inclusions array, photo count, bookable_direct, custom_quote_allowed, featured, popular_badge)
- `/admin/quote-requests` — list of `quote_requests` rows, filter by status, mark as REVIEWING/QUOTED/WON/LOST
- `/admin/bookings` and `/admin/bookings/[id]` keep working through Slice A via the backwards-compat view; in Slice E they get updated to display family + package + inclusions

---

## 8 · Booking Page Reassurance Layer (Correction #7)

When `/book?family=…&package=…` loads:

```
┌─────────────────────────────────────────────────┐
│  📸 Wedding Photography → Full Day Package      │
│  "Cobertura completa de 8 horas..."             │
├─────────────────────────────────────────────────┤
│  ✓ 8 horas de cobertura                         │
│  ✓ Sesión de compromiso incluida                │
│  ✓ 200 fotos editadas en alta resolución        │
│  ✓ Álbum profesional                            │
│  ✓ Galería online privada                       │
├─────────────────────────────────────────────────┤
│  Precio total      $1,800 USD                   │
│  Depósito hoy      $900 USD (50%)               │
│  Saldo el día      $900 USD                     │
├─────────────────────────────────────────────────┤
│  ↻ Puedes reagendar hasta 72h antes sin costo   │
│  🔒 Pago seguro vía Stripe — no guardamos tarjeta│
│  💬 ¿Dudas? WhatsApp +1 (809) 720-9547          │
└─────────────────────────────────────────────────┘
```

Renders ABOVE the date/time wizard. Pulled live from `service_packages` (not hardcoded). Reschedule policy text reads from `BOOKING_FREE_RESCHEDULE_DAYS` constant.

---

## 9 · Smart RFQ Specification (Correction #2)

`/get-quote` becomes context-aware:

| Entry mode | Headline | Intro copy | Form fields |
|---|---|---|---|
| `/get-quote` (no params) | "Cotización personalizada" | "Cuéntanos qué necesitas — diseñamos un paquete a medida." | Generic: family selector, date, budget, details |
| `/get-quote?family=wedding-photography` | "Boda personalizada" | "Estás solicitando una versión personalizada de Wedding Photography." | Family card visible at top, family-specific helper copy ("¿Locación?", "¿Cuántos invitados?") |
| `/get-quote?family=wedding-photography&package=full-day` | "Personalizar: Full Day Wedding" | "Selecciónaste el paquete Full Day. Cuéntanos qué necesitas modificar." | Package card visible with current inclusions, then "What needs to change?" textarea |

Backend writes to `quote_requests` table with `family_id` + optional `package_id` + `source_page` + `source_cta`. Admin email includes the preselected context so the responder knows what they're personalizing.

---

## 10 · What's blocking Slice A right now

1. **Canonical package matrix** — awaited from user (XLS / paste / structured doc, any format)
2. Nothing else

When the matrix arrives, I'll:
1. Reconcile it with the existing 18 `booking_services` rows (mapping doc)
2. Get explicit user approval of the mapping
3. Begin Slice A

---

## 11 · What this blueprint does NOT cover (out of scope)

- Multi-currency (DOP) display strategy beyond the current `currency_display` field — needs a separate decision
- Payment plans / financing (current: full deposit, 50%)
- Customer accounts / login / saved payment methods (anonymous booking flow only)
- Multi-staff scaling (solo-staff assumption locked in until further notice)
- SMS reminders (Resend email only)

These are tracked separately and can be picked up post-rebuild.

---

**End of canonical blueprint. This document is the source of truth for the rebuild.**
