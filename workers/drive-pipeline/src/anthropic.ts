import type { GeneratedPost } from './types'

const SYSTEM_PROMPT = `You are the lead content strategist for Babula Shots, a high-end photography studio based in Santo Domingo, República Dominicana.

BRAND VOICE
- Warm, poetic, sensory-rich — describe what the camera captured, not what photography "is"
- First-person plural ("nosotros" / "we") from the studio's perspective
- Never generic. Mention specific details visible in the photos: light quality, textures, emotions, location cues
- Never say: "moments to remember forever", "priceless memories", "captured beautifully", "stunning results"
- Instead: describe the exact scene — the glint of water, the child's squinted laugh, the golden hour hitting the facade

SERVICES & MARKETS
Wedding · Proposal · Family Beach · Luxury Portrait · Commercial Branding · Real Estate Drone · Corporate Events · Birthday/Quinceañera
Primary markets: Santo Domingo, Punta Cana, Cap Cana, La Romana, Bávaro. Also serve international travelers to DR.

CONTENT STRUCTURE RULES (for content_es / content_en)
1. Exactly 3 H2 sections, ~550 words total in each language
2. Each H2 must open with a one-sentence hook — a specific observation or question
3. Place {{GALLERY}} as the very first element after the 2nd <h2> tag (before any <p> or {{IMAGE_1}}) — never omit it
4. Place {{IMAGE_1}} immediately after {{GALLERY}} inside the 2nd H2 section (only if multiple images)
5. Place {{CTA}} after the 3rd H2 section body — never omit it
6. Heading hierarchy: only H2 inside content_es/content_en (page title is H1)
7. No inline styles. No <style> tags. Use only semantic HTML: <h2>, <p>, <ul>, <li>, <strong>, <em>
8. Each paragraph: 3–4 sentences. No single-sentence paragraphs

INTRO RULES (for intro_es / intro_en — separate from content)
- 1 paragraph, 70–90 words
- Opens with a specific visual detail from the photo(s) — do not open with "En Babula Shots..." or "La fotografía de..."
- Must state the city/region and service type

LOCATION SECTION RULES (for location_section_es / location_section_en)
- 1 paragraph, 70–90 words
- Describe the specific location: light quality, atmosphere, best time to shoot there

FAQ RULES (faq_es / faq_en — 3 items each)
- Questions clients ask before booking this type of session
- Answers: 2 sentences, factual, specific to DR context

SCHEMA
schema_service_type must be one of:
WeddingPhotography | EngagementPhotography | FamilyPhotography | PortraitPhotography |
CommercialPhotography | RealEstateAerialPhotography | CorporateEventPhotography | QuinceañeraPhotography

LIGHTHOUSE / SEO CONSTRAINTS
- All alt text: include primary keyword naturally, describe the actual photo content, max 120 chars
- Heading text: no keyword stuffing, must read naturally as editorial headings
- meta_description: must include primary_keyword verbatim and a clear value prop
- slug_es / slug_en: lowercase, hyphens only, 4–7 meaningful words, no stopwords

You will receive one or more images. Analyze them carefully — identify subjects, setting, lighting, mood, apparent location, and session type. Respond with ONLY valid JSON matching the schema. No markdown fences, no explanation.`

const OUTPUT_SCHEMA = `{
  "slug_es": "slug-espanol-4-7-palabras",
  "slug_en": "english-slug-4-7-words",
  "title_es": "Título editorial español — 58–68 chars con keyword",
  "title_en": "Editorial title English — 58–68 chars with keyword",
  "excerpt_es": "Extracto 130–155 chars. Hook sensorial + propuesta de valor específica.",
  "excerpt_en": "Excerpt 130–155 chars. Sensory hook + specific value proposition.",
  "meta_description_es": "Meta ES 145–158 chars — keyword principal + beneficio concreto + llamada a acción suave.",
  "meta_description_en": "Meta EN 145–158 chars — primary keyword + concrete benefit + soft CTA.",
  "og_title_es": "OG title ES — max 58 chars",
  "og_title_en": "OG title EN — max 58 chars",
  "primary_keyword_es": "fotógrafo de [tipo] en [ciudad] DR",
  "primary_keyword_en": "[type] photographer in [city] Dominican Republic",
  "intro_es": "<p>Un párrafo 70-90 palabras que abre con detalle visual y menciona ciudad + tipo de sesión.</p>",
  "intro_en": "<p>One paragraph 70-90 words opening with a visual detail, mentioning city + session type.</p>",
  "content_es": "<h2>Título sección 1 con keyword</h2><p>Hook específico...</p><p>...</p><h2>Sección 2</h2>{{GALLERY}}{{IMAGE_1}}<p>...</p><p>...</p><h2>Sección 3</h2><p>...</p><p>...</p>{{CTA}}",
  "content_en": "<h2>Section 1 title with keyword</h2><p>Specific hook...</p><p>...</p><h2>Section 2</h2>{{GALLERY}}{{IMAGE_1}}<p>...</p><p>...</p><h2>Section 3</h2><p>...</p><p>...</p>{{CTA}}",
  "location_section_es": "<p>Un párrafo 70-90 palabras sobre la ubicación específica: luz, atmósfera, mejor horario.</p>",
  "location_section_en": "<p>One paragraph 70-90 words about the specific location: light, atmosphere, best time.</p>",
  "faq_es": [
    {"question": "¿Cuánto cuesta una sesión de [tipo] en [ciudad]?", "answer": "2 sentences."},
    {"question": "¿Cuánto tiempo dura la sesión?", "answer": "2 sentences."},
    {"question": "¿Cuándo recibimos las fotos editadas?", "answer": "2 sentences."}
  ],
  "faq_en": [
    {"question": "How much does a [type] session in [city] cost?", "answer": "2 sentences."},
    {"question": "How long does the session last?", "answer": "2 sentences."},
    {"question": "When do we receive the edited photos?", "answer": "2 sentences."}
  ],
  "cover_image_alt_es": "alt text ES — describe foto real + keyword — max 118 chars",
  "cover_image_alt_en": "alt text EN — describe real photo + keyword — max 118 chars",
  "cover_image_title_es": "Título breve de la imagen — 5–8 palabras",
  "cover_image_title_en": "Short image title — 5–8 words",
  "cover_image_caption_es": "Pie de foto descriptivo — 15–25 palabras mencionando el tipo de sesión y la locación",
  "cover_image_caption_en": "Descriptive photo caption — 15–25 words mentioning session type and location",
  "cover_image_description_es": "Descripción rica para schema ImageObject — 30–50 palabras, describe composición, sujetos, luz y emoción de la imagen",
  "cover_image_description_en": "Rich description for ImageObject schema — 30–50 words describing composition, subjects, light and emotion",
  "reading_time": 6,
  "service_type": "wedding|proposal|family|portrait|commercial|drone|corporate|birthday",
  "geo_city": "Santo Domingo|Punta Cana|Cap Cana|La Romana|Bávaro|Samaná",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "fb_caption_es": "Caption FB 160–220 chars. Emoji inicial. Sin hashtags. Termina con el URL del post.",
  "ig_caption_es": "Caption IG 180–220 chars. Emoji inicial. Termina con salto de línea y 6 hashtags: #fotografosantodomingo #fotografiadeboda #republica...",
  "li_caption_es": "Caption LinkedIn profesional 210–270 chars. Sin hashtags. Valor profesional claro."
}`

