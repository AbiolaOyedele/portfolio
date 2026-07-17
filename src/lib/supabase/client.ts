import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/config/env'

/**
 * Creates a Supabase client for use in 'use client' components that need
 * live auth state (e.g. onAuthStateChange listeners).
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
