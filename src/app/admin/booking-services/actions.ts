'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

export type ActionState = { error: string | null; success: boolean }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const VALID_CATEGORIES = ['celebrations', 'portraits', 'commercial', 'specialty']

function parseFields(formData: FormData) {
  const slug = String(formData.get('slug') ?? '').trim()
  const nameEs = String(formData.get('nameEs') ?? '').trim()
  const nameEn = String(formData.get('nameEn') ?? '').trim()
  const descEs = String(formData.get('descriptionEs') ?? '').trim() || null
  const descEn = String(formData.get('descriptionEn') ?? '').trim() || null
  const icon = String(formData.get('icon') ?? '').trim() || '📷'
  const category = String(formData.get('category') ?? '').trim()
  const durationMin = Number(formData.get('durationMin'))
  const priceUsd = Number(formData.get('priceUsd'))
  const depositPercent = Number(formData.get('depositPercent'))
  const sortOrder = Number(formData.get('sortOrder'))
  const bookable = formData.get('bookable') === 'on'
  const active = formData.get('active') === 'on'

  return {
    slug, nameEs, nameEn, descEs, descEn, icon, category,
    durationMin, priceUsd, depositPercent, sortOrder, bookable, active,
  }
}

function validate(f: ReturnType<typeof parseFields>): string | null {
  if (!SLUG_RE.test(f.slug)) return 'Slug must be lowercase, numbers, hyphens (e.g. wedding-photo)'
  if (!f.nameEs || !f.nameEn) return 'Both Spanish and English names are required'
  if (!VALID_CATEGORIES.includes(f.category)) return 'Invalid category'
  if (!Number.isInteger(f.durationMin) || f.durationMin <= 0 || f.durationMin > 600) {
    return 'Duration must be 1–600 minutes'
  }
  if (!Number.isFinite(f.priceUsd) || f.priceUsd < 0) return 'Price must be a non-negative number'
  if (!Number.isInteger(f.depositPercent) || f.depositPercent < 0 || f.depositPercent > 100) {
    return 'Deposit percent must be 0–100'
  }
  return null
}

// ─── Create / update ─────────────────────────────────────────────────────────

export async function createService(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const f = parseFields(formData)
  const err = validate(f)
  if (err) return { error: err, success: false }

  const supabase = createServiceClient()
  const { error } = await supabase.from('booking_services').insert({
    slug: f.slug,
    name_es: f.nameEs,
    name_en: f.nameEn,
    description_es: f.descEs,
    description_en: f.descEn,
    icon: f.icon,
    category: f.category,
    duration_min: f.durationMin,
    price_usd: f.priceUsd,
    deposit_percent: f.depositPercent,
    sort_order: f.sortOrder || 0,
    bookable: f.bookable,
    active: f.active,
  })

  if (error) return { error: error.message, success: false }

  revalidatePath('/admin/booking-services')
  revalidatePath('/[locale]/prices', 'page')
  return { error: null, success: true }
}

export async function updateService(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get('id') ?? '')
  if (!UUID_RE.test(id)) return { error: 'Invalid id', success: false }

  const f = parseFields(formData)
  const err = validate(f)
  if (err) return { error: err, success: false }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('booking_services')
    .update({
      slug: f.slug,
      name_es: f.nameEs,
      name_en: f.nameEn,
      description_es: f.descEs,
      description_en: f.descEn,
      icon: f.icon,
      category: f.category,
      duration_min: f.durationMin,
      price_usd: f.priceUsd,
      deposit_percent: f.depositPercent,
      sort_order: f.sortOrder || 0,
      bookable: f.bookable,
      active: f.active,
    })
    .eq('id', id)

  if (error) return { error: error.message, success: false }

  revalidatePath('/admin/booking-services')
  revalidatePath('/[locale]/prices', 'page')
  return { error: null, success: true }
}

// ─── Quick toggle (active / bookable) ────────────────────────────────────────

export async function toggleServiceFlag(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get('id') ?? '')
  const field = String(formData.get('field') ?? '')
  const value = formData.get('value') === 'true'

  if (!UUID_RE.test(id)) return { error: 'Invalid id', success: false }
  if (field !== 'active' && field !== 'bookable') {
    return { error: 'Invalid field', success: false }
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('booking_services')
    .update({ [field]: value })
    .eq('id', id)

  if (error) return { error: error.message, success: false }

  revalidatePath('/admin/booking-services')
  revalidatePath('/[locale]/prices', 'page')
  return { error: null, success: true }
}
