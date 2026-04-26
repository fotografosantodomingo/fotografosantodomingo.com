# Admin Information Architecture & Route Structure

**Status**: Pre-Slice A readiness artifact #4
**Produced**: 2026-04-26
**Source of truth**: [BOOKING_REBUILD_BLUEPRINT.md](../BOOKING_REBUILD_BLUEPRINT.md) §7
**Constraint**: Architectural Commitment #7 — every new entity (families, packages, pricing, active flags, quote requests) must be manageable from `/admin/*` without dev intervention.

This document is a **specification only**. No CRUD code is written here. The actual implementation ships in Slice A.

---

## 1 · Existing admin surfaces (audit baseline)

The admin panel today (commit `dff2128`) consists of:

| Route | Purpose | Status after rebuild |
|---|---|---|
| `/admin/login` | Supabase email/password sign-in | KEEP (unchanged) |
| `/admin/images` | Portfolio image SEO editor | KEEP (unchanged) |
| `/admin/quotes` | Quote (proposal flow) list + detail | KEEP (unchanged) — separate from new `quote_requests` |
| `/admin/quotes/[id]` | Quote pricing / send proposal | KEEP (unchanged) |
| `/admin/booking-services` | **Flat CRUD over `booking_services`** | **REPLACED** with families/packages hierarchy |
| `/admin/availability` | Weekly schedule + date overrides | KEEP (unchanged) |
| `/admin/bookings` | Booking list with tabs | KEEP, gains family/package columns in Slice E |
| `/admin/bookings/[id]` | Booking detail (cancel/refund/reschedule/mark-completed) | KEEP, gains package summary + inclusions in Slice E |

**Auth model** (preserved unchanged): all `/admin/*` routes are gated by `src/middleware.ts` which checks the Supabase session and redirects unauthenticated requests to `/admin/login`. Layout (`src/app/admin/layout.tsx`) declares `runtime='edge'` and propagates to all admin pages.

---

## 2 · New admin surfaces (Slice A scope)

### 2.1 Route tree

```
/admin/
├── families                              ← NEW (replaces /admin/booking-services)
│   ├── (list view)
│   ├── new                               ← create-family form
│   └── [slug]/
│       ├── (family detail + embedded packages list)
│       ├── edit                          ← family meta edit
│       └── packages/
│           ├── new                       ← create-package form
│           └── [id]/
│               └── (package edit form)
├── quote-requests                        ← NEW (manages quote_requests table)
│   ├── (list view)
│   └── [id]/
│       └── (request detail + status update)
└── (existing surfaces unchanged)
```

### 2.2 Page-by-page responsibility & required fields

#### A. `/admin/families` — Family list

**Purpose**: master list of `service_families` rows. Replaces the categories sidebar of the old flat services CRUD.

**Display columns**:
| Column | Source field | Editable inline? |
|---|---|---|
| Drag handle | (sort_order) | ✅ drag-to-reorder |
| Icon | `icon` | ❌ (open detail) |
| Title (locale-aware) | `title_es` / `title_en` | ❌ |
| Slug | `slug` | ❌ (immutable after creation — affects SEO URL) |
| # packages | `count(service_packages)` | n/a |
| Bookable / Quoteable | `bookable`, `quoteable` flags | ✅ toggle pills |
| Active | `active` | ✅ toggle pill |
| Actions | "Edit", "View packages →" | n/a |

**Top-of-page**: "+ New family" button → `/admin/families/new`

**Filters**: locale switch (ES/EN preview), active/inactive toggle.

#### B. `/admin/families/new` — Create family

**Form fields** (all required unless noted):
| Field | DB column | Validation |
|---|---|---|
| Slug (URL) | `slug` | lowercase, hyphens, must NOT collide with existing |
| Title ES | `title_es` | min 1 char |
| Title EN | `title_en` | min 1 char |
| Tagline ES | `tagline_es` | optional, max 200 char |
| Tagline EN | `tagline_en` | optional, max 200 char |
| Icon (emoji) | `icon` | single emoji, default 📷 |
| SEO parent URL | `seo_parent_url` | must start with `/services/`, default = `/services/<slug>` |
| Bookable | `bookable` | bool, default true |
| Quoteable | `quoteable` | bool, default true |
| Active | `active` | bool, default true |
| Sort order | `sort_order` | int, default = max+10 |

