# Legacy → Canonical Service Reconciliation — v1

**Status**: structural reconciliation complete · awaiting user approval
**Produced**: 2026-04-26
**Source data**:
- 18 live `booking_services` rows (production export 2026-04-26)
- 9 publicly-visible canonical families + 1 admin-only utility (per [docs/service-reconciliation.md](service-reconciliation.md) v2 with 9 locked decisions)
- 3 live bookings (verified): 2× CONFIRMED `weddings` + 1× CANCELLED `portrait`
- Master file Section 5/6 family + package architecture

**Constraint**: this doc maps STRUCTURE only. No invented prices, no invented inclusions, no SQL. Real package details land when the canonical XLS package matrix arrives.

---

## 0 · Mapping-type definitions (used in the table below)

| Type | Meaning | Backfill safety |
|---|---|---|
| `DIRECT_UPGRADE` | Legacy slug → 1 new package, same intent, clean rename only | YES |
| `MERGE` | Legacy slug joins a multi-package family as one of its tiers; sibling packages also exist in the family | YES (1:1 source→target preserved) |
| `SPLIT` | Legacy slug needs to become MULTIPLE new packages (one was an umbrella term) | NO (ambiguous which target a customer paid for) |
| `DEPRECATE_TO_CUSTOM` | No canonical package destination; route to RFQ-only | NO (no destination) |

**Verdict for the 18 rows**: all 18 are either `DIRECT_UPGRADE` or `MERGE`. Zero `SPLIT`. Zero `DEPRECATE_TO_CUSTOM`. Auto-backfill is safe for every row that has live bookings.

---

## 1 · Per-row reconciliation (all 18 legacy `booking_services`)

Each row's "destination package slug" is a **proposal** — the XLS may rename. The `family.slug` is locked.

| # | legacy slug | legacy name_en | $USD | dest. family | dest. package (proposed) | type | reasoning | backfill safe |
|---|---|---|---|---|---|---|---|---|
| 1 | `weddings` | Wedding Photography | $1,000 | `wedding-photography` | `essential-4h` | MERGE | The legacy 4h/$1000 row is the entry tier of a family that will gain Full Day, Destination, and Multi-day packages from XLS. | **YES** ⚠ |
| 2 | `engagement-session` | Engagement Session | $180 | `wedding-photography` | `engagement-session` | DIRECT_UPGRADE | Discrete sub-product within the wedding family; slug semantics carry over with no rename needed. | YES |
| 3 | `quinceaneras` | Quinceañera Photography | $800 | `event-photography` | `quinceanera-coverage` | MERGE | Joins event-photography alongside birthday, baptism, graduation, corporate-event as one of multiple ceremony packages. | YES |
| 4 | `baptism` | Baptism Photography | $250 | `event-photography` | `baptism` | MERGE | Discrete ceremony package merging into event-photography family. | YES |
| 5 | `graduation` | Graduation Photography | $200 | `event-photography` | `graduation` | MERGE | Discrete ceremony package merging into event-photography family. | YES |
| 6 | `birthday-party` | Birthday Party Photography | $300 | `event-photography` | `birthday-party` | MERGE | Joins event family; the existing `/services/birthday-photographer` SEO page (per Decision 3) routes commercially into this package via deep-link. | YES |
| 7 | `portrait` | Portrait Session | $100 | `portrait-photography` | `studio-portrait-1h` | MERGE | Entry-level portrait merges into a family that XLS will expand with Executive, Combo, Zona Colonial, Anniversary, Christmas, Boudoir, AI Avatar, and Snoot packages. | **YES** ⚠ |
| 8 | `family-session` | Family Session | $200 | `family-photography` | `family-session` | DIRECT_UPGRADE | Anchor SKU of the family-photography family; slug carries over. | YES |
| 9 | `maternity` | Maternity Session | $150 | `family-photography` | `maternity` | MERGE | One-hour maternity session merges into family-photography alongside family-session and children. | YES |
| 10 | `children-session` | Children's Sessions | $150 | `family-photography` | `children-session` | MERGE | Discrete kids-only package within family-photography. | YES |
| 11 | `corporate-portrait` | Corporate Portraits | $180 | `portrait-photography` | `corporate-portrait` | MERGE | Premium portrait tier alongside studio + creative portrait packages. | YES |
| 12 | `corporate-event` | Corporate Events | $300 | `event-photography` | `corporate-event-2h` | MERGE | Corporate variant within the events family; tagged for the "for businesses" sub-section of the compare page. | YES |
| 13 | `commercial` | Commercial Photography | $250 | `commercial-photography` | `commercial-1h` | MERGE | Per-hour commercial base package; flagship of the commercial family. | YES |
| 14 | `food-and-beverage` | Food & Beverage | $250 | `commercial-photography` | `food-and-beverage` | MERGE | Discrete commercial sub-vertical (gastronomic photography) within the commercial family. | YES |
| 15 | `real-estate` | Real Estate Photography | $150 | `commercial-photography` | `real-estate` | MERGE | Discrete commercial sub-vertical (real-estate) within the commercial family per Decision 4. | YES |
| 16 | `drone-aerial` | Drone Aerial Photography | $250 | `drone-services-photography-punta-cana` | `standard-aerial-2h` | MERGE | Standard tier of the drone family; XLS will add Quick aerial and Commercial production tiers. | YES |
| 17 | `video-production` | Video Production | $800 | `video-production` (NEW) | `full-day-production` | MERGE | Anchor SKU of the new video-production family; XLS will add half-day and premium tiers. New SEO URL `/services/video-production` required. | YES |
| 18 | `proposal-photography` | Proposal Photography | $250 | `proposal-photography` | `ninja-standard` | DIRECT_UPGRADE | Currently the only proposal SKU; family will gain Premium and Luxury Destination tiers from XLS. | YES |

