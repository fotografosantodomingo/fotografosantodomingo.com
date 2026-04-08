# Copilot Instructions — fotografosantodomingo.com

## SEO Requirements — EVERY New Page MUST Include These

When creating any new page in `src/app/[locale]/`, always implement the full SEO checklist below.

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

---

## 7. Supabase API Routes

- Server API routes (`src/app/api/*/route.ts`) MUST use `createServiceClient()` from `@/lib/supabase/service`
- NEVER use `createSupabaseServerClient()` in API routes — anon key fails RLS on `.select().single()` after insert
- Server actions (`src/lib/actions/*.ts`) already use `createServiceClient()` correctly

---

## 8. Email

- `FROM` address: `'Babula Shots <noreply@fotografosantodomingo.com>'`
- `ADMIN_EMAIL` = `process.env.ADMIN_EMAIL || 'homekrypto@gmail.com'`
- Use Resend SDK via `@/lib/email/resend.ts`

---

## 9. Git

- Default push: `git push origin main` only
- Push to backup only when user explicitly requests: `git push backup main`
