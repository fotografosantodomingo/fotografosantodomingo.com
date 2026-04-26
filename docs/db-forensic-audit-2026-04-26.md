# Production Database Forensic Audit

**Date**: 2026-04-26
**Project**: fotografosantodomingo.com
**Supabase project ref**: `ummlavdykprwozwzhvge`
**Scope**: live production state vs. what repo migrations claim
**Method**: PostgREST OpenAPI introspection + per-table column probe + targeted column existence tests + cross-reference with `supabase/migrations/`

---

## 🚨 Executive Summary — 1 critical finding, layering verdict GREEN

| # | Finding | Severity |
|---|---|---|
| **1** | **Migrations 009 + 010 committed in repo but NEVER applied to production.** The `quotes` table is missing 3 columns (`proposal_token_hash`, `stripe_session_id`, `stripe_payment_intent`) that the `/api/stripe/checkout` and `/api/stripe/webhook` and `/admin/quotes/[id]/actions.ts` code expects. **Any attempt to send a proposal or receive a Stripe webhook for a quote would fail with HTTP 500.** Likely never triggered because the proposal payment flow has not been used in production yet. | 🔴 HIGH |
| 2 | All 15 production tables match repo migrations 001–008 + 011–014. No unexpected tables, no unexpected columns. | 🟢 OK |
| 3 | 1 RPC function present and working: `get_available_slots`. No other custom DB functions exposed. | 🟢 OK |
| 4 | Migration 014 (timezone fix) confirmed applied. Migration 015 confirmed NOT applied. | 🟢 OK |

**Verdict on migration 015/016 layering**: ✅ **Safe to apply 015 with one prerequisite** — apply 009 + 010 first (or confirm proposal flow truly unused). Migration 015 does not depend on 009/010 directly, but applying them brings the schema in sync with the deployed code before we add another layer.

---

## 1 · All public objects in production

### 1.1 Tables / views (15 total)

Inferred via PostgREST OpenAPI spec (`Accept: application/openapi+json` on `/rest/v1/`):

| Object | Type | Source migration | Cols | Rows |
|---|---|---|---|---|
| `admin_users` | table | (legacy, pre-repo) | 3 | 0 |
| `automation_logs` | table | `20260407_002_create_automation_logs.sql` | 20 | 54 |
| `availability_overrides` | table | `20260424_012_availability.sql` | 8 | 0 |
| `availability_rules` | table | `20260424_012_availability.sql` | 7 | 7 |
| `blog_posts` | table | `20260407_001_create_blog_posts.sql` (+ enrichments) | 71 | 48 |
| `booking_email_log` | table | `20260424_013_bookings.sql` | 8 | 4 |
| `booking_services` | table | `20260424_011_booking_services.sql` | 16 | 18 |
| `bookings` | table | `20260424_013_bookings.sql` | 27 | 3 |
| `contact_submissions` | table | `004_contact_submissions.sql` | 14 | 10 |
| `newsletter_subscriptions` | table | `005_newsletter_subscriptions.sql` | 15 | 2 |
| `portfolio_images` | table | `001_image_seo.sql` (+ updates) | 24 | 59 |
| `quotes` | table | `20260412_006_create_quotes_system.sql` (+ 007 +missing 009 +missing 010) | 23 | 6 |
| `reviews` | table | `001_image_seo.sql` | 9 | 16 |
| `review_stats` | view | `001_image_seo.sql` (CREATE VIEW) | 4 | 1 |
| `staff_members` | table | `20260424_011_booking_services.sql` | 10 | 1 |

### 1.2 Custom RPC functions (1 total)

| Function | Returns | Source migration | Status |
|---|---|---|---|
| `get_available_slots(p_staff_id UUID, p_date DATE, p_duration_min INTEGER)` | `TABLE(slot_time TIME)` | `20260424_012_availability.sql` (CREATE), patched by `20260425_014_fix_get_available_slots_timezone.sql` (CREATE OR REPLACE) | ✅ Applied + timezone-fixed (verified by Sprint 4 QA on 2026-04-25) |

### 1.3 Enums in `public` schema (4 detected)

Confirmed live by triggering "invalid value" errors which Postgres echoes back with the enum name:

