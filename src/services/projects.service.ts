import type { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { placeholderProjects } from '@/lib/placeholder'
import * as projectsRepository from '@/repositories/projects.repository'
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type Project,
  type ProjectCategory,
  type UpdateProjectInput,
  type VoteResult,
  type VoteType,
} from '@/types/project'

export interface PublicProjectsParams {
  category?: ProjectCategory | undefined
  subcategory?: string | undefined
}

/**
 * Public project listing. Falls back to placeholder data (filtered by the
 * same category/subcategory) when Supabase returns an empty result, exactly
 * matching the old `useProjects` hook's fallback behavior.
 */
export async function getPublicProjects(
  client: SupabaseClient,
  params: PublicProjectsParams = {},
): Promise<Project[]> {
  let rows: Project[]
  try {
    rows = await projectsRepository.findProjects(client, {
      category: params.category,
      subcategory: params.subcategory,
      visibleOnly: true,
    })
  } catch (err) {
    logger.error({ errorCode: 'DB_QUERY_PROJECTS_FAILED', err }, 'Failed to load public projects')
    throw new AppError(500, 'We could not load projects right now. Please try again shortly.', 'DB_QUERY_PROJECTS_FAILED', err)
  }

  if (rows.length > 0) return rows

  let fallback = placeholderProjects.filter((p) => p.visible)
  if (params.category) fallback = fallback.filter((p) => p.category === params.category)
  if (params.subcategory) fallback = fallback.filter((p) => p.subcategory === params.subcategory)
  return fallback
}

/**
 * Public single-project lookup by slug. Falls back to placeholder data when
 * the real row isn't found. Returns `null` only when neither Supabase nor
 * the placeholder set has a matching slug — the caller should call
 * `notFound()` in that case.
 */
export async function getProjectBySlug(client: SupabaseClient, slug: string): Promise<Project | null> {
  let project: Project | null
  try {
    project = await projectsRepository.findProjectBySlug(client, slug)
  } catch (err) {
    logger.error({ errorCode: 'DB_QUERY_PROJECT_FAILED', err, slug }, 'Failed to load project by slug')
    throw new AppError(500, 'We could not load this project right now. Please try again shortly.', 'DB_QUERY_PROJECT_FAILED', err)
  }

  if (project) return project

  return placeholderProjects.find((p) => p.slug === slug) ?? null
}

/**
 * Admin project listing — NO placeholder fallback. The admin must only ever
 * see real data so they never mistake placeholder content for a real row.
 */
export async function getAllProjectsForAdmin(client: SupabaseClient): Promise<Project[]> {
  try {
    return await projectsRepository.findAllProjectsForAdmin(client)
  } catch (err) {
    logger.error({ errorCode: 'DB_QUERY_PROJECTS_ADMIN_FAILED', err }, 'Failed to load admin project list')
    throw new AppError(500, 'We could not load your projects right now. Please try again shortly.', 'DB_QUERY_PROJECTS_ADMIN_FAILED', err)
  }
}

/**
 * Admin single-project lookup by id — NO placeholder fallback, mirroring
 * `getAllProjectsForAdmin`. Returns `null` when no row matches so the caller
 * can call `notFound()`.
 */
export async function getProjectForAdmin(client: SupabaseClient, id: string): Promise<Project | null> {
  try {
    return await projectsRepository.findProjectById(client, id)
  } catch (err) {
    logger.error({ errorCode: 'DB_QUERY_PROJECT_ADMIN_FAILED', err, projectId: id }, 'Failed to load project for admin')
    throw new AppError(500, 'We could not load this project right now. Please try again shortly.', 'DB_QUERY_PROJECT_ADMIN_FAILED', err)
  }
}

export async function createProject(client: SupabaseClient, input: CreateProjectInput): Promise<Project> {
  const parsed = createProjectSchema.parse(input)
  try {
    return await projectsRepository.insertProject(client, parsed)
  } catch (err) {
    logger.error({ errorCode: 'DB_INSERT_PROJECT_FAILED', err }, 'Failed to create project')
    throw new AppError(500, 'We could not save this project. Please try again.', 'DB_INSERT_PROJECT_FAILED', err)
  }
}

export async function updateExistingProject(
  client: SupabaseClient,
  id: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const parsed = updateProjectSchema.parse({ ...input, id })
  const data: Partial<UpdateProjectInput> = { ...parsed }
  delete data.id
  try {
    return await projectsRepository.updateProject(client, id, data)
  } catch (err) {
    logger.error({ errorCode: 'DB_UPDATE_PROJECT_FAILED', err, projectId: id }, 'Failed to update project')
    throw new AppError(500, 'We could not save your changes. Please try again.', 'DB_UPDATE_PROJECT_FAILED', err)
  }
}

export async function toggleProjectVisibility(
  client: SupabaseClient,
  id: string,
  currentlyVisible: boolean,
): Promise<Project> {
  try {
    return await projectsRepository.updateProject(client, id, { visible: !currentlyVisible })
  } catch (err) {
    logger.error(
      { errorCode: 'DB_UPDATE_PROJECT_VISIBILITY_FAILED', err, projectId: id },
      'Failed to toggle project visibility',
    )
    throw new AppError(
      500,
      'We could not update this project. Please try again.',
      'DB_UPDATE_PROJECT_VISIBILITY_FAILED',
      err,
    )
  }
}

export async function removeProject(client: SupabaseClient, id: string): Promise<void> {
  try {
    await projectsRepository.deleteProject(client, id)
  } catch (err) {
    logger.error({ errorCode: 'DB_DELETE_PROJECT_FAILED', err, projectId: id }, 'Failed to delete project')
    throw new AppError(500, 'We could not delete this project. Please try again.', 'DB_DELETE_PROJECT_FAILED', err)
  }
}

/**
 * Records a like/dislike vote on a project. Public — no admin session
 * required, unlike every other mutation in this file. Returns the fresh
 * counts from the same atomic statement that wrote them, so callers can
 * update their UI directly instead of re-fetching.
 */
export async function voteOnProject(
  client: SupabaseClient,
  projectId: string,
  voteType: VoteType,
): Promise<VoteResult> {
  try {
    return await projectsRepository.incrementProjectVote(client, projectId, voteType)
  } catch (err) {
    logger.error({ errorCode: 'DB_VOTE_PROJECT_FAILED', err, projectId, voteType }, 'Failed to record project vote')
    throw new AppError(500, 'We could not record your vote. Please try again.', 'DB_VOTE_PROJECT_FAILED', err)
  }
}
