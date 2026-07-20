# Worker Configuration Reference

Complete list of all environment variables and secrets for the Cloudflare Worker.

---

## wrangler.toml — env vars (non-sensitive, committed to repo)

```toml
[vars]
# Supabase project URL (not secret — also in your .env.local)
SUPABASE_URL = "https://<ref>.supabase.co"

# Your site's public URL — used to build blog post URLs for social captions
SITE_URL = "https://yourbrand.com"

# The worker's own public URL — used to build OAuth redirect URIs and magic links
WORKER_BASE_URL = "https://your-worker-name.<subdomain>.workers.dev"

# Email sender name+address for review and results emails
REVIEW_EMAIL_FROM = "Your Brand <info@yourbrand.com>"

# Email address that receives review/approve/reject emails
REVIEW_EMAIL_TO = "info@yourbrand.com"

# Claude model to use — swap without code changes
ANTHROPIC_MODEL = "claude-haiku-4-5-20251001"
# Options: claude-haiku-4-5-20251001 | claude-sonnet-4-6 | claude-opus-4-8

# Feature flags — set "true" only after secrets are configured
META_ENABLED = "false"          # Facebook posting
META_IG_ENABLED = "false"       # Instagram posting (requires META_ENABLED=true)
LINKEDIN_ENABLED = "false"      # LinkedIn posting
PINTEREST_ENABLED = "false"     # Pinterest posting
GBP_ENABLED = "false"           # Google Business Profile posting
DA_ENABLED = "false"            # DeviantArt posting

[triggers]
crons = ["0 14 * * *", "0 23 * * *"]   # This site runs twice daily: 14:00 & 23:00 UTC
                                        # (10:00 & 19:00 AST). Cloudflare Workers accept
                                        # multiple cron expressions per worker on the
                                        # free plan — one entry per line is fine too.
```

---

## Secrets — set via `npx wrangler secret put <NAME>`

Never commit secrets. Each is pushed once and stored encrypted in Cloudflare.

### Core (required)

| Secret | Description | How to get |
|--------|-------------|------------|
| `ANTHROPIC_API_KEY` | Anthropic API key | console.anthropic.com → API Keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | Supabase dashboard → Settings → API |
| `GOOGLE_CLIENT_ID` | GCP OAuth 2.0 client ID | GCP → Credentials |
| `GOOGLE_CLIENT_SECRET` | GCP OAuth 2.0 client secret | GCP → Credentials |
| `GOOGLE_REFRESH_TOKEN` | Drive read access refresh token | Visit `/auth/google/start` |
| `GOOGLE_DRIVE_FOLDER_ID` | Root folder ID to watch | From Drive folder URL |
| `RESEND_API_KEY` | Resend transactional email | resend.com → API Keys |
| `EMAIL_LINK_SECRET` | HMAC signing key for manual `/approve` and `/reject` endpoints | `openssl rand -base64 32` |

### Facebook + Instagram (optional)

| Secret | Description | How to get |
|--------|-------------|------------|
| `META_PAGE_ACCESS_TOKEN` | Permanent FB page token | `/me/accounts` with long-lived user token |
| `META_PAGE_ID` | Facebook Page numeric ID | `GET /me?fields=id` with page token |
| `META_IG_BUSINESS_ID` | Instagram Business Account ID | `GET /me?fields=instagram_business_account` |

### LinkedIn (optional)

| Secret | Description | How to get |
|--------|-------------|------------|
| `LINKEDIN_CLIENT_ID` | LinkedIn app client ID | developers.linkedin.com |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn app client secret | developers.linkedin.com |
| `LINKEDIN_ACCESS_TOKEN` | OAuth access token (60-day expiry) | Visit `/auth/linkedin/start` |
| `LINKEDIN_AUTHOR_URN` | `urn:li:person:XXXXX` or `urn:li:organization:XXXXX` | Returned by `/auth/linkedin/start` |

### Pinterest (optional — requires Standard access)

| Secret | Description | How to get |
|--------|-------------|------------|
| `PINTEREST_CLIENT_ID` | Pinterest app ID | developers.pinterest.com |
| `PINTEREST_CLIENT_SECRET` | Pinterest app secret (only available after Trial approval) | developers.pinterest.com |
| `PINTEREST_REFRESH_TOKEN` | OAuth refresh token | Visit `/auth/pinterest/start` |
| `PINTEREST_BOARD_ID` | Numeric board ID to post to | Via API or board URL |

### Google Business Profile (optional — requires Google partner approval)

| Secret | Description | How to get |
|--------|-------------|------------|
| `GBP_CLIENT_ID` | GCP OAuth client ID (optional — falls back to GOOGLE_CLIENT_ID) | GCP → Credentials |
| `GBP_CLIENT_SECRET` | GCP OAuth client secret (optional — falls back to GOOGLE_CLIENT_SECRET) | GCP → Credentials |
| `GBP_REFRESH_TOKEN` | Business manage scope refresh token | Visit `/auth/gbp/start` |
| `GBP_LOCATION_NAME` | `accounts/123/locations/456` | Visit `/gbp/locations?token=...` |
| `GBP_REVIEWS_URL` | (optional, non-secret — can also be a `[vars]` entry) Public URL to your Google listing, stored on synced review rows as `review_url` | Your Google Maps/Search listing URL |

