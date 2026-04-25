# Booking System Implementation Plan
## fotografosantodomingo.com — Custom Setmore Pro Replacement

---

## Goal
Build a fully custom, bilingual (ES/EN), brand-native booking + payment system that matches or exceeds Setmore Pro.
Customers can browse services, pick a date/time from live availability, pay via Stripe (card, Apple Pay, Google Pay), and receive automated email confirmations and reminders — all in their language. Admin can manage the full lifecycle from `/admin/`.

## Scope
- Public route: `/[locale]/book` — multi-step booking wizard
- Admin routes: `/admin/bookings`, `/admin/bookings/[id]`, `/admin/availability`, `/admin/booking-services`
- New Supabase tables: `booking_services`, `staff_members`, `availability_rules`, `availability_overrides`, `bookings`, `booking_email_log`
- New API routes: `/api/bookings/*`, `/api/admin/bookings/*`, `/api/cron/booking-reminders`, `/api/cron/booking-post-session`
- Stripe Payment Element (card + Apple Pay + Google Pay) captured at booking time
- Resend email: confirmation, 24hr reminder, same-day reminder, post-session review request
- Vercel Cron for scheduled emails

## Constraints
- Match existing dark theme, typography, and spacing system — no foreign-looking UI
- All text bilingual (ES/EN) via `next-intl`, including all emails
- Customer language preference stored in `bookings` table and used for all outbound emails
- No double-booking — availability check must be atomic
- No third-party data ownership: all bookings, availability, and email logs in Supabase
- Reuse `getStripe()`, `getResend()`, `createServiceClient()`, admin middleware as-is
- Push to `origin main` only

## Architecture

### Frontend
- `src/app/[locale]/book/page.tsx` — server wrapper (SEO metadata, JSON-LD)
- `src/components/booking/BookingWizard.tsx` — 6-step client wizard
- `src/components/booking/steps/` — individual step components
- `src/app/[locale]/book/confirmation/page.tsx` — post-booking confirmation (also handled inline in wizard)

### Backend API
| Route | Purpose |
|---|---|
| `GET /api/bookings/services` | Public: list active bookable services |
| `GET /api/bookings/availability` | Public: open slots for a date + service + staff |
| `POST /api/bookings` | Public: create booking + Stripe PaymentIntent |
| `GET /api/bookings/[id]` | Public: booking status lookup (confirmation page) |
| `POST /api/stripe/booking-webhook` | Stripe: confirm booking on payment success |
| `GET /api/cron/booking-reminders` | Cron: send 24hr + same-day reminder emails |
| `GET /api/cron/booking-post-session` | Cron: send post-session review email |
| `GET/POST /api/admin/bookings` | Admin: list + patch bookings |
| `POST /api/admin/bookings/[id]/cancel` | Admin: cancel + Stripe refund |
| `POST /api/admin/bookings/[id]/reschedule` | Admin: move to new slot |
| `GET/POST /api/admin/availability` | Admin: set weekly schedule + block dates |
| `GET/POST/PUT/DELETE /api/admin/booking-services` | Admin: service catalog CRUD |

### Data Model (high level)
```
booking_services     — catalog: name_es, name_en, description_es/en, duration_min, price_usd, active
staff_members        — name, bio_es/en, avatar_url, active
availability_rules   — staff_id, day_of_week (0-6), start_time, end_time, active
availability_overrides — staff_id, date, is_blocked, custom_start, custom_end
bookings             — service_id, staff_id, customer_name/email/phone, starts_at, ends_at,
                       status ENUM, locale, stripe_payment_intent_id, stripe_amount_usd,
                       reminder_24h_sent, reminder_same_day_sent, post_session_sent,
                       google_review_url, trustpilot_url, created_at, updated_at
booking_email_log    — booking_id, email_type ENUM, sent_at, recipient_email, locale
```

### Email Templates
| Template | Trigger | Language |
|---|---|---|
| `booking-confirmation` | Immediate after Stripe payment | Customer locale |
| `booking-reminder-24h` | Cron: 24 hours before `starts_at` | Customer locale |
| `booking-reminder-same-day` | Cron: morning of `starts_at` | Customer locale |
| `booking-post-session` | Cron: 2 hours after `ends_at` | Customer locale |
| `booking-admin-new` | Immediate after payment, to admin | ES (admin is Spanish) |

---

## Phased Delivery

### Phase 1 — Database + Security
- [ ] Migration `20260424_011_booking_services.sql`:
  - `booking_services` table with name (ES/EN), description (ES/EN), duration_min, price_usd, sort_order, active
  - `staff_members` table with name, bio (ES/EN), avatar_url, active
- [ ] Migration `20260424_012_availability.sql`:
  - `availability_rules` table (weekly recurring: staff_id, day_of_week, start_time, end_time, active)
  - `availability_overrides` table (per-date: staff_id, date, is_blocked, custom_start, custom_end)
  - DB function `get_available_slots(staff_id, date, duration_min)` — returns open 30-min slots
