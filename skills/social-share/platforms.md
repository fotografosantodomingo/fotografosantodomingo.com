# Platform API Reference & Gotchas

Every platform has its own auth model, rate limits, and silent failure modes.
This file documents what you will actually hit in production.

---

## Facebook Pages

**API:** Meta Graph API v19+
**Auth:** Permanent Page Access Token (never expires unless revoked)
**Endpoint:** `POST /v19.0/{page-id}/photos` (single) or `POST /v19.0/{page-id}/feed` (multi)

### Single photo
```
POST https://graph.facebook.com/{page-id}/photos
  url={image_url}
  caption={text}
  published=true
  access_token={PAGE_TOKEN}
```

### Multi-photo album
Step 1: Upload each photo as unpublished:
```
POST /photos  url={url}  published=false  access_token={token}
→ returns { "id": "photo_id" }
```

Step 2: Publish feed post with attached media:
```
POST /{page-id}/feed
  message={caption}
  attached_media=[{"media_fbid":"id1"},{"media_fbid":"id2"}]
  access_token={token}
```

### Gotchas
- Image URL must be **publicly accessible** (no auth, no redirect). Supabase public bucket URLs work.
- `media_fbid` in the feed post body must be URL-encoded as `media_fbid=id1&media_fbid=id2` when using form encoding.
- Caption limit: 63,206 chars. Practical limit: 400 chars for engagement.
- Page token ≠ User token ≠ App token. Get it from `/me/accounts` with a long-lived user token.

### How to get a permanent page token
```bash
# 1. Short-lived user token → long-lived (60 days)
GET /oauth/access_token?grant_type=fb_exchange_token
  &client_id={app_id}&client_secret={app_secret}
  &fb_exchange_token={short_user_token}

# 2. Long-lived user token → page token (never expires)
GET /me/accounts?access_token={long_lived_user_token}
# Find your page in the array → copy its access_token
```

---

## Instagram Business

**API:** Meta Graph API (Instagram Graph API)
**Auth:** Same Page Access Token as Facebook
**Endpoint:** `POST /{ig-business-id}/media` → `POST /{ig-business-id}/media_publish`

### Single image — 2-step flow
```
# Step 1: Create container
POST /{ig_id}/media
  image_url={url}
  caption={text}
  access_token={token}
→ { "id": "container_id" }

# Step 2: Publish
POST /{ig_id}/media_publish
  creation_id={container_id}
  access_token={token}
→ { "id": "post_id" }  OR error code 2 (already published — treat as success)
```

### Carousel — 3-step flow (NOT used by this pipeline — reference only)
```
# Step 1: Create item containers (one per image, no caption)
POST /{ig_id}/media  image_url={url}  is_carousel_item=true

# Step 2: Poll each item until status_code = "FINISHED"
GET /{item_id}?fields=status_code
# Poll every 2s, max 10 attempts

# Step 3: Create carousel container
POST /{ig_id}/media
  media_type=CAROUSEL
  caption={text}
  children={id1,id2,id3}   ← comma-separated

# Step 4: Publish carousel
POST /{ig_id}/media_publish  creation_id={carousel_id}
```
This pipeline deliberately does **not** implement carousels — see the gotcha above. Kept here only in case you want to reintroduce it with better per-item error isolation.

### Gotchas
- **Error code 2** on `media_publish` = already published (idempotency quirk). Treat as success, verify via `/media` list.
- Images must be **JPEG or PNG**, min 320px, max 1440px recommended for feed.
- **Carousels are not used by this pipeline** (removed on purpose): a single slow or errored secondary child container failed the *entire* post with "Only photo or video can be accepted as media type." IG now always posts a single image, mirroring FB/LinkedIn/GBP/DeviantArt.
- **Container ingestion is async** — publishing right after creating the container returns "Media ID is not available." Poll `GET /{creation_id}?fields=status_code` every ~3s (this pipeline does up to 6 attempts, ~18s) until `status_code=FINISHED` before calling `media_publish`.
- **Oversized source images fail container creation.** Route IG's `image_url` through Supabase's render endpoint capped to 1440×1440 (`?width=1440&height=1440&resize=contain`) — full-res Drive photos otherwise silently fail this step while FB/LinkedIn (which tolerate full-res) succeed.
- Caption: 2,200 chars max, 30 hashtags max.
- IG Business account must be connected to a Facebook Page.
- `META_IG_BUSINESS_ID` ≠ `META_PAGE_ID` — get it from `GET /me?fields=instagram_business_account`.

---

## LinkedIn

**API:** LinkedIn REST API (v202506+)
**Auth:** OAuth 2.0 access token (expires 60 days)
**Scopes needed:** `openid`, `profile`, `w_member_social`
**Endpoint:** `POST https://api.linkedin.com/rest/posts`

