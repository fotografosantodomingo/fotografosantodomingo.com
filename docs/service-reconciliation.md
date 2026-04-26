# Existing Service Reconciliation Map

**Status**: Pre-Slice A readiness artifact #2 — REVISED 2026-04-26 with 9 locked decisions
**Produced**: 2026-04-26
**Source of truth**: [BOOKING_REBUILD_BLUEPRINT.md](../BOOKING_REBUILD_BLUEPRINT.md)
**Constraint**: Architectural Commitment #3 — family slugs MUST equal existing `/services/<slug>` URLs (SEO equity preservation)

## 0 · Locked decisions affecting this document

| # | Decision | Effect on reconciliation |
|---|---|---|
| 3 | birthday-photographer = SEO landing only, routes into `event-photography` | Already the default in §3.3 — confirmed |
| 4 | real-estate + food/beverage stay under `commercial-photography` | Already the default in §3.5 — confirmed |
| 5 | Beach + Video = dedicated SEO families; **Snoot = NOT a standalone family** (style inside portrait) | §2 family list reduced from 11 → 10 candidates. §3 adds note 3.9 covering Snoot's new home |
| 6 | Custom Specialty = admin-only utility, **not a public-facing family** | §2 family list reduced from 10 → 9 public families; Custom Specialty noted as admin-only in §2.5 |

This document maps the **18 currently-seeded `booking_services` rows** in production to candidate `service_families` and `service_packages` in the new normalized schema. It is **structural only** — no final package details, prices, or names are invented. The canonical XLS package matrix (awaited from user) will fill in the actual rows, durations, and inclusions.

---

## 0 · Constraint reminder

The blueprint locked in: **family.slug must match an existing `/services/<slug>` SEO URL** wherever one exists. The 7 SEO URLs available (from `src/lib/services/catalog.ts`):

```
wedding-photography
portrait-photography
drone-services-photography-punta-cana
event-photography
family-photography
commercial-photography
proposal-photography
```

Plus 1 service-detail page that doesn't follow that pattern:
```
birthday-photographer    (lives at /services/birthday-photographer)
```

The master file Section 5 proposes 12 families. After the 9 locked decisions:
- **7 families** map to existing `/services/<slug>` SEO URLs (preserved as-is)
- **2 new families** get fresh SEO URLs: `beach-photography`, `video-production` (Decision 5)
- **Snoot folds into `portrait-photography`** as packages — not its own family (Decision 5)
- **Custom Specialty stays as an admin-only DB row** with no public family page (Decision 6)
- **Birthday-photographer keeps its SEO URL** but commercially routes into `event-photography` (Decision 3)

This produces **9 publicly-visible families** + 1 admin-only family = 10 rows in `service_families`.

---

## 1 · Summary — 18 current rows → candidate families

| # | Old `booking_services` row | DB price | DB duration | DB category | Future family slug | Future role | Confidence |
|---|---|---|---|---|---|---|---|
| 1 | `weddings` | $1,000 | 240 min | celebrations | `wedding-photography` | child package (probably "Essential") | 🟢 high |
| 2 | `engagement-session` | $180 | 60 min | celebrations | `wedding-photography` | child package | 🟢 high |
| 3 | `quinceaneras` | $800 | 240 min | celebrations | `event-photography` | child package | 🟡 medium — could also live in own family if XLS expands quinceañeras significantly |
| 4 | `baptism` | $250 | 120 min | celebrations | `event-photography` | child package | 🟢 high |
| 5 | `graduation` | $200 | 60 min | celebrations | `event-photography` | child package | 🟢 high |
| 6 | `birthday-party` | $300 | 120 min | celebrations | `event-photography` | child package | 🟡 medium — `/services/birthday-photographer` page exists; see §3 |
| 7 | `portrait` | $100 | 60 min | portraits | `portrait-photography` | child package | 🟢 high |
| 8 | `family-session` | $200 | 120 min | portraits | `family-photography` | child package | 🟢 high |
| 9 | `maternity` | $150 | 60 min | portraits | `family-photography` | child package | 🟢 high |
| 10 | `children-session` | $150 | 60 min | portraits | `family-photography` | child package | 🟢 high |
| 11 | `corporate-portrait` | $180 | 60 min | portraits | `portrait-photography` | child package | 🟢 high |
| 12 | `corporate-event` | $300 | 120 min | commercial | `event-photography` | child package | 🟡 medium — could also be its own "corporate-events" family if XLS has many corp variants |
| 13 | `commercial` | $250 | 60 min | commercial | `commercial-photography` | child package | 🟢 high |
| 14 | `food-and-beverage` | $250 | 120 min | commercial | `commercial-photography` | child package | 🟢 high |
| 15 | `real-estate` | $150 | 120 min | commercial | `commercial-photography` | child package | 🟡 medium — master file Section 5 lists "Real Estate / Food / Branding" as a separate family. Default: keep under commercial, see §3.5 |
| 16 | `drone-aerial` | $250 | 120 min | specialty | `drone-services-photography-punta-cana` | child package | 🟢 high |
| 17 | `video-production` | $800 | 360 min | specialty | **new family**: `video-production` | child package + needs new SEO URL | 🟡 medium — see §3.6 |
| 18 | `proposal-photography` | $250 | 120 min | specialty | `proposal-photography` | child package | 🟢 high |

