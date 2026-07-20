import type { CrossPostResult, Env } from './types'

// Instagram's container step ("/media") fails ("Media ID is not available") on
// very large source images. Serve IG a dimension-capped JPEG via Supabase's
// image render endpoint (bounds BOTH sides to 1440px, IG's feed max). Facebook
// and LinkedIn tolerate full-res, so only the IG path uses this.
function igImageUrl(publicUrl: string): string {
  return renderCapped(publicUrl, 1440)
}

// Generic Supabase render-endpoint cap (returns a JPEG bounded to size×size).
// Used to keep oversized source photos within each platform's accepted limits.
function renderCapped(publicUrl: string, size: number): string {
  const marker = '/storage/v1/object/public/'
  if (!publicUrl.includes(marker)) return publicUrl
  const rendered = publicUrl.replace(marker, '/storage/v1/render/image/public/')
  return `${rendered}?width=${size}&height=${size}&resize=contain`
}

// ── Facebook ──────────────────────────────────────────────────────────────────

async function postToFacebook(
  env: Env,
  imageUrls: string[],
  caption: string,
  postUrl: string,
): Promise<CrossPostResult> {
  if (!env.META_PAGE_ACCESS_TOKEN || !env.META_PAGE_ID) {
    return { platform: 'fb', status: 'skipped', error: 'META_PAGE_ACCESS_TOKEN or META_PAGE_ID not set' }
  }

  const fullCaption = `${caption}\n\nMás info: ${postUrl}`
  const token = env.META_PAGE_ACCESS_TOKEN
  const pageId = env.META_PAGE_ID

  try {
    if (imageUrls.length === 1) {
      // Single photo post
      const res = await fetch(`https://graph.facebook.com/${pageId}/photos`, {
        method: 'POST',
        body: new URLSearchParams({
          url: imageUrls[0],
          caption: fullCaption,
          published: 'true',
          access_token: token,
        }),
      })
      const json = await res.json() as { id?: string; error?: { message: string } }
      if (!res.ok || json.error) throw new Error(json.error?.message ?? `status ${res.status}`)
      return { platform: 'fb', status: 'posted', postId: json.id }
    }

    // Multi-photo: upload each unpublished, then POST feed with attached_media
    const mediaIds: string[] = []
    for (const url of imageUrls) {
      const r = await fetch(`https://graph.facebook.com/${pageId}/photos`, {
        method: 'POST',
        body: new URLSearchParams({ url, published: 'false', access_token: token }),
      })
      const j = await r.json() as { id?: string; error?: { message: string } }
      if (!r.ok || j.error) throw new Error(`Photo upload: ${j.error?.message ?? r.status}`)
      mediaIds.push(j.id!)
    }
    const attached = mediaIds.map((id) => `media_fbid=${id}`).join('&')
    const feedRes = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `message=${encodeURIComponent(fullCaption)}&${attached}&access_token=${token}`,
    })
    const feedJson = await feedRes.json() as { id?: string; error?: { message: string } }
    if (!feedRes.ok || feedJson.error) throw new Error(feedJson.error?.message ?? `status ${feedRes.status}`)
    return { platform: 'fb', status: 'posted', postId: feedJson.id }
  } catch (err: unknown) {
    return { platform: 'fb', status: 'failed', error: (err as Error).message }
  }
}

// ── Instagram ─────────────────────────────────────────────────────────────────

async function verifyRecentIgPublish(igId: string, token: string, captionHead: string): Promise<string | null> {
  const since = Math.floor((Date.now() - 60_000) / 1000)
  const res = await fetch(
    `https://graph.facebook.com/${igId}/media?fields=id,timestamp,caption&limit=5&access_token=${token}`,
  )
  if (!res.ok) return null
  const { data } = await res.json() as { data: Array<{ id: string; timestamp: string; caption?: string }> }
  const recent = data.find((m) => {
    const t = new Date(m.timestamp).getTime() / 1000
    return t > since && m.caption?.startsWith(captionHead.slice(0, 50))
  })
  return recent?.id ?? null
}

