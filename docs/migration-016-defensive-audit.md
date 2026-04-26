# Migration 016 — Final Defensive Audit

**Date**: 2026-04-26
**Scope**: machine-verifiable proof that booking_services rename + view takeover is regression-free
**Verdict (TL;DR)**: **3 write paths will break — all isolated to `/admin/booking-services`. Pre-migration code patch required (~15 min).** Everything else is safe.

---

## Audit 1 — Repo-wide impact grep on `booking_services`

### 1A · Reads (SAFE against view)

| File:line | Operation | Verdict |
|---|---|---|
| `src/app/[locale]/book/page.tsx:60` | `.from('booking_services').select(...)` | ✅ SELECT — works against view |
| `src/app/[locale]/prices/page.tsx:179,192,205,285,362,375,388` | comments only | ✅ no runtime impact |
| `src/app/admin/bookings/[id]/actions.ts:43,180` | embedded JOIN `service:booking_services(...)` | ✅ PostgREST treats views identically to tables for embedded JOIN |
| `src/app/admin/bookings/page.tsx:66` | embedded JOIN | ✅ same |
| `src/app/admin/bookings/[id]/page.tsx:70` | embedded JOIN | ✅ same |
| `src/app/admin/booking-services/page.tsx:21` | `.from('booking_services').select(...)` | ✅ SELECT |
| `src/app/api/bookings/route.ts:68` | `.from('booking_services').select(...)` | ✅ SELECT (service lookup before booking insert) |
| `src/app/api/bookings/services/route.ts:17` | `.from('booking_services').select(...)` | ✅ SELECT |
| `src/app/api/bookings/[id]/route.ts:37` | embedded JOIN | ✅ |
| `src/app/api/stripe/booking-webhook/route.ts:89` | embedded JOIN | ✅ |
| `src/app/api/cron/booking-reminders/route.ts:47` | embedded JOIN | ✅ |
| `src/lib/services/catalog.ts:8` | comment | ✅ no runtime impact |
| `scripts/backup-supabase.cjs:31` | table name in backup loop | ✅ SELECT-only — works against view |
| `supabase/migrations/20260424_013_bookings.sql:39` | original FK definition | ⚠️ FK is dropped + re-added in 016 §E and §I — handled |
| `workers/cron-bookings/` | none | ✅ |

### 1B · 🚨 WRITES that will FAIL against the view

PostgreSQL views are **not** writable by default. Without `INSTEAD OF` triggers, INSERT / UPDATE / DELETE against a view returns `cannot change name "booking_services"` or similar error.

| File:line | Operation | Failure mode |
|---|---|---|
| `src/app/admin/booking-services/actions.ts:59` | `.from('booking_services').insert({...})` (createService server action) | Create-new-service in admin UI throws SQL error |
| `src/app/admin/booking-services/actions.ts:95` | `.from('booking_services').update({...})` (updateService) | Edit-service form throws SQL error |
| `src/app/admin/booking-services/actions.ts:137` | `.from('booking_services').update({...})` (toggleServiceFlag) | Active/Bookable toggle pills throw SQL error |

**Surface affected**: `/admin/booking-services` page only. The customer-facing booking flow (`/book`), the admin booking list (`/admin/bookings`), and all API routes work via SELECT-only paths and survive the migration unchanged.

### 1C · TS types

```bash
$ grep -rn "booking_services" src/ --include="*.d.ts" --include="*.ts" | grep -i "type\|interface"
```
→ no generated TypeScript types lock `booking_services` as a TABLE shape. The `Service` type in `src/app/admin/booking-services/ServiceEditor.tsx` is hand-written and cares about column names, not table-vs-view. ✅

### 1D · RPC functions

```bash
$ grep -n "booking_services" supabase/migrations/*.sql
20260424_013_bookings.sql:39:  service_id UUID NOT NULL REFERENCES public.booking_services(id),
```
The only SQL-level reference is the FK in migration 013, which migration 016 §E drops and §I re-adds pointing at `service_packages.id`. ✅