---

## 2 · Candidate family list (after reconciliation + XLS expansion)

The `service_families` table will hold **10 rows total**: 9 publicly visible families + 1 admin-only utility row (Custom Specialty). Per Decision 5, Snoot does NOT become its own family — it lives as packages under `portrait-photography`.

| # | Family slug | SEO URL existing? | Public visibility | Source of children | Status |
|---|---|---|---|---|---|
| 1 | `wedding-photography` | ✅ yes | public | rows 1, 2 + XLS expansion (Essential / Full Day / Destination / Multi-day per master file §6.A) | committed |
| 2 | `portrait-photography` | ✅ yes | public | rows 7, 11 + XLS expansion (Executive, Studio 10, SD Portrait, Combo, Zona Colonial, Anniversary, Christmas, Boudoir, AI Avatar **+ Snoot 5/10/15 photos** per Decision 5) | committed |
| 3 | `event-photography` | ✅ yes | public | rows 3, 4, 5, 6, 12 + XLS variants. **Birthday SEO page routes here** (Decision 3) | committed |
| 4 | `family-photography` | ✅ yes | public | rows 8, 9, 10 + XLS variants (per master file §6.D) | committed |
| 5 | `commercial-photography` | ✅ yes | public | rows 13, 14, 15 + XLS additions. **Real-estate + food/beverage live here** (Decision 4) | committed |
| 6 | `drone-services-photography-punta-cana` | ✅ yes | public | row 16 + XLS expansion (Quick / Standard / Commercial production per master file §6.G) | committed |
| 7 | `proposal-photography` | ✅ yes | public | row 18 + XLS expansion (Ninja / Premium / Luxury per master file §6.F) | committed |
| 8 | `beach-photography` | ❌ NEW SEO URL needed | public | XLS only (Güibia, Caribbean, Saona, Minitas, Premium 15/20 per master file §6.B) | committed (Decision 5) |
| 9 | `video-production` | ❌ NEW SEO URL needed | public | row 17 + XLS variants | committed (Decision 5) |
| 10 | `custom-specialty` | ❌ no SEO URL | **admin-only** | XLS only (RFQ tagging utility) | committed (Decision 6) — see §2.5 |

### 2.1 — Removed from earlier draft (Decision 5)

`snoot-optical-creative` was previously listed as candidate family #10 with a new SEO URL. **Removed**. Snoot now lives as packages within `portrait-photography`:
- Likely 3 packages per master file §6.H: Snoot 5 photos / Snoot 10 photos / Snoot Premium 15 photos
- These packages share the portrait family's SEO URL (`/services/portrait-photography`) and compare page
- They benefit from the existing portrait SEO authority instead of fragmenting search intent

### 2.2 — New SEO URLs to create (Decision 5)

Two families need fresh SEO URLs (no existing equity to preserve, safe to invent):

| Family | New SEO URL | Slice that creates the page |
|---|---|---|
| `beach-photography` | `/services/beach-photography` | Slice B (alongside compare pages) |
| `video-production` | `/services/video-production` | Slice B |

Each needs:
- Full SEO content page (not just a compare grid)
- Entry in `serviceLandingSlugs` (`src/lib/services/catalog.ts`)
- Sitemap entry (`src/app/sitemap.ts`)
- Hreflang pair (ES + EN)
- Internal linking from `/services` family navigator + footer + relevant blog posts

