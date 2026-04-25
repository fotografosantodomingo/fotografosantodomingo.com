'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

export type ActionState = { error: string | null; success: boolean }

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ─── Weekly rules ────────────────────────────────────────────────────────────

export async function upsertWeeklyRule(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const staffId = String(formData.get('staffId') ?? '')
  const dayOfWeek = Number(formData.get('dayOfWeek'))
  const startTime = String(formData.get('startTime') ?? '')
  const endTime = String(formData.get('endTime') ?? '')
  const active = formData.get('active') === 'on'

  if (!UUID_RE.test(staffId)) return { error: 'Invalid staff id', success: false }
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return { error: 'Invalid day of week', success: false }
  }
  if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    return { error: 'Times must be HH:MM (24h)', success: false }
  }
  if (startTime >= endTime) {
    return { error: 'Start time must be before end time', success: false }
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('availability_rules')
    .upsert(
      {
        staff_id: staffId,
        day_of_week: dayOfWeek,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        active,
      },
      { onConflict: 'staff_id,day_of_week' }
    )

  if (error) return { error: error.message, success: false }

  revalidatePath('/admin/availability')
  return { error: null, success: true }
}

// ─── Date overrides ──────────────────────────────────────────────────────────

export async function addDateOverride(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const staffId = String(formData.get('staffId') ?? '')
  const date = String(formData.get('date') ?? '')
  const mode = String(formData.get('mode') ?? '') // 'block' or 'custom'
  const customStart = String(formData.get('customStart') ?? '')
  const customEnd = String(formData.get('customEnd') ?? '')
  const note = String(formData.get('note') ?? '').trim() || null

  if (!UUID_RE.test(staffId)) return { error: 'Invalid staff id', success: false }
  if (!DATE_RE.test(date)) return { error: 'Date must be YYYY-MM-DD', success: false }

  const isBlocked = mode === 'block'
  let payload: Record<string, unknown> = {
    staff_id: staffId,
    override_date: date,
    is_blocked: isBlocked,
    note,
  }

  if (!isBlocked) {
    if (!TIME_RE.test(customStart) || !TIME_RE.test(customEnd)) {
      return { error: 'Custom hours must be HH:MM (24h)', success: false }
    }
    if (customStart >= customEnd) {
      return { error: 'Start time must be before end time', success: false }
    }
    payload = {
      ...payload,
      custom_start: `${customStart}:00`,
      custom_end: `${customEnd}:00`,
    }
  } else {
    payload = { ...payload, custom_start: null, custom_end: null }
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('availability_overrides')
    .upsert(payload, { onConflict: 'staff_id,override_date' })

  if (error) return { error: error.message, success: false }

  revalidatePath('/admin/availability')
  return { error: null, success: true }
}

export async function deleteDateOverride(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const overrideId = String(formData.get('overrideId') ?? '')
  if (!UUID_RE.test(overrideId)) return { error: 'Invalid override id', success: false }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('availability_overrides')
    .delete()
    .eq('id', overrideId)

  if (error) return { error: error.message, success: false }
  revalidatePath('/admin/availability')
  return { error: null, success: true }
}