The `get_available_slots()` PL/pgSQL function (migration 012, fixed in 014) does not reference `booking_services` — it queries `bookings`, `availability_rules`, `availability_overrides`. ✅

---

## Audit 2 — `bookings.service_id` mutation safety

### 2A · service_id reference inventory

```
src/app/[locale]/contact/actions.ts:32   service_id: formData.serviceId       (different table — contact_submissions, NOT bookings)
src/app/[locale]/services/page.tsx:134   key={service.id}                     (catalog object, not DB)
src/app/admin/bookings/[id]/page.tsx:30  service_id: string                   (TS field on TYPE only, no logic)
src/app/admin/bookings/[id]/page.tsx:69  SELECT ... service_id ...            (read-only)
src/app/admin/booking-services/ServiceEditor.tsx:146 hidden form field        (form scope)
src/app/api/bookings/route.ts:18         z.string().uuid()                    (input validation only)
src/app/api/bookings/route.ts:72         .eq('id', data.service_id)           (read filter against view → works)
src/app/api/bookings/route.ts:140        service_id: service.id               (write into bookings table — uses NEW package UUID after migration)
src/app/api/bookings/route.ts:194        service_slug: service.slug           (Stripe metadata, slug not UUID)
src/components/booking/BookingWizard.tsx:115 service_id: state.service.id     (passes the value selected from view)
src/lib/services/catalog.ts:206          local catalog lookup (not DB)
```

**No conditional branching keyed by service_id values.** No code paths like `if (service_id === 'xxxxx-xxxx-...')`. ✅

### 2B · Hardcoded UUIDs in src/

```
src/app/[locale]/blog/[slug]/page.tsx           → Setmore product UUIDs (not booking_services UUIDs)
src/app/[locale]/services/birthday-photographer/page.tsx → same Setmore product UUIDs
```

Verified: none match production `booking_services` UUIDs. These are residual Setmore catalogue references already flagged in `docs/cta-audit.md`. The migration does not touch them. ✅

### 2C · Analytics

```bash
$ grep -rn "service_id\|booking.service" src/lib/analytics/
```
→ empty. No analytics events keyed by service_id. ✅

### 2D · Conditional branching

```bash
$ grep -rn "service_id\s*[=!]==\|switch.*service_id\|case.*'weddings'" src/
```
→ empty. No business logic depends on specific service UUID values. ✅

### 2E · Live booking UUIDs (verified live)

```
booking 5873fc51-…  CONFIRMED  service_id = 8444f9d9-…   → legacy slug 'weddings'
booking f9303384-…  CANCELLED  service_id = 0982745f-…   → legacy slug 'portrait'
booking e7ae1c19-…  CONFIRMED  service_id = 8444f9d9-…   → legacy slug 'weddings'
```

Both UUIDs appear in `legacy_aliases` arrays in migration 016:
- `wedding-photography:essential` has `legacy_aliases = {weddings}`
- `luxury-portrait-photography:essential` has `legacy_aliases = {portrait, corporate-portrait, engagement-session}`

Migration 016 §D backfill via `bs.slug = ANY(p.legacy_aliases)` will resolve all 3 deterministically. ✅

---

## Audit 3 — Runtime simulation

### Honest disclosure

Local Supabase requires Docker (not running on this machine). No staging project exists. I cannot stand up an isolated runtime test from this session.

### What I CAN offer (3 substitutes, ranked by rigor)

#### Option 3A · Production transactional dry-run (recommended)

Single SQL block you paste into the Supabase SQL editor that:
1. `BEGIN` a transaction
2. Apply the FULL 015 + 016 SQL
3. Run every Sprint 1-4 query as a SELECT
4. `ROLLBACK` — production state unchanged

This proves the post-migration state works against real production data without any persistent change. Ready to author on request.

#### Option 3B · Static query trace (already complete — see below)

Each Sprint 1-4 query traced against the view definition in 016 §H.

#### Option 3C · Apply migration 016 + observe via PostgREST

