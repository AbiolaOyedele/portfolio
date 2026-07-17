'use server'

import { redirect } from 'next/navigation'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAppError } from '@/lib/errors'
import { login } from '@/services/auth.service'

export interface LoginActionError {
  code: string
  message: string
}

export interface LoginActionResult {
  success: boolean
  error?: LoginActionError
}

/**
 * Server Action backing the admin login form. Extracts credentials from the
 * submitted FormData, delegates to the auth service, and either redirects to
 * the dashboard on success or returns a plain-English error for the form to
 * render.
 */
export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  const email = formData.get('email')
  const password = formData.get('password')

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return {
      success: false,
      error: {
        code: 'AUTH_LOGIN_MISSING_FIELDS',
        message: 'Please enter both your email and password.',
      },
    }
  }

  try {
    const supabase = await createServerSupabaseClient()
    await login(supabase, { email, password })
  } catch (err) {
    if (isAppError(err)) {
      return { success: false, error: { code: err.code, message: err.message } }
    }

    return {
      success: false,
      error: {
        code: 'AUTH_LOGIN_UNKNOWN_ERROR',
        message: 'We could not sign you in. Please try again.',
      },
    }
  }

  redirect('/admin/dashboard')
}