async function postToInstagram(
  env: Env,
  imageUrls: string[],
  caption: string,
  postUrl: string,
): Promise<CrossPostResult> {
  if (!env.META_PAGE_ACCESS_TOKEN || !env.META_IG_BUSINESS_ID) {
    return { platform: 'ig', status: 'skipped', error: 'META_PAGE_ACCESS_TOKEN or META_IG_BUSINESS_ID not set' }
  }

  const token = env.META_PAGE_ACCESS_TOKEN
  const igId = env.META_IG_BUSINESS_ID
  const fullCaption = `${caption}\n\n${postUrl}`

  try {
    // Single-image post only — IG mirrors FB / LinkedIn / GBP (first image).
    // Carousels were removed: a single slow or errored secondary child container
    // failed the entire post with "Only photo or video can be accepted as media
    // type", so one bad extra photo took down the whole IG post.
    const cRes = await fetch(`https://graph.facebook.com/${igId}/media`, {
      method: 'POST',
      body: new URLSearchParams({ image_url: igImageUrl(imageUrls[0]), caption: fullCaption, access_token: token }),
    })
    const cJson = await cRes.json() as { id?: string; error?: { message: string } }
    if (!cRes.ok || cJson.error) throw new Error(cJson.error?.message ?? `container ${cRes.status}`)
    const creationId = cJson.id!

    // IG ingests the image asynchronously. Publishing before the container is
    // FINISHED returns "Media ID is not available", so poll status_code first.
    let ready = false
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 3000))
      const sRes = await fetch(`https://graph.facebook.com/${creationId}?fields=status_code&access_token=${token}`)
      const sJson = await sRes.json() as { status_code?: string; error?: { message: string } }
      if (sJson.status_code === 'FINISHED') { ready = true; break }
      if (sJson.status_code === 'ERROR') throw new Error('IG container processing failed (status ERROR)')
    }
    if (!ready) throw new Error('IG container not FINISHED after ~18s (Media not ready)')

    const pRes = await fetch(`https://graph.facebook.com/${igId}/media_publish`, {
      method: 'POST',
      body: new URLSearchParams({ creation_id: creationId, access_token: token }),
    })
    const pJson = await pRes.json() as { id?: string; error?: { code?: number; message: string } }
    if (!pRes.ok && pJson.error?.code !== 2) throw new Error(pJson.error?.message ?? `publish ${pRes.status}`)

    const postId = pJson.id ?? await verifyRecentIgPublish(igId, token, caption)
    return { platform: 'ig', status: 'posted', postId: postId ?? undefined }
  } catch (err: unknown) {
    return { platform: 'ig', status: 'failed', error: (err as Error).message }
  }
}

// ── LinkedIn ──────────────────────────────────────────────────────────────────

// LinkedIn only accepts API versions from roughly the last 12 months — this
// must be bumped periodically or posts start failing with NONEXISTENT_VERSION.
// Format: YYYYMM. Last bumped 2026-07-20.
const LI_VERSION = '202607'

async function postToLinkedIn(
  env: Env,
  imageUrl: string,
  caption: string,
  postUrl: string,
): Promise<CrossPostResult> {
  if (!env.LINKEDIN_ACCESS_TOKEN || !env.LINKEDIN_AUTHOR_URN) {
    return { platform: 'li', status: 'skipped', error: 'LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN not set' }
  }

  const token = env.LINKEDIN_ACCESS_TOKEN
  const author = env.LINKEDIN_AUTHOR_URN
  const restHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'LinkedIn-Version': LI_VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
  }

  try {
    // Step 1: initialize image upload (new REST API, replaces registerUpload)
    const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
      method: 'POST',
      headers: restHeaders,
      body: JSON.stringify({ initializeUploadRequest: { owner: author } }),
    })
    if (!initRes.ok) throw new Error(`LI initializeUpload: ${await initRes.text()}`)
    const initJson = await initRes.json() as { value: { uploadUrl: string; image: string } }
    const uploadUrl = initJson.value.uploadUrl
    const imageUrn = initJson.value.image

    // Step 2: upload image bytes
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) throw new Error(`Image fetch for LI: ${imgRes.status}`)
    const imgBuf = await imgRes.arrayBuffer()
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' },
      body: imgBuf,
    })
    if (!putRes.ok) throw new Error(`LI upload PUT: ${putRes.status}`)

    // Step 3: create post (new REST API, replaces ugcPosts)
    const postRes = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: restHeaders,
      body: JSON.stringify({
        author,
        commentary: `${caption}\n\n${postUrl}`,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        content: {
          media: {
            title: caption.slice(0, 200),
            id: imageUrn,
          },
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      }),
    })
    if (!postRes.ok) throw new Error(`LI posts: ${await postRes.text()}`)
    const postId = postRes.headers.get('x-restli-id') ?? undefined
    return { platform: 'li', status: 'posted', postId }
  } catch (err: unknown) {
    return { platform: 'li', status: 'failed', error: (err as Error).message }
  }
}

