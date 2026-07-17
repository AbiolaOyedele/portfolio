'use client'

import { useTransition } from 'react'

import { logoutAction } from '@/components/features/admin/actions'

/**
 * Logout button for <AdminNav />. Client wrapper so we can show a pending
 * state while the `logoutAction` Server Action signs the admin out and
 * redirects to /admin/login.
 */
export default function LogoutButton(): React.JSX.Element {
  const [isPending, startTransition] = useTransition()

  function handleLogout(): void {
    startTransition(() => {
      void logoutAction()
    })
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="text-sm text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50"
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </button>
  )
}
