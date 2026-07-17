'use server'

import { revalidatePath } from 'next/cache'

import { isAppError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdminSession } from '@/services/auth.service'
import { removeProject, toggleProjectVisibility } from '@/services/projects.service'

export interface DashboardActionResult {
  success: boolean
  error?: string
}

/**
 * Server Action backing the per-row visibility toggle. Verifies the caller
 * is the site admin, flips `visible` via the projects service, then
 * revalidates the dashboard so the new state is reflected on next render.
 */
export async function toggleVisibleAction(
  id: string,
  currentlyVisible: boolean,
): Promise<DashboardActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    await requireAdminSession(supabase)

    await toggleProjectVisibility(supabase, id, currentlyVisible)

    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (err) {
    if (isAppError(err)) {
      return { success: false, error: err.message }
    }

    logger.error({ errorCode: 'ADMIN_PROJECT_TOGGLE_UNEXPECTED', err, projectId: id }, 'Unexpected error toggling project visibility')
    return {
      success: false,
      error: 'We could not update this project. Please try again.',
    }
  }
}

/**
 * Server Action backing the per-row delete button. Verifies the caller is
 * the site admin, deletes the project via the projects service, then
 * revalidates the dashboard.
 *
 * The confirmation prompt itself lives client-side (Server Actions can't
 * show a native `confirm()` dialog) — see `DeleteProjectButton`, which only
 * invokes this action after the admin confirms.
 */
export async function deleteProjectAction(id: string): Promise<DashboardActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    await requireAdminSession(supabase)

    await removeProject(supabase, id)

    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (err) {
    if (isAppError(err)) {
      return { success: false, error: err.message }
    }

    logger.error({ errorCode: 'ADMIN_PROJECT_DELETE_UNEXPECTED', err, projectId: id }, 'Unexpected error deleting project')
    return {
      success: false,
      error: 'We could not delete this project. Please try again.',
    }
  }
}
