import type { GeneratedPost } from './types'

const ECOSYSTEM_LINKS = `
- Cotizar sesión (ES): https://www.fotografosantodomingo.com/es/cotizar
- Book a session (EN): https://www.fotografosantodomingo.com/en/cotizar
- Servicios / Services: https://www.fotografosantodomingo.com/es/services
- Blog ES: https://www.fotografosantodomingo.com/es/blog
- Instagram: https://www.instagram.com/babula.shots
- WhatsApp: https://wa.me/18097209547
`

const SYSTEM_PROMPT = `You are the content writer for Babula Shots, a high-end photography studio based in Santo Domingo, República Dominicana.
Services: wedding, proposal, family beach, luxury portrait, commercial branding, real estate drone, corporate events, birthday/quinceañera.
Voice: warm, professional, visually evocative, elegant — never salesy or generic.
Primary market: Santo Domingo, Punta Cana, Cap Cana, La Romana, Bávaro. Also serve international clients traveling to DR.
Always write in first-person plural ("nosotros / we") from the studio's perspective.
Internal links to use where relevant:
${ECOSYSTEM_LINKS}

You will receive one or more images from the photographer's Google Drive and must respond with ONLY valid JSON matching the schema below. No markdown, no explanation, just the JSON object.`

const OUTPUT_SCHEMA = `{
  "slug_es": "slug-en-espanol-con-guiones-max-6-palabras",
  "slug_en": "slug-in-english-max-6-words",
  "title_es": "Título editorial en español (60-70 chars)",
  "title_en": "Editorial title in English (60-70 chars)",
  "excerpt_es": "Extracto 130-160 chars, entusiasma al lector.",
  "excerpt_en": "Excerpt 130-160 chars, hooks the reader.",
  "meta_description_es": "Meta description ES 140-160 chars con keyword principal.",
  "meta_description_en": "Meta description EN 140-160 chars with main keyword.",
  "og_title_es": "OG title ES max 60 chars",
  "og_title_en": "OG title EN max 60 chars",
  "primary_keyword_es": "fotógrafo de [tipo] en [ciudad] (long-tail)",
  "primary_keyword_en": "[type] photographer in [city] (long-tail)",
  "content_es": "<h2>Título sección</h2><p>Cuerpo...</p> — ~700 palabras, 5 secciones H2, placeholder {{IMAGE_1}} para imagen inline si hay múltiples.",
  "content_en": "<h2>Section title</h2><p>Body...</p> — ~700 words, 5 H2 sections, {{IMAGE_1}} placeholder for inline image if multiple.",
  "cover_image_alt_es": "alt text ES descriptivo con keyword (max 125 chars)",
  "cover_image_alt_en": "descriptive EN alt text with keyword (max 125 chars)",
  "reading_time": 5,
  "service_type": "wedding|proposal|family|portrait|commercial|drone|corporate|birthday",
  "geo_city": "Santo Domingo|Punta Cana|Cap Cana|La Romana|Bávaro|Samaná",
  "tags": ["tag1", "tag2", "tag3"],
  "fb_caption_es": "Caption FB en español, 150-220 chars, emoji inicial, sin hashtags",
  "ig_caption_es": "Caption IG en español, 150-220 chars, emoji inicial, termina con 5-7 hashtags relevantes",
  "li_caption_es": "Caption LinkedIn profesional en español, 200-280 chars, sin hashtags"
}`

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

  // Add image(s) first
  for (const url of imageUrls) {
    userContent.push({
      type: 'image',
      source: { type: 'url', url },
    })
  }

  const hint = folderName
    ? `La carpeta de Drive se llama: "${folderName}". Usa este nombre como pista del tipo de sesión, ciudad o evento.`
    : 'Analiza las imágenes para inferir el tipo de sesión y la ubicación.'

  userContent.push({
    type: 'text',
    text: `${hint}\n\nGenera el post bilingüe completo según el esquema:\n${OUTPUT_SCHEMA}`,
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
      max_tokens: 4096,
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

  // Strip markdown fences if present
  const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(clean) as GeneratedPost
}

export function substitutePlaceholders(html: string, imageUrls: string[], altText: string): string {
  let result = html
  imageUrls.slice(1).forEach((url, i) => {
    result = result.replace(
      `{{IMAGE_${i + 1}}}`,
      `<figure><img src="${url}" alt="${altText}" loading="lazy"></figure>`,
    )
  })
  // Strip any leftover unfilled placeholders
  result = result.replace(/\{\{IMAGE_\d+\}\}/g, '')
  return result
}
