# Copilot Instructions — fotografosantodomingo.com

## SEO Requirements — EVERY New Page MUST Include These

When creating any new page in `src/app/[locale]/`, always implement the full SEO checklist below.

These rules also apply when creating new blog posts, page variants, landing pages, or refreshing existing copy. The goal is consistency with the current SEO strategy already used across the site.

---

## 1. Standard `generateMetadata()` Template

```tsx
import type { Metadata } from 'next'

const BASE_URL = 'https://www.fotografosantodomingo.com'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs ? 'ES Title | Babula Shots' : 'EN Title | Babula Shots'
  const description = isEs ? 'ES description...' : 'EN description...'
  return {
    title,
    description,
    // ✅ REQUIRED: 4–6 comma-separated keyword phrases (localized)
    keywords: isEs
      ? 'palabra clave 1, palabra clave 2, fotografo santo domingo'
      : 'keyword 1, keyword 2, photographer santo domingo',
    // ✅ REQUIRED: canonical + hreflang alternates for ES/EN
    alternates: {
      canonical: `${BASE_URL}/${locale}/PAGE_SLUG`,
      languages: {
        es: `${BASE_URL}/es/PAGE_SLUG`,
        en: `${BASE_URL}/en/PAGE_SLUG`,
        'x-default': `${BASE_URL}/es/PAGE_SLUG`,
      },
    },
    // ✅ REQUIRED: Full Open Graph block
    openGraph: {
      type: 'website',                                    // 'article' for blog posts, 'profile' for about
      siteName: 'Fotografo Santo Domingo | Babula Shots', // always this value
      title: isEs ? 'Short ES OG Title' : 'Short EN OG Title',
      description,
      url: `${BASE_URL}/${locale}/PAGE_SLUG`,
      locale: isEs ? 'es_DO' : 'en_US',                  // always include locale
      images: [{
        url: `${BASE_URL}/api/og?title=Encoded+Title&subtitle=Subtitle`,
        width: 1200,
        height: 630,
        alt: isEs ? 'ES image alt text' : 'EN image alt text', // always include alt
      }],
    },
    // ✅ REQUIRED: Twitter card
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Short ES Twitter Title' : 'Short EN Twitter Title',
      description,
      images: [`${BASE_URL}/api/og?title=Encoded+Title`],
    },
    // ✅ REQUIRED: Explicit robots (with googleBot for important pages)
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}
```

### Metadata strategy rules

- Titles must target the main search intent first, then brand second
- Prefer localized keyword-first titles such as `Service | Fotografo Santo Domingo` or `Topic | Babula Shots`
- Do NOT add generic suffixes globally in a way that duplicates page titles
- Descriptions must be written uniquely for each page; never reuse a generic site-wide paragraph
- Keywords must be specific long-tail phrases, not single-word lists
- Canonical URLs must always use `https://www.fotografosantodomingo.com`
- For English pages, keep the English slug; do not translate route slugs
- If a page targets Santo Domingo, Punta Cana, weddings, portraits, drone, or commercial intent, mention that intent explicitly in title/description when natural

---

## 2. JSON-LD Schema — Required per Page Type

Import from `@/components/seo/JsonLd`:
```tsx
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'
```

### All non-home pages: BreadcrumbList
```tsx
const breadcrumbSchema = schemaGenerators.breadcrumb([
  { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
  { name: locale === 'es' ? 'Nombre Sección' : 'Section Name', url: `${BASE_URL}/${locale}/PAGE_SLUG` },
])
```

### Blog list: BreadcrumbList only

### Blog posts: Article + BreadcrumbList
```tsx
const articleSchema = schemaGenerators.article(post, locale)
const breadcrumbSchema = schemaGenerators.breadcrumb([
  { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
  { name: 'Blog', url: `${BASE_URL}/${locale}/blog` },
  { name: post title, url: `${BASE_URL}/${locale}/blog/${slug}` },
])
```

### Homepage and business schemas

- Homepage is the canonical place for the main `LocalBusiness` schema
- Do NOT introduce duplicate `LocalBusiness` nodes in layout or new pages unless there is a clear page-specific reason
- Reuse `schemaGenerators.localBusinessWithRating()` when business schema is needed
- Do NOT add a second `WebSite` schema on pages if the layout already provides it

### Services: ServiceList + BreadcrumbList
```tsx
const serviceListSchema = schemaGenerators.serviceList(locale)
```

### About: Person + BreadcrumbList
```tsx
const personSchema = schemaGenerators.person(locale)
```

### Portfolio: ImageGallery + LocalBusiness + BreadcrumbList (see portfolio/page.tsx)

### Contact: BreadcrumbList (LocalBusiness is on homepage)

---

## 3. Return Structure — Wrap JSON-LD Scripts in a Fragment

