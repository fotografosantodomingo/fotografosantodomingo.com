# Master CTA Destination Audit

**Status**: Pre-Slice A readiness artifact #1
**Produced**: 2026-04-26
**Source of truth**: [BOOKING_REBUILD_BLUEPRINT.md](../BOOKING_REBUILD_BLUEPRINT.md)
**Customer Decision States referenced**: 1-Discovery · 2-Comparing · 3-Validating · 4-Selecting · 5-Booking · 6-Custom

This document maps **every** CTA currently rendered on the public site (homepage, nav, footer, services, SEO pages, prices, book, get-quote, email templates) to its future deterministic destination. Each entry specifies the params required so no CTA arrives without the context it needs.

---

## 🚨 Critical findings — must be addressed in Slice A

| # | Finding | Files affected |
|---|---|---|
| **1** | **6 surfaces still link to the old Setmore URL** (`https://babulashotsrd.setmore.com/...`). The booking system replaced Setmore weeks ago, but several CTAs still send users there — the old Setmore catalogue is no longer maintained. | Homepage, About, Contact (via `BOOKING_LINKS`), `BookingCTA.tsx` (used on **every spoke page**), `/services/birthday-photographer`, `/blog/[slug]` |
| **2** | **Spoke `BookingCTA.tsx` sends ES users to `/es/cotizaciones`** which is the admin-facing quotes view. Customers see a page they shouldn't be on. | `src/components/spoke/BookingCTA.tsx:46` |
| **3** | **`SERVICE_CONVERSION_CONFIG` on `/services/[service]` has zero CTAs to /book** — every primary and secondary CTA points to `/get-quote` or `/portfolio`. SEO traffic to indexed service pages cannot transact. | `src/app/[locale]/services/[service]/page.tsx` (lines 1033–1082) |
| **4** | **Homepage hero has no Book CTA** — the two hero buttons go to `/portfolio` and `/get-quote`. The bottom "Booking CTA" section uses the old Setmore URL. | `src/app/[locale]/page.tsx:238–249, 477` |
| **5** | **Service-card CTAs use the old `?service=<slug>` param** instead of the new blueprint param `?family=<family>&package=<package>`. Functional today (deep-link auto-selects in wizard) but blocks the family/package model. | `/services` cards, `/prices` cards |

---

## Audit summary by surface

| Surface | CTAs | Keep | Retarget | Remove | Critical |
|---|---|---|---|---|---|
| Homepage | 11 | 5 | 4 | 0 | 2 |
| Navigation (desktop + mobile) | 8 | 5 | 3 | 0 | 0 |
| Footer | 14 | 11 | 3 | 0 | 0 |
| `/services` landing | 9 | 1 | 7 | 0 | 1 |
| `/services/[service]` (7 SEO pages × 5+ CTAs each) | ~40 | ~5 | ~35 | 0 | 1 |
| `/services/birthday-photographer` | 9 | 1 | 4 | 4 | 4 |
| Spoke pages (10+ pages via `BookingCTA.tsx`) | 3 each | 1 | 1 | 1 | 2 |
| `/prices` | 7 | 0 | 7 | 0 | 0 |
| `/book` wizard | 6 | 6 | 0 | 0 | 0 |
| `/get-quote` wizard | 1 | 1 | 0 | 0 | 0 |
| `/contact` | 4 | 2 | 2 | 0 | 1 |
| `/about` | 5 | 3 | 2 | 0 | 1 |
| `/blog` index | 6 | 6 | 0 | 0 | 0 |
| `/blog/[slug]` | 5 | 4 | 1 | 0 | 1 |
| `/portfolio` | 4 | 4 | 0 | 0 | 0 |
| `/proposal` | 4 | 4 | 0 | 0 | 0 |
| `/cotizaciones` (admin quotes view) | 2 | 2 | 0 | 0 | 0 |
| `CookieConsent` | 2 | 2 | 0 | 0 | 0 |
| `WhatsAppButton` (floating) | 1 | 1 | 0 | 0 | 0 |
| `HomeFaq` | 1 | 1 | 0 | 0 | 0 |
| Email: `resend.ts` (5 functions) | ~15 | 14 | 1 | 0 | 0 |
| Email: `bookings.ts` (6 functions) | ~12 | 11 | 1 | 0 | 0 |
| **TOTAL** | **~170** | **~89** | **~81** | **5** | **13** |

