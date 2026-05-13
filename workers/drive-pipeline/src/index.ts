import { createClient } from '@supabase/supabase-js'
import { listNewGroups, downloadFile } from './drive'
import { generateBlogPost, substitutePlaceholders } from './anthropic'
import { runCrossPost, linkedInAuthStart, linkedInAuthCallback } from './social'
import { buildMagicLinks, verifyHmac, sendReviewEmail, sendResultsEmail } from './email'
import type { Env, StoredImage, CrossPostResult } from './types'

// ── Supabase helper ───────────────────────────────────────────────────────────

function db(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}

// ── Image upload to Supabase Storage ─────────────────────────────────────────

async function uploadImage(
  env: Env,
  buf: ArrayBuffer,
  groupKey: string,
  fileId: string,
  mimeType: string,
): Promise<StoredImage> {
  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
  const path = `auto/${groupKey}/${fileId}.${ext}`

  const supabase = db(env)
  const { error } = await supabase.storage
    .from('blog_media')
    .upload(path, buf, { contentType: mimeType, upsert: true })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/blog_media/${path}`
  return { fileId, ext, mimeType, publicUrl }
}

// ── Core pipeline ─────────────────────────────────────────────────────────────

async function runPipeline(env: Env): Promise<void> {
  const supabase = db(env)

  // Fetch already-processed group keys
  const { data: processedRows } = await supabase
    .from('processed_drive_files')
    .select('group_key')
  const processedKeys = new Set<string>((processedRows ?? []).map((r: { group_key: string }) => r.group_key))

  // Discover new groups in Drive
  const groups = await listNewGroups(env, env.GOOGLE_DRIVE_FOLDER_ID, processedKeys)
  console.log(`[pipeline] ${groups.length} new group(s) found`)

  for (const group of groups) {
    let blogPostId: string | null = null
    try {
      // Download + upload each image
      const stored: StoredImage[] = []
      for (const file of group.files) {
        const buf = await downloadFile(file.id, env)
        const img = await uploadImage(env, buf, group.groupKey, file.id, file.mimeType)
        stored.push(img)
      }

      const imageUrls = stored.map((s) => s.publicUrl)

      // Generate bilingual post via Claude Vision
      const generated = await generateBlogPost(
        env.ANTHROPIC_API_KEY,
        env.ANTHROPIC_MODEL,
        imageUrls,
        group.folderName,
      )

      // Substitute inline image placeholders
      generated.content_es = substitutePlaceholders(generated.content_es, imageUrls, generated.cover_image_alt_es)
      generated.content_en = substitutePlaceholders(generated.content_en, imageUrls, generated.cover_image_alt_en)

      const autoMeta = {
        fb_caption_es: generated.fb_caption_es,
        ig_caption_es: generated.ig_caption_es,
        li_caption_es: generated.li_caption_es,
        image_urls: imageUrls,
        group_key: group.groupKey,
      }

      // Insert draft blog post
      const { data: post, error: insertErr } = await supabase
        .from('blog_posts')
        .insert({
          slug_es: generated.slug_es,
          slug_en: generated.slug_en,
          title_es: generated.title_es,
          title_en: generated.title_en,
          excerpt_es: generated.excerpt_es,
          excerpt_en: generated.excerpt_en,
          meta_description_es: generated.meta_description_es,
          meta_description_en: generated.meta_description_en,
          og_title_es: generated.og_title_es,
          og_title_en: generated.og_title_en,
          primary_keyword_es: generated.primary_keyword_es,
          primary_keyword_en: generated.primary_keyword_en,
          content_es: generated.content_es,
          content_en: generated.content_en,
          cover_image_url: imageUrls[0],
          cover_image_thumbnail_url: imageUrls[0],
          cover_image_alt_es: generated.cover_image_alt_es,
          cover_image_alt_en: generated.cover_image_alt_en,
          cover_image_format: 'webp',
          reading_time: generated.reading_time,
          service_type: generated.service_type,
          geo_city: generated.geo_city,
          tags: generated.tags,
          status: 'draft',
          source: 'drive-pipeline',
          auto_draft_meta: autoMeta,
          // Legacy compat fields
          title: generated.title_es,
          excerpt: generated.excerpt_es,
          content: generated.content_es,
        })
        .select('id')
        .single()

      if (insertErr || !post) throw new Error(`blog_posts insert: ${insertErr?.message}`)
      blogPostId = post.id

      // Record dedup
      await supabase.from('processed_drive_files').insert({
        group_key: group.groupKey,
        file_ids: group.files.map((f) => f.id),
        blog_post_id: blogPostId,
        status: 'draft_pending',
      })

      // Build and send review email
      const { approveUrl, rejectUrl } = await buildMagicLinks(
        env.EMAIL_LINK_SECRET,
        env.WORKER_BASE_URL,
        blogPostId,
      )
      await sendReviewEmail(env, blogPostId, generated.title_es, imageUrls[0], approveUrl, rejectUrl)

      console.log(`[pipeline] ✓ Draft created: ${blogPostId} — "${generated.title_es}"`)
    } catch (err: unknown) {
      console.error(`[pipeline] ✗ Group ${group.groupKey}:`, (err as Error).message)
      // Mark as failed so we don't retry this group forever
      await supabase.from('processed_drive_files').upsert({
        group_key: group.groupKey,
        file_ids: group.files.map((f) => f.id),
        blog_post_id: blogPostId,
        status: 'failed',
        error_msg: (err as Error).message,
      }, { onConflict: 'group_key' })
    }
  }
}

// ── Approve handler ───────────────────────────────────────────────────────────

async function handleApprove(env: Env, req: Request): Promise<Response> {
  const url = new URL(req.url)
  const postId = url.searchParams.get('post_id') ?? ''
  const ts = parseInt(url.searchParams.get('ts') ?? '0', 10)
  const sig = url.searchParams.get('sig') ?? ''

  // Verify HMAC + expiry (7 days)
  const now = Math.floor(Date.now() / 1000)
  if (now - ts > 7 * 24 * 3600) return htmlPage('Enlace expirado', 'Este enlace tiene más de 7 días y ya no es válido.')
  const valid = await verifyHmac(env.EMAIL_LINK_SECRET, `${postId}:approve:${ts}`, sig)
  if (!valid) return htmlPage('Error', 'Firma inválida.', 400)

  const supabase = db(env)

  // Publish the post
  const { data: post, error } = await supabase
    .from('blog_posts')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('status', 'draft')
    .select('id, title_es, slug_es, auto_draft_meta')
    .single()

  if (error || !post) return htmlPage('Error', `No se pudo publicar (${error?.message ?? 'not found'}).`, 500)

  await supabase.from('processed_drive_files')
    .update({ status: 'approved' })
    .eq('blog_post_id', postId)

  const postUrl = `${env.SITE_URL}/es/blog/${post.slug_es}`
  const meta = (post.auto_draft_meta ?? {}) as Record<string, unknown>
  const imageUrls = (meta.image_urls as string[]) ?? []
  const fbCaption = (meta.fb_caption_es as string) ?? post.title_es
  const igCaption = (meta.ig_caption_es as string) ?? post.title_es
  const liCaption = (meta.li_caption_es as string) ?? post.title_es

  // Cross-post in background (don't await — return confirmation page immediately)
  const crossPostPromise = (async () => {
    const results = await runCrossPost(env, imageUrls, igCaption, fbCaption, liCaption, postUrl)

    // Update blog_posts with social URLs
    const updates: Record<string, string> = {}
    for (const r of results) {
      if (r.status !== 'posted' || !r.postId) continue
      if (r.platform === 'fb') updates.facebook_post_url = `https://www.facebook.com/${r.postId}`
      if (r.platform === 'ig') updates.instagram_post_url = `https://www.instagram.com/p/${r.postId}/`
      if (r.platform === 'li') updates.linkedin_post_url = `https://www.linkedin.com/feed/update/${r.postId}/`
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from('blog_posts').update(updates).eq('id', postId)
    }

    // Update cross_post_jobs
    for (const r of results) {
      await supabase.from('cross_post_jobs').upsert({
        blog_post_id: postId,
        platform: r.platform,
        status: r.status,
        platform_post_id: r.postId ?? null,
        error_msg: r.error ?? null,
        attempted_at: new Date().toISOString(),
      }, { onConflict: 'blog_post_id,platform' })
    }

    await sendResultsEmail(env, post.title_es, postUrl, results).catch(console.error)
  })()

  // Use waitUntil if we have ctx — handled at the caller level
  crossPostPromise.catch(console.error)

  return htmlPage(
    'Post publicado',
    `"${post.title_es}" está ahora en vivo. Los posts en redes sociales se están enviando en segundo plano.`,
    200,
    postUrl,
  )
}

