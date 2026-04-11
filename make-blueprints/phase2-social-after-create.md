# Phase 2: Auto-Post to Social After Blog Creation

This phase starts after `create-post` succeeds (Module 7 in `phase1-cloudinary-to-openai.json`).

Scope for now:
- Single source image only (no multi-photo gallery)
- Publish one post image + one caption to each enabled platform
- Continue even if one platform fails
- Log per-platform status to `/api/admin/log-automation`

## 1. Prerequisites

Set these Make variables/secrets:
- `ADMIN_SECRET`
- `BASE_URL` = `https://www.fotografosantodomingo.com`
- `CLOUDINARY_CLOUD` = `dwewurxla`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `META_PAGE_ID`
- `META_ACCESS_TOKEN`
- `LINKEDIN_PERSON_URN` (example: `urn:li:person:xxxx`)
- `LINKEDIN_ACCESS_TOKEN`
- `PINTEREST_BOARD_ID`
- `PINTEREST_ACCESS_TOKEN`

Optional toggles:
- `ENABLE_INSTAGRAM` = `1` or `0`
- `ENABLE_FACEBOOK` = `1` or `0`
- `ENABLE_LINKEDIN` = `1` or `0`
- `ENABLE_PINTEREST` = `1` or `0`

## 2. Source Data to Reuse

From existing modules:
- Image ID: `{{1.public_id}}`
- Blog URLs: `{{7.data.url_es}}`, `{{7.data.url_en}}`
- Titles/excerpts: from Module 3 (`{{3.title_es}}`, `{{3.excerpt_es}}`, etc.)

Language rule:
- If source folder contains `_EN`, use English text; otherwise use Spanish.

Example caption expression:
- ES: `{{3.title_es}}\n\n{{3.excerpt_es}}\n\n{{7.data.url_es}}\n\nWhatsApp +1 809 720 9547`
- EN: `{{3.title_en}}\n\n{{3.excerpt_en}}\n\n{{7.data.url_en}}\n\nWhatsApp +1 809 720 9547`

## 3. Build Platform Image URLs (Tools: Set multiple variables)

Create one Make module after Module 7 to define URLs from `public_id`:

- `img_instagram`:
  `https://res.cloudinary.com/{{CLOUDINARY_CLOUD}}/image/upload/c_fill,g_auto,w_1080,h_1350,q_auto,f_jpg/{{1.public_id}}`
- `img_facebook`:
  `https://res.cloudinary.com/{{CLOUDINARY_CLOUD}}/image/upload/c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/{{1.public_id}}`
- `img_linkedin`:
  `https://res.cloudinary.com/{{CLOUDINARY_CLOUD}}/image/upload/c_fill,g_auto,w_1200,h_627,q_auto,f_jpg/{{1.public_id}}`
- `img_pinterest`:
  `https://res.cloudinary.com/{{CLOUDINARY_CLOUD}}/image/upload/c_fill,g_auto,w_1000,h_1500,q_auto,f_jpg/{{1.public_id}}`

## 4. Router: One Branch Per Platform

Add a Router after the image-variable module.

Each branch must:
1. Check enable toggle (`ENABLE_* = 1`)
2. Attempt publish (HTTP module)
3. On error, do not stop entire scenario
4. Set branch status variable: `success` or `failed`

If toggle is off, set status variable to `skipped`.

### 4.1 Instagram (Graph API)

HTTP 1: Create media container
- `POST https://graph.facebook.com/v20.0/{{INSTAGRAM_BUSINESS_ACCOUNT_ID}}/media`
- Query/body:
  - `image_url={{img_instagram}}`
  - `caption={{social_caption}}`
  - `access_token={{META_ACCESS_TOKEN}}`

HTTP 2: Publish container
- `POST https://graph.facebook.com/v20.0/{{INSTAGRAM_BUSINESS_ACCOUNT_ID}}/media_publish`
- Query/body:
  - `creation_id={{instagram_container_id}}`
  - `access_token={{META_ACCESS_TOKEN}}`