| Enum | Defined in | Verified |
|---|---|---|
| `booking_status` | `20260424_013_bookings.sql` | ✅ (PATCH on bookings with bogus status returned `invalid input value for enum booking_status`) |
| `booking_email_type` | `20260424_013_bookings.sql` | ✅ (referenced by `booking_email_log` schema) |
| `quote_status` | `20260412_006_create_quotes_system.sql` | ✅ (POST on quotes with bogus status returned `invalid input value for enum quote_status`) |
| `quote_contact_method` | `20260412_006_create_quotes_system.sql` | ✅ (referenced by `quotes.preferred_contact_method` schema) |

### 1.4 Triggers, RLS policies, indexes — limited visibility

These are not exposed via PostgREST. Status inferred from behavior:

- **Triggers**: every table I queried with `updated_at` returns valid timestamps that change on update — `set_updated_at_timestamp()` trigger fires correctly on `bookings`, `booking_services`, `staff_members`, `quotes`, etc.
- **RLS policies**: every test query I ran with the service role key succeeded; anon-write to `bookings` succeeds (Sprint 1 QA proved); anon-read of inactive `booking_services` rows would be filtered (functional verification only).
- **Indexes**: cannot enumerate without `pg_indexes` access. Performance behavior on Sprint 1 QA was acceptable, suggesting all index migrations applied.

---

## 2 · Detailed schemas (booking-relevant tables)

### 2.1 `bookings` (27 columns, 3 rows)

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NOT NULL | `gen_random_uuid()` |
| `service_id` | uuid | NOT NULL | — |
| `staff_id` | uuid | NOT NULL | — |
| `customer_name` | text | NOT NULL | — |
| `customer_email` | text | NOT NULL | — |
| `customer_phone` | text | NULL | — |
| `locale` | text | NOT NULL | `'es'` |
| `starts_at` | timestamptz | NOT NULL | — |
| `ends_at` | timestamptz | NOT NULL | — |
| `status` | `public.booking_status` | NOT NULL | `'PENDING_PAYMENT'` |
| `stripe_payment_intent_id` | text | NULL | — |
| `stripe_charge_id` | text | NULL | — |
| `stripe_amount_usd` | numeric | NULL | — |
| `deposit_amount_usd` | numeric | NULL | — |
| `currency_display` | text | NOT NULL | `'USD'` |
| `dop_rate` | numeric | NULL | — |
| `terms_accepted` | boolean | NOT NULL | `false` |
| `terms_accepted_at` | timestamptz | NULL | — |
| `reminder_24h_sent` | boolean | NOT NULL | `false` |
| `reminder_same_day_sent` | boolean | NOT NULL | `false` |
| `post_session_sent` | boolean | NOT NULL | `false` |
| `admin_notes` | text | NULL | — |
| `cancellation_reason` | text | NULL | — |
| `cancelled_at` | timestamptz | NULL | — |
| `refund_amount_usd` | numeric | NULL | — |
| `created_at` | timestamptz | NOT NULL | `now()` |
| `updated_at` | timestamptz | NOT NULL | `now()` |

**Status values present in 3 live rows**: `CONFIRMED`, `CANCELLED`.

### 2.2 `booking_services` (16 columns, 18 rows)

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NOT NULL | `gen_random_uuid()` |
| `slug` | text | NOT NULL | UNIQUE |
| `name_es` | text | NOT NULL | — |
| `name_en` | text | NOT NULL | — |
| `description_es` | text | NULL | — |
| `description_en` | text | NULL | — |
| `icon` | text | NOT NULL | `'📷'` |
| `category` | text | NOT NULL | `'portrait'` |
| `duration_min` | integer | NOT NULL | `60`, CHECK > 0 |
| `price_usd` | numeric | NOT NULL | CHECK ≥ 0 |
| `deposit_percent` | integer | NOT NULL | `50`, CHECK 0–100 |
| `bookable` | boolean | NOT NULL | `true` |
| `active` | boolean | NOT NULL | `true` |
| `sort_order` | integer | NOT NULL | `0` |
| `created_at` | timestamptz | NOT NULL | `now()` |
| `updated_at` | timestamptz | NOT NULL | `now()` |

### 2.3 `quotes` (23 columns, 6 rows) — **MISSING 3 EXPECTED COLUMNS**