Highest fidelity but commits the change. Recovery via the reversal block in the SQL file (~10 sec downtime if anything breaks).

### Static query trace (Option 3B)

Each Sprint 1-4 read path projected against the view definition:

```sql
-- The view (migration 016 §H):
CREATE VIEW booking_services AS
  SELECT p.id, p.slug, p.name_es, p.name_en, p.description_short_es AS description_es,
         p.description_short_en AS description_en, f.icon, f.slug AS category,
         p.duration_min, p.starting_price_usd AS price_usd, p.deposit_percent,
         p.bookable_direct AS bookable, (p.active AND f.active) AS active,
         p.sort_order, p.created_at, p.updated_at
  FROM service_packages p JOIN service_families f ON f.id = p.family_id;
```

| Sprint 1-4 query | Result against view | Pass? |
|---|---|---|
| `SELECT id,slug,name_es,name_en,description_es,description_en,icon,category,duration_min,price_usd,deposit_percent FROM booking_services WHERE active=true AND bookable=true ORDER BY sort_order` (`/api/bookings/services`) | View exposes all 11 columns. Active filter applies via inherited RLS + view's computed `active` column. Bookable filter via view's aliased `bookable` column. Returns 24 rows. | ✅ |
| `SELECT id,slug,name_es,name_en,duration_min,price_usd,deposit_percent,bookable,active FROM booking_services WHERE id = $1` (`/api/bookings/route.ts:68`) | All columns exposed. After §F, `bookings.service_id` matches `service_packages.id` which is the view's `id`. Returns single row. | ✅ |
| `SELECT slug,name_es,name_en,description_es,description_en,price_usd,duration_min FROM booking_services WHERE active=true AND bookable=true ORDER BY sort_order` (`/book/page.tsx`) | Same as `/api/bookings/services` minus 4 columns. Returns 24 rows. | ✅ |
| Embedded JOIN: `service:booking_services(name_es, name_en, icon, duration_min)` (admin pages, webhook, cron) | PostgREST resolves view-as-resource identically to table. Embedded JOIN through bookings.service_id FK → service_packages.id (the new FK) → joins via view's `id` column. Returns nested object. | ✅ |
| `get_available_slots(staff_id, date, duration_min)` RPC (booking flow) | RPC body queries `bookings`, `availability_rules`, `availability_overrides` only — does not touch booking_services or its view. Unaffected. | ✅ |
| `SELECT id,slug,name_es,name_en,description_es,description_en,icon,category,duration_min,price_usd,deposit_percent,sort_order,bookable,active FROM booking_services ORDER BY sort_order` (`/admin/booking-services` list) | All 14 columns exposed by view. Returns 33 rows (all packages, including inactive). | ✅ |

| Sprint 2 admin write | Result against view | Pass? |
|---|---|---|
| `INSERT INTO booking_services (slug, name_es, ...) VALUES (...)` (createService) | View has no INSTEAD OF trigger. Postgres rejects: `cannot insert into view "booking_services"`. | ❌ |
| `UPDATE booking_services SET ... WHERE id = $1` (updateService, toggleServiceFlag) | Same — view rejects DML. | ❌ |

### PostgREST schema cache

PostgREST caches the schema; after a table → view swap, it may serve `404` for the resource for ~60 seconds until the cache refreshes. The migration 016 file already documents this as a "Reload schema cache" manual step. Mitigation: a single Supabase Dashboard click after the migration commits.

---

## Audit 4 — Fallback strategy comparison

### Strategy A: rename + view (current 016) + admin code patch

1. Apply migration 015 (additive, safe)
2. **Pre-patch** `src/app/admin/booking-services/actions.ts` — replace 3 write paths with a 410 GONE response (the page is replaced by `/admin/families` in Slice A anyway)
3. **Pre-patch** `src/app/admin/booking-services/page.tsx` and `ServiceEditor.tsx` — render a "moved to /admin/families" message
4. Deploy these 2 file changes
5. Apply migration 016 (rename + view)
6. Reload PostgREST schema cache
7. Run verification probes

