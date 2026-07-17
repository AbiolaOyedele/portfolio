import { notFound } from 'next/navigation'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getProjectForAdmin } from '@/services/projects.service'

import ProjectForm from './project-form'

export interface AdminProjectPageProps {
  params: Promise<{ id: string }>
}

/**
 * Admin create/edit page — Server Component. `id === 'new'` renders the form
 * with empty defaults; any other `id` is fetched via `getProjectForAdmin`
 * (no placeholder fallback) and `notFound()` is called when it doesn't
 * resolve to a real row.
 */
export default async function AdminProjectPage({ params }: AdminProjectPageProps): Promise<React.JSX.Element> {
  const { id } = await params

  if (id === 'new') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-xl font-medium text-text-primary mb-8">New Project</h1>
        <ProjectForm />
      </div>
    )
  }

  const client = await createServerSupabaseClient()
  const project = await getProjectForAdmin(client, id)

  if (!project) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-xl font-medium text-text-primary mb-8">Edit Project</h1>
      <ProjectForm defaultValues={project} />
    </div>
  )
}
