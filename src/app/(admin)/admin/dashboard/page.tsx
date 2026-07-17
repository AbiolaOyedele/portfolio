import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import ProjectTable from '@/components/features/admin/ProjectTable'
import { isAppError } from '@/lib/errors'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdminSession } from '@/services/auth.service'
import { getAllProjectsForAdmin } from '@/services/projects.service'
import type { Project } from '@/types/project'

export const metadata: Metadata = {
  title: 'Admin — Projects',
  robots: { index: false, follow: false },
}

/**
 * Admin dashboard — lists every project (visible or not) with inline
 * visibility/delete controls and links to edit each one.
 *
 * `/admin/*` is already gated by `middleware.ts` (redirects non-admins to
 * `/admin/login`), but `requireAdminSession` is called again here too:
 * middleware can only check the session cookie, while this call also
 * re-verifies the user's email against `ADMIN_EMAIL` right before the
 * admin-only query runs — the same defense-in-depth the service layer
 * already documents for RLS. Cheap enough to not skip.
 */
export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
  const supabase = await createServerSupabaseClient()

  let projects: Project[] = []
  let loadError: string | null = null

  try {
    await requireAdminSession(supabase)
    projects = await getAllProjectsForAdmin(supabase)
  } catch (err) {
    loadError = isAppError(err)
      ? err.message
      : 'We could not load your projects right now. Please try again shortly.'
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-medium text-text-primary">Projects</h1>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-text-primary text-white rounded-full px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> New project
          </Link>
        </div>

        {loadError ? (
          <p className="text-red-500 text-sm">{loadError}</p>
        ) : projects.length === 0 ? (
          <p className="text-text-muted text-sm">No projects yet.</p>
        ) : (
          <ProjectTable projects={projects} />
        )}
      </div>
    </div>
  )
}