After save → redirect to `/admin/families/[slug]`.

#### C. `/admin/families/[slug]` — Family detail + packages list

**Top section** — family metadata card with "Edit family meta" button → `/admin/families/[slug]/edit`.

**Bottom section** — packages list under this family:
| Column | Source field | Editable inline? |
|---|---|---|
| Drag handle | `sort_order` | ✅ drag-to-reorder |
| Name (locale-aware) | `name_es` / `name_en` | ❌ |
| Slug | `slug` | ❌ |
| Duration | `duration_min` | ❌ |
| Price USD | `starting_price_usd` | ✅ inline edit (with confirm) |
| Deposit % | `deposit_percent` | ✅ inline edit |
| Direct book | `bookable_direct` | ✅ toggle pill |
| Custom quote | `custom_quote_allowed` | ✅ toggle pill |
| Featured | `featured` | ✅ toggle pill |
| Badge | `popular_badge` | ✅ dropdown: none / `most_booked` / `best_value` |
| Active | `active` | ✅ toggle pill |
| Actions | "Edit" → `/admin/families/[slug]/packages/[id]` | n/a |

**Top-of-section**: "+ New package" button → `/admin/families/[slug]/packages/new`

#### D. `/admin/families/[slug]/edit` — Edit family meta

Same fields as B (create), preloaded. Slug is **read-only** after creation (affects SEO + DB FK + bookmarks; rename requires a separate migration with 301 redirect).

#### E. `/admin/families/[slug]/packages/new` — Create package

**Form fields**:
| Field | DB column | Validation |
|---|---|---|
| Slug | `slug` | unique within family |
| Name ES | `name_es` | min 1 char |
| Name EN | `name_en` | min 1 char |
| Description (short) ES | `description_short_es` | max 280 char |
| Description (short) EN | `description_short_en` | max 280 char |
| Duration (min) | `duration_min` | int, > 0 |
| Starting price USD | `starting_price_usd` | numeric, ≥ 0 |
| Deposit % | `deposit_percent` | int, 0–100, default 50 |
| Photo count | `photo_count` | int, optional, > 0 if provided |
| Inclusions ES | `inclusions_es` | array of strings, max 10 entries × 200 char |
| Inclusions EN | `inclusions_en` | array of strings (parallel to ES) |
| Bookable direct | `bookable_direct` | bool, default true |
| Custom quote allowed | `custom_quote_allowed` | bool, default true |
| Featured | `featured` | bool, default false |
| Popular badge | `popular_badge` | enum: NULL / `most_booked` / `best_value` |
| Active | `active` | bool, default true |
| Sort order | `sort_order` | int, default = max+10 |

**Live preview pane** (right side of form): shows what the package will look like on the public compare page (one card, real CSS), updates on form input. ES/EN tabs.

#### F. `/admin/families/[slug]/packages/[id]` — Edit package

Same as E (create), preloaded. Slug editable but with warning if changed (breaks any existing `?package=<old-slug>` URLs in customer emails — those bookings still resolve via `bookings.package_id` FK, so no data loss, but inbound links break).

#### G. `/admin/quote-requests` — Quote request list

**Purpose**: manage submissions to the `quote_requests` table (the new RFQ inbox). Separate from `/admin/quotes` which handles the older proposal flow.

**Tabs**: New / Reviewing / Quoted / Won / Lost / All.

**Display columns**:
| Column | Source field |
|---|---|
| Submitted | `created_at` (relative + tooltip) |
| Customer | `customer_name`, `customer_email` |
| Family | `family_id` → joined `service_families.title_*` (or "—" if generic) |
| Package | `package_id` → joined `service_packages.name_*` (or "—") |
| Locale | `locale` |
| Source | `source_page`, `source_cta` |
| Status | `status` enum |
| Actions | "View →" |

#### H. `/admin/quote-requests/[id]` — Quote request detail

