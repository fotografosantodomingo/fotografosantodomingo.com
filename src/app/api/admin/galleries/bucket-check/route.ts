/**
 * TEMPORARY — read-only live check of the GALLERIES_BUCKET R2 bucket's
 * actual contents, to verify against the (known to lag) billing /usage
 * API. No writes, no deletes. Remove after use.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getGalleryBucket } from '@/lib/gallery/r2'

export const runtime = 'edge'

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.ADMIN_SECRET
  if (!authHeader?.startsWith('Bearer ') || !expectedSecret) return false
  return authHeader.slice('Bearer '.length) === expectedSecret
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bucket = getGalleryBucket()
  let cursor: string | undefined
  let count = 0
  const sampleKeys: string[] = []

  do {
    const listing = await bucket.list({ prefix: '', cursor })
    count += listing.objects.length
    for (const o of listing.objects) {
      if (sampleKeys.length < 20) sampleKeys.push(o.key)
    }
    cursor = listing.truncated ? listing.cursor : undefined
  } while (cursor)

  return NextResponse.json({ liveObjectCount: count, sampleKeys })
}
