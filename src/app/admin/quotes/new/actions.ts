'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin-auth'
import { createServiceClient } from '@/lib/supabase/service'
import { getChecklistTemplate } from '@/lib/quotes/checklist'
import OpenAI from 'openai'

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<{ userId: string } | null> {
  const supabase = createAdminSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single()
  return data ? { userId: user.id } : null
}

// ─── Parse WhatsApp ───────────────────────────────────────────────────────────

export type ParsedQuoteData = {
  full_name: string | null
  whatsapp_phone: string | null
  email: string | null
  service_type: string | null
  event_date: string | null
  city: string | null
  country: string | null
  description: string | null
  budget_mentioned: number | null
}

export type ParseResult =
  | { ok: true; data: ParsedQuoteData }
  | { ok: false; error: string }

const SYSTEM_PROMPT = `You extract structured quote data from raw WhatsApp conversation snippets between a photographer and a potential client.

Return ONLY valid JSON matching this schema (use null for any field you cannot confidently extract):
{
  "full_name": string | null,
  "whatsapp_phone": string | null,
  "email": string | null,
  "service_type": string | null,
  "event_date": string | null,
  "city": string | null,
  "country": string | null,
  "description": string | null,
  "budget_mentioned": number | null
}

service_type must be one of: WEDDINGS, ENGAGEMENT_SESSION, QUINCEANERAS, MATERNITY, FAMILY, BIRTHDAY_PARTY, BAPTISMS, GRADUATION, CHILDRENS_SESSIONS, ARCHITECTURE, PORTRAITS, CORPORATE_PORTRAITS, FOOD_AND_BEVERAGE, VIDEO_PRODUCTION, DRONE_AERIAL, OTHER
event_date must be ISO 8601 yyyy-mm-dd format. Current year is 2026.`

export async function parseWhatsAppAction(text: string): Promise<ParseResult> {
  if (!await requireAdmin()) return { ok: false, error: 'Unauthorized' }

  if (!text || text.trim().length < 10) return { ok: false, error: 'Text too short' }
  if (text.length > 8000) return { ok: false, error: 'Text too long (max 8000 chars)' }

  const apiKey = process.env.OPEN_AI_QUOTE
  if (!apiKey) return { ok: false, error: 'OpenAI API key not configured' }

  try {
    const client = new OpenAI({ apiKey })
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text.trim() },
      ],
    })
    const raw = completion.choices[0]?.message?.content ?? ''
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return { ok: false, error: 'AI returned no parseable JSON' }
    const parsed = JSON.parse(match[0]) as ParsedQuoteData
    return { ok: true, data: parsed }
  } catch (err) {
    console.error('[parseWhatsAppAction]', err)
    return { ok: false, error: 'AI parse failed' }
  }
}

// ─── Create Draft ─────────────────────────────────────────────────────────────

export type CreateDraftInput = {
  full_name: string | null
  whatsapp_phone: string | null
  email: string | null
  client_company: string | null
  service_type: string | null
  event_date: string | null
  city: string | null
  country: string | null
  description: string | null
  whatsapp_raw_text: string | null
  locale: 'es' | 'en'
}

export type CreateDraftResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

export async function createDraftAction(input: CreateDraftInput): Promise<CreateDraftResult> {
  if (!await requireAdmin()) return { ok: false, error: 'Unauthorized' }

  const scoping_checklist = getChecklistTemplate(input.service_type)

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('quotes')
    .insert({
      status: 'DRAFT',
      locale: input.locale,
      full_name: input.full_name,
      whatsapp_phone: input.whatsapp_phone,
      email: input.email,
      service_type: input.service_type,
      event_date: input.event_date,
      city: input.city,
      country: input.country,
      description: input.description,
      whatsapp_raw_text: input.whatsapp_raw_text,
      client_company: input.client_company,
      scoping_checklist,
      payment_mode: 'FULL',
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[createDraftAction]', error)
    return { ok: false, error: 'Failed to create draft' }
  }

  return { ok: true, id: data.id }
}
