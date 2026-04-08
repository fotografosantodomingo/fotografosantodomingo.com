/**
 * Supabase service client — no cookie dependency.
 *
 * Use this in API routes and webhook handlers where there is no browser
 * session. Requires SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
 *
 * NEVER import this from a client component.
 */

import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for createServiceClient()')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