### 2.5 — Custom Specialty as admin-only utility (Decision 6)

Custom Specialty stays in the `service_families` table but with `active = false` for public surfaces. Its purpose:
- Provides a `family_id` value for `quote_requests` rows that don't fit any other family (truly bespoke projects: theater, fashion, music video, art photography, etc.)
- Surfaces in the admin /admin/quote-requests filter and reporting
- **Never rendered on the public site** — no /services entry, no /prices entry, no compare page
- Does not appear in JSON-LD on /book

Implementation: insert with `active = false` so the public `service_families_public_read` RLS policy hides it. Admin's `service_families_admin_all` policy makes it visible in admin UI for tagging quote requests.

---

## 3 · Per-service notes (mapping ambiguities)

### 3.1 `weddings` + `engagement-session` → `wedding-photography` family

- `weddings` is the obvious flagship. Likely becomes the "Essential" or starter package, since master file §6.A names "Essential 4h basic" as the first wedding package.
- `engagement-session` ($180, 60 min) is a sub-product of weddings — historically bookable on its own but commonly bundled. **Recommend**: keep as a standalone package within `wedding-photography` family AND also surface it as an "add-on" hint on the wedding compare page.
- ⚠️ The current `/services` Wedding card displays `Desde $1,100` while DB row is `$1,000`. This was deliberate per user instruction (anchor pricing). The XLS will resolve final price.

### 3.2 `portrait` + `corporate-portrait` → `portrait-photography` family

- These are both 60-minute studio-or-location sessions with different pricing tiers ($100 vs $180). They map cleanly as two child packages.
- Master file §6.C lists 9 portrait packages — the XLS will fill in the other 7 (Executive, Studio 10, Santo Domingo, Combo, Zona Colonial, Anniversary, Christmas, Boudoir, AI Avatar).

### 3.3 Birthday & quinceañeras → `event-photography` family (vs separate page)