Numbers approximate where the same component renders identically in ES + EN — counted once.

---

## 1 · Homepage (`src/app/[locale]/page.tsx`)

| Line | Element | Current href | Future href | Params required | State | Action |
|---|---|---|---|---|---|---|
| 238 | Hero primary CTA | `/[locale]/portfolio` | `/[locale]/services` | none | 1-Discovery | **RETARGET** — hero should route to family navigator, not portfolio |
| 244 | Hero secondary CTA | `/[locale]/get-quote` | `/[locale]/get-quote?source_page=home_hero&source_cta=secondary` | `source_page`, `source_cta` | 6-Custom | **RETARGET** — same destination, gain analytics provenance |
| 284, 303 | Work preview tiles (8) | `/[locale]/portfolio` | `/[locale]/portfolio` | none | 3-Validating | KEEP |
| 322 | "Ver portafolio completo" | `/[locale]/portfolio` | `/[locale]/portfolio` | none | 3-Validating | KEEP |
| 351 | Service grid card (×6) | `/[locale]/services` | `/[locale]/services/<family-slug>` | `<family-slug>` per card | 1→2 Discovery → Comparing | **RETARGET** — currently all 6 go to the same page; should each route to its family SEO page |
| 401 | "Leave a Google review" | `https://g.page/r/babulashots/review` | (unchanged) | none | n/a | KEEP |
| **477** | **"Reservar sesión"** | **`https://babulashotsrd.setmore.com/reserva`** | **`/[locale]/services?source_cta=home_book_block`** | `source_page`, `source_cta` | 1-Discovery | **🚨 CRITICAL — kill Setmore link, route to family navigator** |
| 484 | WhatsApp | `https://wa.me/...` | (unchanged) | prefilled msg | n/a | KEEP |
| 492 | "Solicitar presupuesto" | `/[locale]/get-quote` | `/[locale]/get-quote?source_page=home_book_block&source_cta=secondary` | `source_page`, `source_cta` | 6-Custom | **RETARGET** |

---

## 2 · Navigation (`src/components/Navigation.tsx`)

Same component renders desktop + mobile, so each CTA appears 1–2x in the file.

| Line | Element | Current href | Future href | Params | State | Action |
|---|---|---|---|---|---|---|
| 287 | Logo home link | `/[locale]` | `/[locale]` | none | 1 | KEEP |
| 298, 367, 445, 495 | Mega-menu links (services, my work, portfolio, info) | `/[locale]/services/<slug>`, `/[locale]/portfolio?category=…`, `/[locale]/about`, `/[locale]/blog`, etc | (unchanged structure) | none | 1–3 | KEEP — these are SEO category links, all preserved |
| 399, 529 | Language switch | `switchPath` (computed) | (unchanged) | none | n/a | KEEP |
| 405 | WhatsApp (desktop) | `https://wa.me/...` | (unchanged) | prefilled msg | n/a | KEEP |
| 413 | "Book Now" (desktop) | `/[locale]/book` | `/[locale]/services?source_cta=nav_book` | `source_cta` | 1-Discovery | **RETARGET** — without context, route to family navigator (not bare `/book` which has nothing preselected) |
| 507 | WhatsApp (mobile) | `https://wa.me/...` | (unchanged) | prefilled msg | n/a | KEEP |
| 522 | "Book Now" (mobile) | `/[locale]/book` | `/[locale]/services?source_cta=nav_book_mobile` | `source_cta` | 1-Discovery | **RETARGET** — same logic as desktop |

---

## 3 · Footer (`src/components/Footer.tsx`)

