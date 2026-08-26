/**
 * TEMPORARY — one-time bulk hard-delete of every gallery (R2 objects + DB
 * rows), requested explicitly by the site owner. Protected by ADMIN_SECRET
 * Bearer token, same pattern as /api/admin/update-image and
 * /api/admin/log-automation.
 *
 * Unlike DELETE /api/admin/galleries/[id] (which soft-deletes, keeping the
 * metadata row for audit purposes), this permanently removes the galleries
 * rows themselves — gallery_photos/gallery_downloads cascade via FK.
 *
 * Remove this route after use — it is intentionally destructive and has no
 * confirmation step beyond the Bearer token.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { deleteGalleryObjects } from '@/lib/gallery/r2'

export const runtime = 'edge'

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.ADMIN_SECRET
  if (!authHeader?.startsWith('Bearer ') || !expectedSecret) return false
  return authHeader.slice('Bearer '.length) === expectedSecret
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: galleries, error } = await supabase.from('galleries').select('id, slug')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!galleries || galleries.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0, results: [] })
  }

  const results: Array<{ id: string; slug: string; r2ObjectsDeleted: number; dbDeleted: boolean; error?: string }> = []

  for (const g of galleries) {
    let r2ObjectsDeleted = 0
    try {
      r2ObjectsDeleted = await deleteGalleryObjects(g.id)
    } catch (err) {
      results.push({ id: g.id, slug: g.slug, r2ObjectsDeleted: 0, dbDeleted: false, error: `R2 delete failed: ${(err as Error).message}` })
      continue
    }

    const { error: delErr } = await supabase.from('galleries').delete().eq('id', g.id)
    results.push({
      id: g.id,
      slug: g.slug,
      r2ObjectsDeleted,
      dbDeleted: !delErr,
      error: delErr?.message,
    })
  }

  return NextResponse.json({
    ok: true,
    deleted: results.filter(r => r.dbDeleted).length,
    total: galleries.length,
    results,
  })
}
