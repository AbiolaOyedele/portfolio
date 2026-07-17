'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { isAppError } from '@/lib/errors'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdminSession } from '@/services/auth.service'
import { createProject, updateExistingProject } from '@/services/projects.service'
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '@/types/project'

export interface ProjectActionError {
  code: string
  message: string
}

export interface ProjectActionResult {
  success: boolean
  error?: ProjectActionError
}

/**
 * Server Action backing project creation. Takes a plain typed object rather
 * than `FormData` since `images`/`tags` are arrays that don't serialize
 * cleanly through native form submission (plan §6.2).
 *
 * Verifies the caller is the admin, validates the input against
 * `createProjectSchema`, creates the row, revalidates the dashboard, and
 * redirects to the new project's edit page.
 */
export async function createProjectAction(input: CreateProjectInput): Promise<ProjectActionResult> {
  let projectId: string
  try {
    const supabase = await createServerSupabaseClient()
    await requireAdminSession(supabase)

    const parsed = createProjectSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_PROJECT_INVALID',
          message: parsed.error.issues[0]?.message ?? 'Invalid input.',
        },
      }
    }

    const project = await createProject(supabase, parsed.data)
    projectId = project.id
  } catch (err) {
    if (isAppError(err)) {
      return { success: false, error: { code: err.code, message: err.message } }
    }

    return {
      success: false,
      error: {
        code: 'PROJECT_CREATE_UNKNOWN_ERROR',
        message: 'We could not save this project. Please try again.',
      },
    }
  }

  revalidatePath('/admin/dashboard')
  redirect(`/admin/projects/${projectId}`)
}

/**
 * Server Action backing project updates. Same plain-object signature as
 * `createProjectAction`, for the same reason.
 *
 * Verifies the caller is the admin, validates the input against
 * `updateProjectSchema`, updates the row, and revalidates the dashboard.
 */
export async function updateProjectAction(
  id: string,
  input: UpdateProjectInput,
): Promise<ProjectActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    await requireAdminSession(supabase)

    const parsed = updateProjectSchema.safeParse({ ...input, id })
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_PROJECT_INVALID',
          message: parsed.error.issues[0]?.message ?? 'Invalid input.',
        },
      }
    }

    await updateExistingProject(supabase, id, parsed.data)
  } catch (err) {
    if (isAppError(err)) {
      return { success: false, error: { code: err.code, message: err.message } }
    }

    return {
      success: false,
      error: {
        code: 'PROJECT_UPDATE_UNKNOWN_ERROR',
        message: 'We could not save your changes. Please try again.',
      },
    }
  }

  revalidatePath('/admin/dashboard')
  return { success: true }
}