// ── Pinterest ─────────────────────────────────────────────────────────────────

async function refreshPinterestToken(env: Env): Promise<string> {
  const creds = btoa(`${env.PINTEREST_CLIENT_ID}:${env.PINTEREST_CLIENT_SECRET}`)
  const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: env.PINTEREST_REFRESH_TOKEN ?? '' }),
  })
  if (!res.ok) throw new Error(`Pinterest token refresh failed: ${await res.text()}`)
  const json = await res.json() as { access_token: string }
  return json.access_token
}

async function postToPinterest(
  env: Env,
  imageUrl: string,
  caption: string,
  postUrl: string,
  title: string,
): Promise<CrossPostResult> {
  if (!env.PINTEREST_CLIENT_ID || !env.PINTEREST_CLIENT_SECRET || !env.PINTEREST_REFRESH_TOKEN || !env.PINTEREST_BOARD_ID) {
    return { platform: 'pi', status: 'skipped', error: 'Pinterest secrets not set' }
  }
  try {
    const token = await refreshPinterestToken(env)
    const res = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        board_id: env.PINTEREST_BOARD_ID,
        title: title.slice(0, 100),
        description: `${caption}\n\n${postUrl}`,
        link: postUrl,
        media_source: { source_type: 'image_url', url: imageUrl },
      }),
    })
    const json = await res.json() as { id?: string; message?: string }
    if (!res.ok) throw new Error(json.message ?? `Pinterest ${res.status}`)
    return { platform: 'pi', status: 'posted', postId: json.id }
  } catch (err: unknown) {
    return { platform: 'pi', status: 'failed', error: (err as Error).message }
  }
}

// ── Google Business Profile ───────────────────────────────────────────────────

async function refreshGbpToken(env: Env): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GBP_CLIENT_ID ?? env.GOOGLE_CLIENT_ID,
      client_secret: env.GBP_CLIENT_SECRET ?? env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GBP_REFRESH_TOKEN ?? '',
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`GBP token refresh failed: ${await res.text()}`)
  const json = await res.json() as { access_token: string }
  return json.access_token
}

