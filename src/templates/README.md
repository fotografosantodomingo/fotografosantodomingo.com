# Template Starters

Use `localized-seo-page-template.tsx` when creating a new standalone localized page under `src/app/[locale]/...`.

Use `blog-post-template.ts` when preparing a payload for `POST /api/admin/create-post`.

For **spoke pages** (`src/app/[locale]/[hub]/[spoke]/page.tsx`), use `src/data/spoke-pages.ts` as the data source and `src/components/spoke/SpokePageTemplate.tsx` as the layout. The zona-colonial page is the reference implementation. All standards below derive from it.

---

## Spoke Page — Mandatory Rules

### Always included on every spoke

- **Hero: text only** — no background image. Use `noHeroImage={true}` prop on `SpokePageTemplate`.
- **What to Expect** — 3 bullet points with real local knowledge. Never generic.
- **Custom gallery** — real Cloudinary images only. Pass `customGallery={<YourGallery />}` to `SpokePageTemplate`. Zero placeholders ever.
- **Investment section** — real starting price shown with `$` amount. No ranges like "$X–$Y", no "Contact for pricing".
- **Why Babula Shots** — 4 reasons specific to that city/venue. Not a copy-paste of the previous spoke.
- **Client testimonial** — one real named quote from a client who used this exact service type or location. Never anonymous. Place after Why Babula Shots. Add to `spoke.testimonial` field in `spoke-pages.ts`.
- **FAQ** — minimum 5 questions specific to that location. If a question could apply to any photographer in any country it is not acceptable.
- **Author bio** — 2-sentence bio of Michal Babula with link to `/about`. Required for E-E-A-T scoring. Rendered automatically by `SpokePageTemplate` between FAQ and Final CTA — no extra data needed.
- **Related spokes** — minimum 3 once more spokes are published. Suppress section when < 3 are live.
- **Final CTA** — urgency line specific to this location (e.g. season, permit notice, limited availability). Not generic.
- **Schema** — all 4 JSON-LD blocks: BreadcrumbList, Service/LocalService, FAQPage, ImageObject. Must pass Rich Results Test with zero warnings.
- **Footer** — in correct locale. Footer receives `locale` prop from layout; layout passes `normalizedLocale`.
- **Dynamic updated date** — `formatSiteLastUpdated(locale)` already dynamic. Never hardcode a date.

### Never allowed

- Placeholder images (URL containing `Image+Coming+Soon` or public ID starting with `[`)
- Generic FAQ questions reusable across any photographer or any country
- Missing `priceFromUsd` — use a real number
- Hardcoded review counts, dates, or business hours
- Schema warnings in Google Rich Results Test
- Publishing before client visual approval on desktop **and** mobile
- Mismatched footer language (EN footer on ES page or vice versa)
- `status: 'published'` without both EN and ES URLs submitted to GSC the same day

---

## Spoke Page — Pre-publish Quality Checklist

Run every item before changing `status: 'approved'` → `status: 'published'`.

```
□ Real Cloudinary images in hero (no-image hero is OK) and all gallery slots
□ curl -s {url} | grep -c 'application/ld+json' returns >= 1
□ Rich Results Test: zero errors, zero warnings — both EN and ES URLs
□ Title tag appears once, under 60 chars
□ Meta description unique, under 160 chars
□ noindex confirmed off (status = 'published', not 'approved')
□ Hreflang EN + ES + x-default all present in <head>
□ Footer renders in correct language on both EN and ES versions
□ Language switcher EN ↔ ES works correctly on both versions
□ FAQ has minimum 5 location-specific questions
□ Testimonial present — named client, real quote, relevant location or service type
□ Pricing shown — real dollar amount, not a range
□ At least 1 related spoke link (3+ preferred once more are published)
□ Both EN and ES versions deployed together in the same commit
□ Both URLs submitted to GSC on the same day as publish
```

---

## Spoke Data Shape — `spoke-pages.ts`

When adding a new spoke:
1. Copy the zona-colonial block as the data reference skeleton
2. Fill every `[CONTENT — Sprint 2]` placeholder before setting status to `approved`
3. Provide real `heroImagePublicId` and all `gallery[].publicId` from Cloudinary
4. Write 5 genuine location-specific FAQ items — verify they are not duplicates of any sibling spoke
5. Set `status: 'draft'` on commit; change to `'approved'` after local preview builds without errors; change to `'published'` after client visual sign-off

**Testimonial field** — add `testimonial: { clientName, eventLabel, quoteEn, quoteEs }` to the spoke object. `clientName` must be a real person (full name). `eventLabel` shows under the name (e.g. `"Zona Colonial Wedding, December 2025"`). The section renders automatically and is skipped if the field is absent.

---

## Adding a custom gallery component

If the spoke needs a layout the generic `GallerySection` cannot produce:
1. Create `src/components/spoke/{SpokeId}Gallery.tsx`
2. Pass it via `customGallery={<YourGallery locale={locale} />}` in `src/app/[locale]/[hub]/[spoke]/page.tsx`
3. Use `display: flex; gap: 0; lineHeight: 0` on all rows to eliminate gaps
4. Set `height: auto; objectFit: unset` on all images — never crop or fill
5. Cloudinary base: `https://res.cloudinary.com/dwewurxla/image/upload/f_auto,q_auto`

---

## Localized page (non-spoke)

Before shipping a new standalone page:
- Add translation keys to both `src/messages/es.json` and `src/messages/en.json`
- Add the bare-path redirect in `next.config.js` for the new page slug
- Keep the slug in English for both locales
- Add at least two natural internal links when the page is important enough to index

## Blog post

Before shipping a new blog post:
- Fill the payload with bilingual fields that match `CreatePostSchema`
- Keep `slug_es` and `slug_en` lowercase with hyphens only
- Use Cloudinary image URLs that include the `f_webp` transform
- Confirm the SEO title and description are unique in both languages
- Keep the body localized instead of translating only the metadata
- End with a CTA to a relevant service, portfolio page, or contact page