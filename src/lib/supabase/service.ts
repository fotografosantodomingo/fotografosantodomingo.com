/**
 * Supabase service client — no cookie dependency.
 *
 * Use this in API routes and webhook handlers where there is no browser
 * session. Uses SUPABASE_SERVICE_ROLE_KEY when available (bypasses RLS),
 * otherwise falls back to the public anon key.
 *
 * NEVER import this from a client component.
 */

import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY
            ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
