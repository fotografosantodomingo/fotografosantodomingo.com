# Existing Service Reconciliation Map

**Status**: Pre-Slice A readiness artifact #2
**Produced**: 2026-04-26
**Source of truth**: [BOOKING_REBUILD_BLUEPRINT.md](../BOOKING_REBUILD_BLUEPRINT.md)
**Constraint**: Architectural Commitment #3 — family slugs MUST equal existing `/services/<slug>` URLs (SEO equity preservation)

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

The master file Section 5 proposes 12 families; only the 7 above (and possibly birthday) have SEO URLs. The other 5 families (Beach, Studio/Snoot, Video Production, Custom Specialty) need either:
- (a) **new SEO URLs created** (no equity to preserve, OK to invent), or
- (b) **rolled into existing families** as child packages

This document defaults to (a) where the master file explicitly names a separate family, with a note flagging the SEO impact.

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

The blueprint's `service_families` table will hold approximately **11 rows**. The 7 with existing SEO URLs are committed; the other 4 are tentative and depend on the XLS.

| # | Family slug | SEO URL existing? | Source of children | Status |
|---|---|---|---|---|
| 1 | `wedding-photography` | ✅ yes | rows 1, 2 + XLS expansion (Essential / Full Day / Destination / Multi-day per master file §6.A) | committed |
| 2 | `portrait-photography` | ✅ yes | rows 7, 11 + XLS expansion (Executive, Studio 10, SD Portrait, Combo, Zona Colonial, Anniversary, Christmas, Boudoir, AI Avatar per master file §6.C) | committed |
| 3 | `event-photography` | ✅ yes | rows 3, 4, 5, 6, 12 + XLS variants | committed |
| 4 | `family-photography` | ✅ yes | rows 8, 9, 10 + XLS variants (per master file §6.D) | committed |
| 5 | `commercial-photography` | ✅ yes | rows 13, 14, 15 + XLS additions | committed |
| 6 | `drone-services-photography-punta-cana` | ✅ yes | row 16 + XLS expansion (Quick / Standard / Commercial production per master file §6.G) | committed |
| 7 | `proposal-photography` | ✅ yes | row 18 + XLS expansion (Ninja / Premium / Luxury per master file §6.F) | committed |
| 8 | `beach-photography` (NEW) | ❌ no — needs new SEO URL | XLS only (Güibia, Caribbean, Saona, Minitas, Premium 15/20 per master file §6.B) | **awaiting XLS + user OK** |
| 9 | `video-production` (NEW) | ❌ no — needs new SEO URL | row 17 + XLS variants | **awaiting XLS** |
| 10 | `snoot-optical-creative` (NEW) | ❌ no — needs new SEO URL | XLS only (5 / 10 / 15 photos per master file §6.H) | **awaiting XLS** |
| 11 | `custom-specialty` (NEW) | ❌ no — quote-only, may not need SEO URL | XLS only (Master file §6.J) | **awaiting XLS** |

### Required new SEO URL decisions

For families 8–11 (Beach, Video, Snoot, Custom), each needs:
- A new `/services/<slug>` SEO page created (full SEO content, not just a compare grid)
- A new entry in `serviceLandingSlugs` in `src/lib/services/catalog.ts`
- A sitemap entry
- An hreflang pair

OR the user can decide to **not create SEO pages** for some (e.g., Custom Specialty). In that case, the family exists in DB and admin but has no public family page — it surfaces only via /services landing and a link to `/get-quote`.

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

## 5 · Open questions for the user

Before Slice A starts:

1. **Birthday handling**: confirm `/services/birthday-photographer` stays as SEO-only page routing into `event-photography` family — OR should it become its own family with its own SEO URL kept?
2. **Real-estate / food / branding**: confirm they live under `commercial-photography` family — OR should we create a separate `real-estate-photography` family (with new SEO URL)?
3. **Beach / Video / Snoot families**: confirm they should each get a new `/services/<slug>` SEO page, OR is it acceptable to expose them only via the family navigator and skip dedicated SEO pages?
4. **Custom Specialty**: should this family have any public surface, or is it admin-only (used to tag custom RFQ-only quotes)?

Default answers if no input:
1. → SEO page stays, routes into event family
2. → keep under commercial
3. → yes, create dedicated SEO pages (full content needed; ranks for new keywords)
4. → admin-only, no public surface

---

## 6 · What this document does NOT do

- It does NOT define final package names, prices, durations, photo counts, or inclusions. Those come from the canonical XLS.
- It does NOT propose the package seed migration (that's artifact #5, skeleton only).
- It does NOT touch the existing 18 DB rows. The reconciliation runs as a one-time migration AFTER the XLS lands and the user approves the seed.

---

**End of reconciliation map. 18 existing rows mapped to 7 committed families + ~4 new families pending XLS.**
