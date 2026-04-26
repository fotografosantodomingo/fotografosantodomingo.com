'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

export type ActionState = { error: string | null; success: boolean }

const STATUSES = ['NEW', 'REVIEWING', 'QUOTED', 'WON', 'LOST'] as const
const Status = z.enum(STATUSES)

export async function updateQuoteRequestStatus(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id) return { error: 'Missing id', success: false }
  const parsed = Status.safeParse(status)
  if (!parsed.success) return { error: 'Invalid status', success: false }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('quote_requests')
    .update({ status: parsed.data })
    .eq('id', id)
  if (error) return { error: error.message, success: false }

  revalidatePath('/admin/quote-requests')
  revalidatePath(`/admin/quote-requests/${id}`)
  return { error: null, success: true }
}

export async function updateQuoteRequestNotes(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get('id') ?? '')
  const notes = String(formData.get('admin_notes') ?? '')
  if (!id) return { error: 'Missing id', success: false }
  if (notes.length > 5000) return { error: 'Notes too long (max 5000 chars)', success: false }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('quote_requests')
    .update({ admin_notes: notes || null })
    .eq('id', id)
  if (error) return { error: error.message, success: false }

  revalidatePath(`/admin/quote-requests/${id}`)
  return { error: null, success: true }
}
