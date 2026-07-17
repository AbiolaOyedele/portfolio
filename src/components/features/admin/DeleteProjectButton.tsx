'use client'

import { Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

import { deleteProjectAction } from '@/app/(admin)/admin/dashboard/actions'

export interface DeleteProjectButtonProps {
  projectId: string
}

/**
 * Delete button for a single project row. Server Actions can't show a
 * native `confirm()` dialog, so the confirmation check happens here,
 * client-side, matching the old dashboard's `confirm('Are you sure...')`
 * behavior — the action is only invoked once the admin confirms.
 */
export default function DeleteProjectButton({ projectId }: DeleteProjectButtonProps): React.JSX.Element {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleClick(): void {
    if (!window.confirm('Are you sure you want to delete this project?')) return

    setError(null)
    startTransition(async () => {
      const result = await deleteProjectAction(projectId)
      if (!result.success) {
        setError(result.error ?? 'We could not delete this project. Please try again.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label="Delete project"
        className="p-2 text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
