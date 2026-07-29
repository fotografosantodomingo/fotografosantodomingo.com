/**
 * Supabase server client for admin server components and server actions.
 * Uses full cookie get/set/remove so Supabase can refresh sessions.
 *
 * ONLY use in admin server components and server actions — never in API routes
 * (use createServiceClient() there instead).
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export function createAdminSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

/**
 * Session check for API route handlers (read-only cookies via NextRequest —
 * see the docstring above for why this is separate from createAdminSupabaseClient).
 * Matches the inline pattern already used in /api/admin/quotes/create-draft.
 */
export async function isAdminSession(req: NextRequest): Promise<boolean> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => req.cookies.get(name)?.value, set: () => {}, remove: () => {} } }
  )
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return false
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', session.user.id).single()
  return !!data
}
