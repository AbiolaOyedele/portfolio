import AdminNav from '@/components/features/admin/AdminNav'

export interface AdminLayoutProps {
  children: React.ReactNode
}

/**
 * Shared chrome for all authenticated /admin/* pages (dashboard, project
 * form, about form, etc). Renders <AdminNav /> above the page content.
 *
 * /admin/login is deliberately NOT wrapped in this nav — showing "Projects /
 * About / Logout" links on the sign-in screen makes no sense before there's
 * a session to log out of. It gets its own layout at
 * src/app/(admin)/admin/login/layout.tsx that renders children standalone,
 * which — being more specific in the route tree — overrides this one for
 * that segment. This mirrors the old app, where AdminLogin.jsx rendered on
 * its own and every other admin page rendered <AdminNav /> itself.
 */
export default function AdminLayout({ children }: AdminLayoutProps): React.JSX.Element {
  return (
    <>
      <AdminNav />
      {children}
    </>
  )
}