### DeviantArt (optional)

| Secret | Description | How to get |
|--------|-------------|------------|
| `DA_CLIENT_ID` | DeviantArt app client ID | deviantart.com/developers/apps |
| `DA_CLIENT_SECRET` | DeviantArt app client secret | deviantart.com/developers/apps |
| `DA_REFRESH_TOKEN` | OAuth refresh token | Visit `/auth/deviantart/start` |

---

## Worker HTTP endpoints

All endpoints are on the worker URL (`WORKER_BASE_URL`).

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/run?token=<tok>` | token = first 24 chars of SUPABASE_SERVICE_ROLE_KEY | Manually trigger pipeline |
| `GET` | `/approve?post_id=&ts=&sig=` | HMAC sig (from email link) | Approve + publish + cross-post |
| `GET` | `/reject?post_id=&ts=&sig=` | HMAC sig (from email link) | Archive draft |
| `GET` | `/health` | None | Returns "ok" |
| `GET` | `/debug-drive?token=<tok>` | token | Lists raw Drive folder contents |
| `GET` | `/meta/status?token=<tok>` | token | Checks FB/IG token validity |
| `GET` | `/auth/google/start` | None | Redirects to Google OAuth |
| `GET` | `/auth/google/callback` | Google code | Exchanges code, shows refresh token |
| `GET` | `/auth/linkedin/start` | None | Redirects to LinkedIn OAuth |
| `GET` | `/auth/linkedin/callback` | LinkedIn code | Exchanges code, shows token + URN |
| `GET` | `/auth/pinterest/start` | None | Redirects to Pinterest OAuth |
| `GET` | `/auth/pinterest/callback` | Pinterest code | Exchanges code, shows refresh token |
| `GET` | `/auth/gbp/start` | None | Redirects to Google OAuth (business.manage scope) |
| `GET` | `/auth/gbp/callback` | Google code | Exchanges code, shows refresh token |
| `GET` | `/gbp/locations?token=<tok>` | token | Lists GBP accounts + locations |
| `GET` | `/auth/deviantart/start` | None | Redirects to DeviantArt OAuth |
| `GET` | `/auth/deviantart/callback` | DeviantArt code | Exchanges code, shows refresh token |
| `GET` | `/sync-reviews?token=<tok>` | token | Manually triggers the Google review sync (also runs every cron tick) |
| `GET` | `/retry-crosspost?post_id=<uuid>&token=<tok>` | token | Idempotent retry — re-posts only platforms not already `'posted'` in `cross_post_jobs` |
| `GET` | `/debug-gbp?token=<tok>` | token | One-time GBP verification: confirms partner approval, lists accounts/locations, probes review read access |

---

## How to verify all secrets are set

```bash
npx wrangler secret list
```

Compare against the table above. Any missing required secret will cause the pipeline to fail silently on that step.

---

## Cron schedule reference

```toml
# Common schedules
"0 17 * * *"    # Daily at 17:00 UTC (1 PM AST)
"0 14 * * *"    # Daily at 14:00 UTC (10 AM EST)
"0 9 * * 1"     # Every Monday at 09:00 UTC
"0 */6 * * *"   # Every 6 hours

# This site's actual config — twice daily:
crons = ["0 14 * * *", "0 23 * * *"]   # 10:00 & 19:00 AST
```

Each cron tick runs `runPipeline()` (Drive → blog → cross-post, one new
group per run) followed by a best-effort `syncGbpReviews()` call — the review
sync never blocks or fails the main pipeline.

---

## Token management cheat sheet

```bash
# Refresh Google Drive token
open <WORKER_BASE_URL>/auth/google/start
# → copy token → wrangler secret put GOOGLE_REFRESH_TOKEN

# Refresh LinkedIn token (do every 50 days to be safe)
open <WORKER_BASE_URL>/auth/linkedin/start
# → copy token + URN → wrangler secret put LINKEDIN_ACCESS_TOKEN
# → wrangler secret put LINKEDIN_AUTHOR_URN

# Refresh Pinterest token
open <WORKER_BASE_URL>/auth/pinterest/start
# → copy refresh token → wrangler secret put PINTEREST_REFRESH_TOKEN

# Refresh GBP token
open <WORKER_BASE_URL>/auth/gbp/start
# → copy refresh token → wrangler secret put GBP_REFRESH_TOKEN

# Refresh DeviantArt token
open <WORKER_BASE_URL>/auth/deviantart/start
# → copy refresh token → wrangler secret put DA_REFRESH_TOKEN
```
