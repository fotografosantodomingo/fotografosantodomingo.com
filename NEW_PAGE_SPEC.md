# New Page Standard — fotografosantodomingo.com

This is the engineering, SEO, and content standard for creating any new page on
fotografosantodomingo.com. A page is not "done" when the URL resolves. It is done
when it is architecturally integrated, bilingual, factually verified, written like
a person wrote it, schema-valid, visually consistent, and confirmed live on
production.

Reference quality bar: the Zona Colonial wedding spoke page, the Punta Cana
proposal geo page, and the baptism-photographer-santo-domingo spoke page.
Do not ship a generic page bolted onto the site below that bar.

---

## 0. Core principles

1. **Architecture first.** Reuse an existing system. Don't invent a new route
   shape when one of the four systems in §1 already fits.
2. **Intent first.** Answer the search query in the first ~200 words.
3. **No hallucinated facts.** Prices, locations, counts, and claims must trace
   back to a real source — never invented, never assumed.
4. **Bilingual by default.** Nothing ships English-only or Spanish-only.
5. **Machine-readable.** If Google and LLMs can't parse the schema, it doesn't
   count as shipped.
6. **Human-written.** See §4. This is not a style preference — it's a real
   defense against Google's scaled-content-abuse policy and against reading as
   untrustworthy to an actual visitor.

---

## 1. Pick the right system first

Search the repo before writing code. Do not create a new architecture when an
existing one already supports the use case.

| Use case | System | Files |
|---|---|---|
| Themed landing page under an existing service family (e.g. "proposal photography in Zona Colonial") | **Spoke page** | `src/data/spoke-pages.ts` — rendered by `src/app/[locale]/[hub]/[spoke]/page.tsx` |
| One family × one city (e.g. "wedding photographer in Cap Cana") | **Geo page** | `src/data/geo-pages/registry.ts` (defines the page) + `src/data/service-content/<family>.ts` → `geoCoverage[citySlug]` (supplies the content — never duplicate it into the registry) |
| New coverage, FAQ, or gallery on an existing service family | **Service-content file** | `src/data/service-content/<family>.ts` |
| Doesn't fit any catalog pattern (legal page, one-off campaign) | **Standalone route** | `src/app/[locale]/<slug>/page.tsx` — last resort, most manual upkeep |

Rules that apply regardless of which system:
- Check `RESERVED_SLUGS` in `geo-pages/registry.ts` and existing routes before picking a slug — never assume one is free.
- `hubSlug`/`familySlug` must match a real `service_families.slug` row in Supabase. Never invent a family.
- `enSlug`/`esSlug` are independent, separately-translated slugs — never a mechanical prefix of the same string (`/es/fotografo-bodas` does not imply `/en/fotografo-bodas`).
- Never restate content that already lives in a `geoCoverage` block — geo pages source it, they don't copy it.

---

## 2. Content rules

- **Bilingual, always.** Every string is `{ es: ..., en: ... }`. No placeholder or missing-locale content ships.
- **Never invent a business fact.** Prices, package inclusions, durations, deposit terms, counts, and claims must come from real `service_packages` rows or existing published data. If a number isn't verified, say so and cite the source explicitly — see the Catedral Primada FAQ entry: real sourced figure + an explicit note that the third party controls it, not us.
- **Answer the query in the first ~200 words.** Lead with who/what/where, not a scene-setting intro. The homepage hero is the reference pattern: H1 states identity + location, the subhead immediately follows with services + credibility (since 2015).
- **FAQs come from real search queries.** Run `scripts/gsc-analytics.mjs` → `QUESTION QUERIES` periodically and turn real hits into `miniFaq`/`faqData` entries, preserving the visitor's actual phrasing where practical — that phrasing is also what an LLM is likely to match against when deciding whether to cite this page.
- **Every photo gets real, distinct alt text** describing the actual visible scene — never generic ("photo1.jpg", "Wedding photo") and never copy-pasted between images.

---

## 3. E-E-A-T — make the trust signals concrete, not decorative

Google's actual quality framework (Experience, Expertise, Authoritativeness,
Trust) maps to specific things already built into this site — use them on every
page rather than treating E-E-A-T as an abstract goal:

