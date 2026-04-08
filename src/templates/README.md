# Template Starters

Use `localized-seo-page-template.tsx` when creating a new localized page under `src/app/[locale]/...`.

Use `blog-post-template.ts` when preparing a payload for `POST /api/admin/create-post`.

Before shipping a new page:
- Add translation keys to both `src/messages/es.json` and `src/messages/en.json`.
- Add the bare-path redirect in `next.config.js` for the new page slug.
- Keep the slug in English for both locales.
- Add at least two natural internal links when the page or article is important enough to index.

Before shipping a new blog post:
- Fill the payload with bilingual fields that match `CreatePostSchema`.
- Keep `slug_es` and `slug_en` lowercase with hyphens only.
- Use Cloudinary image URLs that include the `f_webp` transform.
- Confirm the SEO title and description are unique in both languages.
- Keep the body localized instead of translating only the metadata.
- End with a CTA to a relevant service, portfolio page, or contact page.