Present:

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NOT NULL | `gen_random_uuid()` |
| `created_at` | timestamptz | NOT NULL | `now()` |
| `updated_at` | timestamptz | NOT NULL | `now()` |
| `locale` | text | NOT NULL | `'es'` |
| `service_type` | text | NULL | — |
| `event_date` | date | NULL | — |
| `country` | text | NULL | — |
| `state` | text | NULL | — |
| `city` | text | NULL | — |
| `description` | text | NULL | — |
| `full_name` | text | NULL | — |
| `email` | text | NULL | — |
| `whatsapp_phone` | text | NULL | — |
| `preferred_contact_method` | `public.quote_contact_method` | NULL | — |
| `callback_time_preference` | text | NULL | — |
| `status` | `public.quote_status` | NOT NULL | `'PENDING_REVIEW'` |
| `final_price_usd` | numeric | NULL | — |
| `admin_note_customer` | text | NULL | — |
| `admin_internal_notes` | text | NULL | — |
| `proposal_expires_at` | timestamptz | NULL | — |
| `form_step_reached` | integer | NOT NULL | `1` |
| `participants_count` | integer | NULL | — |
| `add_drone` | boolean | NOT NULL | `false` |

**Missing — referenced by application code but NOT in production DB**:

| Column | Should be added by | Used by |
|---|---|---|
| `proposal_token_hash` (TEXT, unique partial index) | `20260424_009_add_proposal_token.sql` | `src/app/api/stripe/checkout/route.ts:39`, `src/app/proposal/[id]/page.tsx:62`, `src/app/admin/quotes/[id]/actions.ts:84` |
| `stripe_session_id` (TEXT, partial index) | `20260424_010_add_stripe_payment_fields.sql` | `src/app/api/stripe/webhook/route.ts:51` |
| `stripe_payment_intent` (TEXT) | `20260424_010_add_stripe_payment_fields.sql` | `src/app/api/stripe/webhook/route.ts:53` |

**Verified live with HTTP 400 + Postgres `42703 column does not exist` errors** on each column.

### 2.4 `booking_email_log` (8 cols, 4 rows)

Standard schema per `20260424_013_bookings.sql` — all fields present.

### 2.5 `staff_members` (10 cols, 1 row)

Standard schema per `20260424_011_booking_services.sql` — all fields present.
Single seeded row: Michal Babula (already verified by Sprint 1 QA).

### 2.6 `availability_rules` (7 cols, 7 rows)

Standard schema. 7 rows = one rule per day-of-week.

### 2.7 `availability_overrides` (8 cols, 0 rows)

Standard schema. Empty — no vacation blocks set.

---

## 3 · Foreign key dependency map

Inferred from repo migrations (all migrations 011, 012, 013 confirmed applied):

```
                  staff_members.id
                        ▲
            ┌───────────┼─────────────────┐
            │           │                 │
   availability_rules  availability_   bookings.staff_id
   .staff_id          overrides.       (FK, NOT NULL)
   (FK, ON DELETE     staff_id
    CASCADE)          (FK, ON DELETE
                       CASCADE)


                booking_services.id
                       ▲
                       │
                       │
                bookings.service_id
                (FK, NOT NULL — no ON DELETE specified
                 → defaults to NO ACTION, prevents service deletion
                 if any booking references it)


                  bookings.id
                       ▲
                       │
                       │
                booking_email_log.booking_id
                (FK, ON DELETE CASCADE)
```

**Inbound FK references to `booking_services`**: 1 — `bookings.service_id`.
**Inbound FK references to `bookings`**: 1 — `booking_email_log.booking_id`.

