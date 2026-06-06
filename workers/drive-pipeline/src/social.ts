import type { CrossPostResult, Env } from './types'

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
): Promise<CrossPostResult> {
  if (!env.META_PAGE_ACCESS_TOKEN || !env.META_IG_BUSINESS_ID) {
    return { platform: 'ig', status: 'skipped', error: 'META_PAGE_ACCESS_TOKEN or META_IG_BUSINESS_ID not set' }
  }

  const token = env.META_PAGE_ACCESS_TOKEN
  const igId = env.META_IG_BUSINESS_ID

  try {
    if (imageUrls.length === 1) {
      // 2-step: container → publish
      const cRes = await fetch(`https://graph.facebook.com/${igId}/media`, {
        method: 'POST',
        body: new URLSearchParams({ image_url: imageUrls[0], caption, access_token: token }),
      })
      const cJson = await cRes.json() as { id?: string; error?: { message: string } }
      if (!cRes.ok || cJson.error) throw new Error(cJson.error?.message ?? `container ${cRes.status}`)

      const pRes = await fetch(`https://graph.facebook.com/${igId}/media_publish`, {
        method: 'POST',
        body: new URLSearchParams({ creation_id: cJson.id!, access_token: token }),
      })
      const pJson = await pRes.json() as { id?: string; error?: { code?: number; message: string } }

      if (!pRes.ok && pJson.error?.code !== 2) throw new Error(pJson.error?.message ?? `publish ${pRes.status}`)

      const postId = pJson.id ?? await verifyRecentIgPublish(igId, token, caption)
      return { platform: 'ig', status: 'posted', postId: postId ?? undefined }
    }

    // Carousel: 3-step
    const itemIds: string[] = []
    for (const url of imageUrls) {
      const r = await fetch(`https://graph.facebook.com/${igId}/media`, {
        method: 'POST',
        body: new URLSearchParams({ image_url: url, is_carousel_item: 'true', access_token: token }),
      })
      const j = await r.json() as { id?: string; error?: { message: string } }
      if (!r.ok || j.error) throw new Error(`Carousel item: ${j.error?.message ?? r.status}`)
      // Poll until FINISHED
      for (let i = 0; i < 10; i++) {
        await new Promise((res) => setTimeout(res, 2000))
        const statusRes = await fetch(`https://graph.facebook.com/${j.id!}?fields=status_code&access_token=${token}`)
        const s = await statusRes.json() as { status_code?: string }
        if (s.status_code === 'FINISHED') break
      }
      itemIds.push(j.id!)
    }

    const carRes = await fetch(`https://graph.facebook.com/${igId}/media`, {
      method: 'POST',
      body: new URLSearchParams({
        media_type: 'CAROUSEL',
        caption,
        children: itemIds.join(','),
        access_token: token,
      }),
    })
    const carJson = await carRes.json() as { id?: string; error?: { message: string } }
    if (!carRes.ok || carJson.error) throw new Error(carJson.error?.message ?? `carousel ${carRes.status}`)

    const pubRes = await fetch(`https://graph.facebook.com/${igId}/media_publish`, {
      method: 'POST',
      body: new URLSearchParams({ creation_id: carJson.id!, access_token: token }),
    })
    const pubJson = await pubRes.json() as { id?: string; error?: { code?: number; message: string } }
    if (!pubRes.ok && pubJson.error?.code !== 2) throw new Error(pubJson.error?.message ?? `publish ${pubRes.status}`)

    const postId = pubJson.id ?? await verifyRecentIgPublish(igId, token, caption)
    return { platform: 'ig', status: 'posted', postId: postId ?? undefined }
  } catch (err: unknown) {
    return { platform: 'ig', status: 'failed', error: (err as Error).message }
  }
}

// ── LinkedIn ──────────────────────────────────────────────────────────────────

const LI_VERSION = '202501'

async function postToLinkedIn(
  env: Env,
  imageUrl: string,
  caption: string,
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
        commentary: caption,
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

// ── Orchestrator ──────────────────────────────────────────────────────────────

export async function runCrossPost(
  env: Env,
  imageUrls: string[],
  igCaption: string,
  fbCaption: string,
  liCaption: string,
  postUrl: string,
): Promise<CrossPostResult[]> {
  const results: CrossPostResult[] = []

  const [fbResult, igResult, liResult] = await Promise.all([
    env.META_ENABLED === 'true'
      ? postToFacebook(env, imageUrls, fbCaption, postUrl)
      : Promise.resolve<CrossPostResult>({ platform: 'fb', status: 'skipped', error: 'META_ENABLED=false' }),

    env.META_ENABLED === 'true' && env.META_IG_ENABLED === 'true'
      ? postToInstagram(env, imageUrls, igCaption)
      : Promise.resolve<CrossPostResult>({ platform: 'ig', status: 'skipped', error: 'META_IG_ENABLED=false' }),

    env.LINKEDIN_ENABLED === 'true'
      ? postToLinkedIn(env, imageUrls[0], liCaption)
      : Promise.resolve<CrossPostResult>({ platform: 'li', status: 'skipped', error: 'LINKEDIN_ENABLED=false' }),
  ])

  results.push(fbResult, igResult, liResult)
  return results
}

// ── LinkedIn OAuth helpers (operational tool) ─────────────────────────────────

export function linkedInAuthStart(env: Env, workerUrl: string): string {
  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.LINKEDIN_CLIENT_ID ?? '',
    redirect_uri: `${workerUrl}/auth/linkedin/callback`,
    state,
    scope: 'w_member_social r_basicprofile',
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

  // Get member ID via /v2/me (requires r_basicprofile)
  const meRes = await fetch('https://api.linkedin.com/v2/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  const me = await meRes.json() as { id?: string }
  const authorUrn = `urn:li:person:${me.id}`

  return { token: access_token, authorUrn }
}
