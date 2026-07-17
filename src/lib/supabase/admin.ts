import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/config/env'
import { AppError } from '@/lib/errors'

/**
 * Returns a service-role Supabase client that bypasses RLS.
 *
 * Scaffold for future use — nothing calls this yet. `SUPABASE_SERVICE_ROLE_KEY`
 * is optional in `src/config/env.ts` because the real key has not been
 * provisioned yet; this throws a clear `AppError` until it is.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError(
      500,
      'Service role key is not configured.',
      'CONFIG_SUPABASE_ADMIN_KEY_MISSING'
    )
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