- [ ] Migration `20260424_013_bookings.sql`:
  - `bookings` table with full lifecycle fields + all email_sent flags
  - `booking_email_log` table
  - Status ENUM: `PENDING_PAYMENT | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW`
  - `updated_at` trigger (reuse pattern from quotes)
  - RLS: anon can INSERT + SELECT own booking by id; service_role full control; authenticated admin full control
  - Indexes: `starts_at`, `status`, `staff_id + starts_at`, `stripe_payment_intent_id`
- [ ] Seed initial `staff_members` row for the photographer
- [ ] Seed initial `availability_rules` (default Mon-Sat 9am-6pm, 30-min slot interval)
- [ ] **Needs from you:** service list, staff name(s), default working hours

### Phase 2 — Service Catalog + Availability API
- [ ] `src/lib/bookings/constants.ts` — slot interval config, max advance booking window
- [ ] `GET /api/bookings/services` — returns active services ordered by sort_order
- [ ] `GET /api/bookings/availability?staff_id=&date=&service_id=` — returns open slots for a given date:
  - Applies `availability_rules` for the day-of-week
  - Applies `availability_overrides` for that specific date
  - Subtracts already-confirmed bookings during that window
  - Returns `string[]` of ISO time slots (e.g. `["09:00","09:30","10:00"...]`)
- [ ] Unit test plan: blocked day returns empty, booked slot excluded, override wins over rule
- [ ] `GET /api/bookings/staff` — returns active staff (for staff selection step)

### Phase 3 — Booking Creation + Stripe
- [ ] `POST /api/bookings`:
  - Validates slot is still open (atomic: re-check inside Supabase transaction)
  - Creates booking with status `PENDING_PAYMENT`
  - Creates Stripe `PaymentIntent` with amount from `booking_services.price_usd`
  - Enables `automatic_payment_methods: { enabled: true }` (covers card, Apple Pay, Google Pay automatically)
  - Returns `{ bookingId, clientSecret }`
- [ ] `POST /api/stripe/booking-webhook`:
  - Handles `payment_intent.succeeded` → set booking status to `CONFIRMED`
  - Handles `payment_intent.payment_failed` → set status to `PENDING_PAYMENT` (slot released)
  - Handles `charge.refunded` → set status to `CANCELLED`
  - Triggers `sendBookingConfirmation()` + `sendBookingAdminAlert()` on success
  - Vercel webhook secret verification (same pattern as proposal webhook)
- [ ] `GET /api/bookings/[id]` — public status endpoint (used by confirmation page)
- [ ] Stale `PENDING_PAYMENT` slot cleanup: bookings older than 30min with no payment revert to available
  (can be done via DB cron or in availability slot calculation — mark as released)
- [ ] **Needs from you:** Stripe currency (USD assumed), deposit vs full payment preference (full assumed)

### Phase 4 — Email System
- [ ] Extend `src/lib/email/resend.ts` with booking email functions:
  - `sendBookingConfirmation(booking, service, staff, locale)` — bilingual HTML
  - `sendBookingAdminAlert(booking, service, staff)` — ES admin alert
  - `sendBookingReminder24h(booking, service, staff, locale)`
  - `sendBookingReminderSameDay(booking, service, staff, locale)`
  - `sendBookingPostSession(booking, service, locale, reviewUrls)` — friendly review request
- [ ] Email designs:
  - Match existing email style (gradient header, card layout, brand colors)
  - Confirmation: booking date/time, service, photographer, what to expect, add-to-calendar link
  - Reminders: compact, clear appointment summary + address/meeting point
  - Post-session: warm tone, direct one-click button to Google Review + Trustpilot
- [ ] All email sends logged to `booking_email_log`
- [ ] **Needs from you:** Google Business Review URL, Trustpilot profile URL

### Phase 5 — Public Booking Wizard UI
- [ ] `/[locale]/book/page.tsx` with full `generateMetadata()` + BreadcrumbList JSON-LD
- [ ] `BookingWizard.tsx` — 6-step wizard client component:
  - **Step 1 — Service:** Cards with icon, name (localized), duration badge, price. Single select.
  - **Step 2 — Staff:** Photographer cards (or auto-select if only one staff member). Skip if single staff.
  - **Step 3 — Date:** Calendar month view. Dates without availability greyed out. Click to load slots.
  - **Step 4 — Time:** Slot grid from availability API. Confirm selection shows summary.
  - **Step 5 — Your Details:** Name, email, phone. Language preference auto-detected (stored with booking). Simple validation.
  - **Step 6 — Payment:** Stripe `PaymentElement` mounted with `clientSecret` from booking creation. Handles card + Apple Pay + Google Pay natively.
  - **Confirmation state:** Success screen within wizard (no redirect). Booking summary + "Add to Calendar" button.
- [ ] Progress bar + step labels (localized)
- [ ] Mobile-first layout — calendar and slot grid work well on 390px
- [ ] Dark theme + site accent colors throughout
- [ ] Translations: add all keys to `src/messages/es.json` + `src/messages/en.json` under `booking.*` namespace

### Phase 6 — Scheduled Emails (Cron)
- [ ] `GET /api/cron/booking-reminders`:
  - Protected by `Authorization: Bearer CRON_SECRET`
  - Query bookings where `starts_at` is in 23–25h window → send `booking-reminder-24h`, set flag
  - Query bookings where `starts_at` is today, morning not yet sent → send `booking-reminder-same-day`, set flag