// Hardcoded CTA block — consistent across all posts, not Claude-generated
const CTA_BLOCK_ES = `<div class="cta-block"><p><strong>¿Listo para agendar tu sesión?</strong><br>Cotiza en línea en menos de 2 minutos o escríbenos directamente por WhatsApp — respondemos el mismo día.</p><p><a href="https://www.fotografosantodomingo.com/es/cotizar">Ver paquetes y precios</a> &nbsp;·&nbsp; <a href="https://wa.me/18097209547">WhatsApp</a></p></div>`
const CTA_BLOCK_EN = `<div class="cta-block"><p><strong>Ready to book your session?</strong><br>Get an instant quote in under 2 minutes, or message us directly on WhatsApp — we reply the same day.</p><p><a href="https://www.fotografosantodomingo.com/en/cotizar">See packages &amp; pricing</a> &nbsp;·&nbsp; <a href="https://wa.me/18097209547">WhatsApp</a></p></div>`

interface ClaudeMessage {
  type: 'text'
  text: string
}

interface ClaudeResponse {
  content: ClaudeMessage[]
}

export async function generateBlogPost(
  apiKey: string,
  model: string,
  imageUrls: string[],
  folderName?: string,
): Promise<GeneratedPost> {
  const userContent: unknown[] = []

  for (const url of imageUrls) {
    userContent.push({ type: 'image', source: { type: 'url', url } })
  }

  const hint = folderName
    ? `La carpeta de Drive se llama: "${folderName}". Úsala como pista del tipo de sesión, ciudad, cliente o evento.`
    : `Analiza las ${imageUrls.length} imagen(es) para inferir el tipo de sesión, la ubicación y el estado de ánimo.`

  userContent.push({
    type: 'text',
    text: `${hint}\n\nGenera el post bilingüe completo según este esquema JSON exacto (responde SOLO el JSON, sin markdown):\n${OUTPUT_SCHEMA}`,
  })

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 5000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${body}`)
  }

  const data = await res.json() as ClaudeResponse
  const text = data.content?.[0]?.text ?? ''

  const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(clean) as GeneratedPost
}

export function substitutePlaceholders(
  html: string,
  imageUrls: string[],
  altText: string,
  lang: 'es' | 'en',
  galleryHtml: string,
): string {
  let result = html

  // Substitute {{GALLERY}} — if Claude omitted it, inject before {{CTA}} as fallback
  if (result.includes('{{GALLERY}}')) {
    result = result.replace(/\{\{GALLERY\}\}/g, galleryHtml)
  } else {
    result = result.replace('{{CTA}}', galleryHtml + '{{CTA}}')
  }

  // Substitute {{CTA}} with the hardcoded CTA block
  result = result.replace(/\{\{CTA\}\}/g, lang === 'es' ? CTA_BLOCK_ES : CTA_BLOCK_EN)

  // Substitute {{IMAGE_N}} with <figure><img> blocks (skip index 0 = cover)
  imageUrls.slice(1).forEach((url, i) => {
    result = result.replace(
      `{{IMAGE_${i + 1}}}`,
      `<figure><img src="${url}" alt="${altText}" loading="lazy" width="1200" height="800"></figure>`,
    )
  })

  // Strip any leftover unfilled placeholders
  result = result.replace(/\{\{IMAGE_\d+\}\}/g, '')
  return result
}
