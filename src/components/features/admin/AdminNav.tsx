import Link from 'next/link'

import LogoutButton from '@/components/features/admin/LogoutButton'

/**
 * Top nav for all authenticated /admin/* pages. Server Component — the only
 * interactive piece (logout) is isolated in <LogoutButton />, a small client
 * wrapper around the `logoutAction` Server Action.
 *
 * Ported from the old React Router AdminNav.jsx: same links, same layout,
 * `next/link` in place of react-router's `Link`.
 */
export default function AdminNav(): React.JSX.Element {
  return (
    <nav className="border-b border-border bg-surface">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">Admin Panel</span>
        <div className="flex items-center gap-6">
          <Link
            href="/admin/dashboard"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/admin/about"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            About
          </Link>
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}