// ── Reject handler ────────────────────────────────────────────────────────────

async function handleReject(env: Env, req: Request): Promise<Response> {
  const url = new URL(req.url)
  const postId = url.searchParams.get('post_id') ?? ''
  const ts = parseInt(url.searchParams.get('ts') ?? '0', 10)
  const sig = url.searchParams.get('sig') ?? ''

  const now = Math.floor(Date.now() / 1000)
  if (now - ts > 7 * 24 * 3600) return htmlPage('Enlace expirado', 'Este enlace tiene más de 7 días.')
  const valid = await verifyHmac(env.EMAIL_LINK_SECRET, `${postId}:reject:${ts}`, sig)
  if (!valid) return htmlPage('Error', 'Firma inválida.', 400)

  const supabase = db(env)
  await supabase.from('blog_posts').update({ status: 'archived' }).eq('id', postId)
  await supabase.from('processed_drive_files').update({ status: 'rejected' }).eq('blog_post_id', postId)

  return htmlPage('Post rechazado', 'El borrador ha sido archivado.')
}

// ── HTML response helper ──────────────────────────────────────────────────────

function htmlPage(title: string, body: string, status = 200, backUrl?: string): Response {
  const back = backUrl
    ? `<p style="margin:20px 0 0"><a href="${backUrl}" style="color:#c8a96e">Ver el post →</a></p>`
    : ''
  return new Response(
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;background:#0e0e0d;color:#f0ede6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .box{max-width:480px;padding:40px;border:1px solid #2e2c29;background:#161513;text-align:center}
    h1{color:#c8a96e;font-size:1.4rem;margin:0 0 12px}p{color:#8a8680;font-size:14px;margin:0}</style>
    </head><body><div class="box"><h1>${title}</h1><p>${body}</p>${back}</div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html;charset=utf-8' } },
  )
}

// ── Meta status probe ─────────────────────────────────────────────────────────

async function handleMetaStatus(env: Env, token: string): Promise<Response> {
  if (token !== (env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 24)) {
    return new Response('Unauthorized', { status: 401 })
  }
  const res = await fetch(
    `https://graph.facebook.com/me?fields=id,name,instagram_business_account&access_token=${env.META_PAGE_ACCESS_TOKEN ?? ''}`,
  )
  const json = await res.json()
  return new Response(JSON.stringify(json, null, 2), { headers: { 'Content-Type': 'application/json' } })
}

// ── Worker entry ──────────────────────────────────────────────────────────────

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runPipeline(env))
  },

  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url)
    const { pathname } = url
    const token = url.searchParams.get('token') ?? ''

    // Manual trigger (protected by token = first 24 chars of service role key)
    if (pathname === '/run' && req.method === 'POST') {
      if (token !== (env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 24)) {
        return new Response('Unauthorized', { status: 401 })
      }
      ctx.waitUntil(runPipeline(env))
      return new Response('Pipeline triggered', { status: 202 })
    }

    if (pathname === '/approve') return handleApprove(env, req)
    if (pathname === '/reject') return handleReject(env, req)

    if (pathname === '/health') return new Response('ok')

    if (pathname === '/meta/status') return handleMetaStatus(env, token)

    // Google OAuth — get refresh token (one-time setup)
    if (pathname === '/auth/google/start') {
      const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID ?? '',
        redirect_uri: `${env.WORKER_BASE_URL}/auth/google/callback`,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        access_type: 'offline',
        prompt: 'consent',
      })
      return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302)
    }
    if (pathname === '/auth/google/callback') {
      const code = url.searchParams.get('code') ?? ''
      if (!code) return htmlPage('Error', 'No code returned from Google.', 400)
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID ?? '',
          client_secret: env.GOOGLE_CLIENT_SECRET ?? '',
          code,
          redirect_uri: `${env.WORKER_BASE_URL}/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      })
      const json = await res.json() as { refresh_token?: string; error?: string; error_description?: string }
      if (!res.ok || !json.refresh_token) {
        return htmlPage('Error', json.error_description ?? json.error ?? 'No refresh_token returned. Make sure you added prompt=consent.', 400)
      }
      return htmlPage(
        'Google OAuth — done',
        `<strong>Refresh Token:</strong><br>
         <code style="color:#c8a96e;word-break:break-all;font-size:12px">${json.refresh_token}</code>
         <br><br>Run in your terminal:<br>
         <code style="color:#c8a96e">wrangler secret put GOOGLE_REFRESH_TOKEN</code><br>
         then paste the token above when prompted.`,
      )
    }

    // LinkedIn OAuth
    if (pathname === '/auth/linkedin/start') {
      const redirectTo = linkedInAuthStart(env, env.WORKER_BASE_URL)
      return Response.redirect(redirectTo, 302)
    }
    if (pathname === '/auth/linkedin/callback') {
      const code = url.searchParams.get('code') ?? ''
      try {
        const { token: liToken, authorUrn } = await linkedInAuthCallback(env, env.WORKER_BASE_URL, code)
        return htmlPage(
          'LinkedIn OAuth',
          `<strong>Access token:</strong><br><code style="color:#c8a96e;word-break:break-all">${liToken}</code>
           <br><br><strong>Author URN:</strong><br><code style="color:#c8a96e">${authorUrn}</code>
           <br><br>Copy these and run:<br>
           <code>wrangler secret put LINKEDIN_ACCESS_TOKEN</code><br>
           <code>wrangler secret put LINKEDIN_AUTHOR_URN</code>`,
        )
      } catch (e: unknown) {
        return htmlPage('Error', (e as Error).message, 500)
      }
    }

    return new Response('Not found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
