/**
 * Cloudinary Upload Webhook — POST /api/cloudinary/webhook
 *
 * Cloudinary fires this endpoint immediately after a file is uploaded
 * (or finished processing). The handler:
 *   1. Validates the shared secret from the query string
 *   2. Extracts image metadata + optional upload context
 *   3. Calls GPT-4o Vision to generate bilingual SEO captions
 *   4. Upserts the result into Supabase (keyed by public_id)
 *
 * ─── Cloudinary setup ────────────────────────────────────────────────────
 * In Cloudinary Dashboard → Settings → Upload → Upload notifications:
 *   Notification URL:
 *     https://fotografosantodomingo.com/api/cloudinary/webhook?secret=<CLOUDINARY_WEBHOOK_SECRET>
 *   Events: Upload
 *
 * ─── Upload context (optional but recommended) ───────────────────────────
 * When uploading via Cloudinary Upload Widget or SDK, pass a `context`
 * object to give the AI better targeting:
 *
 *   cloudinary.uploader.upload(file, {
 *     folder: 'portfolio',
 *     context: {
 *       category: 'wedding',
 *       location: 'Punta Cana, República Dominicana',
 *       keywords: 'fotógrafo de bodas punta cana, ceremonia en la playa',
 *       featured: 'false',
 *     },
 *   })
 *
 * ─── Required env vars ───────────────────────────────────────────────────
 *   CLOUDINARY_WEBHOOK_SECRET  — Shared secret added to the notification URL
 *   OPENAI_API_KEY             — GPT-4o Vision
 *   NEXT_PUBLIC_SUPABASE_URL   — already set
 *   SUPABASE_SERVICE_ROLE_KEY  — bypasses RLS for server-side writes
 *                                (or NEXT_PUBLIC_SUPABASE_ANON_KEY as fallback,
 *                                 but service role is strongly recommended)
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateBilingualCaptions } from '@/lib/ai/caption-generator'
import { createServiceClient } from '@/lib/supabase/service'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse Cloudinary context string "key=value|key2=value2" → Record */
function parseCloudinaryContext(contextStr?: string): Record<string, string> {
  if (!contextStr) return {}
  return Object.fromEntries(
    contextStr.split('|').map((pair) => {
      const idx = pair.indexOf('=')
      return idx === -1 ? [pair, ''] : [pair.slice(0, idx), pair.slice(idx + 1)]
    }),
  )
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Auth — shared secret in query string
  const secret = process.env.CLOUDINARY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Cloudinary webhook] CLOUDINARY_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const providedSecret = req.nextUrl.searchParams.get('secret') ?? ''
  if (providedSecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Cloudinary sends different notification_type values.
  // We only care about 'upload' and 'info' (after AI processing finishes).
  const notificationType: string = body.notification_type ?? body.type ?? ''
  if (!['upload', 'info', 'eager'].includes(notificationType)) {
    // Not an upload event — acknowledge and ignore
    return NextResponse.json({ ok: true, ignored: true })
  }

  const publicId: string = body.public_id ?? ''
  const secureUrl: string = body.secure_url ?? ''
  const width: number = body.width ?? 1200
  const height: number = body.height ?? 800
  const format: string = body.format ?? 'jpg'
  const cloudinaryTags: string[] = body.tags ?? []

  if (!publicId || !secureUrl) {
    return NextResponse.json({ error: 'Missing public_id or secure_url' }, { status: 400 })
  }

  // 3. Extract upload context
  const ctx = parseCloudinaryContext(body.context?.custom ?? body.context)
  const captionContext = {
    category:        ctx.category,
    location:        ctx.location,
    keywords:        ctx.keywords,
    cloudinaryTags:  cloudinaryTags.length > 0 ? cloudinaryTags : undefined,
  }

  // 4. Generate bilingual captions via GPT-4o Vision
  let captions: Awaited<ReturnType<typeof generateBilingualCaptions>>
  try {
    captions = await generateBilingualCaptions(secureUrl, captionContext)
  } catch (err: any) {
    console.error('[Cloudinary webhook] Caption generation failed:', err?.message)
    return NextResponse.json({ error: err?.message ?? 'AI generation failed' }, { status: 500 })
  }

  // 5. Upsert into Supabase (keyed by public_id — UNIQUE constraint in migration 001)
  const supabase = createServiceClient()

  const upsertData = {
    public_id,
    ...captions,
    // Parse metadata from upload context (with safe defaults)
    category:  ctx.category  ?? 'other',
    location:  ctx.location  ?? '',
    featured:  ctx.featured  === 'true',
    width,
    height,
    // Track that this was AI-generated
    ai_generated:    true,
    ai_generated_at: new Date().toISOString(),
    seo_keywords:    ctx.keywords ?? cloudinaryTags.join(', '),
  }

  const { error: dbError } = await supabase
    .from('portfolio_images')
    .upsert(upsertData, { onConflict: 'public_id' })

  if (dbError) {
    console.error('[Cloudinary webhook] Supabase upsert failed:', dbError.message)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  console.log(`[Cloudinary webhook] ✓ Processed ${publicId}`)
  return NextResponse.json({ ok: true, public_id: publicId })
}