### Required headers
```
Authorization: Bearer {token}
Content-Type: application/json
LinkedIn-Version: 202506
X-Restli-Protocol-Version: 2.0.0
```

### Image post — 3-step flow
```
# Step 1: Initialize image upload
POST https://api.linkedin.com/rest/images?action=initializeUpload
{
  "initializeUploadRequest": { "owner": "urn:li:person:XXXXX" }
}
→ { "value": { "uploadUrl": "...", "image": "urn:li:image:XXXXX" } }

# Step 2: Upload image bytes (binary PUT)
PUT {uploadUrl}
  Authorization: Bearer {token}
  Content-Type: application/octet-stream
  Body: raw image bytes

# Step 3: Create post
POST https://api.linkedin.com/rest/posts
{
  "author": "urn:li:person:XXXXX",
  "commentary": "caption text",
  "visibility": "PUBLIC",
  "distribution": {
    "feedDistribution": "MAIN_FEED",
    "targetEntities": [],
    "thirdPartyDistributionChannels": []
  },
  "content": {
    "media": {
      "title": "short title",
      "id": "urn:li:image:XXXXX"
    }
  },
  "lifecycleState": "PUBLISHED",
  "isReshareDisabledByAuthor": false
}
```

Post ID is in response header `x-restli-id`, not response body.

### Gotchas
- **v2 UGC Posts API is deprecated** (removed Aug 2023). Use `/rest/posts` only.
- `LinkedIn-Version` header is required — use current month format `YYYYMM`.
- Author URN: `urn:li:person:{sub}` for personal, `urn:li:organization:{id}` for company page.
- Get `sub` from `GET https://api.linkedin.com/v2/userinfo` with token.
- Token refresh: LinkedIn does not support refresh tokens for 3-legged OAuth. Re-auth every 60 days.
- Only first image used (LinkedIn API supports single image per post, not carousel via this flow).

---

## Pinterest

**API:** Pinterest API v5
**Auth:** OAuth 2.0 with refresh tokens (sliding expiry — refresh token is long-lived)
**Scopes needed:** `boards:read`, `boards:write`, `pins:read`, `pins:write`
**Endpoint:** `POST https://api.pinterest.com/v5/pins`

### Access levels

| Level | What you get | How to get |
|-------|-------------|------------|
| Trial | Read-only, pins visible to creator only | Auto-approved (hours) |
| Standard | Full read/write, public pins | Submit application (days/weeks) |

**You need Standard access to post public pins.**

### Token refresh flow
```
POST https://api.pinterest.com/v5/oauth/token
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token={refresh_token}
→ { "access_token": "...", "expires_in": 2592000 }
```

Refresh tokens do not expire unless revoked. Access tokens expire after 30 days.

### Create pin
```
POST https://api.pinterest.com/v5/pins
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "board_id": "123456789",
  "title": "pin title (max 100 chars)",
  "description": "description with link",
  "link": "https://yourblog.com/post",
  "media_source": {
    "source_type": "image_url",
    "url": "https://cdn.supabase.co/..."
  }
}
```

### Gotchas
- Only first image used (single pin per post — no carousel via URL source).
- Board ID from URL: `pinterest.com/{user}/{board-name}/` — not the board name but the numeric ID (get via `GET /v5/boards`).
- `source_type: "image_url"` = Pinterest fetches the image server-side. URL must be publicly accessible.
- App Client Secret is **not available** while Trial access is pending in the developer portal.

---

## Google Business Profile

**API:** My Business APIs (new separate services, v4 deprecated)
**Auth:** Google OAuth 2.0 with `business.manage` scope
**Status:** RESTRICTED — requires Google partner approval (7–10 days)

### Access request
https://developers.google.com/my-business/content/prereqs#request-access

Without approval: quota = 0, all API calls return `RESOURCE_EXHAUSTED`.

### Post a local post (once approved)
```
POST https://mybusiness.googleapis.com/v4/{locationName}/localPosts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "languageCode": "es",
  "summary": "caption text",
  "callToAction": { "actionType": "LEARN_MORE", "url": "https://..." },
  "media": [{ "mediaFormat": "PHOTO", "sourceUrl": "https://..." }],
  "topicType": "STANDARD"
}
```

Location name format: `accounts/123456789/locations/987654321`
Get it from `GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts`
then `GET https://mybusinessbusinessinformation.googleapis.com/v1/{account}/locations`

### Gotchas
- v4 `mybusiness.googleapis.com` is deprecated and returns 404. Use the new split APIs.
- Quota 0 error even after enabling API = not yet approved for partner access.
- GBP OAuth refresh token can reuse the same GCP client as Google Drive (just different scope).
- Location name persists; does not change unless you delete/recreate the GBP listing.

---

## DeviantArt

