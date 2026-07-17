'use client'

import { useState, useTransition } from 'react'

import { toggleVisibleAction } from '@/app/(admin)/admin/dashboard/actions'

export interface VisibilityToggleProps {
  projectId: string
  initialVisible: boolean
}

/**
 * Pill switch that flips a project's `visible` flag via the
 * `toggleVisibleAction` Server Action. Updates optimistically while the
 * action is in flight, then rolls back if the action reports failure —
 * ported from the old dashboard's inline `toggleVisible` handler.
 */
export default function VisibilityToggle({ projectId, initialVisible }: VisibilityToggleProps): React.JSX.Element {
  const [visible, setVisible] = useState(initialVisible)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleToggle(): void {
    const nextVisible = !visible
    setError(null)
    setVisible(nextVisible)

    startTransition(async () => {
      const result = await toggleVisibleAction(projectId, visible)
      if (!result.success) {
        setVisible(visible)
        setError(result.error ?? 'We could not update this project. Please try again.')
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={visible}
        aria-label={visible ? 'Visible — click to hide' : 'Hidden — click to show'}
        className={`w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 ${
          visible ? 'bg-green-500' : 'bg-border'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            visible ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
