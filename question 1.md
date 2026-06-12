Hi — we're setting up a second service (a Cloudflare Worker) to auto-post image + caption to the same Facebook Page and Instagram Business account that this website already posts to, using the Meta Graph API. I'd like to reuse the existing setup instead of creating a new Meta app. Could you send me the following? (A token works from multiple services at once, so reusing it won't affect your site.)
If the site posts via custom code with a Meta app, I need:
Page Access Token — the token used to publish (ideally the permanent Page token). Env var is probably named like META_PAGE_ACCESS_TOKEN / FB_PAGE_TOKEN / PAGE_ACCESS_TOKEN.
Facebook Page ID (numeric) — e.g. META_PAGE_ID.
Instagram Business Account ID (numeric) — e.g. META_IG_BUSINESS_ID / IG_USER_ID. (If you don't have it handy: GET https://graph.facebook.com/v21.0/{PAGE_ID}?fields=instagram_business_account&access_token={PAGE_TOKEN}.)
Meta App ID + App Secret — only so we can refresh/extend the token later if needed. (Optional but helpful.)
Which permissions the token has — please confirm it includes pages_manage_posts, pages_read_engagement, instagram_basic, and instagram_content_publish.
Token type + expiry — is it a permanent Page token (never expires) or a long-lived user token (60 days)? And what Graph API version do you call?
If the site does NOT use custom code (e.g. it posts via Meta Business Suite, a scheduler like Buffer/Metricool/Later, or a WordPress plugin), just tell me which tool — then there's no token to share and I'll create a small Meta app on our side for the same Page/IG.
Please send any secrets through a secure channel (not plain email/chat) — e.g. a password manager share or 1Password/Bitwarden link.