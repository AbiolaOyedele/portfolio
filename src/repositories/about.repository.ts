import type { SupabaseClient } from '@supabase/supabase-js'

import type { About, AboutInput } from '@/types/about'

/**
 * All Supabase queries for the single-row `about` table live here, and
 * nowhere else. Thin pass-through only — no fallback data, no business
 * logic, no try/catch. Postgrest errors bubble up raw to the service layer.
 */

export async function findAbout(client: SupabaseClient): Promise<About | null> {
  const { data, error } = await client.schema('portfolio').from('about').select('*').limit(1).maybeSingle()
  if (error) throw error
  return (data ?? null) as About | null
}

export async function upsertAbout(
  client: SupabaseClient,
  data: AboutInput,
  existingId: string | null,
): Promise<About> {
  if (existingId) {
    const { data: updated, error } = await client
      .schema('portfolio')
      .from('about')
      .update(data)
      .eq('id', existingId)
      .select('*')
      .single()
    if (error) throw error
    return updated as About
  }

  const { data: inserted, error } = await client.schema('portfolio').from('about').insert(data).select('*').single()
  if (error) throw error
  return inserted as About
}