This is the trickiest case in the reconciliation:
- `/services/birthday-photographer` is its own SEO page (separate file: `src/app/[locale]/services/birthday-photographer/page.tsx`). It's indexed and ranks for "fotógrafo de cumpleaños".
- The page CTAs go to **Setmore URLs** today (CTA audit critical finding #1).

**Recommended treatment**: 
- Keep `/services/birthday-photographer` as an SEO-only landing page (no `service_families` row of its own). Its CTAs route into the `event-photography` family compare page (`/services/event-photography/packages?focus=birthday`).
- The `event-photography` family compare page presents Birthday and Quinceañera as prominent child packages alongside Baptism, Graduation, and Corporate Event variants.
- Update `serviceLandingSlugs` to include `birthday-photographer` so the sitemap keeps it, but it does not become a family.

This preserves SEO equity AND aligns transactionally.

### 3.4 `corporate-event` → `event-photography` (vs `corporate-events` standalone)

- DB row 12 is `corporate-event` ($300, 120 min, commercial category).
- Master file §6.E groups "Birthday, Baptism, Graduation, Quinceañera, Corporate event variants" all under "Events & Celebrations".
- **Recommend**: keep under `event-photography` family but tag the package with `category: 'corporate'` (or use `popular_badge: 'corporate'`) so the compare page can present a "for businesses" mini-section.

### 3.5 `real-estate` + `food-and-beverage` → `commercial-photography` (vs separate "Real Estate / Food / Branding")

- DB rows 14, 15 currently in commercial category.
- Master file §6.H proposes "Real Estate / Food / Branding" as its own family.
- **Recommend**: keep under `commercial-photography` family for now (preserves the existing SEO page's authority over real-estate-related searches). The XLS may dictate splitting, in which case we create a new `real-estate-photography` family with SEO URL. **Defer to XLS contents**.

### 3.6 `video-production` → standalone family or under existing?

- DB row 17 is `video-production` ($800, 360 min).
- No `/services/video-production` SEO page exists today.
- Master file §6.I lists Video Production as its own family with half-day/full-day/premium tiers.
- **Recommend**: create `video-production` family with new SEO URL `/services/video-production`. The single existing DB row becomes one of the packages (likely the "Full Day" tier given $800/6h pricing).

### 3.7 `drone-aerial` → `drone-services-photography-punta-cana` family

- The SEO URL is geo-tagged ("punta-cana"). This is intentional for ranking in that market.
- The family slug `drone-services-photography-punta-cana` is verbose but matches the URL.
- **Recommend**: keep the family slug = the URL slug verbatim. Display name in admin can be the friendlier "Drone Services".

### 3.8 `proposal-photography` → `proposal-photography` family

- Clean 1:1 mapping. The single existing DB row becomes the "Ninja Standard" package per master file §6.F.
- Master file proposes 3 packages (Ninja standard, Premium coordination, Luxury destination) — the XLS will define the other 2.

### 3.9 Snoot Óptico packages → `portrait-photography` family (Decision 5)

- **No existing DB row** for Snoot — comes entirely from the XLS per master file §6.H
- **Decision 5 routes Snoot under `portrait-photography`** rather than its own family
- Likely XLS rows: "Snoot Óptico — 5 fotos", "Snoot Óptico — 10 fotos", "Snoot Óptico Premium — 15 fotos" (these match the current /prices page entries that we previously flipped to `bookable: false`)
- These become 3 child packages of `portrait-photography`, each with `popular_badge` differentiating them in compare:
  - 5 photos → entry-level
  - 10 photos → `popular_badge: 'most_booked'` (probable)
  - 15 photos → `featured: true` + premium positioning
- The /prices page can remove the dedicated "Studio & Creative Lighting" category header — these surface within the Portraits section instead
- Once seeded, the `bookable: true` flag returns (currently false per the temporary fix)

---

## 4 · Mapping to the new schema (mechanical preview)

For each existing booking row, the migration will produce:

```sql
-- Step 1: Create the family
INSERT INTO service_families (slug, title_es, title_en, seo_parent_url, ...)
VALUES ('wedding-photography', 'Bodas', 'Wedding Photography', '/services/wedding-photography', ...);

-- Step 2: Create the package(s) referencing the family
INSERT INTO service_packages (
  family_id, slug, name_es, name_en, duration_min, starting_price_usd,
  deposit_percent, bookable_direct, custom_quote_allowed, ...
)
SELECT
  (SELECT id FROM service_families WHERE slug = 'wedding-photography'),
  'essential',          -- new package slug (defined in XLS)
  'Boda Esencial',      -- name from XLS
  'Essential Wedding',
  240,
  1000.00,
  50,
  true, true,
  ...;

-- Step 3: Backfill existing bookings.family_id and package_id
UPDATE bookings b
SET
  family_id = (SELECT id FROM service_families WHERE slug = 'wedding-photography'),
  package_id = (SELECT p.id FROM service_packages p
                JOIN service_families f ON f.id = p.family_id
                WHERE f.slug = 'wedding-photography' AND p.slug = 'essential'),
  package_snapshot = jsonb_build_object(
    'family_slug', 'wedding-photography',
    'package_slug', 'essential',
    -- ... per package_snapshot schema in blueprint §2.4
  )
WHERE b.service_id = (SELECT id FROM booking_services_old WHERE slug = 'weddings');
```

The full migration appears as artifact #5 (skeleton-only, no real seed values until XLS lands).

---

## 5 · Open questions — RESOLVED

All four questions raised in the original draft have been answered by the user's locked decisions (2026-04-26):

1. **Birthday handling** — RESOLVED (Decision 3): `/services/birthday-photographer` stays as SEO-only page, routes into `event-photography` family. No new family created.
2. **Real-estate / food / branding** — RESOLVED (Decision 4): keep under `commercial-photography` family for this rebuild. No split.
3. **Beach / Video / Snoot families** — RESOLVED (Decision 5):
   - Beach → dedicated family + new SEO URL `/services/beach-photography`
   - Video → dedicated family + new SEO URL `/services/video-production`
   - Snoot → NOT a family. Lives as 3 packages inside `portrait-photography`. See §3.9.
4. **Custom Specialty** — RESOLVED (Decision 6): admin-only utility (`active = false` on public side). Used for tagging RFQ-only quotes. No public surface anywhere. See §2.5.

---

## 6 · What this document does NOT do

- It does NOT define final package names, prices, durations, photo counts, or inclusions. Those come from the canonical XLS.
- It does NOT propose the package seed migration (that's artifact #5, skeleton only).
- It does NOT touch the existing 18 DB rows. The reconciliation runs as a one-time migration AFTER the XLS lands and the user approves the seed.

---

**End of reconciliation map. 18 existing rows mapped to 9 public families + 1 admin-only utility family. Awaiting canonical XLS for package details.**