```tsx
return (
  <>
    <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
    {/* additional JSON-LD scripts here */}
    <main className="min-h-screen">
      {/* page content */}
    </main>
  </>
)
```

### Schema consistency rules

- Prefer one authoritative schema node per entity type rather than multiple overlapping versions
- Breadcrumb labels must be localized
- Blog post schema must use the actual localized title/excerpt content shown on the page
- Service and portfolio pages should reference real data and real URLs, not placeholder copy

---

## 4. OG Image URL Convention

The `/api/og` endpoint generates dynamic OG images. Use this pattern:
```
/api/og?title=URL+Encoded+Title&subtitle=URL+Encoded+Subtitle
```

Use `+` for spaces (not `%20`) in the query string for readability.

---

## 5. Page Slug Naming

- All page routes are inside `src/app/[locale]/`
- Always use English slugs (e.g., `/services`, `/portfolio`, `/about`, `/contact`)
- Add redirect in `next.config.js` for bare paths: `{ source: '/new-page', destination: '/es/new-page', permanent: false }`

---

## 6. i18n / Translations

- Translations live in `src/messages/es.json` and `src/messages/en.json`
- Always add new translation keys to BOTH files
- Use `getTranslations({ locale, namespace: 'your_namespace' })` in server components
- The `contact.form.service` key is a NAMESPACE (not a string) — use `contact.form.service.label`
- Never hard-code English-only body copy, CTA labels, author bios, or metadata on localized pages

---

## 7. Strategic SEO Rules for ALL Future Pages

### Internal linking

- Every new important page should link naturally to at least 2 relevant existing pages when possible
- Prefer links between services, portfolio, contact, and blog where contextually useful
- Blog posts should include contextual links to related services or contact pages

### Heading structure

- Use exactly one clear `h1` that matches the core topic of the page
- Use descriptive `h2`/`h3` headings containing secondary keyword variations where natural
- Do not skip from `h1` to `h4`

### Content targeting

- New landing pages must target one primary intent, not many mixed intents
- Avoid thin pages; new SEO pages should have enough unique content to justify indexing
- Copy should mention service area and buyer intent naturally, not through keyword stuffing
- Use localized language for Dominican Republic search intent when relevant

### Images

- Important images must have descriptive localized `alt` text
- Prefer meaningful filenames/public IDs and captions/descriptions when image data is stored
- If the page is image-heavy, consider matching schema from `JsonLd.ts` where appropriate

### Technical consistency

- Use `BASE_URL = 'https://www.fotografosantodomingo.com'`
- Do not use non-`www` canonicals, schema URLs, or sitemap references
- Do not reintroduce outdated business hours or outdated social profiles in schema
- Avoid duplicate title patterns, duplicate schema entities, and duplicated metadata blocks

---

## 8. Blog Post SEO Rules — REQUIRED for Every New Post

When creating or editing files for blog content, preserve the same SEO strategy used by current posts.

### Blog post metadata

- Each post must have a unique SEO title and description in both languages
- Title should target a long-tail search query, not a vague editorial title alone
- Description should summarize the search value of the article in 140-160 characters when practical
- Include localized keywords relevant to the article topic and city/service intent when appropriate

### Blog post structure

- Start with a strong introductory paragraph that states the topic and search intent clearly
- Use descriptive subheadings with semantic hierarchy
- Include practical, original information rather than filler text
- End with a contextual CTA to a service, portfolio, or contact page when relevant

### Blog post linking

- Add internal links to related services, portfolio, or contact pages when they fit naturally
- Prefer at least 2 internal links per substantial post when useful
- Do not add fake external citations or unnecessary outbound links

### Blog post schema and OG

- Use `schemaGenerators.article(post, locale)` and breadcrumb schema
- Open Graph title/description should stay aligned with the article search intent
- OG image URL should follow the `/api/og?title=...&subtitle=...` convention

### Blog content quality bar

- Avoid generic AI-style phrasing and repeated paragraphs
- Prefer concrete local knowledge, examples, processes, and buyer-facing guidance
- If updating an older article, improve metadata, headings, internal links, and clarity together

---

## 9. Supabase API Routes

- Server API routes (`src/app/api/*/route.ts`) MUST use `createServiceClient()` from `@/lib/supabase/service`
- NEVER use `createSupabaseServerClient()` in API routes — anon key fails RLS on `.select().single()` after insert
- Server actions (`src/lib/actions/*.ts`) already use `createServiceClient()` correctly

---

## 10. Email

- `FROM` address: `'Babula Shots <noreply@fotografosantodomingo.com>'`
- `ADMIN_EMAIL` = `process.env.ADMIN_EMAIL || 'homekrypto@gmail.com'`
- Use Resend SDK via `@/lib/email/resend.ts`

---

## 11. Git

- Default push: `git push origin main` only
- Push to backup only when user explicitly requests: `git push backup main`