- [ ] `GET /api/cron/booking-post-session`:
  - Query bookings where `ends_at` is 2–4h ago, status `CONFIRMED`, post_session not sent → send review email, set flag
- [ ] Add to `vercel.json` cron config:
  ```json
  { "path": "/api/cron/booking-reminders", "schedule": "0 7 * * *" },
  { "path": "/api/cron/booking-post-session", "schedule": "0 20 * * *" }
  ```
- [ ] Add `CRON_SECRET` to environment variables
- [ ] **Note:** Vercel Cron on hobby plan runs at most once/day; Pro plan supports any cron schedule

### Phase 7 — Admin Panel Extensions
- [ ] `/admin/bookings/page.tsx` — booking list:
  - Tabs: Upcoming / Past / Cancelled / All
  - Columns: customer name, service, date/time, staff, amount, status badge, actions
  - Click row → detail page
- [ ] `/admin/bookings/[id]/page.tsx` — booking detail:
  - Full booking summary
  - Cancel button → calls `/api/admin/bookings/[id]/cancel` (Stripe refund + status update + cancellation email)
  - Reschedule form → pick new date/time, calls `/api/admin/bookings/[id]/reschedule`
  - Email log section (shows which automated emails went out)
- [ ] `/admin/availability/page.tsx` — availability manager:
  - Weekly schedule grid per staff (toggle day on/off, set start/end time)
  - Date overrides section: pick a date, mark as blocked or set custom hours
  - "Block a range" option for vacation periods
- [ ] `/admin/booking-services/page.tsx` — service catalog editor:
  - List of services with toggle (active/inactive), reorder, edit
  - Add/edit service modal: name ES/EN, description ES/EN, duration, price
- [ ] Admin nav sidebar: add "Bookings", "Availability", "Services" links
- [ ] Dashboard summary widget (bookings this week, revenue this month, next 3 upcoming appointments)

### Phase 8 — Navigation + SEO Integration
- [ ] Add "Book Now" CTA button in site navigation (prominent, localized)
- [ ] Add "Book" link to footer
- [ ] Add CTA block to service landing pages (`/[locale]/services/[service]`) pointing to `/[locale]/book?service=SERVICE_SLUG`
  - Booking wizard pre-selects the matching service when `?service=` param is present
- [ ] Add `BookingService` JSON-LD schema (extend `schemaGenerators` in `src/components/seo/JsonLd.ts`)
- [ ] Update `public/llms.txt` with `/[locale]/book` entry
- [ ] Update `sitemap.ts` to include `/[locale]/book`
- [ ] Add `booking.*` i18n keys to both locale files

### Phase 9 — QA + Launch
- [ ] End-to-end ES flow: service → staff → date → time → details → pay → confirmation → check email
- [ ] End-to-end EN flow: same
- [ ] Stripe test mode: card success, card decline, Apple Pay simulator, Google Pay simulator
- [ ] Webhook test: `stripe trigger payment_intent.succeeded`
- [ ] Cron dry-run: hit `/api/cron/booking-reminders` manually with `CRON_SECRET`, verify emails sent
- [ ] Double-booking test: two concurrent requests for same slot — only one should confirm
- [ ] Mobile QA: calendar and payment on 390px
- [ ] Admin panel: create/cancel/reschedule from mobile
- [ ] Verify `PENDING_PAYMENT` slots are released after 30min

---

## What I Need From You Before Phase 1

1. **Service list** — For each service:
   - Name in ES + EN
   - Short description (1-2 sentences, ES + EN)
   - Duration (minutes)
   - Price (USD)
   - Should it be bookable? (some services like weddings might still go through the quote flow)

2. **Staff** — Photographer name(s) for the `staff_members` table. Is there more than one photographer, or always solo?

3. **Working hours** — Default availability. E.g. Mon–Sat 9am–6pm AST? Are Sundays bookable?

4. **Google Review URL** — Direct link to your Google Business review form

5. **Trustpilot URL** — Your Trustpilot business profile URL (or leave blank to skip that button)

6. **Currency** — USD assumed. Confirm, or add DOP (Dominican Peso)?

7. **Deposit vs full payment** — Full payment at booking assumed (same as proposal system). Confirm.

8. **Slot interval** — 30-minute booking slots assumed. Change to 60-min?

---

## Environment Variables to Add

```
CRON_SECRET=<random-secret-for-cron-endpoint-protection>
```
(Stripe, Resend, Supabase vars already exist from the quote system)

---

## Progress Tracker

- [ ] Plan created and saved
- [ ] Phase 1 — Database + Security
- [ ] Phase 2 — Service Catalog + Availability API
- [ ] Phase 3 — Booking Creation + Stripe
- [ ] Phase 4 — Email System
- [ ] Phase 5 — Public Booking Wizard UI
- [ ] Phase 6 — Scheduled Emails (Cron)
- [ ] Phase 7 — Admin Panel Extensions
- [ ] Phase 8 — Navigation + SEO Integration
- [ ] Phase 9 — QA + Launch