**Live-booking footnote** (⚠ in column "backfill safe"):
- Row 1 (`weddings`): 2 bookings rely on this mapping — `e7ae1c19-…df1c` (CONFIRMED, 2026-04-29) and `…` (CONFIRMED, 2026-04-28). Migration 016's backfill MUST set `family_id = wedding-photography` and `package_id = essential-4h` (or whatever the XLS names this tier) for these rows.
- Row 7 (`portrait`): 1 booking (CANCELLED, 2026-04-27). Backfill should still be done for accounting completeness (CANCELLED rows are not destroyed; they're audit data).
- Rows 2–6, 8–18: zero live bookings, so backfill is "safe" trivially (no production data depends on the mapping).

---

## 2 · Mapping-type rollup

| Mapping type | Count | Rows |
|---|---|---|
| `DIRECT_UPGRADE` | 3 | engagement-session, family-session, proposal-photography |
| `MERGE` | 15 | weddings, quinceaneras, baptism, graduation, birthday-party, portrait, maternity, children-session, corporate-portrait, corporate-event, commercial, food-and-beverage, real-estate, drone-aerial, video-production |
| `SPLIT` | 0 | — |
| `DEPRECATE_TO_CUSTOM` | 0 | — |

The DIRECT_UPGRADE / MERGE distinction is mostly cosmetic for the migration logic (both produce a 1:1 row→row backfill). The line is drawn at "does the legacy slug need a rename to fit naturally into the new family's tier naming convention?" — for MERGE rows, the proposed new package slug differs from the legacy slug (e.g., `weddings` → `essential-4h`, `portrait` → `studio-portrait-1h`) so the family's other siblings can sit beside it without confusion.

---

## 3 · Section A — Legacy services that should remain publicly accessible via SEO redirect pages

The site currently exposes 8 SEO landing URLs; **all 8 must remain alive after the rebuild** (Architectural Commitment #4 — no URL loss). Their CTAs change to route into the new family compare page, but the URL itself is preserved with full content.

| Existing public URL | Hosts which legacy slugs (intent) | Post-rebuild role |
|---|---|---|
| `/services/wedding-photography` | weddings + engagement-session | family SEO page → routes CTAs to `/services/wedding-photography/packages` |
| `/services/portrait-photography` | portrait + corporate-portrait | family SEO page → `/services/portrait-photography/packages` |
| `/services/event-photography` | quinceaneras + baptism + graduation + birthday-party + corporate-event | family SEO page → `/services/event-photography/packages` |
| `/services/family-photography` | family-session + maternity + children-session | family SEO page → `/services/family-photography/packages` |
| `/services/commercial-photography` | commercial + food-and-beverage + real-estate | family SEO page → `/services/commercial-photography/packages` |
| `/services/drone-services-photography-punta-cana` | drone-aerial | family SEO page → `/services/drone-services-photography-punta-cana/packages` |
| `/services/proposal-photography` | proposal-photography | family SEO page → `/services/proposal-photography/packages` |
| `/services/birthday-photographer` | birthday-party (Decision 3 alias) | SEO landing page that routes commercially into `event-photography` compare with focused tab |

**New SEO URL to create** (Decision 5):
- `/services/video-production` — for the video-production family. No existing equity; ranks as a new keyword.

**No legacy slug is "an SEO page" of its own.** Slugs are package identifiers; SEO pages are family identifiers. So this section is really mapping legacy slugs to which existing SEO page covers them — and the answer is **all 18 are covered**, mostly via the existing 8 pages plus the 1 new page for video.

---

## 4 · Section B — Legacy services that should disappear from direct booking completely

**Count: 0.**

None of the 18 legacy slugs need to lose direct-bookability. All currently sit at `bookable=true` in production with a fixed price and clear scope. Each has a clean canonical destination as a `bookable_direct=true` package in the new model.

This will become non-zero ONLY when the XLS introduces NEW packages within these families that should be quote-only (e.g., master file §6.A includes "Multi-day / Custom Wedding — RFQ only" — but that's a new package, not a migration of an existing one).

---

## 5 · Section C — Legacy services that should survive only as hidden quote-request options

**Count: 0.**

Same reasoning as Section B: every legacy slug has a clean direct-bookable destination. No legacy service needs to be hidden behind RFQ-only routing.

The `custom-specialty` admin-only family (Decision 6) is **for new RFQ submissions** that don't fit any other family — it does NOT receive any of the 18 legacy slugs as members.

---

## 6 · Backfill safety summary

The only legacy slugs with live booking data are:

| Legacy slug | Live bookings | Status | Required backfill in migration 016 |
|---|---|---|---|
| `weddings` | 2 | both CONFIRMED | `family_id=wedding-photography`, `package_id=essential-4h` (or final XLS slug), `package_snapshot` JSONB built from final XLS values |
| `portrait` | 1 | CANCELLED | `family_id=portrait-photography`, `package_id=studio-portrait-1h` (or final XLS slug); CANCELLED bookings still get backfilled for accounting |
| (other 16) | 0 | — | no backfill action needed for those slugs (no historical data to preserve) |

**All 3 backfills are deterministic and safe**: each legacy slug has exactly one canonical destination, and the destination price (per current legacy row) is the entry-level tier of its target family. The customer's `stripe_amount_usd` and `deposit_amount_usd` already match the legacy row's price, so the `package_snapshot.price_usd` will be identical to what they paid.

---

## 7 · Open items requiring XLS data

The following package slugs are **proposals** in this v1 doc and may be renamed when XLS lands:

| Proposed (this doc) | Legacy source | Awaiting XLS confirmation |
|---|---|---|
| `essential-4h` | weddings | Final wedding-tier slug (could also be `core-wedding`, `essential`, `wedding-essential`, etc.) |
| `studio-portrait-1h` | portrait | Final portrait base-tier slug |
| `commercial-1h` | commercial | Final commercial base-tier slug |
| `corporate-event-2h` | corporate-event | Final corporate-event slug |
| `standard-aerial-2h` | drone-aerial | Final standard drone slug |
| `full-day-production` | video-production | Final full-day video slug |
| `quinceanera-coverage` | quinceaneras | Final quinceañera slug |

The other 11 proposed slugs are unlikely to change (`engagement-session`, `baptism`, `graduation`, `birthday-party`, `family-session`, `maternity`, `children-session`, `corporate-portrait`, `food-and-beverage`, `real-estate`, `ninja-standard`).

---

## 8 · What this document does NOT do

- It does NOT define final package names, prices, durations, photo counts, or inclusions.
- It does NOT propose any new packages (the new tiers in each family come from XLS, not from this doc).
- It does NOT contain any SQL.
- It does NOT touch the live `booking_services` table.

---

**End of reconciliation v1. 18 legacy rows mapped: 3 DIRECT_UPGRADE, 15 MERGE, 0 SPLIT, 0 DEPRECATE_TO_CUSTOM. All 3 live bookings are auto-backfill safe. Awaiting user approval to lock proposed package slugs, or XLS arrival to override them.**
