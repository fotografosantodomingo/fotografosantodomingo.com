/**
 * Bilingual AI Caption Generator
 *
 * Uses GPT-4o Vision to analyze a Cloudinary image URL and generate
 * SEO-optimized alt text, title, caption, and description in both
 * English and Spanish.
 *
 * Context injection: supply category, location, and page-level SEO
 * keywords so the AI output is targeted to your existing content strategy
 * rather than generic descriptions.
 */

import OpenAI from 'openai'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CaptionContext {
  /** wedding | portrait | drone | event | commercial */
  category?: string
  /** e.g. "Punta Cana, República Dominicana" */
  location?: string
  /**
   * Page-level SEO keywords — the same terms you plan to use in the
   * surrounding page text. The AI will weave these naturally into the
   * generated descriptions.
   *
   * Example: "fotógrafo de bodas punta cana, boda en la playa, Santo Domingo"
   */
  keywords?: string
  /** Cloudinary auto-tags (from Google Auto-Tagging add-on if enabled) */
  cloudinaryTags?: string[]
}

export interface GeneratedCaptions {
  alt_en: string
  alt_es: string
  title_en: string
  title_es: string
  caption_en: string
  caption_es: string
  description_en: string
  description_es: string
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `\
You are a bilingual (English/Spanish) SEO copywriter for "Babula Shots",
a professional photography studio based in Santo Domingo, República Dominicana
(website: fotografosantodomingo.com).

PRIMARY GOAL: rank on Google for photography services in the Dominican Republic.
The metadata must feel natural to human readers while being rich in LOCAL SERVICE keywords.

Core service keywords to weave in naturally (use Spanish variants in ES, English in EN):
  ES: fotografo santo domingo, fotógrafo república dominicana, sesiones de fotos santo domingo,
      fotografía profesional santo domingo, fotografo dominicano, fotografo punta cana,
      fotografía de bodas república dominicana, sesión fotográfica santo domingo
  EN: photographer santo domingo, photography sessions dominican republic,
      professional photographer dominican republic, santo domingo photographer,
      punta cana photographer, dominican republic wedding photographer

Rules:
- Alt text (50-120 chars): describe the photo subject + mention the SERVICE + LOCATION.
  Always include "santo domingo" or "república dominicana" (ES) / "dominican republic" (EN).
- Title attribute (3-7 words): service-focused hover tooltip, e.g. "Sesión de Fotos Santo Domingo".
- Caption (1-2 sentences): editorial, human-sounding. Mention the service + invite contact.
- Description (2-3 sentences): richer keyword density, pitch the studio's expertise and location.
- Spanish must be natural Caribbean/Dominican Spanish, not Castilian.
- Do NOT invent names, dates, or private details.
- Always base the scene description on what is visible in the image, but frame it around
  the PHOTOGRAPHY SERVICE rather than narrating the image like a news caption.

Return ONLY a valid JSON object with exactly these 8 string keys:
alt_en, alt_es, title_en, title_es, caption_en, caption_es, description_en, description_es
`

function buildUserPrompt(context?: CaptionContext): string {
  const parts: string[] = ['Analyze this image and generate the required metadata.']

  if (context?.category) {
    const labels: Record<string, string> = {
      wedding:    'Wedding photography',
      portrait:   'Portrait photography',
      drone:      'Aerial/drone photography',
      event:      'Event photography',
      commercial: 'Commercial/product photography',
    }
    parts.push(`Photo category: ${labels[context.category] ?? context.category}`)
  }

  if (context?.location) {
    parts.push(`Location: ${context.location}`)
  }

  if (context?.keywords?.trim()) {
    parts.push(
      `Target SEO keywords (incorporate these naturally):\n${context.keywords}`,
    )
  }

  if (context?.cloudinaryTags?.length) {
    parts.push(
      `Cloudinary content tags detected in this image: ${context.cloudinaryTags.join(', ')}`,
    )
  }

  return parts.join('\n\n')
}

// ---------------------------------------------------------------------------
// Core generator
// ---------------------------------------------------------------------------

let _client: OpenAI | null = null
function getClient(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

/**
 * Generate bilingual SEO captions for a Cloudinary image.
 *
 * @param imageUrl     Full Cloudinary secure_url for the image
 * @param context      Optional context to improve keyword targeting
 * @param model        OpenAI model — defaults to gpt-4o-mini (cost-efficient)
 */
export async function generateBilingualCaptions(
  imageUrl: string,
  context?: CaptionContext,
  model = process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
): Promise<GeneratedCaptions> {
  const client = getClient()

  const response = await client.chat.completions.create({
    model,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: buildUserPrompt(context) },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
        ],
      },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? '{}'

  let parsed: Record<string, string>
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`AI returned invalid JSON: ${raw.slice(0, 200)}`)
  }

  // Validate all 8 keys are present strings
  const REQUIRED_KEYS = [
    'alt_en', 'alt_es',
    'title_en', 'title_es',
    'caption_en', 'caption_es',
    'description_en', 'description_es',
  ] as const

  const missing = REQUIRED_KEYS.filter((k) => typeof parsed[k] !== 'string' || !parsed[k])
  if (missing.length > 0) {
    throw new Error(`AI response missing keys: ${missing.join(', ')}. Got: ${raw.slice(0, 300)}`)
  }

  return {
    alt_en:         parsed.alt_en,
    alt_es:         parsed.alt_es,
    title_en:       parsed.title_en,
    title_es:       parsed.title_es,
    caption_en:     parsed.caption_en,
    caption_es:     parsed.caption_es,
    description_en: parsed.description_en,
    description_es: parsed.description_es,
  }
}