- **Experience** — at least one real photo from an actual shoot at that
  location, and at least one detail in the copy only someone who was actually
  there would know (a specific church interior, an actual logistics quirk, a
  real weather pattern). Stock-photo energy or purely generic description is
  the opposite of this.
- **Expertise** — reference the canonical author entity, `{'@id': '${BASE_URL}/#person'}`, never a duplicated inline `Person` stub.
- **Authoritativeness** — `sameAs` must be `SAME_AS_LINKS` from `@/lib/utils/constants`. One source of truth, never a hand-rolled array (this exact bug was fixed twice in one session already — once in `JsonLd.ts`, once in the blog template's separate `@graph` block).
- **Trust** — real, sourced pricing only (§2); genuine reviews/ratings only from `BUSINESS_RATING`, never invented review counts or star ratings.

---

## 4. Write like a person, not a model — this is a requirement, not a preference

Two independent reasons this matters: Google's spam policy explicitly targets
scaled, formulaic AI content, and a real visitor comparing this page to a
human-written competitor can tell the difference in about one paragraph.
Before shipping copy, check it against these tells:

**Banned phrasing patterns** (instant AI tells — rewrite on sight):
"in today's fast-paced world," "nestled in the heart of," "look no further,"
"whether you're X or Y," "elevate your experience," "unforgettable moments,"
"unlock," "dive into," "game-changer," "seamless," "breathtaking," "journey"
used as a metaphor for a photo session, rhetorical questions as section
openers ("Looking for the perfect photographer?").

**Structural tells to avoid:**
- Every section built from a rule-of-three (three adjectives, three bullet
  points, three examples) on every single page. One or two spoke pages using
  a three-item structure is normal; all of them doing it identically is a
  template fingerprint. Vary the count and the shape page to page.
- Uniform sentence rhythm — AI defaults to evenly-paced, medium-length
  sentences back to back. Mix a short sentence in. Let one run long.
- Symmetric FAQ answers (every answer is 2 sentences long regardless of how
  complex the question actually is). Real answers vary in length with the
  question.
- Copy that would still make sense with the city name swapped for a different
  one. If a paragraph is that generic, it hasn't earned its place on a page
  about a specific location.

**What to do instead:**
- Ground claims in something concrete and specific — a named church, a real
  price, an actual described photo — rather than a vague superlative. This
  fixes the AI-pattern problem and the E-E-A-T problem in the same edit.
- Write ES copy the way a Dominican business owner actually talks, not a
  textbook-formal translation of the EN copy back into Spanish.
- Testimonials should sound like something a person actually said —
  contractions, imperfect syntax, a specific detail — never a polished
  marketing pull-quote.
- It's fine, and often better, for copy to admit a small real friction (traffic
  in the Zona Colonial on weekends, a permit that takes coordination) instead
  of presenting everything as frictionless. Genuine businesses have minor
  caveats; AI copy never does.

Before calling copy done, read it out loud. If it sounds like it could have
been generated for any photographer in any city with a find-and-replace, it
isn't done.

---

## 5. SEO & schema checklist

