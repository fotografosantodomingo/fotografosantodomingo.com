import { createClient } from '@supabase/supabase-js'
import { listNewGroups, downloadFile } from './drive'
import { generateBlogPost, substitutePlaceholders } from './anthropic'
import { runCrossPost, linkedInAuthStart, linkedInAuthCallback, pinterestAuthStart, pinterestAuthCallback, refreshGbpToken, deviantArtAuthStart, deviantArtAuthCallback } from './social'
import { verifyHmac, sendResultsEmail } from './email'
import type { Env, StoredImage } from './types'

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

// ── Service link sets (curated per service type) ──────────────────────────────

const BASE = 'https://www.fotografosantodomingo.com'

interface LinkSet { es: Array<{ text: string; url: string; description: string }>; en: Array<{ text: string; url: string; description: string }> }

const SERVICE_LINK_SETS: Record<string, LinkSet> = {
  wedding: {
    es: [
      { text: 'Fotografía de bodas en DR', url: `${BASE}/es/services/wedding`, description: 'Paquetes completos para fotografía de bodas en República Dominicana' },
      { text: 'Propuestas de matrimonio', url: `${BASE}/es/services/proposal`, description: 'Captamos el momento exacto de la propuesta con discreción' },
      { text: 'Retratos de pareja', url: `${BASE}/es/services/portrait`, description: 'Sesiones de retrato para novios antes o después de la boda' },
      { text: 'Cotizar tu boda', url: `${BASE}/es/get-quote`, description: 'Presupuesto personalizado en menos de 2 minutos' },
    ],
    en: [
      { text: 'Wedding photography in DR', url: `${BASE}/en/services/wedding`, description: 'Full wedding photography packages in the Dominican Republic' },
      { text: 'Marriage proposal photography', url: `${BASE}/en/services/proposal`, description: 'We capture the proposal moment with discretion and emotion' },
      { text: 'Couple portrait sessions', url: `${BASE}/en/services/portrait`, description: 'Portrait sessions for couples before or after the wedding' },
      { text: 'Get a wedding quote', url: `${BASE}/en/get-quote`, description: 'Personalized quote in under 2 minutes' },
    ],
  },
  proposal: {
    es: [
      { text: 'Propuestas de matrimonio', url: `${BASE}/es/services/proposal`, description: 'Capturamos la propuesta en Santo Domingo y destinos DR' },
      { text: 'Fotografía de bodas', url: `${BASE}/es/services/wedding`, description: 'Cobertura completa desde la propuesta hasta el gran día' },
      { text: 'Retratos de lujo', url: `${BASE}/es/services/portrait`, description: 'Sesiones de retrato para parejas en locaciones exclusivas' },
      { text: 'Cotizar propuesta', url: `${BASE}/es/get-quote`, description: 'Presupuesto personalizado en 2 minutos' },
    ],
    en: [
      { text: 'Proposal photography', url: `${BASE}/en/services/proposal`, description: 'We capture the proposal moment across Dominican Republic' },
      { text: 'Wedding photography', url: `${BASE}/en/services/wedding`, description: 'Full coverage from proposal to the big day' },
      { text: 'Luxury couple portraits', url: `${BASE}/en/services/portrait`, description: 'Portrait sessions for couples at exclusive DR locations' },
      { text: 'Get a proposal quote', url: `${BASE}/en/get-quote`, description: 'Personalized quote in 2 minutes' },
    ],
  },
  family: {
    es: [
      { text: 'Fotos de familia en playa', url: `${BASE}/es/services/family`, description: 'Sesiones familiares en las mejores playas de República Dominicana' },
      { text: 'Retratos de lujo', url: `${BASE}/es/services/portrait`, description: 'Retratos individuales y de pareja con luz natural en DR' },
      { text: 'Fotografía de quinceañera', url: `${BASE}/es/services/birthday`, description: 'Sesiones especiales para quinceañeras y celebraciones familiares' },
      { text: 'Cotizar sesión familiar', url: `${BASE}/es/get-quote`, description: 'Precio personalizado para tu sesión en 2 minutos' },
    ],
    en: [
      { text: 'Family beach photography', url: `${BASE}/en/services/family`, description: 'Family sessions at the best beaches in the Dominican Republic' },
      { text: 'Luxury portrait sessions', url: `${BASE}/en/services/portrait`, description: 'Individual and couple portraits with natural light in DR' },
      { text: 'Quinceañera photography', url: `${BASE}/en/services/birthday`, description: 'Special sessions for quinceañeras and family celebrations' },
      { text: 'Book a family session', url: `${BASE}/en/get-quote`, description: 'Get a personalized quote in 2 minutes' },
    ],
  },
  portrait: {
    es: [
      { text: 'Retrato de lujo y moda', url: `${BASE}/es/services/portrait`, description: 'Retratos editoriales con luz natural y dirección artística profesional' },
      { text: 'Fotografía comercial', url: `${BASE}/es/services/commercial`, description: 'Contenido visual para marcas y emprendimientos en Santo Domingo' },
      { text: 'Fotos de familia en playa', url: `${BASE}/es/services/family`, description: 'Sesiones familiares en exteriores y playa en DR' },
      { text: 'Cotizar retrato', url: `${BASE}/es/get-quote`, description: 'Presupuesto para tu sesión de retrato en 2 minutos' },
    ],
    en: [
      { text: 'Luxury portrait photography', url: `${BASE}/en/services/portrait`, description: 'Editorial portraits with natural light and professional art direction' },
      { text: 'Commercial photography', url: `${BASE}/en/services/commercial`, description: 'Visual content for brands and businesses in Santo Domingo' },
      { text: 'Family photography', url: `${BASE}/en/services/family`, description: 'Family sessions at the beach and outdoors in DR' },
      { text: 'Book a portrait session', url: `${BASE}/en/get-quote`, description: 'Get a quote for your portrait session in 2 minutes' },
    ],
  },
  commercial: {
    es: [
      { text: 'Fotografía comercial', url: `${BASE}/es/services/commercial`, description: 'Imágenes para marcas, productos y emprendimientos en Santo Domingo' },
      { text: 'Fotografía con drone', url: `${BASE}/es/services/drone-real-estate`, description: 'Tomas aéreas para proyectos inmobiliarios y comerciales' },
      { text: 'Eventos corporativos', url: `${BASE}/es/services/corporate`, description: 'Cobertura profesional de eventos empresariales en DR' },
      { text: 'Cotizar proyecto', url: `${BASE}/es/get-quote`, description: 'Presupuesto para tu proyecto comercial en 2 minutos' },
    ],
    en: [
      { text: 'Commercial photography', url: `${BASE}/en/services/commercial`, description: 'Images for brands, products and businesses in Santo Domingo' },
      { text: 'Drone aerial photography', url: `${BASE}/en/services/drone-real-estate`, description: 'Aerial shots for real estate and commercial projects' },
      { text: 'Corporate event coverage', url: `${BASE}/en/services/corporate`, description: 'Professional photography for corporate events in DR' },
      { text: 'Get a commercial quote', url: `${BASE}/en/get-quote`, description: 'Quote for your commercial project in 2 minutes' },
    ],
  },
  drone: {
    es: [
      { text: 'Drone inmobiliario', url: `${BASE}/es/services/drone-real-estate`, description: 'Fotografía aérea para propiedades y proyectos inmobiliarios en DR' },
      { text: 'Fotografía comercial', url: `${BASE}/es/services/commercial`, description: 'Contenido visual profesional para marcas y proyectos' },
      { text: 'Eventos corporativos', url: `${BASE}/es/services/corporate`, description: 'Cobertura de eventos empresariales con drone incluido' },
      { text: 'Cotizar vuelo drone', url: `${BASE}/es/get-quote`, description: 'Presupuesto para tu proyecto aéreo en 2 minutos' },
    ],
    en: [
      { text: 'Real estate drone photography', url: `${BASE}/en/services/drone-real-estate`, description: 'Aerial photography for properties and real estate in DR' },
      { text: 'Commercial photography', url: `${BASE}/en/services/commercial`, description: 'Professional visual content for brands and projects' },
      { text: 'Corporate event photography', url: `${BASE}/en/services/corporate`, description: 'Corporate event coverage with drone included' },
      { text: 'Get a drone quote', url: `${BASE}/en/get-quote`, description: 'Quote for your aerial project in 2 minutes' },
    ],
  },
  corporate: {
    es: [
      { text: 'Eventos corporativos', url: `${BASE}/es/services/corporate`, description: 'Fotografía profesional de eventos empresariales en Santo Domingo' },
      { text: 'Fotografía comercial', url: `${BASE}/es/services/commercial`, description: 'Imágenes para marcas y comunicación corporativa' },
      { text: 'Retrato ejecutivo', url: `${BASE}/es/services/portrait`, description: 'Retratos profesionales para equipos directivos y LinkedIn' },
      { text: 'Cotizar evento', url: `${BASE}/es/get-quote`, description: 'Presupuesto para tu evento corporativo en 2 minutos' },
    ],
    en: [
      { text: 'Corporate event photography', url: `${BASE}/en/services/corporate`, description: 'Professional corporate event photography in Santo Domingo' },
      { text: 'Commercial photography', url: `${BASE}/en/services/commercial`, description: 'Images for brands and corporate communications' },
      { text: 'Executive headshots', url: `${BASE}/en/services/portrait`, description: 'Professional portraits for leadership teams and LinkedIn' },
      { text: 'Get a corporate quote', url: `${BASE}/en/get-quote`, description: 'Quote for your corporate event in 2 minutes' },
    ],
  },
  birthday: {
    es: [
      { text: 'Quinceañeras y cumpleaños', url: `${BASE}/es/services/birthday`, description: 'Fotografía de quinceañeras y cumpleaños en Santo Domingo' },
      { text: 'Fotos de familia en playa', url: `${BASE}/es/services/family`, description: 'Sesiones familiares en playa y exteriores en República Dominicana' },
      { text: 'Retratos de lujo', url: `${BASE}/es/services/portrait`, description: 'Retratos editoriales para jóvenes y adultos en DR' },
      { text: 'Cotizar quinceañera', url: `${BASE}/es/get-quote`, description: 'Presupuesto para tu celebración en 2 minutos' },
    ],
    en: [
      { text: 'Quinceañera photography', url: `${BASE}/en/services/birthday`, description: 'Quinceañera and birthday photography in Santo Domingo' },
      { text: 'Family beach photography', url: `${BASE}/en/services/family`, description: 'Family sessions at the beach and outdoors in DR' },
      { text: 'Luxury portrait sessions', url: `${BASE}/en/services/portrait`, description: 'Editorial portraits for young adults in DR' },
      { text: 'Book a birthday session', url: `${BASE}/en/get-quote`, description: 'Get a quote for your celebration in 2 minutes' },
    ],
  },
}

