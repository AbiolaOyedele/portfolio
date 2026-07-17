import type { SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/config/env'
import { AppError } from '@/lib/errors'
import { logger } from '@/lib/logger'

export interface LoginInput {
  email: string
  password: string
}

export interface AdminSession {
  userId: string
  email: string
}

/**
 * Logs in with email/password. Any Supabase auth error (wrong password,
 * unknown user, etc.) is translated into a single generic AppError so we
 * never leak Supabase's raw error message or confirm/deny account existence.
 */
export async function login(client: SupabaseClient, input: LoginInput): Promise<void> {
  const { error } = await client.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })

  if (error) {
    logger.error({ errorCode: 'AUTH_LOGIN_INVALID_CREDENTIALS', err: error }, 'Admin login failed')
    throw new AppError(401, 'Incorrect email or password.', 'AUTH_LOGIN_INVALID_CREDENTIALS')
  }
}

export async function logout(client: SupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut()
  if (error) {
    logger.error({ errorCode: 'AUTH_LOGOUT_FAILED', err: error }, 'Admin logout failed')
    throw new AppError(500, 'We could not sign you out. Please try again.', 'AUTH_LOGOUT_FAILED', error)
  }
}

/**
 * Verifies the current session belongs to the site owner. Defense in depth
 * alongside RLS's `is_portfolio_admin()` check — RLS failures surface as
 * generic Postgrest errors, this gives callers a proper plain-English
 * AppError before ever touching the database.
 */
export async function requireAdminSession(client: SupabaseClient): Promise<AdminSession> {
  const { data, error } = await client.auth.getUser()

  if (error || !data.user || data.user.email !== env.ADMIN_EMAIL) {
    logger.error(
      { errorCode: 'AUTH_FORBIDDEN_NOT_ADMIN', err: error, userId: data?.user?.id },
      'Admin session check failed',
    )
    throw new AppError(403, 'You do not have permission to do this.', 'AUTH_FORBIDDEN_NOT_ADMIN')
  }

  return { userId: data.user.id, email: data.user.email }
}
