'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

export type ActionState = { error: string | null; success: boolean }

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const FamilyInput = z.object({
  slug: z.string().regex(SLUG_RE, 'Slug must be lowercase kebab-case'),
  title_es: z.string().trim().min(1).max(200),
  title_en: z.string().trim().min(1).max(200),
  tagline_es: z.string().trim().max(500).optional().nullable(),
  tagline_en: z.string().trim().max(500).optional().nullable(),
  icon: z.string().trim().min(1).max(8),
  seo_parent_url: z.string().trim().min(1).max(200),
  bookable: z.boolean(),
  quoteable: z.boolean(),
  active: z.boolean(),
  sort_order: z.number().int(),
})

function parseForm(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k)
    return typeof v === 'string' ? v : ''
  }
  const num = (k: string, d = 0) => {
    const n = Number(get(k))
    return Number.isFinite(n) ? n : d
  }
  return {
    slug: get('slug').trim(),
    title_es: get('title_es'),
    title_en: get('title_en'),
    tagline_es: get('tagline_es') || null,
    tagline_en: get('tagline_en') || null,
    icon: get('icon') || '📷',
    seo_parent_url: get('seo_parent_url'),
    bookable: formData.get('bookable') === 'on',
    quoteable: formData.get('quoteable') === 'on',
    active: formData.get('active') === 'on',
    sort_order: num('sort_order', 0),
  }
}

export async function createFamily(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = FamilyInput.safeParse(parseForm(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input', success: false }
  }
  const supabase = createServiceClient()
  const { error } = await supabase.from('service_families').insert(parsed.data)
  if (error) return { error: error.message, success: false }
  revalidatePath('/admin/families')
  return { error: null, success: true }
}

export async function updateFamily(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Missing id', success: false }
  const parsed = FamilyInput.safeParse(parseForm(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input', success: false }
  }
  const supabase = createServiceClient()
  const { error } = await supabase.from('service_families').update(parsed.data).eq('id', id)
  if (error) return { error: error.message, success: false }
  revalidatePath('/admin/families')
  return { error: null, success: true }
}

export async function toggleFamilyFlag(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get('id') ?? '')
  const field = String(formData.get('field') ?? '')
  const value = String(formData.get('value') ?? '') === 'true'
  if (!id || !['active', 'bookable', 'quoteable'].includes(field)) {
    return { error: 'Invalid request', success: false }
  }
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('service_families')
    .update({ [field]: value })
    .eq('id', id)
  if (error) return { error: error.message, success: false }
  revalidatePath('/admin/families')
  return { error: null, success: true }
}
