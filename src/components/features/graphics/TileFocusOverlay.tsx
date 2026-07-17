'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { getProjectAspect } from '@/lib/masonry'
import type { Project } from '@/types/project'

export interface TileFocusOverlayProps {
  project: Project
  isDetailOpen: boolean
  onClose: () => void
  onMoreInfo: () => void
}

/**
 * The zoomed-in "focused" view a canvas card grows into on click — a fixed
 * overlay sharing GraphicsCanvasCard's `layoutId` so Framer Motion animates
 * the grow-from-grid-position transition automatically. Stays mounted while
 * the detail modal is open on top of it (matching the old SwipeDeck →
 * ProjectDetailModal nesting) so "closing detail returns to the focused
 * card" needs no extra state — the card view was never gone.
 */
export function TileFocusOverlay({ project, isDetailOpen, onClose, onMoreInfo }: TileFocusOverlayProps): React.JSX.Element {
  const coverUrl = cloudinaryUrl(project.cover_url, { width: 1080 })
  const aspect = getProjectAspect(project)

  // Deferred while the detail modal is open (it owns its own Escape
  // listener) so one press only ever closes the topmost layer.
  useEffect(() => {
    if (isDetailOpen) return
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDetailOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--color-text-primary)]/40 px-6 py-10 backdrop-blur-sm"
    >
      <motion.div
        layoutId={`tile-${project.id}`}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        style={{ aspectRatio: aspect }}
        className="relative w-[90vw] max-w-[333px] overflow-hidden rounded-2xl border border-border bg-surface shadow-card-hover sm:max-w-[399px] lg:max-w-[480px]"
      >
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 90vw, 480px"
            className="object-cover"
            priority
          />
        )}
      </motion.div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed right-4 top-6 z-[61] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-primary shadow-card sm:right-6"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="fixed bottom-6 left-1/2 z-[61] flex h-14 -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-surface pl-4 pr-5 shadow-card">
        <span className="max-w-[140px] truncate text-[14px] text-text-primary sm:max-w-[240px]">{project.title}</span>
        <button
          type="button"
          onClick={onMoreInfo}
          className="flex min-h-[44px] items-center whitespace-nowrap text-[12px] text-text-secondary underline underline-offset-2"
        >
          more info +
        </button>
      </div>
    </motion.div>
  )
}
