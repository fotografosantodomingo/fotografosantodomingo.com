// Real Cloudinary thumbnail generation for auto-ingested blog cover images.
//
// Kept isolated from index.ts's post-creation flow on purpose: this is a
// best-effort enhancement (a nicer thumbnail), not a required step. Callers
// must catch failures here and fall back to the existing behavior
// (cover_image_thumbnail_url = cover_image_url) rather than let a Cloudinary
// hiccup block blog post creation.
import type { Env } from './types'

async function sha1Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Uploads an already-public Supabase Storage image URL to Cloudinary (fetched
 * server-side by Cloudinary, no bytes pass through this worker) and returns a
 * real w_800 thumbnail derivative URL. Uses a deterministic public_id derived
 * from the source fileId, so re-processing the same image is a no-op upload
 * (same public_id, same asset, no duplicates) rather than creating a new one
 * each run. Never touches the original Supabase file or the cover_image_url
 * field — this only ever produces a thumbnail URL for the caller to store.
 */
export async function generateBlogThumbnail(
  env: Env,
  sourceUrl: string,
  fileId: string,
): Promise<string> {
  const cloudName = env.CLOUDINARY_CLOUD_NAME
  const apiKey = env.CLOUDINARY_API_KEY
  const apiSecret = env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials not configured')
  }

  const folder = 'blog-thumbnails'
  const publicId = fileId
  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign = `folder=${folder}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const signature = await sha1Hex(paramsToSign)

  const form = new URLSearchParams()
  form.append('file', sourceUrl)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)
  form.append('overwrite', 'true')
  form.append('public_id', publicId)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Cloudinary upload failed (${res.status}): ${body.slice(0, 200)}`)
  }
  const json = (await res.json()) as { public_id: string }

  return `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,w_800,q_auto,f_webp/${json.public_id}`
}
