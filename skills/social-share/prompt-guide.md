# Claude Prompt Guide — Adapting for Any Brand

The pipeline uses a single Claude Vision call to generate everything: bilingual blog post,
SEO metadata, and platform-specific social captions. This file explains how to adapt it.

---

## What Claude generates in one call

Given 1–2 images and a folder name hint, Claude returns a JSON object with:

- `slug_es` / `slug_en` — URL slugs
- `title_es` / `title_en` — editorial titles (58–68 chars)
- `excerpt_es` / `excerpt_en` — 130–155 char teasers
- `meta_description_es` / `meta_description_en` — SEO meta (145–158 chars)
- `og_title_es` / `og_title_en` — Open Graph titles
- `primary_keyword_es` / `primary_keyword_en` — target keyword
- `intro_es` / `intro_en` — opening paragraph
- `content_es` / `content_en` — full bilingual HTML (3 H2s, ~550 words each)
- `location_section_es` / `location_section_en` — location paragraph
- `faq_es` / `faq_en` — 3 FAQ items each
- `cover_image_alt_es/en`, `title`, `caption`, `description` — image metadata
- `reading_time` — estimated minutes
- `service_type` — used for internal link sets
- `geo_city` — location detection
- `tags` — array of 5 tags
- `fb_caption_es` — Facebook caption (160–220 chars, emoji, no hashtags)
- `ig_caption_es` — Instagram caption (180–220 chars, 6 hashtags)
- `li_caption_es` — LinkedIn caption (210–270 chars, professional tone)
- `pi_caption_es` — Pinterest description (150–300 chars, keyword-rich, evergreen)
- `gbp_caption_es` — Google Business text (150–250 chars, local CTA)

---

## System prompt structure

The system prompt has 5 sections. Change sections 1–3 per brand; keep 4–5 unchanged.

### Section 1 — Brand identity (CHANGE THIS)
```
You are the lead content strategist for {Brand Name}, a {type of business}
based in {City}, {Country}.
```

### Section 2 — Brand voice rules (CHANGE THIS)
Define:
- Tone adjectives (warm / technical / playful / luxurious)
- POV (first-person plural "we" vs third-person)
- Forbidden phrases (generic fluff to avoid)
- Required specifics (what details to always mention)

Example for a restaurant:
```
BRAND VOICE
- Warm, sensory, food-focused — describe aromas, textures, the chef's hands
- First-person plural from the restaurant's perspective
- Never: "unforgettable experience", "farm to table", "culinary journey"
- Always: mention specific dishes, cooking techniques, local ingredient sources
```

### Section 3 — Services & markets (CHANGE THIS)
List the specific service types and geographic markets:
```
SERVICES & MARKETS
Wedding photography · Family sessions · Corporate events
Primary markets: Santo Domingo, Punta Cana, Cap Cana
Also serve: international travelers
```

### Section 4 — Content structure rules (KEEP AS-IS)
The HTML structure rules, word counts, placeholder positions ({{GALLERY}}, {{CTA}}, {{IMAGE_N}})
are universal — do not change unless you change the post rendering logic.

### Section 5 — SEO constraints (KEEP AS-IS)
Alt text limits, heading rules, meta description format — also universal.

---

## CTA block (hardcoded, not Claude-generated)

The `{{CTA}}` placeholder is replaced server-side with a hardcoded HTML block.
This ensures consistent CTAs that can be updated without re-generating posts.

```typescript
const CTA_BLOCK_ES = `<div class="cta-block">
  <p><strong>¿Listo para agendar?</strong><br>
  Cotiza en línea o escríbenos por WhatsApp.</p>
  <p><a href="https://yourbrand.com/cotizar">Ver precios</a>
  &nbsp;·&nbsp; <a href="https://wa.me/1234567890">WhatsApp</a></p>
</div>`
```

Adapt the URLs and copy. The `cta-block` CSS class must be styled in your site.

---

## {{GALLERY}} placeholder

Replaced with an internal link to your portfolio/gallery for the current service type.
Built from a lookup table in `src/index.ts` → `SERVICE_LINK_SETS`:

```typescript
const SERVICE_LINK_SETS: Record<string, LinkSet> = {
  wedding: {
    es: [
      { text: 'Fotografía de bodas', url: '/es/services/wedding', description: '...' },
      ...
    ]
  }
}
```

Add your service types here. `generated.service_type` (from Claude) is the lookup key.

---

## Adding a new language

1. Add `_fr` / `_de` / etc. fields to the JSON schema in `OUTPUT_SCHEMA`
2. Add matching fields to `GeneratedPost` in `types.ts`
3. Add matching columns to `blog_posts` table
4. Add platform caption fields for each language per platform
5. In `runCrossPost()`, pass the new language caption

---

## Model selection

| Use case | Model | Why |
|----------|-------|-----|
| Production (cost-optimized) | `claude-haiku-4-5-20251001` | $0.003/post, fast (~8s) |
| Higher quality (richer prose) | `claude-sonnet-4-6` | ~10x cost, noticeably better writing |
| Special posts (flagship content) | `claude-opus-4-8` | Most expensive, photojournalism-quality writing |

Set via `ANTHROPIC_MODEL` env var in wrangler.toml — no code change needed.

---

## Prompt iteration strategy

**⚠️ There is no draft/review gate.** `runPipeline()` inserts the post with
`status: 'published'` and immediately calls `runCrossPost()` — a manual `/run`
during prompt iteration goes live on the blog **and** posts to every enabled
platform (FB, IG, LinkedIn, Pinterest, GBP, DeviantArt) in the same call.
`/reject` only archives the blog post afterward; it cannot un-post from social
platforms.

To iterate on the prompt safely:
1. Temporarily set every `*_ENABLED` flag to `"false"` in `wrangler.toml` and redeploy.
2. Hit `/run` manually:
   ```bash
   curl -X POST "<WORKER_URL>/run?token=<token>"
   ```
3. Check the generated post in Supabase → `blog_posts` (it will be `published` on your
   site, but nothing will have gone to social). Use `/reject` to archive it if it's junk.
4. Tweak the prompt, redeploy, repeat.
5. Re-enable the platform flags only once you're happy with output quality.

---

## Common prompt failures and fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Claude generates wrong service type | Folder name not descriptive enough | Rename Drive folder to include service type (e.g., "Boda Juan y Maria - Cap Cana") |
| {{GALLERY}} missing from HTML | Claude ignored the placement rule | Add stronger emphasis in content rules: "NEVER omit {{GALLERY}}" |
| Social captions too long / too short | Model not following length rules | Add explicit char count constraints to the schema description |
| Slug contains stopwords | Claude generating verbose slugs | Add example slugs to the schema comment |
| FAQ answers too generic | No DR/local context in prompt | Add geo-specific context to brand voice section |
