'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

export type ActionState = { error: string | null; success: boolean }

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const PackageInput = z.object({
  family_id: z.string().uuid(),
  slug: z.string().regex(SLUG_RE, 'Slug must be lowercase kebab-case'),
  name_es: z.string().trim().min(1).max(200),
  name_en: z.string().trim().min(1).max(200),
  description_short_es: z.string().trim().max(500).nullable(),
  description_short_en: z.string().trim().max(500).nullable(),
  inclusions_es: z.array(z.string().trim().min(1)),
  inclusions_en: z.array(z.string().trim().min(1)),
  duration_min: z.number().int().positive(),
  starting_price_usd: z.number().nonnegative(),
  deposit_percent: z.number().int().min(0).max(100),
  photo_count: z.number().int().positive().nullable(),
  minimum_billable_hours: z.number().int().positive().nullable(),
  bookable_direct: z.boolean(),
  custom_quote_allowed: z.boolean(),
  featured: z.boolean(),
  popular_badge: z.enum(['most_booked', 'best_value']).nullable(),
  active: z.boolean(),
  sort_order: z.number().int(),
})

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

function parseForm(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k)
    return typeof v === 'string' ? v : ''
  }
  const num = (k: string, fallback: number | null = null): number | null => {
    const raw = get(k)
    if (!raw.trim()) return fallback
    const n = Number(raw)
    return Number.isFinite(n) ? n : fallback
  }
  const numReq = (k: string, d = 0) => {
    const n = Number(get(k))
    return Number.isFinite(n) ? n : d
  }
  const badge = get('popular_badge').trim()
  return {
    family_id: get('family_id'),
    slug: get('slug').trim(),
    name_es: get('name_es'),
    name_en: get('name_en'),
    description_short_es: get('description_short_es') || null,
    description_short_en: get('description_short_en') || null,
    inclusions_es: splitLines(get('inclusions_es')),
    inclusions_en: splitLines(get('inclusions_en')),
    duration_min: numReq('duration_min', 60),
    starting_price_usd: numReq('starting_price_usd', 0),
    deposit_percent: numReq('deposit_percent', 50),
    photo_count: num('photo_count', null),
    minimum_billable_hours: num('minimum_billable_hours', null),
    bookable_direct: formData.get('bookable_direct') === 'on',
    custom_quote_allowed: formData.get('custom_quote_allowed') === 'on',
    featured: formData.get('featured') === 'on',
    popular_badge: badge === '' ? null : badge,
    active: formData.get('active') === 'on',
    sort_order: numReq('sort_order', 0),
  }
}

export async function createPackage(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = PackageInput.safeParse(parseForm(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input', success: false }
  }
  if (parsed.data.inclusions_es.length !== parsed.data.inclusions_en.length) {
    return { error: 'Inclusions ES and EN must have the same number of lines', success: false }
  }
  const supabase = createServiceClient()
  const { error } = await supabase.from('service_packages').insert(parsed.data)
  if (error) return { error: error.message, success: false }
  revalidatePath('/admin/packages')
  return { error: null, success: true }
}

export async function updatePackage(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Missing id', success: false }
  const parsed = PackageInput.safeParse(parseForm(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input', success: false }
  }
  if (parsed.data.inclusions_es.length !== parsed.data.inclusions_en.length) {
    return { error: 'Inclusions ES and EN must have the same number of lines', success: false }
  }
  const supabase = createServiceClient()
  const { error } = await supabase.from('service_packages').update(parsed.data).eq('id', id)
  if (error) return { error: error.message, success: false }
  revalidatePath('/admin/packages')
  return { error: null, success: true }
}

export async function togglePackageFlag(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get('id') ?? '')
  const field = String(formData.get('field') ?? '')
  const value = String(formData.get('value') ?? '') === 'true'
  if (!id || !['active', 'bookable_direct', 'custom_quote_allowed', 'featured'].includes(field)) {
    return { error: 'Invalid request', success: false }
  }
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('service_packages')
    .update({ [field]: value })
    .eq('id', id)
  if (error) return { error: error.message, success: false }
  revalidatePath('/admin/packages')
  return { error: null, success: true }
}
