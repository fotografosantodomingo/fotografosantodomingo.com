import { type NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin-auth'

export const runtime = 'edge'

export async function POST(_request: NextRequest) {
  const supabase = createAdminSupabaseClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/admin/login', _request.url))
}