**Display sections**:
1. Customer info (name, email, phone, locale)
2. Context (family + package, with link to the public family page)
3. The customer's `details` text
4. Optional: `event_date`, `budget_usd`
5. Provenance: `source_page`, `source_cta`, `created_at`
6. Admin notes (textarea, editable)
7. Status update form (NEW → REVIEWING → QUOTED → WON / LOST)

**Action buttons**:
- "Reply via email" → `mailto:` with prefilled subject
- "Reply via WhatsApp" → `wa.me` with prefilled message
- "Open quotes pipeline" → links to `/admin/quotes/new?from_request=<id>` (creates a formal quote referencing this request — Slice E feature, defer)

---

## 3 · Admin nav update

The current admin layout (`src/app/admin/layout.tsx:21-37`) has a header with these links:

```
Bookings · Availability · Services · Quotes · Images
```

**After Slice A**, the "Services" link is replaced and a new "Quote Requests" link is added:

```
Bookings · Availability · Families · Quote Requests · Quotes · Images
```

The "Sign out" form action and styling are preserved.

---

## 4 · Auth & RLS policy changes

The new tables need policies parallel to the existing `bookings` / `booking_services` patterns:

| Table | anon (public) | authenticated (admin) | service_role |
|---|---|---|---|
| `service_families` | SELECT where `active=true` | ALL | ALL |
| `service_packages` | SELECT where `active=true` AND `family.active=true` | ALL | ALL |
| `quote_requests` | INSERT only | ALL | ALL |

These RLS policies are part of migration `015` (artifact #5).

---

## 5 · Required server actions (Slice A scope)

Each admin page uses Next.js Server Actions for mutations (matches the existing pattern in `/admin/bookings/[id]/actions.ts`).

| Action file | Server actions exported |
|---|---|
| `src/app/admin/families/actions.ts` | `createFamily`, `updateFamily`, `toggleFamilyFlag`, `reorderFamilies`, `deleteFamily` (with FK guard) |
| `src/app/admin/families/[slug]/packages/actions.ts` | `createPackage`, `updatePackage`, `togglePackageFlag`, `reorderPackages`, `deletePackage` |
| `src/app/admin/quote-requests/actions.ts` | `updateQuoteRequestStatus`, `updateAdminNotes` |

Every action: validates input with Zod, uses `createServiceClient()` (bypasses RLS), calls `revalidatePath()` for the admin page AND any affected public surfaces (`/[locale]/services`, `/[locale]/prices`, etc.).

---

## 6 · Existing admin pages — what changes during Slice A

### `/admin/booking-services` (REMOVED)

Replaced by `/admin/families`. Add a 301 redirect in `next.config.js` from `/admin/booking-services` → `/admin/families` to preserve any bookmarks Michal may have.

### `/admin/bookings` (preserved, gains columns later)

The booking list view (`src/app/admin/bookings/page.tsx`) reads from the `bookings` table via the legacy `booking_services` view in Slice A — visibly unchanged. In Slice E, columns are added: family, package, deposit/balance breakdown.

### `/admin/bookings/[id]` (preserved, gains sections later)

Detail page works unchanged in Slice A (uses the view). In Slice E, gets a "Package details" section reading from `package_snapshot` JSONB.

### `/admin/availability` (unchanged)

Independent of the families/packages refactor.

---

## 7 · Mobile / dark-mode admin

The existing admin pages are responsive and dark-mode aware (uses `dark:` Tailwind variants). The new family/package pages MUST follow the same conventions — verified in Slice A QA.

---

## 8 · What this document does NOT specify

- **Visual/styling details** (button colors, spacing, exact form layout). These follow the existing `/admin/bookings/*` aesthetic.
- **Field-level copy** (helper text, error messages). Drafted during Slice A implementation, ES + EN.
- **Bulk operations** (multi-select delete/toggle). Out of scope for Slice A; can be added later if needed.
- **Audit log of admin changes**. Out of scope; Supabase has built-in audit at the platform level.
- **Permission tiers** (admin vs editor). Single admin role for now (matches current setup).

---

**End of admin IA. 6 new pages in `/admin/families/*` + 2 new pages in `/admin/quote-requests/*`. All gated by existing middleware. All shipped in Slice A.**
