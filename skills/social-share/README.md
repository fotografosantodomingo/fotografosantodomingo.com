# Skill: Drive → Blog → Social Pipeline

**Drop image in folder → review email → one-click publish to blog + 5 social platforms.**

Zero CMS. Zero manual writing. One human decision.

---

## What this builds

A Cloudflare Worker that runs daily, watches a Google Drive folder, generates a bilingual
SEO blog post with Claude Vision, sends you a review email with Approve/Reject links,
and on approval publishes the post to your site + cross-posts to every social platform.

```
Google Drive folder
      │
      ▼  (cron, daily)
Cloudflare Worker
      │
      ├─ Downloads images → Supabase Storage (public CDN)
      │
      ├─ Calls Claude Vision → bilingual blog post JSON
      │   (ES + EN: title, slug, content, meta, FAQs, social captions)
      │
      ├─ Inserts draft → Supabase blog_posts
      │
      └─ Sends review email (Resend) with HMAC-signed links
              │
    ┌─────────┴──────────┐
    ▼                    ▼
  APPROVE              REJECT
    │                    │
    ├─ status=published   └─ status=archived
    │
    ├─► Facebook Page (Graph API)
    ├─► Instagram Business (Graph API)
    ├─► LinkedIn Page/Person (REST API v202506)
    ├─► Pinterest (API v5)  [requires Standard access]
    └─► Google Business Profile  [requires partner API approval]
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

- Content moderation — the Approve gate is the only filter
- Scheduled/queued publishing — Approve = publish immediately
- Engagement analytics pull-back — results stored but metrics not fetched
- Multi-language captions (other than ES default) — trivially extensible
- Video/Reels — images only; video requires container upload flows on IG/FB

---

## Performance envelope (Cloudflare Free plan)

| Scenario | Time |
|----------|------|
| 1 image, 700-word bilingual post | ~20s |
| 2 images, bilingual | ~24s |
| 3+ images or long body | Use Workers Paid ($5/mo, 15-min budget) |

Cross-posting runs in `ctx.waitUntil()` — response returns immediately, social posts happen in background.

---

## Cost estimate (per post)

| Service | Cost |
|---------|------|
| Claude Haiku (vision, ~5000 tokens) | ~$0.003 |
| Resend (2 emails) | Free tier |
| Cloudflare Worker | Free tier |
| Supabase Storage | ~$0.00003/image |
| **Total** | **~$0.003/post** |
