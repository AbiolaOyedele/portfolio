import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/config/env'

/**
 * Creates a Supabase client bound to the current request's cookies, for use
 * in Server Components, Server Actions, and Route Handlers.
 *
 * Must be called fresh on every request — never cache or share the instance.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component render — middleware handles
          // session refresh in that case, so this is a safe no-op.
        }
      },
    },
  })
}
