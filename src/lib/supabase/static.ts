import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/config/env'

/**
 * Creates a plain Supabase client (anon key, no cookie adapter) for use
 * outside a request scope — e.g. `generateStaticParams`, which runs at
 * build time and cannot call `next/headers` `cookies()`.
 *
 * Only safe for public, RLS-visible data with no per-user session context.
 * For Server Components, Server Actions, and Route Handlers that need the
 * signed-in user's session, use `createServerSupabaseClient` instead.
 */
export function createStaticSupabaseClient(): SupabaseClient {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
