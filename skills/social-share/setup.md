# Setup Guide — From Zero to Live

Estimated time: 45–90 minutes (most time spent on platform OAuth flows).

---

## Prerequisites

```bash
npm i -g wrangler        # Cloudflare CLI
wrangler login

# Supabase CLI (optional but useful)
brew install supabase/tap/supabase
supabase login
```

---

## Step 1 — Copy the worker

```bash
cp -r workers/drive-pipeline workers/my-brand-pipeline
cd workers/my-brand-pipeline
```

Edit `wrangler.toml`:
```toml
name = "my-brand-drive-pipeline"

[vars]
SUPABASE_URL = "https://<ref>.supabase.co"
SITE_URL = "https://mybrand.com"
WORKER_BASE_URL = "https://my-brand-drive-pipeline.<subdomain>.workers.dev"
REVIEW_EMAIL_FROM = "My Brand <info@mybrand.com>"
REVIEW_EMAIL_TO = "info@mybrand.com"
ANTHROPIC_MODEL = "claude-haiku-4-5-20251001"
META_ENABLED = "false"        # enable after setup
META_IG_ENABLED = "false"
LINKEDIN_ENABLED = "false"
PINTEREST_ENABLED = "false"
GBP_ENABLED = "false"
```

Deploy once to get the worker URL:
```bash
npx wrangler deploy
```

Note the URL: `https://my-brand-drive-pipeline.<subdomain>.workers.dev`
You'll need it for all OAuth redirect URIs below.

---

## Step 2 — Supabase

1. Create project at app.supabase.com
2. Run `schema.sql` from this skill folder in the SQL editor
3. Create storage bucket `blog_media` → set to **Public**
4. Copy service role key (Settings → API)

```bash
echo "<service_role_key>" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Set in wrangler.toml:
```toml
SUPABASE_URL = "https://<ref>.supabase.co"
```

---

## Step 3 — Google Drive (OAuth)

### 3a. Create GCP project

1. console.cloud.google.com → New Project
2. Enable **Google Drive API**
3. OAuth consent screen → External → add scopes:
   - `https://www.googleapis.com/auth/drive.readonly`
4. Credentials → Create OAuth 2.0 Client ID (Web Application)
5. Add redirect URI: `<WORKER_BASE_URL>/auth/google/callback`
6. Copy Client ID and Client Secret

```bash
echo "<client_id>" | npx wrangler secret put GOOGLE_CLIENT_ID
echo "<client_secret>" | npx wrangler secret put GOOGLE_CLIENT_SECRET
```

### 3b. Get refresh token

```bash
npx wrangler deploy   # deploy with the new secrets first
```

Visit: `<WORKER_BASE_URL>/auth/google/start`
→ Authorize with your Google account
→ Page shows refresh token

```bash
echo "<refresh_token>" | npx wrangler secret put GOOGLE_REFRESH_TOKEN
```

### 3c. Set Drive folder ID

Create a folder in Google Drive, copy its ID from the URL
(`https://drive.google.com/drive/folders/<FOLDER_ID>`):

```bash
echo "<folder_id>" | npx wrangler secret put GOOGLE_DRIVE_FOLDER_ID
```

---

## Step 4 — Email (Resend)

1. Create account at resend.com
2. Add and verify your domain
3. Create API key

```bash
echo "<resend_api_key>" | npx wrangler secret put RESEND_API_KEY
```

Set email link signing secret (any random 32+ char string):
```bash
openssl rand -base64 32 | npx wrangler secret put EMAIL_LINK_SECRET
```

---

## Step 5 — Anthropic

1. console.anthropic.com → API Keys → Create
2. Add billing credits ($5 = ~1500 posts at Haiku pricing)

```bash
echo "<anthropic_api_key>" | npx wrangler secret put ANTHROPIC_API_KEY
```

---

## Step 6 — Facebook + Instagram

You need: Facebook Page, Instagram Business Account connected to that Page.

### 6a. Get permanent page token

1. developers.facebook.com → My Apps → Create App → Business
2. Add products: Facebook Login, Instagram Graph API
3. App Settings → Basic → copy App ID and App Secret
4. Generate a User token with permissions:
   - `pages_manage_posts`, `pages_read_engagement`
   - `instagram_content_publish`, `instagram_basic`
5. Exchange for a long-lived token, then exchange for a permanent Page token:

```bash
# Long-lived user token (60 days)
curl "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN"

# Page access token (never expires)
curl "https://graph.facebook.com/me/accounts?access_token=LONG_LIVED_USER_TOKEN"
# → find your page, copy its access_token field
```

6. Get Page ID and IG Business Account ID:
```bash
curl "https://graph.facebook.com/me?fields=id,name,instagram_business_account&access_token=PAGE_TOKEN"
```

