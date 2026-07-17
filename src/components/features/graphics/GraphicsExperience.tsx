'use client'

import { useEffect, useState } from 'react'
import type { Project } from '@/types/project'
import { GraphicsCanvas } from './GraphicsCanvas'
import { TileFocusOverlay } from './TileFocusOverlay'

export interface GraphicsExperienceProps {
  projects: Project[]
}

/**
 * Top-level client boundary for the /graphics page: owns which project is
 * focused in the full-screen viewer. `GraphicsCanvas` itself stays
 * permanently mounted so its pan position survives open/close, and closing
 * back to the canvas always lands exactly where you left off.
 */
export function GraphicsExperience({ projects }: GraphicsExperienceProps): React.JSX.Element {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  // Full-bleed immersive canvas — lock outer page scroll for the whole
  // visit so (public)/layout.tsx's unconditional Footer (rendered below
  // children) never becomes reachable via page scroll, which would fight
  // against panning the canvas itself.
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleCardFocus = (project: Project): void => {
    const index = projects.findIndex((p) => p.id === project.id)
    setFocusedIndex(index >= 0 ? index : 0)
  }

  const focusedProject = focusedIndex !== null ? (projects[focusedIndex] ?? null) : null

  return (
    <>
      <GraphicsCanvas
        projects={projects}
        isInert={focusedProject !== null}
        focusedProjectId={focusedProject?.id ?? null}
        onCardFocus={handleCardFocus}
      />
      {focusedIndex !== null && (
        <TileFocusOverlay projects={projects} initialIndex={focusedIndex} onClose={() => setFocusedIndex(null)} />
      )}
    </>
  )
}
