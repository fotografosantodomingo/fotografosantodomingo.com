# Quote + Booking System Implementation Plan

## Goal
Replace all site-level "Get Quote" flows with a bilingual multi-step quote wizard and admin-managed proposal + deposit flow, while preserving the floating WhatsApp button exactly as-is.

## Scope
- New public route: `/[locale]/get-quote`
- New admin routes: `/admin/login`, `/admin/quotes`, `/admin/quotes/[id]`
- New public proposal route: `/proposal/[id]`
- Supabase table + RLS for quote lifecycle
- Resend email pipeline (3 templates)
- Stripe checkout + webhook for 50% deposit
- Analytics events: `quote_form_submitted`, `whatsapp_click`

## Constraints
- Keep existing design language (light, clean, same typography and spacing)
- Keep floating WhatsApp button unchanged
- Support ES/EN end-to-end
- No Prisma/ORM; use Supabase Postgres + existing service client patterns
- Admin pricing is manual; no auto-pricing logic

## Architecture
- Frontend:
  - `src/app/[locale]/get-quote/*` wizard UI + validation + progress + language toggle
  - `src/app/proposal/[id]/page.tsx` proposal states
- Backend API:
  - `POST /api/quotes` create/update quote draft + final submit
  - `POST /api/admin/quotes/[id]/send-proposal` set price + send magic-link email
  - `POST /api/stripe/webhook` mark quote accepted on checkout completion
- Data:
  - `quotes` table + enums + RLS + indexes + updated_at trigger
- Emails:
  - React Email templates for:
    1. Customer submission confirmation
    2. Admin new lead alert
    3. Customer proposal magic-link

## Phased Delivery

### Phase 1 - Database + Security
- Create `quotes` table with required fields and lifecycle enums
- Enable RLS and policies:
  - anon: insert only
  - authenticated admin: select/update/manage
  - service_role: full backend control
- Add indexes for admin list and status filtering

### Phase 2 - Email Foundation
- Configure Resend provider helpers for quote emails
- Add React Email templates (ES/EN)
- Add localized subject lines and dynamic content placeholders

### Phase 3 - Quote Submission API
- Build `/api/quotes` for:
  - partial draft create (after step 2)
  - draft updates per step
  - final submit + status `PENDING_REVIEW`
- Trigger customer + admin emails on final submit

### Phase 4 - Public Quote Wizard UI
- Implement 5-step wizard with per-step validation
- Service type cards (16 types)
- Location selectors via `country-state-city` package
- Date validation (no past, no <2 weeks)
- Contact preference logic + callback time condition
- Success state without redirect

### Phase 5 - Admin Authentication + Panel
- Build `/admin/login` (Supabase auth)
- Protect `/admin/*` routes
- Build `/admin/quotes` list with status filters
- Build `/admin/quotes/[id]` detail + pricing form
- Implement send magic-link action (status -> `SENT_TO_CUSTOMER`, expiry +7 days)

### Phase 6 - Proposal + Stripe
- Build `/proposal/[id]` with states:
  - active
  - expired
  - accepted
- Stripe checkout for 50% deposit
- Success redirect handling + DB update
- Stripe webhook fallback update

### Phase 7 - Link Replacement + Analytics
- Replace all "Get Quote" button targets to `/[locale]/get-quote`
- Keep floating WhatsApp button intact
- Add analytics events:
  - `quote_form_submitted` (+service_type)
  - `whatsapp_click` (+source=`floating_button`)

### Phase 8 - QA + Launch
- End-to-end ES flow test
- End-to-end EN flow test
- Email rendering checks in both languages
- Stripe test payments + webhook verification
- Admin mobile UX verification

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_EMAIL=info@fotografosantodomingo.com`
- `NEXT_PUBLIC_BASE_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Progress Tracker
- [x] Plan created and saved
- [x] Phase 1 started
- [ ] Phase 1 complete
- [ ] Phase 2 complete
- [ ] Phase 3 complete
- [ ] Phase 4 complete
- [ ] Phase 5 complete
- [ ] Phase 6 complete
- [ ] Phase 7 complete
- [ ] Phase 8 complete
