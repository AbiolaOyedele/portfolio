'use server'

import { redirect } from 'next/navigation'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { isAppError } from '@/lib/errors'
import { logout } from '@/services/auth.service'

export interface LogoutActionResult {
  success: boolean
  error?: string
}

/**
 * Server Action backing the admin nav's logout button. Signs the current
 * admin out via the auth service, then redirects to the login screen.
 *
 * Redirects even if `logout` throws — an admin clicking "Logout" should
 * always land back on the login page, and a failed server-side sign-out
 * still lets the login page's own session check take over from there.
 */
export async function logoutAction(): Promise<LogoutActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    await logout(supabase)
  } catch (err) {
    if (isAppError(err)) {
      logger.error({ errorCode: err.code, err }, 'Admin logout action failed')
    } else {
      logger.error({ errorCode: 'AUTH_LOGOUT_UNKNOWN_ERROR', err }, 'Unexpected error during admin logout')
    }
  }

  redirect('/admin/login')
}
