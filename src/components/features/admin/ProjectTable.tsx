import { Pencil } from 'lucide-react'
import Link from 'next/link'

import DeleteProjectButton from '@/components/features/admin/DeleteProjectButton'
import VisibilityToggle from '@/components/features/admin/VisibilityToggle'
import type { Project } from '@/types/project'

export interface ProjectTableProps {
  projects: Project[]
}

/**
 * Admin projects table. Server-rendered — the row data itself is static
 * markup; only the visibility toggle and delete button need client-side
 * interactivity, so those are split into their own leaf components.
 *
 * Columns match the old `AdminDashboard.jsx` table: title, category,
 * subcategory, visible toggle, sort order, edit/delete actions.
 */
export default function ProjectTable({ projects }: ProjectTableProps): React.JSX.Element {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wide">
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3 hidden sm:table-cell">Category</th>
            <th className="px-5 py-3 hidden lg:table-cell">Subcategory</th>
            <th className="px-5 py-3">Visible</th>
            <th className="px-5 py-3 hidden sm:table-cell">Order</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b border-border last:border-0 hover:bg-bg/50">
              <td className="px-5 py-3 text-sm text-text-primary">{project.title}</td>
              <td className="px-5 py-3 text-sm text-text-secondary capitalize hidden sm:table-cell">
                {project.category}
              </td>
              <td className="px-5 py-3 text-sm text-text-muted hidden lg:table-cell">
                {project.subcategory || '—'}
              </td>
              <td className="px-5 py-3">
                <VisibilityToggle projectId={project.id} initialVisible={project.visible} />
              </td>
              <td className="px-5 py-3 text-sm text-text-muted hidden sm:table-cell">{project.sort_order}</td>
              <td className="px-5 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    aria-label="Edit project"
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <DeleteProjectButton projectId={project.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