Every page must emit, at minimum:
- `generateMetadata` with locale-specific title, description, keywords, canonical + hreflang alternates (`es`/`en`/`x-default`), OG + Twitter card images. (Reasonable defaults: title ≈60 chars, description ≈155 chars — these are general best practice, not something currently enforced by a lint rule in this repo, so treat them as a target, not a hard gate.)
- `BreadcrumbList` schema via `schemaGenerators.breadcrumb(...)`.
- The relevant entity schema for the content type: `Service`/`LocalBusiness` (spoke/geo pages via `buildSpokeSchemas`), `BlogPosting` (blog), `Product`+`Offer` (anything showing a real price — see `schemaGenerators.priceCatalog`), `FAQPage` (only if the FAQ is genuinely page-specific — don't emit the same FAQPage content on two pages).
- `ImageObject` for the hero image, including `contentUrl`, a real bilingual `caption`/description, and a `creator` reference back to the canonical Person entity — already implemented in `buildImageObject` (`src/lib/spoke-schema.ts`); use it, don't reimplement it.
- **`sameAs` must be `SAME_AS_LINKS`** — never a new array (see §3).
- **Author/Person references use `{'@id': '${BASE_URL}/#person'}`** — never a duplicated inline stub.
- Check `find "src/app/[locale]" -name "page.tsx"` against `grep -l "generateJsonLd"` periodically — every content page should have schema; only legal boilerplate (privacy/terms) is exempt.

**Validation is not optional:** a script tag existing is not proof the schema is
correct. After building, fetch the rendered HTML, extract every
`application/ld+json` block, and `json.loads` each one — confirm real data, not
just that it parses.

---

## 6. Technical / rendering rules

- **Set `export const dynamic` explicitly — never rely on the default.** This site hit a real production bug from skipping this: `/prices` had no `dynamic` export, and Cloudflare's `next-on-pages` KV/Cache-API layer served a render cached *before* a code change existed, for up to 24h, surviving multiple redeploys, because nothing had invalidated it. Use `force-dynamic` unless you have a specific, verified reason for static generation.
- **Fetch-level caching is a separate, fine thing to keep.** `getUsdToDopRate()`'s intentional 24h cache is not the problem — an un-invalidated *page-render* cache is. Don't remove a deliberate fetch cache to chase this.
- Run `npx tsc --noEmit -p .` before every commit. This repo has a small set of known pre-existing, unrelated errors (gtag typing conflicts, a couple of Cloudflare Worker type gaps) — diff your error count against baseline, don't chase those down.
- **A green deploy is not proof of anything.** After deploying, fetch the actual production URL and confirm the expected content, correct locale, correct canonical/hreflang, and real JSON-LD are present. The `/prices` bug looked identical to a successful deploy at every stage except the final content check.

---

## 7. Visual / design rules (the "Bugatti" system)

This site's dark theme is inspired by Bugatti.com's monochrome design language
(see `DESIGN.md`) but implemented with this site's own token values — don't
copy Bugatti's literal palette, use this site's tokens:

- Canvas/ink via CSS custom properties (`--bugatti-canvas`, `--bugatti-ink`, `--bugatti-ink-muted`, `--bugatti-hairline`/`--bugatti-hairline-soft`), defaulting **dark** at `:root`/`html.dark`, flipped by `html.light-mode` (set by `ThemeToggle.tsx` via `localStorage` — **not** `prefers-color-scheme`).
- Gold accent `#c8a96e` for emphasis/price/CTA highlights — the site's one accent color. Don't introduce a second one.
- Mono-caps labels: `font-mono uppercase tracking-widest text-[10-11px] text-ink-muted` for eyebrows, captions, nav.
- **Sections that must render dark in BOTH themes** need the `hero-white-lock` escape hatch, or the site-wide light-mode CSS retrofit will flip bare `text-white` to near-black and make it unreadable. Test explicitly with `localStorage.theme = 'light'` — this won't surface in normal dev unless forced.
- **Third-party embedded widgets** (iframes, injected scripts) cannot be restyled beyond whatever the vendor exposes. Don't promise deep restyling of anything not confirmed same-origin.
- Any element in a flex row needs an explicit width or `shrink-0` if its content injects asynchronously — a bare `width: 100%` on a flex child that fills in later is not safe by default.

---

## 8. Before calling a page "done"

1. `npx tsc --noEmit -p .` — clean against baseline.
2. Both locales, both themes — including `localStorage.theme = 'light'` forced explicitly.
3. Every schema block parses and contains real data — not just that the `<script>` tag exists.
4. Read the copy out loud against §4. If it reads as generic or template-shaped, rewrite before shipping.
5. The **live deployed page** actually reflects the change — fetch the production URL, don't trust "deploy success" alone.
6. Target Lighthouse 100/100/100/100 where feasible — the standing bar for any new marketing page, not a stretch goal.

A page is done when: it uses the right architecture, it's genuinely bilingual,
it answers intent immediately, every fact in it is real and sourced, it reads
like a person wrote it, its schema is valid and verified, it matches the
visual system in both themes, and the live production URL has been checked —
not the build log.
