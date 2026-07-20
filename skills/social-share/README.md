# Skill: Drive → Blog → Social Pipeline

**Drop image in folder → review email → one-click publish to blog + 5 social platforms.**

Zero CMS. Zero manual writing. One human decision.

---

## What this builds

A Cloudflare Worker that runs daily, watches a Google Drive folder, generates a bilingual
SEO blog post with Claude Vision, and immediately publishes to the site + cross-posts to
every social platform — fully automatic, no human approval step.

```
Google Drive folder
      │
      ▼  (cron — this site runs it twice daily, 10:00 & 19:00 AST)
Cloudflare Worker
      │
      ├─ Downloads images → Supabase Storage (public CDN)
      │
      ├─ Calls Claude Vision → bilingual blog post JSON
      │   (ES + EN: title, slug, content, meta, FAQs, social captions)
      │
      ├─ Inserts post → Supabase blog_posts  (status=published immediately)
      │
      ├─► Facebook Page (Graph API)
      ├─► Instagram Business (Graph API)
      ├─► LinkedIn Page/Person (REST API v202506)
      ├─► Pinterest (API v5)  [requires Standard access]
      ├─► Google Business Profile  [requires partner API approval]
      ├─► DeviantArt (Stash upload → publish)
      │
      └─ Sends results email (Resend) — what was posted + links

Separately, every cron tick also runs a best-effort Google review sync:
GBP reviews API → upsert into Supabase `reviews` table (full refresh of
source='google' rows) → site's /testimonials page reads from there.
```

---

## File map

| File | Purpose |
|------|---------|
| `README.md` | This file — architecture overview |
| `setup.md` | Complete setup from zero to deployed |
| `platforms.md` | Per-platform API details, gotchas, token setup |
| `prompt-guide.md` | How to write the Claude system prompt for any brand |
| `schema.sql` | Supabase tables required |
| `worker-config.md` | All env vars and secrets reference |

---

## Tech stack decision log

| Layer | Choice | Why |
|-------|--------|-----|
| Scheduler | Cloudflare Workers Cron | Free tier, 100k req/day, no server |
| Image source | Google Drive API (OAuth refresh) | Universal UX; owners already use Drive |
| LLM | Anthropic Claude Haiku (Vision) | Cheapest multimodal; structured JSON output |
| Storage | Supabase Storage (public bucket) | Free 1 GB; direct public CDN URLs for social APIs |
| Database | Supabase Postgres | Free tier; RLS for security; REST is Worker-friendly |
| Email | Resend | Reliable deliverability; simple REST API from Workers |
| Cross-post | Native platform APIs only | No SaaS dependency, no extra cost |

---

## What this does NOT include

- Content moderation — posts go live automatically; manual `/approve` and `/reject` endpoints exist for one-off overrides (but only affect the blog post, not already-published social posts)
- Scheduled/queued publishing — cron fires on schedule, publishes immediately
- Engagement analytics pull-back — results stored but metrics not fetched
- Multi-language captions (other than ES default) — trivially extensible
- Video/Reels — images only; video requires container upload flows on IG/FB
- Instagram carousels — deliberately removed; one slow/errored secondary container failed the whole post, so IG now mirrors FB/LinkedIn/GBP/DeviantArt with a single image only

---

## Performance envelope (Cloudflare Free plan)

| Scenario | Time |
|----------|------|
| 1 image, 700-word bilingual post | ~20s |
| 2 images, bilingual | ~24s |
| 3+ images or long body | Use Workers Paid ($5/mo, 15-min budget) |

Cross-posting runs inline during the cron job — all platforms are attempted before the worker exits.

---

## Cost estimate (per post)

| Service | Cost |
|---------|------|
| Claude Haiku (vision, ~5000 tokens) | ~$0.003 |
| Resend (2 emails) | Free tier |
| Cloudflare Worker | Free tier |
| Supabase Storage | ~$0.00003/image |
| **Total** | **~$0.003/post** |