| Line | Element | Current href | Future href | Params | State | Action |
|---|---|---|---|---|---|---|
| 33–48 | Social links (IG, FB, LinkedIn, Pinterest, TikTok, WhatsApp) | external | (unchanged) | none | n/a | KEEP (×6) |
| 62 | "Reservar Ahora" (Quick Links) | `/[locale]/book` | `/[locale]/services?source_cta=footer_book` | `source_cta` | 1-Discovery | **RETARGET** — same logic as nav |
| 68 | "Precios" | `/[locale]/prices` | `/[locale]/prices` | none | 2 | KEEP |
| 69 | "Servicios" | `/[locale]/services` | `/[locale]/services` | none | 1 | KEEP |
| 70 | "Portafolio" | `/[locale]/portfolio` | `/[locale]/portfolio` | none | 3 | KEEP |
| 71 | "Nosotros" | `/[locale]/about` | `/[locale]/about` | none | 3 | KEEP |
| 72 | Blog | `/[locale]/blog` | `/[locale]/blog` | none | 3 | KEEP |
| 73 | Contacto | `/[locale]/contact` | `/[locale]/contact` | none | 6 | KEEP |
| 105 | Trustpilot button | `SOCIAL_LINKS.trustpilot` | (unchanged) | none | n/a | KEEP |
| 132 | Privacy | `/[locale]/privacy` | (unchanged) | none | n/a | KEEP |
| 135 | Terms | `/[locale]/terms` | (unchanged) | none | n/a | KEEP |
| 148, 161 | "babulashotsrd.com" external link | external | (unchanged) | none | n/a | KEEP — old portfolio domain, separate brand asset |

**Master file Section 14 says**: "Footer: service quick links only to family pages + quote." Action: when families ship in Slice B, replace the current generic "Servicios" entry with 4–6 named family links + the quote link. This is a Slice B/E task, NOT a Slice A task.

---

## 4 · `/services` landing (`src/app/[locale]/services/page.tsx`)

