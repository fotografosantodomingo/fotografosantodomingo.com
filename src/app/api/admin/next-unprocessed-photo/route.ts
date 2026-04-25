import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'


const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.ADMIN_SECRET
  if (!authHeader?.startsWith('Bearer ') || !expectedSecret) return false
  return authHeader.slice('Bearer '.length) === expectedSecret
}

async function cloudinarySearch(expression: string, maxResults = 500): Promise<{ public_id: string; asset_folder: string; created_at: string }[]> {
  const basicAuth = btoa(`${CLOUDINARY_KEY}:${CLOUDINARY_SECRET}`)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/resources/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${basicAuth}` },
    body: JSON.stringify({ expression, max_results: maxResults, sort_by: [{ uploaded_at: 'asc' }], fields: ['public_id', 'asset_folder', 'created_at'] }),
  })
  const data = await res.json() as { resources?: { public_id: string; asset_folder: string; created_at: string }[]; error?: { message: string } }
  if (data.error) throw new Error(`Cloudinary error: ${data.error.message}`)
  return data.resources ?? []
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!CLOUDINARY_KEY || !CLOUDINARY_SECRET || !CLOUDINARY_CLOUD) {
    return NextResponse.json({ error: 'Cloudinary credentials not configured' }, { status: 500 })
  }

  try {
    const supabase = createServiceClient()

    // Get all successfully processed public_ids
    const { data: logs, error: logsError } = await supabase
      .from('automation_logs')
      .select('public_id')
      .eq('status', 'success')

    if (logsError) {
      return NextResponse.json({ error: 'Failed to query logs', message: logsError.message }, { status: 500 })
    }

    const processedSet = new Set((logs ?? []).map((r: { public_id: string }) => r.public_id))

    // Get all images from Cloudinary BLOG folder (sorted oldest first)
    const allImages = await cloudinarySearch('folder=BLOG AND resource_type:image')

    // Find the first image not yet processed
    const next = allImages.find((img) => !processedSet.has(img.public_id))

    if (!next) {
      return NextResponse.json({
        found: false,
        message: 'All images have been processed',
        total_cloudinary: allImages.length,
        total_processed: processedSet.size,
      })
    }

    return NextResponse.json({
      found: true,
      public_id: next.public_id,
      asset_folder: next.asset_folder || 'BLOG',
      created_at: next.created_at,
      total_cloudinary: allImages.length,
      total_processed: processedSet.size,
      remaining: allImages.length - processedSet.size,
    })
  } catch (err) {
    console.error('next-unprocessed-photo error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