```bash
echo "<page_token>" | npx wrangler secret put META_PAGE_ACCESS_TOKEN
echo "<page_id>" | npx wrangler secret put META_PAGE_ID
echo "<ig_business_id>" | npx wrangler secret put META_IG_BUSINESS_ID
```

In wrangler.toml:
```toml
META_ENABLED = "true"
META_IG_ENABLED = "true"
```

---

## Step 7 — LinkedIn

1. developers.linkedin.com → Create App
2. Products: Share on LinkedIn, Sign In with LinkedIn using OpenID Connect
3. Auth → OAuth 2.0 settings → add redirect URI: `<WORKER_BASE_URL>/auth/linkedin/callback`
4. Copy Client ID and Client Secret

```bash
echo "<client_id>" | npx wrangler secret put LINKEDIN_CLIENT_ID
echo "<client_secret>" | npx wrangler secret put LINKEDIN_CLIENT_SECRET
```

5. Get access token + author URN:

```bash
npx wrangler deploy
```

Visit: `<WORKER_BASE_URL>/auth/linkedin/start`
→ Page shows access token and author URN

```bash
echo "<access_token>" | npx wrangler secret put LINKEDIN_ACCESS_TOKEN
echo "<author_urn>" | npx wrangler secret put LINKEDIN_AUTHOR_URN
# format: urn:li:person:XXXXXXXX or urn:li:organization:XXXXXXXX
```

In wrangler.toml: `LINKEDIN_ENABLED = "true"`

**Note:** LinkedIn tokens expire after 60 days. Re-run `/auth/linkedin/start` to refresh.

---

## Step 8 — Pinterest (requires Standard access)

Pinterest API requires a formal access request for write permissions.

1. developers.pinterest.com → Create App
2. Add redirect URI: `<WORKER_BASE_URL>/auth/pinterest/callback`
3. Submit for **Trial access** (auto-approved usually within hours)
4. Then submit for **Standard access** (required for `pins:write`, takes days/weeks)
5. Once Standard approved, copy App ID and Client Secret

```bash
echo "<app_id>" | npx wrangler secret put PINTEREST_CLIENT_ID
echo "<client_secret>" | npx wrangler secret put PINTEREST_CLIENT_SECRET
```

6. Get refresh token:

Visit: `<WORKER_BASE_URL>/auth/pinterest/start`
→ Page shows refresh token

```bash
echo "<refresh_token>" | npx wrangler secret put PINTEREST_REFRESH_TOKEN
```

7. Get Board ID from URL of your Pinterest board:
`https://pinterest.com/user/board-name/` → use the board ID (found via API or URL slug)

```bash
echo "<board_id>" | npx wrangler secret put PINTEREST_BOARD_ID
```

In wrangler.toml: `PINTEREST_ENABLED = "true"`

---

## Step 9 — Google Business Profile (requires Google partner approval)

GBP API is not freely available. Process:

1. Enable APIs in GCP: `My Business Account Management API`, `My Business Business Information API`
2. Add scope `https://www.googleapis.com/auth/business.manage` to your OAuth consent screen
3. Add redirect URI to your OAuth client: `<WORKER_BASE_URL>/auth/gbp/callback`
4. Submit access request: https://developers.google.com/my-business/content/prereqs#request-access
5. Wait 7–10 business days for Google approval

Once approved:
```bash
echo "<refresh_token>" | npx wrangler secret put GBP_REFRESH_TOKEN
```

Get location name:
Visit: `<WORKER_BASE_URL>/gbp/locations?token=<first_24_chars_of_SUPABASE_SERVICE_ROLE_KEY>`
→ Shows JSON with `locations[].name` field

```bash
echo "accounts/123456789/locations/987654321" | npx wrangler secret put GBP_LOCATION_NAME
```

In wrangler.toml: `GBP_ENABLED = "true"`

**Note:** GBP_CLIENT_ID and GBP_CLIENT_SECRET are not needed if you reuse your GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET (same GCP project). The worker falls back automatically.

---

## Step 10 — Final deploy + test

```bash
npx wrangler deploy
```

Test by manually triggering the pipeline:
```bash
curl -X POST "<WORKER_BASE_URL>/run?token=<first_24_chars_of_SUPABASE_SERVICE_ROLE_KEY>"
```

Check your email for a review draft. Click Approve. Verify the post appears on all platforms.

---

## Ongoing maintenance

| Task | Frequency | How |
|------|-----------|-----|
| LinkedIn token refresh | Every 60 days | Visit `/auth/linkedin/start` |
| Google Drive token | Only if revoked | Visit `/auth/google/start` |
| Pinterest token | Sliding expiry | Handled automatically by worker |
| Meta page token | Never expires | Only if token revoked/permissions changed |