| Line | Element | Current href | Future href | Params | State | Action |
|---|---|---|---|---|---|---|
| 91 | Hero "Reservar Ahora" | `/[locale]/book` | `/[locale]/services` (#packages anchor) OR `/[locale]/services?focus=top-family` | scroll target | 1 | **RETARGET** — at the top of the navigator, this CTA should scroll to the family grid, not exit to /book |
| 96 | Hero "Solicitar Presupuesto" | `/[locale]/get-quote` | `/[locale]/get-quote?source_page=services_hero&source_cta=secondary` | `source_page`, `source_cta` | 6 | **RETARGET** |
| 99 | Hero "Ver Nuestro Trabajo" | `/[locale]/portfolio` | (unchanged) | none | 3 | KEEP |
| 125 | Birthday popular badge | `/[locale]/services/birthday-photographer` | (unchanged) | none | 2 | KEEP |
| 200 | Per-card "Reservar" | `/[locale]/book?service=<bookingSlug>` | `/[locale]/services/<family-slug>/packages?source_page=services_landing&source_cta=card_reserve` | `source_page`, `source_cta` | 2-Comparing | **RETARGET** — landing card → compare page, not direct to book (per blueprint §6 CTA framework) |
| 206 | Per-card "Cotizar" | `/[locale]/get-quote` | `/[locale]/get-quote?family=<family-slug>&source_page=services_landing&source_cta=card_quote` | `family`, `source_page`, `source_cta` | 6 | **RETARGET** |
| 305 | Bottom "Reservar Ahora" | `/[locale]/get-quote` | `/[locale]/services?source_cta=services_bottom_book` | none | 1 | **RETARGET** (currently mislabeled — text says "Reservar" but href is `/get-quote`) |
| 308 | Bottom "Hablar con Michal" | `/[locale]/contact` | `/[locale]/contact?source_page=services_landing` | `source_page` | 6 | **RETARGET** |

---

## 5 · `/services/[service]` SEO pages (`src/app/[locale]/services/[service]/page.tsx`)

This file is ~2900 lines and renders **7 service pages** (wedding, portrait, drone, event, family, commercial, proposal) using a `SERVICE_CONVERSION_CONFIG` table. CTAs render in 4 sections: top hero, mid-content, bottom CTA strip, and "next steps" sidebar.

### `SERVICE_CONVERSION_CONFIG` retargeting (single source — fixes all 7 pages × 4 sections):

| Service | Current `primaryCta.href` | Future `primaryCta.href` | Current `secondaryCta.href` | Future `secondaryCta.href` |
|---|---|---|---|---|
| **wedding** | `/portfolio?category=wedding` | `/services/wedding-photography/packages?source_cta=seo_primary` | `/get-quote` | `/get-quote?family=wedding-photography&source_cta=seo_secondary` |
| **portrait** | `/get-quote` | `/services/portrait-photography/packages?source_cta=seo_primary` | `/portfolio?category=portrait` | `/portfolio?category=portrait` (KEEP) |
| **drone** | `/get-quote` | `/services/drone-services-photography-punta-cana/packages?source_cta=seo_primary` | `/portfolio?category=drone` | `/portfolio?category=drone` (KEEP) |
| **event** | `/get-quote` | `/services/event-photography/packages?source_cta=seo_primary` | `/portfolio?category=event` | `/portfolio?category=event` (KEEP) |
| **family** | `/get-quote` | `/services/family-photography/packages?source_cta=seo_primary` | `/portfolio?category=portrait` | `/portfolio?category=portrait` (KEEP) |
| **commercial** | `/get-quote` | `/services/commercial-photography/packages?source_cta=seo_primary` | `/portfolio?category=commercial` | `/portfolio?category=commercial` (KEEP) |
| **proposal** | `/get-quote` | `/services/proposal-photography/packages?source_cta=seo_primary` | `/proposal` | `/proposal` (KEEP — `/proposal` is its own SEO page) |

### Other CTAs in the same file:
| Line | Element | Action |
|---|---|---|
| 2620 | "Sobre Michal" sidebar | KEEP (`/[locale]/about`) |
| 2624 | "Cotización personalizada" sidebar | **RETARGET** → `/get-quote?family=<family-slug>&source_page=seo_sidebar` |
| 2676 | Venue links | KEEP (internal SEO links) |
| 2760 | Related services | KEEP (`/[locale]/services/<related>`) |
| 2792 | WhatsApp deep link | KEEP |
| 2803 | "All services" link | KEEP (`/[locale]/services`) |

---

## 6 · `/services/birthday-photographer` (single SEO page, separate file)

| Line | Element | Current href | Future href | State | Action |
|---|---|---|---|---|---|
| **376–381** | `bookingLinks` constant (4 Setmore URLs) | `https://babulashotsrd.setmore.com/book?...` | replace with `/[locale]/services/event-photography/packages?package=<slug>&source_cta=birthday_<position>` | 4 | **🚨 CRITICAL — REMOVE all 4 Setmore URLs** |
| 478, 548, 627 | "Reservar" buttons (event3h) | `bookingLinks.event3h` | `/[locale]/services/event-photography/packages?source_cta=birthday_hero` | 4 | RETARGET (same fix as above) |
| 481, 580 | quincenara15 | `bookingLinks.quincenara15` | `/[locale]/services/event-photography/packages?package=quinceanera-15&source_cta=birthday_qv15` | 4 | RETARGET |
| 564 | quincenara10 | `bookingLinks.quincenara10` | `/[locale]/services/event-photography/packages?package=quinceanera-10&source_cta=birthday_qv10` | 4 | RETARGET |
| 596 | quincenaraVip | `bookingLinks.quincenaraVip` | `/[locale]/services/event-photography/packages?package=quinceanera-vip&source_cta=birthday_qvVIP` | 4 | RETARGET |
| 484 | "Ver portafolio cumpleaños" | `/[locale]/portfolio?category=birthday` | (unchanged) | 3 | KEEP |
| 630 | "Solicitar presupuesto" | `/[locale]/get-quote` | `/[locale]/get-quote?family=event-photography&package=birthday&source_page=birthday_seo&source_cta=birthday_quote` | 6 | RETARGET |
| 633 | "Ver eventos" | `/[locale]/services/event-photography` | (unchanged) | 2 | KEEP |

---

## 7 · Spoke pages — `BookingCTA.tsx` and `SpokePageTemplate.tsx`

These render across **every spoke page** (Zona Colonial, Punta Cana proposal, etc — 10+ indexed URLs). Fixing the component fixes them all.

### `src/components/spoke/BookingCTA.tsx`
| Line | Element | Current href | Future href | State | Action |
|---|---|---|---|---|---|
| **12** | `SETMORE_URL` const | `https://babulashotsrd.setmore.com/reserva` | (delete the const) | 4 | **🚨 CRITICAL — REMOVE** |
| 57 | "Reservar fecha" primary | `SETMORE_URL` | `/[locale]/services?source_cta=spoke_book&source_page=<spoke-slug>` | 1→4 | **RETARGET** (without family context, route to navigator) — OR if the spoke is family-specific, route to `/[locale]/services/<family>/packages` |
| 68 | WhatsApp secondary | computed | (unchanged) | n/a | KEEP |
| **46, 86** | quoteUrl bug | ES → `/es/cotizaciones` (ADMIN), EN → `/en/get-quote` | both → `/[locale]/get-quote?family=<spoke-family>&source_page=<spoke-slug>&source_cta=spoke_quote` | 6 | **🚨 BUG FIX** |

The component should accept a `familySlug?: string` prop so each spoke can specify its target family. If the spoke is generic (e.g., a venue page), default to `/services`.

### `src/components/spoke/SpokePageTemplate.tsx`
| Line | Element | Current href | Future href | State | Action |
|---|---|---|---|---|---|
| 198 | Portfolio link | `/[locale]/portfolio` | (unchanged) | 3 | KEEP |
| 406 | About link | `/[locale]/about` | (unchanged) | 3 | KEEP |
| 454 | Related-spoke links | `/[locale]/<slug>` | (unchanged) | 3 | KEEP |

---

## 8 · `/prices` (`src/app/[locale]/prices/page.tsx`)

| Line | Element | Current href | Future href | Params | State | Action |
|---|---|---|---|---|---|---|
| 588 | Per-card "Reservar" (bookable services) | `/[locale]/book?service=<svc-slug>` | `/[locale]/services/<family-slug>/packages?package=<package-slug>&source_page=prices&source_cta=card_reserve` | family, package, source_* | 2-Comparing | **RETARGET** — route to compare page, not direct to book (blueprint §6 explicit) |
| 595 | Per-card "Cotizar" | `/[locale]/get-quote` | `/[locale]/get-quote?family=<family-slug>&package=<package-slug>&source_page=prices&source_cta=card_quote` | family, package, source_* | 6 | **RETARGET** |
| 628 | "Solicitar Cotización" (Custom block) | `/[locale]/get-quote` | `/[locale]/get-quote?source_page=prices_custom&source_cta=custom_block` | source_* | 6 | **RETARGET** |
| 650 | Bottom "Reservar Ahora" | `/[locale]/book` | `/[locale]/services?source_cta=prices_bottom_book` | source_cta | 1 | **RETARGET** |
| 656 | Bottom "Hablar con Michal" | `/[locale]/contact` | `/[locale]/contact?source_page=prices` | source_page | 6 | **RETARGET** |

---

## 9 · `/book` wizard (`src/app/[locale]/book/page.tsx` + steps)

Wizard inputs + outputs are already correct. Only auxiliary CTAs to audit:

| File:Line | Element | Current href | Future href | State | Action |
|---|---|---|---|---|---|
| `StepConfirmation.tsx:146` | "WhatsApp" CTA after success | `https://wa.me/...` | (unchanged) | n/a | KEEP |
| `StepConfirmation.tsx:154` | "Volver al inicio" | `/[locale]` | (unchanged) | n/a | KEEP |
| `StepDetails.tsx:97, 109` | "Términos" link | `/es/terms`, `/en/terms` | (unchanged) | n/a | KEEP |
| `StepDetails.tsx:101, 113` | "Privacidad" link | `/es/privacy`, `/en/privacy` | (unchanged) | n/a | KEEP |

---

## 10 · `/get-quote` wizard (`src/components/quote/GetQuoteWizard.tsx`)

Wizard already context-aware-ready. Only one auxiliary CTA:

| Line | Element | Current href | Future href | State | Action |
|---|---|---|---|---|---|
| 264 | Post-submit "Volver al inicio" | `/[locale]` | (unchanged) | n/a | KEEP |

This page is in scope for full Slice E rebuild — see blueprint §9.

---

## 11 · `/contact` (`src/app/[locale]/contact/ContactClient.tsx`)

| Line | Element | Current href | Future href | State | Action |
|---|---|---|---|---|---|
| 351 | tel: link | `tel:${CONTACT_INFO.phone}` | (unchanged) | n/a | KEEP |
| **401** | "Calendly" button | `BOOKING_LINKS.calendly` (= Setmore!) | `/[locale]/services?source_cta=contact_calendar` | 1 | **🚨 RETARGET — `BOOKING_LINKS.calendly` actually points to Setmore. Either retarget or relabel.** |
| **455** | "Setmore" button | `BOOKING_LINKS.setmore` | `/[locale]/services?source_cta=contact_book` | 1 | **🚨 RETARGET** |
| 466 | WhatsApp (prefilled) | `https://wa.me/...` | (unchanged) | n/a | KEEP |

---

## 12 · `/about` (`src/app/[locale]/about/page.tsx`)

| Line | Element | Current href | Future href | State | Action |
|---|---|---|---|---|---|
| 174 | "Ver Portafolio" | `/[locale]/portfolio` | (unchanged) | 3 | KEEP |
| 180 | WhatsApp | `https://wa.me/...` | (unchanged) | n/a | KEEP |
| 208 | Instagram | external | (unchanged) | n/a | KEEP |
| **492** | Bottom "Reservar" | `BOOKING_LINKS.setmore` | `/[locale]/services?source_cta=about_book` | 1 | **🚨 RETARGET** |
| 500 | Bottom WhatsApp | `https://wa.me/...` | (unchanged) | n/a | KEEP |

---

## 13 · `/blog` index (`src/app/[locale]/blog/page.tsx`)

| Line | Element | Current href | Future href | Action |
|---|---|---|---|---|
| 153, 216 | "Back to blog" | `/[locale]/blog` | (unchanged) | KEEP |
| 165 | Category filter | `/[locale]/blog?category=…` | (unchanged) | KEEP |
| 245, 258 | Post title + cover link | `/[locale]/blog/${post.slug}` | (unchanged) | KEEP |
| 312 | WhatsApp | external | (unchanged) | KEEP |
| 320 | "Contacto" | `/[locale]/contact` | (unchanged) | KEEP |

---

## 14 · `/blog/[slug]` (`src/app/[locale]/blog/[slug]/page.tsx`)

| Line | Element | Current href | Future href | Action |
|---|---|---|---|---|
| 538 | "Back to blog" | `/[locale]/blog` | (unchanged) | KEEP |
| **547** | "Reservar" (post-end) | `setmoreUrl` (computed from `post.setmore_service_url` OR fallback Setmore URL) | `/[locale]/services?source_cta=blog_post_book&source_page=blog_${slug}` | **🚨 RETARGET** — also needs to drop `setmore_service_url` field from `blog_posts` table or rename to `book_target_url` |
| 550 | WhatsApp | external | (unchanged) | KEEP |
| 554 | Google reviews | external | (unchanged) | KEEP |
| 579 | Social share | external | (unchanged) | KEEP |

---

## 15 · `/portfolio` (`src/components/portfolio/PortfolioClient.tsx`)

| Line | Element | Current href | Future href | Action |
|---|---|---|---|---|
| 117, 246 | WhatsApp (×2) | external | (unchanged) | KEEP |
| 124 | "Ver Servicios" | `/[locale]/services` | (unchanged) | KEEP |
| 253 | "Contacto" | `/[locale]/contact` | (unchanged) | KEEP |

---

## 16 · `/proposal` (`src/app/[locale]/proposal/page.tsx`)

| Line | Element | Current href | Action |
|---|---|---|---|
| 186 | per-package internal href | (passes `href` prop) | KEEP — these are internal SEO spoke navigations |
| 345, 351, 357 | Spoke navigations | `/[locale]/proposal/...`, `/[locale]/bodas/...` | KEEP |

This is the proposal-photography service detail page (separate from the customer-proposal-viewer at `/proposal/[id]`).

---

## 17 · `/cotizaciones` (admin-facing — needs treatment)

This is currently public but is admin-style content. With the rebuild it should EITHER:
- Move to `/admin/quotes` only (not exposed publicly), OR
- Stay public but clearly transactional

| Line | Element | Current href | Action |
|---|---|---|---|
| 93 | "Ver servicios" | `/[locale]/services` | KEEP |
| 96 | "Contacto" | `/[locale]/contact` | KEEP |

**Decision needed**: should `/[locale]/cotizaciones` be:
- (a) Removed from public — 301 to `/[locale]/get-quote`?
- (b) Kept as a public RFQ summary page?

If (a), the current ES `BookingCTA` bug (sending ES users to `/cotizaciones`) is mooted automatically. **Default recommendation: (a) 301 to `/get-quote`.**

---

## 18 · Floating UI (`CookieConsent`, `WhatsAppButton`, `HomeFaq`)

| File:Line | Element | Current href | Action |
|---|---|---|---|
| `CookieConsent.tsx:72, 80` | Privacy links (×2) | `/[locale]/privacy` | KEEP |
| `WhatsAppButton.tsx:28` | Floating WhatsApp | computed `wa.me` URL | KEEP |
| `HomeFaq.tsx:72` | "Ask on WhatsApp" | computed `wa.me` URL | KEEP |

---

## 19 · Email templates — `src/lib/email/resend.ts`

5 functions: `sendContactNotification`, `sendContactConfirmation`, `sendNewsletterWelcome`, `sendQuoteSubmissionNotification`, `sendQuoteSubmissionConfirmation`, `sendProposalEmail`.

Most CTAs are KEEP (mailto, tel, wa.me, fotografosantodomingo.com hub navigation). Only one needs attention:

| File:Line | Element | Current href | Future href | Action |
|---|---|---|---|---|
| `resend.ts:165` | Quick links footer "Servicios" | `${SITE_URL}/${locale}/services` | `${SITE_URL}/${locale}/services` (unchanged) | KEEP |
| `resend.ts` (proposal email) | `data.proposalUrl` (unique customer link) | dynamic | (unchanged) | KEEP |

✅ All 5 quote/contact/proposal email templates already use the canonical site URL — no Setmore references in the email layer.

---

## 20 · Email templates — `src/lib/email/bookings.ts`

6 booking emails (confirmation, admin alert, 24h reminder, same-day reminder, post-session, cancellation).

| File:Line | Element | Current href | Future href | Action |
|---|---|---|---|---|
| `bookings.ts:123, 221, 378, 449, 601` | WhatsApp CTAs | `https://wa.me/18097209547` | (unchanged) | KEEP (×5) |
| `bookings.ts:308` | Admin "Ver en panel" | `${BASE_URL}/admin/bookings/${ctx.bookingId}` | (unchanged) | KEEP |
| `bookings.ts:512` | Post-session "Review on Google" | `${REVIEW_LINKS.google}` | (unchanged) | KEEP |
| All 6 templates | Body copy | uses `service.name_*` only | upgrade to use `package.name_*` + `family.title_*` | **RETARGET** (content, not href) — handled in artifact #6 (email upgrade plan) |

---

## Required new query-param convention (locked)

After this rebuild, every internal CTA arriving at `/book`, `/services/<family>/packages`, or `/get-quote` MUST carry:

```
?family=<family-slug>            # required for /book and /services/<family>/packages
&package=<package-slug>          # required for /book; optional for compare and quote
&source_page=<originating-page>  # for analytics + provenance
&source_cta=<cta-identifier>     # for analytics + A/B testing
```

`source_cta` values used in this audit (canonical list):

```
home_hero_primary, home_hero_secondary, home_book_block_primary,
home_book_block_secondary, home_service_grid
nav_book, nav_book_mobile
footer_book
services_hero_primary, services_hero_secondary, services_landing_card_reserve,
services_landing_card_quote, services_bottom_book, services_bottom_contact
seo_primary, seo_secondary, seo_sidebar_quote, seo_sidebar_about
prices_card_reserve, prices_card_quote, prices_custom_block,
prices_bottom_book, prices_bottom_contact
spoke_book, spoke_quote
birthday_hero, birthday_qv10, birthday_qv15, birthday_qvVIP, birthday_quote
about_book, contact_book, contact_calendar
blog_post_book
```

These map 1:1 to entries in the analytics events (`source` field).

---

## Open items requiring user decision before Slice E

1. **`/cotizaciones`** — keep as public page or 301 to `/get-quote`? (default: 301)
2. **`blog_posts.setmore_service_url` column** — drop, or rename to `book_target_url`? (default: rename to `book_target_url`)
3. **Family slug for the birthday-photographer page** — currently the page sits at `/services/birthday-photographer` but its CTAs map to the `event-photography` family. Either move the page, or treat `birthday-photographer` as an SEO-only route that links into the event family. (default: keep URL for SEO equity, retarget CTAs into event-photography family)

---

**End of audit. Total CTAs reviewed: ~170. Critical retargets: 13. Setmore URLs to remove: 5 distinct URLs across 6 surfaces.**
