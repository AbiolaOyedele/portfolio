'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, X as XIcon } from 'lucide-react'
import { voteOnProjectAction } from '@/app/(public)/graphics/actions'
import type { Project, VoteResult, VoteType } from '@/types/project'
import { SwipeDeckCard } from './SwipeDeckCard'
import { ProjectDetailModal } from './ProjectDetailModal'

const STACK_SIZE = 3 // front card + 2 peeking behind

export interface SwipeDeckProps {
  cards: Project[]
  startIndex: number
  voteOverrides: Record<string, VoteResult>
  votedIds: Set<string>
  onVoted: (projectId: string, result: VoteResult) => void
  onMarkVoted: (projectId: string) => void
  onClose: () => void
}

/**
 * Full-screen Tinder-style overlay. `GraphicsCanvas` stays mounted behind
 * this (see GraphicsExperience) so its pan position and revealed-card set
 * survive close/reopen — this component itself fully unmounts/remounts on
 * each open (fresh currentIndex), which is why vote-count overrides live one
 * level up rather than in this component's own state.
 */
export function SwipeDeck({ cards, startIndex, voteOverrides, votedIds, onVoted, onMarkVoted, onClose }: SwipeDeckProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [forceSwipe, setForceSwipe] = useState<VoteType | null>(null)

  const currentProject: Project | undefined = cards[currentIndex]
  const isExhausted = !currentProject

  // Escape closes the detail modal first (that listener lives in
  // ProjectDetailModal itself); this deck's own Escape-closes-the-whole-deck
  // listener is deliberately not attached at all while the modal is open, so
  // one press only ever closes one layer.
  useEffect(() => {
    if (isDetailOpen) return
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDetailOpen, onClose])

  const commitVote = (direction: VoteType): void => {
    if (!currentProject) return
    const projectId = currentProject.id
    onMarkVoted(projectId)
    void voteOnProjectAction(projectId, direction).then((result) => {
      if (result.success) onVoted(projectId, { likes: result.likes, dislikes: result.dislikes })
    })
  }

  const handleSwipeComplete = (direction: VoteType): void => {
    commitVote(direction)
    setForceSwipe(null)
    setCurrentIndex((i) => i + 1)
  }

  const stack = cards.slice(currentIndex, currentIndex + STACK_SIZE)
  const displayCounts: VoteResult | null = currentProject
    ? (voteOverrides[currentProject.id] ?? { likes: currentProject.likes, dislikes: currentProject.dislikes })
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-bg px-6 py-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close swipe deck"
        className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-primary shadow-card"
      >
        <XIcon className="h-5 w-5" />
      </button>

      {isExhausted ? (
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-lg text-text-primary">You&rsquo;ve seen them all.</p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-full bg-accent px-6 text-[14px] text-white"
          >
            Back to gallery
          </button>
        </div>
      ) : (
        <>
          {currentProject && votedIds.has(currentProject.id) && (
            <span className="mb-3 rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-text-muted">
              You already voted on this one
            </span>
          )}
          <div className="relative h-[55vh] w-full max-w-[420px]">
            {stack.map((project, i) => (
              <SwipeDeckCard
                key={project.id}
                project={project}
                isFront={i === 0}
                stackDepth={i}
                forceSwipe={i === 0 ? forceSwipe : null}
                onSwipeComplete={handleSwipeComplete}
                onTapImage={() => setIsDetailOpen(true)}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setForceSwipe('dislike')}
                aria-label="Dislike"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-card transition-transform active:scale-95"
              >
                <XIcon className="h-6 w-6" />
              </button>
              <span className="text-[12px] text-text-muted">{displayCounts?.dislikes ?? 0}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setForceSwipe('like')}
                aria-label="Like"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-card transition-transform active:scale-95"
              >
                <Heart className="h-6 w-6 fill-current" />
              </button>
              <span className="text-[12px] text-text-muted">{displayCounts?.likes ?? 0}</span>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {isDetailOpen && currentProject && (
          <ProjectDetailModal
            project={currentProject}
            voteOverrides={voteOverrides}
            votedIds={votedIds}
            onVoted={onVoted}
            onMarkVoted={onMarkVoted}
            onClose={() => setIsDetailOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