Set `instagram_status`:
- `success` if both calls return 2xx
- `failed` otherwise

### 4.2 Facebook Page

HTTP: Create page feed post with image link
- `POST https://graph.facebook.com/v20.0/{{META_PAGE_ID}}/feed`
- Query/body:
  - `message={{social_caption}}`
  - `link={{7.data.url_es}}` or `{{7.data.url_en}}`
  - `picture={{img_facebook}}`
  - `access_token={{META_ACCESS_TOKEN}}`

Set `facebook_status` to `success`/`failed`.

### 4.3 LinkedIn

HTTP:
- `POST https://api.linkedin.com/v2/ugcPosts`
- Headers:
  - `Authorization: Bearer {{LINKEDIN_ACCESS_TOKEN}}`
  - `Content-Type: application/json`
  - `X-Restli-Protocol-Version: 2.0.0`
- Body:

```json
{
  "author": "{{LINKEDIN_PERSON_URN}}",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "{{social_caption}}"
      },
      "shareMediaCategory": "ARTICLE",
      "media": [
        {
          "status": "READY",
          "originalUrl": "{{7.data.url_es}}",
          "title": {
            "text": "{{3.title_es}}"
          }
        }
      ]
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}
```

Use EN values when `_EN` folder is detected.

Set `linkedin_status` to `success`/`failed`.

### 4.4 Pinterest

HTTP:
- `POST https://api.pinterest.com/v5/pins`
- Headers:
  - `Authorization: Bearer {{PINTEREST_ACCESS_TOKEN}}`
  - `Content-Type: application/json`
- Body:

```json
{
  "board_id": "{{PINTEREST_BOARD_ID}}",
  "title": "{{3.title_es}}",
  "description": "{{social_caption}}",
  "link": "{{7.data.url_es}}",
  "media_source": {
    "source_type": "image_url",
    "url": "{{img_pinterest}}"
  }
}
```

Use EN values when `_EN` folder is detected.

Set `pinterest_status` to `success`/`failed`.

## 5. Final Status Aggregation

After all branches, add one aggregator module (Set variable or function) to compute final automation status:

- `success` if all enabled platforms are `success` or `skipped`
- `partial_success` if at least one is `success` and at least one is `failed`
- `failed_social` if all enabled platforms failed

Also set `phase = "phase2_social"`.

## 6. Log Back to API

Add one final HTTP module:
- `POST {{BASE_URL}}/api/admin/log-automation`
- Headers:
  - `Authorization: Bearer {{ADMIN_SECRET}}`
  - `Content-Type: application/json`
- JSON body (jsonString mode recommended):

```json
{
  "idempotency_key": "{{1.public_id}}_{{formatDate(now; \"X\")}}_phase2",
  "folder": "{{1.asset_folder}}",
  "public_id": "{{1.public_id}}",
  "image_format": "webp",
  "status": "{{final_status}}",
  "phase": "phase2_social",
  "post_id": "{{7.data.post_id}}",
  "blog_url_es": "{{7.data.url_es}}",
  "blog_url_en": "{{7.data.url_en}}",
  "instagram_status": "{{instagram_status}}",
  "facebook_status": "{{facebook_status}}",
  "linkedin_status": "{{linkedin_status}}",
  "pinterest_status": "{{pinterest_status}}",
  "completed_at": "{{formatDate(now; \"YYYY-MM-DDTHH:mm:ss[Z]\")}}"
}
```

## 7. Recommended Rollout

1. Enable only Facebook first and test with one upload.
2. Enable Instagram second (container + publish flow).
3. Enable LinkedIn and Pinterest last.
4. Keep `stopOnHttpError = false` on platform modules.
5. Keep final logging always-on.

## 8. Notes

- Current backend already accepts platform statuses (`success|failed|skipped|pending`) in automation logs.
- This phase does not require schema/database changes.
- Multi-photo carousel/gallery can be added later as a separate phase.
