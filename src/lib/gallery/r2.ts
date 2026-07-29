/**
 * R2 access for client galleries. Photos are streamed through Pages
 * Functions straight to/from R2 — no separate S3-style API tokens to
 * provision, just the binding declared in wrangler.toml.
 *
 * Only the R2 methods actually used are typed here (not the full R2Bucket
 * surface) to avoid depending on @cloudflare/workers-types globally.
 */

import { getRequestContext } from '@cloudflare/next-on-pages'

type R2HttpMetadata = { contentType?: string; contentDisposition?: string }

export interface GalleryR2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    opts?: { httpMetadata?: R2HttpMetadata }
  ): Promise<{ size: number }>
  get(key: string): Promise<{ body: ReadableStream; size: number; httpMetadata?: R2HttpMetadata } | null>
  delete(keys: string | string[]): Promise<void>
  list(opts: { prefix: string; cursor?: string }): Promise<{
    objects: { key: string }[]
    truncated: boolean
    cursor?: string
  }>
}

export function getGalleryBucket(): GalleryR2Bucket {
  const { env } = getRequestContext()
  const bucket = (env as unknown as { GALLERIES_BUCKET?: GalleryR2Bucket }).GALLERIES_BUCKET
  if (!bucket) {
    throw new Error('GALLERIES_BUCKET R2 binding not found — check wrangler.toml / Pages dashboard bindings')
  }
  return bucket
}

export function galleryObjectKey(galleryId: string, photoId: string, variant: 'original' | 'preview') {
  return `galleries/${galleryId}/${variant}/${photoId}.jpg`
}

export async function putGalleryObject(
  key: string,
  body: ReadableStream | ArrayBuffer,
  contentType = 'image/jpeg'
): Promise<number> {
  const bucket = getGalleryBucket()
  const result = await bucket.put(key, body, { httpMetadata: { contentType } })
  return result.size
}

export async function getGalleryObject(key: string) {
  const bucket = getGalleryBucket()
  return bucket.get(key)
}

// Deletes every object under `galleries/${galleryId}/` — used on expiration
// and manual delete. Paginated since R2 list() caps results per call.
export async function deleteGalleryObjects(galleryId: string): Promise<number> {
  const bucket = getGalleryBucket()
  const prefix = `galleries/${galleryId}/`
  let cursor: string | undefined
  let deleted = 0
  do {
    const listing = await bucket.list({ prefix, cursor })
    if (listing.objects.length > 0) {
      await bucket.delete(listing.objects.map((o) => o.key))
      deleted += listing.objects.length
    }
    cursor = listing.truncated ? listing.cursor : undefined
  } while (cursor)
  return deleted
}
