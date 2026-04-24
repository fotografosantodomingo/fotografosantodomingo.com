'use server'

import { redirect } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase/admin-auth'

export async function signIn(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  const next = (formData.get('next') as string | null) ?? '/admin/quotes'

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  redirect(next.startsWith('/admin') ? next : '/admin/quotes')
}

export async function signOut(): Promise<void> {
  const supabase = createAdminSupabaseClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
