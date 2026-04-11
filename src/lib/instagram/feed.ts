type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'

type InstagramMedia = {
  id: string
  caption?: string
  media_type: InstagramMediaType
  media_url?: string
  permalink: string
  thumbnail_url?: string
  timestamp?: string
}

type InstagramGraphResponse = {
  data?: InstagramMedia[]
  error?: {
    message?: string
    code?: number
  }
}

const GRAPH_API_BASE = 'https://graph.facebook.com/v20.0'

function getAccessToken() {
  return process.env.INSTAGRAM_ACCESS_TOKEN || process.env.INSTAGRAM_GRAPH_API_TOKEN || ''
}

function getAccountId() {
  return process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || process.env.INSTAGRAM_USER_ID || ''
}

function normalizeMedia(media: InstagramMedia) {
  return {
    ...media,
    media_url: media.media_url || media.thumbnail_url,
  }
}

export async function getInstagramFeed(limit = 8): Promise<InstagramMedia[]> {
  const accessToken = getAccessToken()
  const accountId = getAccountId()

  if (!accessToken || !accountId) {
    console.warn('Instagram feed skipped: missing INSTAGRAM_ACCESS_TOKEN/INSTAGRAM_GRAPH_API_TOKEN or INSTAGRAM_BUSINESS_ACCOUNT_ID/INSTAGRAM_USER_ID')
    return []
  }

  const params = new URLSearchParams({
    fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
    limit: String(limit),
    access_token: accessToken,
  })

  const response = await fetch(`${GRAPH_API_BASE}/${accountId}/media?${params.toString()}`, {
    next: { revalidate: 60 * 60 },
  })

  if (!response.ok) {
    console.error('Instagram feed request failed:', response.status)
    return []
  }

  const payload = (await response.json()) as InstagramGraphResponse

  if (payload.error) {
    console.error('Instagram Graph API error:', payload.error)
    return []
  }

  return (payload.data || []).map(normalizeMedia).filter((item) => Boolean(item.media_url) && Boolean(item.permalink))
}
