'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { isAppError } from '@/lib/errors'
import { requireAdminSession } from '@/services/auth.service'
import { saveAbout } from '@/services/about.service'
import { aboutSchema, type AboutInput } from '@/types/about'

export interface SaveAboutResult {
  success: boolean
  error?: string
}

/**
 * Server Action for the admin about form. Takes a typed object rather than
 * `FormData` because `tools` and `clients` are arrays — the same reasoning
 * as the project form.
 *
 * Revalidates both `/admin/about` (so the admin sees its own save reflected)
 * and the public `/about` page (since the about data it reads just changed).
 */
export async function saveAboutAction(
  input: AboutInput,
  existingId: string | null
): Promise<SaveAboutResult> {
  const supabase = await createServerSupabaseClient()

  try {
    await requireAdminSession(supabase)

    const parsed = aboutSchema.safeParse(input)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? 'Please check the form for errors.',
      }
    }

    await saveAbout(supabase, parsed.data, existingId)

    revalidatePath('/admin/about')
    revalidatePath('/about')

    return { success: true }
  } catch (err) {
    if (isAppError(err)) {
      return { success: false, error: err.message }
    }

    logger.error({ errorCode: 'ADMIN_ABOUT_SAVE_UNEXPECTED', err }, 'Unexpected error saving about page')
    return {
      success: false,
      error: 'Something went wrong while saving. Please try again.',
    }
  }
}
