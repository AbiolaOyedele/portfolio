import type { SupabaseClient } from '@supabase/supabase-js'

import type { CreateProjectInput, Project, ProjectCategory, UpdateProjectInput, VoteResult, VoteType } from '@/types/project'

/**
 * All Supabase queries for the `projects` table live here, and nowhere else.
 * Thin pass-through only — no fallback data, no business logic, no try/catch.
 * Postgrest errors bubble up raw to the calling service layer.
 */

export interface ProjectFilters {
  category?: ProjectCategory | undefined
  subcategory?: string | undefined
  visibleOnly?: boolean | undefined
}

export async function findProjects(
  client: SupabaseClient,
  filters: ProjectFilters = {},
): Promise<Project[]> {
  let query = client.schema('portfolio').from('projects').select('*').order('sort_order', { ascending: true })

  if (filters.visibleOnly) {
    query = query.eq('visible', true)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.subcategory) {
    query = query.eq('subcategory', filters.subcategory)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function findProjectBySlug(client: SupabaseClient, slug: string): Promise<Project | null> {
  const { data, error } = await client.schema('portfolio').from('projects').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return (data ?? null) as Project | null
}

export async function findProjectById(client: SupabaseClient, id: string): Promise<Project | null> {
  const { data, error } = await client.schema('portfolio').from('projects').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data ?? null) as Project | null
}

export async function findAllProjectsForAdmin(client: SupabaseClient): Promise<Project[]> {
  const { data, error } = await client
    .schema('portfolio')
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function insertProject(
  client: SupabaseClient,
  data: CreateProjectInput,
): Promise<Project> {
  const { data: inserted, error } = await client.schema('portfolio').from('projects').insert(data).select('*').single()
  if (error) throw error
  return inserted as Project
}

export async function updateProject(
  client: SupabaseClient,
  id: string,
  data: Partial<UpdateProjectInput>,
): Promise<Project> {
  const { data: updated, error } = await client
    .schema('portfolio')
    .from('projects')
    .update(data)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return updated as Project
}

export async function deleteProject(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.schema('portfolio').from('projects').delete().eq('id', id)
  if (error) throw error
}

/**
 * Atomically increments a project's like or dislike counter via the
 * `increment_project_vote` RPC (see supabase/schema.sql) — a raw table
 * UPDATE isn't used here because it can't express "increment by exactly 1"
 * without a lost-update race between concurrent votes, and a public UPDATE
 * grant/RLS policy can't be scoped to just these two columns. `.single()`
 * both unwraps the one-row `returns table(...)` response and surfaces a
 * clean error if the function raised an exception (e.g. project not found).
 */
export async function incrementProjectVote(
  client: SupabaseClient,
  projectId: string,
  voteType: VoteType,
): Promise<VoteResult> {
  const { data, error } = await client
    .schema('portfolio')
    .rpc('increment_project_vote', { project_id: projectId, vote_type: voteType })
    .single()
  if (error) throw error
  const row = data as { new_likes: number; new_dislikes: number }
  return { likes: row.new_likes, dislikes: row.new_dislikes }
}
