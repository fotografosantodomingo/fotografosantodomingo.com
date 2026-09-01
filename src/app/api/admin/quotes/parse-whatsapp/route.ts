import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'edge'

async function isAdminSession(req: NextRequest): Promise<boolean> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => req.cookies.get(name)?.value, set: () => {}, remove: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', session.user.id).single()
  return !!data
}

let _client: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPEN_AI_QUOTE })
  return _client
}

const SYSTEM_PROMPT = `You extract structured quote data from raw WhatsApp conversation snippets between a photographer and a potential client.

Return ONLY valid JSON matching this schema (use null for any field you cannot confidently extract):
{
  "full_name": string | null,       // client's first + last name
  "whatsapp_phone": string | null,  // phone number as dialed, keep + and country code if present
  "email": string | null,
  "service_type": string | null,    // one of: WEDDINGS, ENGAGEMENT_SESSION, QUINCEANERAS, MATERNITY, FAMILY, BIRTHDAY_PARTY, BAPTISMS, GRADUATION, CHILDRENS_SESSIONS, ARCHITECTURE, PORTRAITS, CORPORATE_PORTRAITS, FOOD_AND_BEVERAGE, PRODUCT_PHOTOGRAPHY, VIDEO_PRODUCTION, DRONE_AERIAL, OTHER
  "event_date": string | null,      // ISO 8601 date yyyy-mm-dd, current year is 2026
  "city": string | null,
  "country": string | null,
  "description": string | null,     // brief summary of what they want, max 200 chars
  "budget_mentioned": number | null // numeric USD value if client mentioned a budget
}`

export async function POST(req: NextRequest) {
  if (!await isAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let text: string
  try {
    const body = await req.json()
    text = typeof body.text === 'string' ? body.text.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!text || text.length < 10) {
    return NextResponse.json({ error: 'text is required (min 10 chars)' }, { status: 400 })
  }
  if (text.length > 8000) {
    return NextResponse.json({ error: 'text too long (max 8000 chars)' }, { status: 400 })
  }

  try {
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI returned no parseable JSON' }, { status: 502 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({ ok: true, data: parsed })
  } catch (err) {
    console.error('[parse-whatsapp] error:', err)
    return NextResponse.json({ error: 'AI parse failed' }, { status: 500 })
  }
}
