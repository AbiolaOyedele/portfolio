'use client'

import { useActionState } from 'react'

import { loginAction, type LoginActionResult } from './actions'

const initialState: LoginActionResult = { success: false }

/**
 * Admin login page. Submits credentials via the `loginAction` Server Action,
 * which redirects to the dashboard on success or returns a plain-English
 * error to display on the form.
 */
export default function AdminLoginPage(): React.JSX.Element {
  const [state, formAction, isPending] = useActionState<LoginActionResult, FormData>(
    async (_previousState, formData) => loginAction(formData),
    initialState,
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-medium text-text-primary mb-8 text-center">Admin Login</h1>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {state.error.message}
            </div>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-text-primary/20"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-text-primary/20"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-text-primary text-white rounded-full py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