const DEFAULT_LINKS: LinkSet = {
  es: [
    { text: 'Nuestros servicios', url: `${BASE}/es/services`, description: 'Todos los servicios de fotografía profesional en DR' },
    { text: 'Fotografía de bodas', url: `${BASE}/es/services/wedding`, description: 'Cobertura completa para el día más importante' },
    { text: 'Galería de trabajos', url: `${BASE}/es/portfolio`, description: 'Explora nuestra galería de fotografía profesional' },
    { text: 'Cotizar sesión', url: `${BASE}/es/get-quote`, description: 'Presupuesto personalizado en 2 minutos' },
  ],
  en: [
    { text: 'Our services', url: `${BASE}/en/services`, description: 'All professional photography services in DR' },
    { text: 'Wedding photography', url: `${BASE}/en/services/wedding`, description: 'Full coverage for your most important day' },
    { text: 'Photo gallery', url: `${BASE}/en/portfolio`, description: 'Explore our professional photography gallery' },
    { text: 'Get a quote', url: `${BASE}/en/get-quote`, description: 'Personalized quote in 2 minutes' },
  ],
}

function buildGalleryLink(serviceType: string, locale: 'es' | 'en'): string {
  const labels: Record<string, { es: string; en: string }> = {
    wedding:    { es: 'fotografía de bodas',         en: 'wedding photography' },
    proposal:   { es: 'propuestas de matrimonio',    en: 'marriage proposal photography' },
    family:     { es: 'fotografía de familia',       en: 'family photography' },
    portrait:   { es: 'retratos de lujo',            en: 'luxury portrait photography' },
    commercial: { es: 'fotografía comercial',        en: 'commercial photography' },
    drone:      { es: 'fotografía aérea con drone',  en: 'drone photography' },
    corporate:  { es: 'fotografía corporativa',      en: 'corporate photography' },
    birthday:   { es: 'fotografía de quinceañeras',  en: 'quinceañera photography' },
  }
  const label = labels[serviceType.toLowerCase()]
  if (locale === 'es') {
    const text = label?.es ?? 'fotografía profesional'
    return `<p>Explora más de nuestro trabajo en nuestra <a href="${BASE}/es/portfolio">galería de ${text}</a>.</p>`
  }
  const text = label?.en ?? 'professional photography'
  return `<p>Explore more of our work in our <a href="${BASE}/en/portfolio">${text} gallery</a>.</p>`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapSchemaServiceType(serviceType: string): string {
  const validTypes = new Set([
    'WeddingPhotography', 'EngagementPhotography', 'FamilyPhotography',
    'PortraitPhotography', 'CommercialPhotography', 'RealEstateAerialPhotography',
    'CorporateEventPhotography', 'QuinceañeraPhotography',
  ])
  if (validTypes.has(serviceType)) return serviceType

  const map: Record<string, string> = {
    wedding: 'WeddingPhotography',
    boda: 'WeddingPhotography',
    proposal: 'EngagementPhotography',
    engagement: 'EngagementPhotography',
    family: 'FamilyPhotography',
    familia: 'FamilyPhotography',
    portrait: 'PortraitPhotography',
    retrato: 'PortraitPhotography',
    commercial: 'CommercialPhotography',
    comercial: 'CommercialPhotography',
    drone: 'RealEstateAerialPhotography',
    corporate: 'CorporateEventPhotography',
    corporativo: 'CorporateEventPhotography',
    birthday: 'QuinceañeraPhotography',
    quinceañera: 'QuinceañeraPhotography',
  }
  return map[serviceType.toLowerCase()] ?? 'PhotographyService'
}

// Anthropic's vision API hard-rejects images whose longest side exceeds 8000px
// ("dimensions exceed max allowed size: 8000 pixels") and downscales anything
// above ~1568px anyway. Full-res Drive photos can be larger, which silently
// killed a day's post. Route the vision call through Supabase's image render
// endpoint capped at 1568px; the original full-res publicUrl is still used for
// the blog body, cover image, and social cross-posts.
function toVisionUrl(publicUrl: string): string {
  const marker = '/storage/v1/object/public/'
  if (!publicUrl.includes(marker)) return publicUrl
  const rendered = publicUrl.replace(marker, '/storage/v1/render/image/public/')
  return `${rendered}?width=1568&height=1568&resize=contain`
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
  const allGroups = await listNewGroups(env, env.GOOGLE_DRIVE_FOLDER_ID, processedKeys)
  console.log(`[pipeline] ${allGroups.length} new group(s) found, processing 1`)
  const groups = allGroups.slice(0, 1)

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

      // Generate bilingual post via Claude Vision — use dimension-capped render
      // URLs so oversized photos (>8000px) don't get rejected by the vision API.
      const generated = await generateBlogPost(
        env.ANTHROPIC_API_KEY,
        env.ANTHROPIC_MODEL,
        imageUrls.map(toVisionUrl),
        group.folderName,
      )

      // Derive service type, link set, and gallery links
      const serviceKey = generated.service_type.toLowerCase()
      const linkSet = SERVICE_LINK_SETS[serviceKey] ?? DEFAULT_LINKS
      const galleryEs = buildGalleryLink(serviceKey, 'es')
      const galleryEn = buildGalleryLink(serviceKey, 'en')

      // Substitute inline image placeholders, CTA blocks, and gallery links
      generated.content_es = substitutePlaceholders(generated.content_es, imageUrls, generated.cover_image_alt_es, 'es', galleryEs)
      generated.content_en = substitutePlaceholders(generated.content_en, imageUrls, generated.cover_image_alt_en, 'en', galleryEn)

      // Slug collision guard — append short group key suffix if slug already exists
      const { data: slugConflict } = await supabase
        .from('blog_posts')
        .select('id')
        .or(`slug_es.eq.${generated.slug_es},slug.eq.${generated.slug_es}`)
        .limit(1)
        .maybeSingle()
      if (slugConflict) {
        const suffix = `-${group.groupKey.slice(0, 6).toLowerCase().replace(/[^a-z0-9]/g, '')}`
        generated.slug_es = generated.slug_es + suffix
        generated.slug_en = generated.slug_en + suffix
      }

      const autoMeta = {
        fb_caption_es: generated.fb_caption_es,
        ig_caption_es: generated.ig_caption_es,
        li_caption_es: generated.li_caption_es,
        pi_caption_es: generated.pi_caption_es,
        gbp_caption_es: generated.gbp_caption_es,
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
          intro_es: generated.intro_es,
          intro_en: generated.intro_en,
          content_es: generated.content_es,
          content_en: generated.content_en,
          location_section_es: generated.location_section_es,
          location_section_en: generated.location_section_en,
          faq_es: generated.faq_es,
          faq_en: generated.faq_en,
          cover_image_url: imageUrls[0],
          cover_image_thumbnail_url: imageUrls[0],
          cover_image_alt_es: generated.cover_image_alt_es,
          cover_image_alt_en: generated.cover_image_alt_en,
          cover_image_title_es: generated.cover_image_title_es,
          cover_image_title_en: generated.cover_image_title_en,
          cover_image_caption_es: generated.cover_image_caption_es,
          cover_image_caption_en: generated.cover_image_caption_en,
          cover_image_description_es: generated.cover_image_description_es,
          cover_image_description_en: generated.cover_image_description_en,
          cover_image_format: 'webp',
          internal_links_es: linkSet.es,
          internal_links_en: linkSet.en,
          schema_service_type: mapSchemaServiceType(generated.service_type),
          reading_time: generated.reading_time,
          service_type: generated.service_type,
          geo_city: generated.geo_city,
          tags: generated.tags,
          status: 'published',
          published_at: new Date().toISOString(),
          source: 'drive-pipeline',
          auto_draft_meta: autoMeta,
          // Legacy compat fields
          slug: generated.slug_es,
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
        status: 'approved',
      })

      // Cross-post immediately — no manual approval needed
      const postUrl = `${env.SITE_URL}/es/blog/${generated.slug_es}`
      const results = await runCrossPost(
        env,
        imageUrls,
        generated.ig_caption_es,
        generated.fb_caption_es,
        generated.li_caption_es,
        generated.pi_caption_es,
        generated.gbp_caption_es,
        postUrl,
        generated.title_es,
      )

      // Update blog_posts with social URLs
      const socialUpdates: Record<string, string> = {}
      for (const r of results) {
        if (r.status !== 'posted' || !r.postId) continue
        if (r.platform === 'fb') socialUpdates.facebook_post_url = `https://www.facebook.com/${r.postId}`
        if (r.platform === 'ig') socialUpdates.instagram_post_url = `https://www.instagram.com/p/${r.postId}/`
        if (r.platform === 'li') socialUpdates.linkedin_post_url = `https://www.linkedin.com/feed/update/${r.postId}/`
      }
      if (Object.keys(socialUpdates).length > 0) {
        await supabase.from('blog_posts').update(socialUpdates).eq('id', blogPostId)
      }

      // Update cross_post_jobs
      for (const r of results) {
        await supabase.from('cross_post_jobs').upsert({
          blog_post_id: blogPostId,
          platform: r.platform,
          status: r.status,
          platform_post_id: r.postId ?? null,
          error_msg: r.error ?? null,
          attempted_at: new Date().toISOString(),
        }, { onConflict: 'blog_post_id,platform' })
      }

      await sendResultsEmail(env, generated.title_es, postUrl, results).catch(console.error)
      console.log(`[pipeline] ✓ Published: ${blogPostId} — "${generated.title_es}"`)
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

async function handleApprove(env: Env, req: Request, ctx: ExecutionContext): Promise<Response> {
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

  // Publish the post — also matches already-published posts so a double-click doesn't error
  const { data: post, error } = await supabase
    .from('blog_posts')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', postId)
    .in('status', ['draft', 'published'])
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
  const piCaption = (meta.pi_caption_es as string) ?? post.title_es
  const gbpCaption = (meta.gbp_caption_es as string) ?? post.title_es

  // Cross-post in background (don't await — return confirmation page immediately)
  const crossPostPromise = (async () => {
    const results = await runCrossPost(env, imageUrls, igCaption, fbCaption, liCaption, piCaption, gbpCaption, postUrl, post.title_es)

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

  ctx.waitUntil(crossPostPromise)

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

// ── Retry cross-post (idempotent) ─────────────────────────────────────────────
// Re-runs social cross-posting for an existing post, skipping platforms already
// marked 'posted' in cross_post_jobs — so a single failed platform (e.g. IG)
// can be retried without duplicating the others. Token-authed like /run.
async function handleRetryCrossPost(env: Env, req: Request): Promise<Response> {
  const postId = new URL(req.url).searchParams.get('post_id') ?? ''
  if (!postId) return new Response('Missing post_id', { status: 400 })

  const supabase = db(env)
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('id, title_es, slug_es, auto_draft_meta')
    .eq('id', postId)
    .single()
  if (error || !post) return new Response(`Post not found: ${error?.message ?? 'n/a'}`, { status: 404 })

  const { data: jobs } = await supabase
    .from('cross_post_jobs')
    .select('platform, status')
    .eq('blog_post_id', postId)
  const skip = new Set((jobs ?? []).filter((j) => j.status === 'posted').map((j) => j.platform as string))

  const postUrl = `${env.SITE_URL}/es/blog/${post.slug_es}`
  const meta = (post.auto_draft_meta ?? {}) as Record<string, unknown>
  const imageUrls = (meta.image_urls as string[]) ?? []
  const cap = (k: string) => (meta[k] as string) ?? post.title_es

  const results = await runCrossPost(
    env, imageUrls, cap('ig_caption_es'), cap('fb_caption_es'), cap('li_caption_es'),
    cap('pi_caption_es'), cap('gbp_caption_es'), postUrl, post.title_es, skip,
  )

  const updates: Record<string, string> = {}
  for (const r of results) {
    if (r.status !== 'posted' || !r.postId) continue
    if (r.platform === 'fb') updates.facebook_post_url = `https://www.facebook.com/${r.postId}`
    if (r.platform === 'ig') updates.instagram_post_url = `https://www.instagram.com/p/${r.postId}/`
    if (r.platform === 'li') updates.linkedin_post_url = `https://www.linkedin.com/feed/update/${r.postId}/`
  }
  if (Object.keys(updates).length > 0) await supabase.from('blog_posts').update(updates).eq('id', postId)

  for (const r of results) {
    if (r.status === 'skipped') continue // never overwrite an existing 'posted' row
    await supabase.from('cross_post_jobs').upsert({
      blog_post_id: postId, platform: r.platform, status: r.status,
      platform_post_id: r.postId ?? null, error_msg: r.error ?? null,
      attempted_at: new Date().toISOString(),
    }, { onConflict: 'blog_post_id,platform' })
  }

  return new Response(JSON.stringify({ post_id: postId, skipped_already_posted: [...skip], results }, null, 2),
    { headers: { 'Content-Type': 'application/json' } })
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
  async scheduled(_event: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
    await runPipeline(env)
  },

  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url)
    const { pathname } = url
    const token = url.searchParams.get('token') ?? ''

    // Manual trigger — runs synchronously so the full 30s wall-clock is available for Claude
    if (pathname === '/run' && req.method === 'POST') {
      if (token !== (env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 24)) {
        return new Response('Unauthorized', { status: 401 })
      }
      await runPipeline(env)
      return new Response('Pipeline triggered', { status: 200 })
    }

    if (pathname === '/approve') return handleApprove(env, req, ctx)
    if (pathname === '/reject') return handleReject(env, req)

    // Idempotent social retry — only platforms not already 'posted' are re-sent.
    if (pathname === '/retry-crosspost') {
      if (token !== (env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 24)) {
        return new Response('Unauthorized', { status: 401 })
      }
      return handleRetryCrossPost(env, req)
    }

    // One-time: verify GBP approval + discover account/location IDs for GBP_LOCATION_NAME.
    if (pathname === '/debug-gbp') {
      if (token !== (env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 24)) {
        return new Response('Unauthorized', { status: 401 })
      }
      try {
        const at = await refreshGbpToken(env)
        const acctRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: { Authorization: `Bearer ${at}` },
        })
        const accounts = await acctRes.json() as { accounts?: Array<{ name: string; accountName?: string }> }
        const out: Record<string, unknown> = { accountsStatus: acctRes.status, accounts }
        const firstAcct = accounts.accounts?.[0]?.name
        if (firstAcct) {
          const locRes = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${firstAcct}/locations?readMask=name,title,storefrontAddress&pageSize=100`,
            { headers: { Authorization: `Bearer ${at}` } },
          )
          out.locationsStatus = locRes.status
          out.locations = await locRes.json()
          out.hint_GBP_LOCATION_NAME = `${firstAcct}/locations/<locationId from name above>`
        }
        return new Response(JSON.stringify(out, null, 2), { headers: { 'Content-Type': 'application/json' } })
      } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }, null, 2), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
    }

    if (pathname === '/health') return new Response('ok')

    // Drive debug — lists raw contents of the watched folder
    if (pathname === '/debug-drive') {
      if (token !== (env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 24)) {
        return new Response('Unauthorized', { status: 401 })
      }
      try {
        const { getAccessToken } = await import('./drive') as unknown as { getAccessToken: never }
        void getAccessToken
        // Use fetch directly with fresh token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            refresh_token: env.GOOGLE_REFRESH_TOKEN,
            grant_type: 'refresh_token',
          }),
        })
        const tokenJson = await tokenRes.json() as { access_token?: string; error?: string }
        if (!tokenRes.ok || !tokenJson.access_token) {
          return new Response(JSON.stringify({ error: 'token_refresh_failed', detail: tokenJson }, null, 2), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
        const driveRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`'${env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`)}&fields=files(id,name,mimeType)&pageSize=10`,
          { headers: { Authorization: `Bearer ${tokenJson.access_token}` } },
        )
        const driveJson = await driveRes.json()
        return new Response(JSON.stringify({ status: driveRes.status, folder: env.GOOGLE_DRIVE_FOLDER_ID, drive: driveJson }, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (e: unknown) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
    }

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
      const liError = url.searchParams.get('error')
      if (liError) {
        const desc = url.searchParams.get('error_description') ?? liError
        return htmlPage('LinkedIn OAuth Error', `<p style="color:red"><strong>${liError}</strong>: ${desc}</p><p>Go back and try <a href="/auth/linkedin/start">/auth/linkedin/start</a> again.</p>`, 400)
      }
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

    // Pinterest OAuth
    if (pathname === '/auth/pinterest/start') {
      const redirectTo = pinterestAuthStart(env, env.WORKER_BASE_URL)
      return Response.redirect(redirectTo, 302)
    }
    if (pathname === '/auth/pinterest/callback') {
      const piError = url.searchParams.get('error')
      if (piError) {
        const desc = url.searchParams.get('error_description') ?? piError
        return htmlPage('Pinterest OAuth Error', `<p style="color:red"><strong>${piError}</strong>: ${desc}</p><p>Try <a href="/auth/pinterest/start">/auth/pinterest/start</a> again.</p>`, 400)
      }
      const code = url.searchParams.get('code') ?? ''
      if (!code) return htmlPage('Pinterest OAuth Error', 'No code returned.', 400)
      try {
        const { accessToken, refreshToken } = await pinterestAuthCallback(env, env.WORKER_BASE_URL, code)
        return htmlPage(
          'Pinterest OAuth — done',
          `<strong>Refresh Token (save this):</strong><br>
           <code style="color:#c8a96e;word-break:break-all;font-size:12px">${refreshToken}</code>
           <br><br><strong>Access Token (short-lived, ignore):</strong><br>
           <code style="color:#8a8680;word-break:break-all;font-size:11px">${accessToken}</code>
           <br><br>Run in your terminal:<br>
           <code style="color:#c8a96e">wrangler secret put PINTEREST_REFRESH_TOKEN</code><br>
           then paste the refresh token above when prompted.`,
        )
      } catch (e: unknown) {
        return htmlPage('Error', (e as Error).message, 500)
      }
    }

    // GBP OAuth
    if (pathname === '/auth/gbp/start') {
      const params = new URLSearchParams({
        client_id: env.GBP_CLIENT_ID ?? env.GOOGLE_CLIENT_ID,
        redirect_uri: `${env.WORKER_BASE_URL}/auth/gbp/callback`,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/business.manage',
        access_type: 'offline',
        prompt: 'consent',
      })
      return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302)
    }
    if (pathname === '/auth/gbp/callback') {
      const code = url.searchParams.get('code') ?? ''
      if (!code) return htmlPage('Error', 'No code returned from Google.', 400)
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.GBP_CLIENT_ID ?? env.GOOGLE_CLIENT_ID,
          client_secret: env.GBP_CLIENT_SECRET ?? env.GOOGLE_CLIENT_SECRET,
          code,
          redirect_uri: `${env.WORKER_BASE_URL}/auth/gbp/callback`,
          grant_type: 'authorization_code',
        }),
      })
      const json = await res.json() as { refresh_token?: string; error?: string; error_description?: string }
      if (!res.ok || !json.refresh_token) {
        return htmlPage('Error', json.error_description ?? json.error ?? 'No refresh_token returned.', 400)
      }
      return htmlPage(
        'GBP OAuth — done',
        `<strong>Refresh Token:</strong><br>
         <code style="color:#c8a96e;word-break:break-all;font-size:12px">${json.refresh_token}</code>
         <br><br>Run in your terminal:<br>
         <code style="color:#c8a96e">wrangler secret put GBP_REFRESH_TOKEN</code><br>
         then paste the token above when prompted.<br><br>
         Next: visit <a href="/gbp/locations" style="color:#c8a96e">/gbp/locations?token=...</a> to find your location name.`,
      )
    }

    // DeviantArt OAuth
    if (pathname === '/auth/deviantart/start') {
      const redirectTo = deviantArtAuthStart(env, env.WORKER_BASE_URL)
      return Response.redirect(redirectTo, 302)
    }
    if (pathname === '/auth/deviantart/callback') {
      const daError = url.searchParams.get('error')
      if (daError) {
        const desc = url.searchParams.get('error_description') ?? daError
        return htmlPage('DeviantArt OAuth Error', `<p style="color:red"><strong>${daError}</strong>: ${desc}</p><p>Try <a href="/auth/deviantart/start">/auth/deviantart/start</a> again.</p>`, 400)
      }
      const code = url.searchParams.get('code') ?? ''
      if (!code) return htmlPage('DeviantArt OAuth Error', 'No code returned.', 400)
      try {
        const { refreshToken } = await deviantArtAuthCallback(env, env.WORKER_BASE_URL, code)
        return htmlPage(
          'DeviantArt OAuth — done',
          `<strong>Refresh Token (save this):</strong><br>
           <code style="color:#c8a96e;word-break:break-all;font-size:12px">${refreshToken}</code>
           <br><br>Run in your terminal:<br>
           <code style="color:#c8a96e">wrangler secret put DA_REFRESH_TOKEN</code><br>
           then paste the token above when prompted.<br><br>
           Then set <code>DA_ENABLED = "true"</code> in wrangler.toml and redeploy.`,
        )
      } catch (e: unknown) {
        return htmlPage('Error', (e as Error).message, 500)
      }
    }

    // GBP — list accounts + locations (to find GBP_LOCATION_NAME)
    if (pathname === '/gbp/locations') {
      if (token !== (env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 24)) {
        return new Response('Unauthorized', { status: 401 })
      }
      try {
        const accessToken = await refreshGbpToken(env)
        const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const accountsJson = await accountsRes.json() as { accounts?: Array<{ name: string; accountName: string; type: string }> }
        const accounts = accountsJson.accounts ?? []

        const locationRows: Array<{ account: string; name: string; title: string }> = []
        for (const account of accounts) {
          const locRes = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          )
          const locJson = await locRes.json() as { locations?: Array<{ name: string; title: string }> }
          for (const loc of locJson.locations ?? []) {
            locationRows.push({ account: account.accountName, name: loc.name, title: loc.title })
          }
        }

        return new Response(JSON.stringify({ accounts, locations: locationRows }, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (e: unknown) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
    }

    return new Response('Not found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