**API:** DeviantArt OAuth2 API (Stash + publish)
**Auth:** OAuth 2.0 with refresh tokens
**Scopes needed:** `browse publish stash user`
**Endpoint:** `POST /api/v1/oauth2/stash/submit` then `POST /api/v1/oauth2/stash/publish`

DeviantArt has no direct "create post with image URL" endpoint — you must
upload the image bytes to the user's private Stash first, then publish that
Stash item as a deviation.

### Token refresh flow
```
POST https://www.deviantart.com/oauth2/token
Content-Type: application/x-www-form-urlencoded

client_id={id}&client_secret={secret}&grant_type=refresh_token&refresh_token={refresh_token}
→ { "access_token": "..." }
```

### Step 1 — upload to Stash
```
POST https://www.deviantart.com/api/v1/oauth2/stash/submit
Content-Type: multipart/form-data

access_token={token}
title={title, max 50 chars}
artist_comments={html caption + link back to your site}
file={raw image bytes as a Blob}
→ { "status": "success", "itemid": 123456 }
```
The worker downloads the image bytes itself first (`fetch(imageUrl)` →
`arrayBuffer()`) since this endpoint needs a real file upload, not a URL.

### Step 2 — publish from Stash
```
POST https://www.deviantart.com/api/v1/oauth2/stash/publish
Content-Type: application/x-www-form-urlencoded

access_token={token}
itemid={itemid from step 1}
title={title}
catpath=photography
is_mature=0
feature=1
allow_comments=1
license_options[commercial]=0
license_options[modify]=no
license_options[share]=yes
→ { "status": "success", "url": "https://www.deviantart.com/...", "deviationid": "..." }
```

### Gotchas
- Two-step Stash→publish flow — a single-step "create deviation" endpoint does not exist.
- `title` is capped at 50 chars on both calls — truncate before sending or the API rejects it.
- Response bodies are JSON but returned with unpredictable content-types in practice — parse via `res.text()` then `JSON.parse()`, don't rely on `res.json()` succeeding cleanly.
- Uses the pipeline's Pinterest caption (`pi_caption_es`) rather than a dedicated DeviantArt caption field — no separate `da_caption_es` was added since Pinterest's evergreen, keyword-rich style fit DeviantArt's audience well enough.
- `license_options` controls whether others can remix/sell derivatives — this pipeline defaults to non-commercial, no-modify, shareable.

---

## Platform comparison table

| Platform | Token type | Expires | Write scope | Free public posting |
|----------|-----------|---------|-------------|---------------------|
| Facebook | Page token | Never (unless revoked) | pages_manage_posts | Yes |
| Instagram | Page token | Never (unless revoked) | instagram_content_publish | Yes (Business account required) |
| LinkedIn | Access token | 60 days | w_member_social | Yes |
| Pinterest | Refresh token (sliding) | Never (unless revoked) | pins:write | Requires Standard access approval |
| GBP | Refresh token | Never | business.manage | Requires Google partner approval |
| DeviantArt | Refresh token | Never (unless revoked) | stash, publish | Yes — standard app registration only |

---

## Debugging cross-post failures

All cross-post results are stored in `cross_post_jobs` table:
```sql
SELECT platform, status, error_msg, attempted_at
FROM cross_post_jobs
WHERE blog_post_id = '<uuid>'
ORDER BY attempted_at DESC;
```

**Important:** the `platform` CHECK constraint must include every platform you
enable. It shipped as `('fb','ig','li')` and silently rejected `gbp`/`pi`/`da`
rows for a while — the upsert failed, the row never recorded `'posted'`, and
`/retry-crosspost` kept re-posting those platforms on every retry (duplicate
GBP local posts in production). Current constraint: see `schema.sql`.

Results email also sent after every cron run / `/approve` / `/retry-crosspost` showing per-platform status.

Common errors:

| Error | Platform | Fix |
|-------|----------|-----|
| `OAuthException: Invalid OAuth access token` | FB/IG | Token revoked — regenerate page token |
| `Token refresh failed: invalid_grant` | Google/GBP | Refresh token revoked — re-run `/auth/google/start` |
| `LI posts: 401` | LinkedIn | Token expired — re-run `/auth/linkedin/start` |
| `Pinterest token refresh failed` | Pinterest | Refresh token revoked — re-run `/auth/pinterest/start` |
| `RESOURCE_EXHAUSTED quota_limit_value: 0` | GBP | API not approved — submit partner access request |
| `DA token refresh failed` | DeviantArt | Refresh token revoked — re-run `/auth/deviantart/start` |
| `DA stash failed` / `DA publish failed` | DeviantArt | Check `title` isn't over 50 chars; check image bytes actually downloaded (source URL reachable) |
| `redirect_uri_mismatch` | Any OAuth | Add the callback URL to the OAuth app settings |
| A platform silently never shows `posted` even though the API call succeeds | Any | Check the `cross_post_jobs.platform` CHECK constraint includes that platform — see note above |