async function postToGoogleBusiness(
  env: Env,
  imageUrl: string,
  caption: string,
  postUrl: string,
): Promise<CrossPostResult> {
  if (!env.GBP_REFRESH_TOKEN || !env.GBP_LOCATION_NAME) {
    return { platform: 'gbp', status: 'skipped', error: 'GBP_REFRESH_TOKEN or GBP_LOCATION_NAME not set' }
  }
  try {
    const token = await refreshGbpToken(env)
    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/${env.GBP_LOCATION_NAME}/localPosts`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageCode: 'es',
          summary: `${caption}\n\n${postUrl}`,
          callToAction: { actionType: 'LEARN_MORE', url: postUrl },
          media: [{ mediaFormat: 'PHOTO', sourceUrl: renderCapped(imageUrl, 2000) }],
          topicType: 'STANDARD',
        }),
      },
    )
    const json = await res.json() as { name?: string; error?: { message: string } }
    if (!res.ok) throw new Error(json.error?.message ?? `GBP ${res.status}`)
    return { platform: 'gbp', status: 'posted', postId: json.name }
  } catch (err: unknown) {
    return { platform: 'gbp', status: 'failed', error: (err as Error).message }
  }
}

// ── DeviantArt ────────────────────────────────────────────────────────────────

async function refreshDeviantArtToken(env: Env): Promise<string> {
  const res = await fetch('https://www.deviantart.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     env.DA_CLIENT_ID ?? '',
      client_secret: env.DA_CLIENT_SECRET ?? '',
      grant_type:    'refresh_token',
      refresh_token: env.DA_REFRESH_TOKEN ?? '',
    }),
  })
  if (!res.ok) throw new Error(`DA token refresh failed: ${await res.text()}`)
  const json = await res.json() as { access_token?: string; error?: string }
  if (!json.access_token) throw new Error(`DA token refresh: ${json.error ?? 'no access_token'}`)
  return json.access_token
}

async function postToDeviantArt(
  env: Env,
  imageUrl: string,
  caption: string,
  postUrl: string,
  title: string,
): Promise<CrossPostResult> {
  if (!env.DA_CLIENT_ID || !env.DA_CLIENT_SECRET || !env.DA_REFRESH_TOKEN) {
    return { platform: 'da', status: 'skipped', error: 'DA secrets not set' }
  }
  try {
    const token = await refreshDeviantArtToken(env)

    // Download image bytes
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) throw new Error(`Image fetch for DA: ${imgRes.status}`)
    const imgBuf = await imgRes.arrayBuffer()
    const mimeType = imgRes.headers.get('content-type') ?? 'image/jpeg'
    const ext = mimeType.includes('png') ? 'png' : 'jpg'

    const artistComments =
      `<p>${caption}</p>` +
      `<p>📷 <a href="${postUrl}">Más información en nuestro blog</a> · ` +
      `<a href="https://www.fotografosantodomingo.com">fotografosantodomingo.com</a></p>`

    // Step 1 — upload to Stash
    const stashForm = new FormData()
    stashForm.append('access_token', token)
    stashForm.append('title', title.slice(0, 50))
    stashForm.append('artist_comments', artistComments)
    stashForm.append('file', new Blob([imgBuf], { type: mimeType }), `photo.${ext}`)

    const stashRes = await fetch('https://www.deviantart.com/api/v1/oauth2/stash/submit', {
      method: 'POST',
      body: stashForm,
    })
    const stashText = await stashRes.text()
    let stashJson: { status?: string; itemid?: number; error?: string; error_description?: string }
    try { stashJson = JSON.parse(stashText) } catch { throw new Error(`DA stash parse: ${stashText.slice(0, 200)}`) }
    if (stashJson.status !== 'success' || !stashJson.itemid) {
      throw new Error(stashJson.error_description ?? stashJson.error ?? `DA stash failed: ${stashText.slice(0, 200)}`)
    }

    // Step 2 — publish from Stash
    const pubBody = new URLSearchParams({
      access_token:                token,
      itemid:                      String(stashJson.itemid),
      title:                       title.slice(0, 50),
      catpath:                     'photography',
      is_mature:                   '0',
      feature:                     '1',
      allow_comments:              '1',
      'license_options[commercial]': '0',
      'license_options[modify]':   'no',
      'license_options[share]':    'yes',
    })

    const pubRes = await fetch('https://www.deviantart.com/api/v1/oauth2/stash/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: pubBody,
    })
    const pubText = await pubRes.text()
    let pubJson: { status?: string; url?: string; deviationid?: string; error?: string; error_description?: string }
    try { pubJson = JSON.parse(pubText) } catch { throw new Error(`DA publish parse: ${pubText.slice(0, 200)}`) }
    if (pubJson.status !== 'success') {
      throw new Error(pubJson.error_description ?? pubJson.error ?? `DA publish failed: ${pubText.slice(0, 200)}`)
    }

    return { platform: 'da', status: 'posted', postId: pubJson.url ?? pubJson.deviationid }
  } catch (err: unknown) {
    return { platform: 'da', status: 'failed', error: (err as Error).message }
  }
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export async function runCrossPost(
  env: Env,
  imageUrls: string[],
  igCaption: string,
  fbCaption: string,
  liCaption: string,
  piCaption: string,
  gbpCaption: string,
  postUrl: string,
  postTitle: string,
  skip: Set<string> = new Set(),
): Promise<CrossPostResult[]> {
  const [fbResult, igResult, liResult, piResult, gbpResult, daResult] = await Promise.all([
    env.META_ENABLED === 'true' && !skip.has('fb')
      ? postToFacebook(env, imageUrls, fbCaption, postUrl)
      : Promise.resolve<CrossPostResult>({ platform: 'fb', status: 'skipped', error: skip.has('fb') ? 'already posted' : 'META_ENABLED=false' }),

    env.META_ENABLED === 'true' && env.META_IG_ENABLED === 'true' && !skip.has('ig')
      ? postToInstagram(env, imageUrls, igCaption, postUrl)
      : Promise.resolve<CrossPostResult>({ platform: 'ig', status: 'skipped', error: skip.has('ig') ? 'already posted' : 'META_IG_ENABLED=false' }),

    env.LINKEDIN_ENABLED === 'true' && !skip.has('li')
      ? postToLinkedIn(env, imageUrls[0], liCaption, postUrl)
      : Promise.resolve<CrossPostResult>({ platform: 'li', status: 'skipped', error: skip.has('li') ? 'already posted' : 'LINKEDIN_ENABLED=false' }),

    env.PINTEREST_ENABLED === 'true' && !skip.has('pi')
      ? postToPinterest(env, imageUrls[0], piCaption, postUrl, postTitle)
      : Promise.resolve<CrossPostResult>({ platform: 'pi', status: 'skipped', error: skip.has('pi') ? 'already posted' : 'PINTEREST_ENABLED=false' }),

    env.GBP_ENABLED === 'true' && !skip.has('gbp')
      ? postToGoogleBusiness(env, imageUrls[0], gbpCaption, postUrl)
      : Promise.resolve<CrossPostResult>({ platform: 'gbp', status: 'skipped', error: skip.has('gbp') ? 'already posted' : 'GBP_ENABLED=false' }),

    env.DA_ENABLED === 'true' && !skip.has('da')
      ? postToDeviantArt(env, imageUrls[0], piCaption, postUrl, postTitle)
      : Promise.resolve<CrossPostResult>({ platform: 'da', status: 'skipped', error: skip.has('da') ? 'already posted' : 'DA_ENABLED=false' }),
  ])

  return [fbResult, igResult, liResult, piResult, gbpResult, daResult]
}

// ── Pinterest OAuth helpers ────────────────────────────────────────────────────

export function pinterestAuthStart(env: Env, workerUrl: string): string {
  const params = new URLSearchParams({
    client_id: env.PINTEREST_CLIENT_ID ?? '',
    redirect_uri: `${workerUrl}/auth/pinterest/callback`,
    response_type: 'code',
    scope: 'boards:read,boards:write,pins:read,pins:write',
  })
  return `https://www.pinterest.com/oauth/?${params}`
}

export async function pinterestAuthCallback(
  env: Env,
  workerUrl: string,
  code: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const creds = btoa(`${env.PINTEREST_CLIENT_ID}:${env.PINTEREST_CLIENT_SECRET}`)
  const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${workerUrl}/auth/pinterest/callback`,
    }),
  })
  if (!res.ok) throw new Error(`Pinterest token exchange: ${await res.text()}`)
  const json = await res.json() as { access_token: string; refresh_token: string }
  return { accessToken: json.access_token, refreshToken: json.refresh_token }
}

// ── GBP token (exported for locations probe) ──────────────────────────────────

export { refreshGbpToken }

// ── LinkedIn OAuth helpers (operational tool) ─────────────────────────────────

export function linkedInAuthStart(env: Env, workerUrl: string): string {
  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.LINKEDIN_CLIENT_ID ?? '',
    redirect_uri: `${workerUrl}/auth/linkedin/callback`,
    state,
    scope: 'openid profile w_member_social',
  })
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`
}

export async function linkedInAuthCallback(env: Env, workerUrl: string, code: string): Promise<{ token: string; authorUrn: string }> {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${workerUrl}/auth/linkedin/callback`,
      client_id: env.LINKEDIN_CLIENT_ID ?? '',
      client_secret: env.LINKEDIN_CLIENT_SECRET ?? '',
    }),
  })
  if (!res.ok) throw new Error(`LI token exchange: ${await res.text()}`)
  const { access_token } = await res.json() as { access_token: string }

  const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  const me = await meRes.json() as { sub?: string }
  const authorUrn = `urn:li:person:${me.sub}`

  return { token: access_token, authorUrn }
}

// ── DeviantArt OAuth helpers ──────────────────────────────────────────────────

export function deviantArtAuthStart(env: Env, workerUrl: string): string {
  const params = new URLSearchParams({
    client_id:     env.DA_CLIENT_ID ?? '',
    redirect_uri:  `${workerUrl}/auth/deviantart/callback`,
    response_type: 'code',
    scope:         'browse publish stash user',
  })
  return `https://www.deviantart.com/oauth2/authorize?${params}`
}

export async function deviantArtAuthCallback(
  env: Env,
  workerUrl: string,
  code: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch('https://www.deviantart.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     env.DA_CLIENT_ID ?? '',
      client_secret: env.DA_CLIENT_SECRET ?? '',
      grant_type:    'authorization_code',
      code,
      redirect_uri:  `${workerUrl}/auth/deviantart/callback`,
    }),
  })
  if (!res.ok) throw new Error(`DA token exchange: ${await res.text()}`)
  const json = await res.json() as { access_token?: string; refresh_token?: string; error?: string; error_description?: string }
  if (!json.access_token || !json.refresh_token) {
    throw new Error(json.error_description ?? json.error ?? 'DA: no tokens returned')
  }
  return { accessToken: json.access_token, refreshToken: json.refresh_token }
}