This means migration 016 (the cutover) needs to:
1. Drop `bookings.service_id` FK constraint before dropping `booking_services` table
2. The `booking_email_log → bookings` CASCADE relationship is unaffected (we're not dropping `bookings`)

The migration 016 skeleton already documents this in Step 5.

---

## 4 · Row counts (booking-related)

```
bookings                      3 rows   (CONFIRMED + CANCELLED only)
booking_services             18 rows   (active = matches /api/bookings/services count)
booking_email_log             4 rows
staff_members                 1 row    (Michal Babula)
availability_rules            7 rows   (one per day-of-week)
availability_overrides        0 rows
quotes                        6 rows   (status: PENDING_REVIEW)
```

**Key takeaways**:
- 3 bookings are real and need backfill in migration 016 — confirmed.
- 6 quotes exist in `PENDING_REVIEW` — none have been promoted to ACCEPTED/REJECTED, which is consistent with the proposal-flow code being broken (couldn't write `proposal_token_hash`).
- Email log has 4 entries from the 3 bookings (1 confirmation + 1 admin alert per booking, but only some sent — likely 4 = 2 booking confirmations + 2 admin alerts; sample needed if you want exact attribution).

---

## 5 · Migration history audit

Repo has 23 migration files. Applied status determined by inspecting which tables/columns/RPCs exist in production:

| File | Status | Evidence |
|---|---|---|
| `001_image_seo.sql` | ✅ Applied | `portfolio_images`, `reviews`, `review_stats` all exist |
| `002_localized_image_fields.sql` | ✅ Applied | `portfolio_images.alt_text_es`, `alt_text_en` columns present |
| `003_ai_caption_fields.sql` | ✅ Applied | AI caption columns present in portfolio_images |
| `004_contact_submissions.sql` | ✅ Applied | `contact_submissions` table exists |
| `005_newsletter_subscriptions.sql` | ✅ Applied | `newsletter_subscriptions` table exists |
| `006_blog_posts.sql` | ✅ Applied | `blog_posts` exists (later modified) |
| `20260407_001_create_blog_posts.sql` | ✅ Applied | full blog schema present |
| `20260407_002_create_automation_logs.sql` | ✅ Applied | `automation_logs` exists |
| `20260407_003_rls_policies.sql` | ✅ Applied (inferred) | RLS allows anon insert on contact, etc |
| `20260407_004_indexes.sql` | ✅ Applied (inferred) | query performance acceptable |
| `20260408_005_blog_posts_page_sections.sql` | ✅ Applied | `blog_posts.page_sections` column present |
| `20260411_005_add_blog_cover_image_seo_fields.sql` | ✅ Applied | cover image SEO columns present |
| `20260412_006_create_quotes_system.sql` | ✅ Applied | `quotes` table + `quote_status` enum exist |
| `20260412_007_quote_participants_drone_step.sql` | ✅ Applied | `participants_count` and `add_drone` columns present |
| `20260422_008_blog_posts_social_links.sql` | ✅ Applied | `blog_posts` has social_links column (assumed in 71-col count) |
| **`20260424_009_add_proposal_token.sql`** | ❌ **NOT applied** | `quotes.proposal_token_hash` returns 42703 |
| **`20260424_010_add_stripe_payment_fields.sql`** | ❌ **NOT applied** | `quotes.stripe_session_id`, `stripe_payment_intent` return 42703 |
| `20260424_011_booking_services.sql` | ✅ Applied | `booking_services` + `staff_members` exist with all 16/10 columns |
| `20260424_012_availability.sql` | ✅ Applied | `availability_rules`, `availability_overrides`, `get_available_slots()` all exist |
| `20260424_013_bookings.sql` | ✅ Applied | `bookings` + `booking_email_log` + enums exist |
| `20260425_014_fix_get_available_slots_timezone.sql` | ✅ Applied | confirmed by Sprint 4 QA on 2026-04-25 (manual paste in dashboard) |
| `20260426_015_service_families_and_packages.sql` | ❌ Not applied | `service_families`, `service_packages`, `quote_requests` all return 404 |
| `20260426_016_seed_packages.sql` | ❌ Not applied | depends on 015 |

**Out-of-sync count**: 2 missing (009 + 010) + 2 expected-not-yet (015 + 016).

---

## 6 · Production drift findings

### 6.1 Drift from repo → production

**Confirmed drift**: migrations `20260424_009` and `20260424_010` exist in repo but never ran.

The likely chain of events:
- 2026-04-24: migrations 009/010/011/012/013 were all created in the same dev session
- 011 + 012 + 013 were run via Supabase SQL editor (the booking system needed these)
- 009 + 010 were SKIPPED — possibly because the user pasted only the bookings ones, or because 009/010 were created later than 011-013 in a different commit and forgotten
- The proposal payment flow code was deployed but the columns it needs were never added

### 6.2 Drift from production → repo

**None detected.** No unexpected tables, no unexpected columns, no unexpected RPCs. This is good — production state is a strict subset of what repo claims (rather than diverged in unknown directions).

The only items I cannot directly observe via PostgREST:
- Manual indexes created in dashboard (would show in dashboard's "Database → Indexes")
- Manual RLS policy edits (would show in dashboard's "Database → Policies")
- Manual trigger or function changes

If any of those exist, they'd be invisible to this audit. Recommended: spot-check the Supabase dashboard's Database → Triggers, Functions, Indexes, Policies tabs to confirm.

---

## 7 · Verdict on migration 015 + 016 layering

### 7.1 Can migration 015 be applied safely now?

**✅ YES — with one prerequisite recommended.**

Migration 015 is purely additive:
- Creates 3 new tables (`service_families`, `service_packages`, `quote_requests`) — none collide with existing names
- Adds 5 new columns to `bookings` — all NULLable, all `IF NOT EXISTS`
- Adds new RLS policies under unique names — no conflict
- Adds new indexes under unique names — no conflict
- Adds new triggers using existing `set_updated_at_timestamp()` function (which is already present)

It does NOT depend on migrations 009 or 010. So technically it can run today.

**Recommendation before applying 015**: apply migrations 009 + 010 first.

Reasons:
1. The proposal payment flow is currently silently broken in production. Applying 009 + 010 fixes it without code changes.
2. Bringing production into sync with repo before adding a new layer reduces cognitive load — every future migration audit is cleaner.
3. If the proposal flow is never going to be used and you'd rather **keep it disabled**, mark migrations 009 + 010 as "deprecated" in the repo (rename them to `.sql.deprecated`) so future audits don't flag them as drift. But this is a design decision.

### 7.2 Can migration 016 be applied safely now?

**❌ NO — it's a skeleton.** Every actual `INSERT`, `UPDATE`, `DROP`, `CREATE VIEW` is commented out. The migration would run successfully but accomplish nothing (only the `BEGIN; assertion; COMMIT;` shell would execute).

It needs the canonical XLS package matrix to be filled in with real seed rows. Once that lands:
- Steps 1 + 2 (seed families + packages): straightforward
- Step 3 (backfill 3 live bookings): needs explicit mapping per row — see §1.1 of `docs/service-reconciliation.md`
- Steps 5–7 (drop FK, drop table, create view): destructive, require fresh `npm run backup:db` immediately before
- Step 8 (final assertion ≥18 rows): adjustable target

### 7.3 Recommended apply order

```
1. (immediate, 1 minute)         Apply migration 009 in Supabase SQL editor
2. (immediate, 1 minute)         Apply migration 010 in Supabase SQL editor
3. (verify, 30 seconds)          Re-run §6 probes to confirm drift is gone
4. (await user)                  Receive canonical XLS package matrix
5. (15 minutes)                  Fill migration 016 with real rows; produce mapping doc
6. (await user)                  Approve mapping
7. (immediate, 30 seconds)       npm run backup:db (off-disk before destruction)
8. (immediate, 1 minute)         Apply migration 015 in Supabase SQL editor
9. (immediate, 1 minute)         Apply migration 016 in Supabase SQL editor
10. (verify)                     Backwards-compat view returns ≥ 18 rows; live bookings backfilled
11. (Slice A code)               Build /admin/families/*, /admin/quote-requests/*, public APIs, wire analytics, upgrade emails
```

---

## 8 · What this audit cannot see (limitations)

- Direct row-level introspection of `pg_catalog.pg_indexes`, `pg_trigger`, `pg_constraint`, `pg_policies` is not exposed via PostgREST and Supabase CLI is logged into a different account locally
- Raw SQL execution capability is unavailable without DB password or PAT
- I'm unable to verify exact CHECK constraint expressions, index definitions, or trigger function bodies — I can only observe their behavior (does an UPDATE bump `updated_at`? yes → trigger works)

To close these visibility gaps, three options:
1. **(Recommended)** Run a one-time SQL paste in Supabase dashboard's SQL editor that dumps `pg_catalog` into a result set — I can write the queries
2. Provide the production DB password to enable `supabase db dump` from this session
3. Run `supabase link` against this account from this machine

Tell me if you want option 1 — I'll write the introspection queries.

---

**End of audit. Production state is healthy and predictable. Migrations 009/010 should be applied before 015. Migration 015 is safe to layer; migration 016 awaits XLS.**