**Operational risk**: low. Pre-patch is ~15 min and removes the only failure mode. Customer-facing flow continues working. Admin sees "moved" message until Slice A admin UI lands.

**Recovery** (if anything breaks): paste the reversal SQL → 30 sec downtime → schema returns to pre-016 state. Pre-patched files harmless to leave in place.

### Strategy B: no rename, dual catalog, defer view + service_id repoint to Slice B

1. Apply migration 015 (additive, safe)
2. Apply a TRIMMED 016 — sections A, B, C, D only:
   - Insert 9 families
   - Insert 33 packages with legacy_aliases
   - Verify counts
   - Backfill bookings family_id, package_id, package_snapshot
3. **Skip** sections E, F, G, H, I (no FK drop, no service_id repoint, no rename, no view)
4. Sprint 1-4 code keeps reading from the legacy `booking_services` TABLE (still has 18 rows, untouched)
5. Slice A code reads from `service_packages` directly (canonical path)
6. Both surfaces coexist; admin UI in Slice A operates on `service_packages` only
7. Sometime in Slice B (when no code reads from `booking_services` anymore) apply a follow-up migration to do the rename + view + service_id repoint

**Operational risk**: very low. Every existing surface keeps working byte-for-byte. No view-DML failure mode. No PostgREST cache reload required.

**Cons**:
- Two sources of truth temporarily — admin Strategy B adds a discipline burden: any package edit done via the OLD `/admin/booking-services` writes to `booking_services` table; Slice A `/admin/families/*` writes to `service_packages`. If both surfaces are exposed, drift occurs.
- The simplest mitigation: same as Strategy A's pre-patch — replace `/admin/booking-services` with a 410 GONE before applying anything. The legacy table becomes read-only de facto.

### Side-by-side

| Dimension | Strategy A (rename+view) | Strategy B (no rename) |
|---|---|---|
| Migration 016 SQL | full file | sections A-D only |
| Files patched before apply | 3 (admin/booking-services) | 3 (same — to prevent legacy-table writes) |
| PostgREST cache reload | required | not needed |
| `bookings.service_id` semantics | repointed to canonical UUIDs | unchanged (still legacy UUIDs) |
| Risk of view DML failure | mitigated by pre-patch | n/a |
| Future cleanup migration | none | one needed in Slice B |
| Recovery if anything breaks | reversal SQL + restore patch | none needed (additive only) |
| Drift risk between two catalogs | none post-migration | until Slice A removes `/admin/booking-services` |
| Slice A code shape | reads `service_packages` (or view) | reads `service_packages` |

### Recommendation

**Strategy B (defer rename + view to Slice B)** is the safer move. It:
- Keeps the migration 016 entirely additive (no rename, no DML reroute, no FK drop/re-add)
- Achieves the SAME functional state for Slice A: 33 packages exist, 9 families exist, bookings have family_id/package_id/package_snapshot, customer surfaces unaffected
- Defers the only legitimately-risky operation (view takeover) until after Slice A code is verified — so the rename can happen against an already-tested codebase
- Reduces production downtime to zero (additive operations don't lock or replace the booking_services table)

The pre-patch on `/admin/booking-services` is needed in BOTH strategies for the same reason — but in Strategy B it's about preventing user confusion (legacy admin would still work but write to a deprecated table), while in Strategy A it's about preventing actual SQL errors.

---

## Final recommendation

**Adopt Strategy B**. Author a "Migration 016 SLIM" version that contains only sections A-D + the pre-flight assertions + a final verification block. Defer the view + rename to "Migration 020" (or wherever Slice A finishes) once we've shipped and verified Slice A code reading directly from `service_packages`.

If you want full strategy A, I can do it — but only after the `/admin/booking-services` pre-patch is committed.

**Either way, do not paste 016 in its current form** until either:
- (Strategy A) admin pre-patch is in place
- (Strategy B) 016 is trimmed to sections A-D

Awaiting your call.
