'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useVotedProjects } from '@/hooks/useVotedProjects'
import type { Project, VoteResult } from '@/types/project'
import { GraphicsCanvas } from './GraphicsCanvas'
import { TileFocusOverlay } from './TileFocusOverlay'
import { ProjectDetailModal } from './ProjectDetailModal'
import { CustomCursor } from './CustomCursor'

export interface GraphicsExperienceProps {
  projects: Project[]
}

/**
 * Top-level client boundary for the /graphics page: owns which card is
 * focused, whether its detail panel is open, and vote-count overrides —
 * `GraphicsCanvas` itself stays permanently mounted so its pan position and
 * revealed-card set survive open/close, and closing back to the canvas
 * always lands exactly where you left off.
 */
export function GraphicsExperience({ projects }: GraphicsExperienceProps): React.JSX.Element {
  const [focusedProject, setFocusedProject] = useState<Project | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [voteOverrides, setVoteOverrides] = useState<Record<string, VoteResult>>({})
  const { votedIds, markVoted } = useVotedProjects()

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
    setFocusedProject(project)
  }

  const handleCloseFocus = (): void => {
    setIsDetailOpen(false)
    setFocusedProject(null)
  }

  const handleVoted = (projectId: string, result: VoteResult): void => {
    setVoteOverrides((prev) => ({ ...prev, [projectId]: result }))
  }

  return (
    <>
      <CustomCursor />
      <GraphicsCanvas
        projects={projects}
        isInert={focusedProject !== null}
        focusedProjectId={focusedProject?.id ?? null}
        onCardFocus={handleCardFocus}
      />
      <AnimatePresence>
        {focusedProject && (
          <TileFocusOverlay
            project={focusedProject}
            isDetailOpen={isDetailOpen}
            onClose={handleCloseFocus}
            onMoreInfo={() => setIsDetailOpen(true)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {focusedProject && isDetailOpen && (
          <ProjectDetailModal
            project={focusedProject}
            voteOverrides={voteOverrides}
            votedIds={votedIds}
            onVoted={handleVoted}
            onMarkVoted={markVoted}
            onClose={() => setIsDetailOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
