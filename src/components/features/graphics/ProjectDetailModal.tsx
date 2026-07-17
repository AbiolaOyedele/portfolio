'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Heart, X } from 'lucide-react'
import { voteOnProjectAction } from '@/app/(public)/graphics/actions'
import { cloudinaryUrl } from '@/lib/cloudinary'
import Tag from '@/components/ui/Tag'
import type { Project, VoteResult, VoteType } from '@/types/project'

export interface ProjectDetailModalProps {
  project: Project
  voteOverrides: Record<string, VoteResult>
  votedIds: Set<string>
  onVoted: (projectId: string, result: VoteResult) => void
  onMarkVoted: (projectId: string) => void
  onClose: () => void
}

/**
 * The "mini page" opened by tapping the current card in the swipe deck —
 * image plus available details, scrollable, closing always returns to the
 * deck (onClose is always the deck's own local dismiss handler).
 *
 * Self-contained rather than extracted from `Lightbox.tsx` — the shell here
 * (backdrop-click-to-close, Escape, body-scroll-lock, fade, close button) is
 * copied from that established pattern, but `Lightbox` itself is shipped,
 * working code entangled with its own prev/next image-pagination logic that
 * this "mini page" doesn't need — duplicating ~20 lines of shell here is a
 * better trade than refactoring working code outside this feature's scope.
 */
export function ProjectDetailModal({
  project,
  voteOverrides,
  votedIds,
  onVoted,
  onMarkVoted,
  onClose,
}: ProjectDetailModalProps): React.JSX.Element {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose()
  }

  const commitVote = (direction: VoteType): void => {
    onMarkVoted(project.id)
    void voteOnProjectAction(project.id, direction).then((result) => {
      if (result.success) onVoted(project.id, { likes: result.likes, dislikes: result.dislikes })
    })
  }

  const coverUrl = cloudinaryUrl(project.cover_url, { width: 1000 })
  const counts = voteOverrides[project.id] ?? { likes: project.likes, dislikes: project.dislikes }
  const hasVoted = votedIds.has(project.id)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={handleBackdropClick}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-6 top-6 z-[71] p-2 text-white/70 hover:text-white"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface">
        {coverUrl && (
          <div className="relative aspect-video w-full">
            <Image src={coverUrl} alt={project.title} fill sizes="(max-width: 640px) 100vw, 512px" className="object-cover" priority />
          </div>
        )}

        <div className="p-6">
          <h2 className="mb-2 text-[22px] leading-tight text-text-primary" style={{ fontWeight: 400 }}>
            {project.title}
          </h2>

          {project.tags && project.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}

          {project.description ? (
            <p className="text-[15px] leading-[1.8] text-text-secondary" style={{ fontWeight: 300 }}>
              {project.description}
            </p>
          ) : (
            <p className="text-[14px] text-text-muted" style={{ fontWeight: 300 }}>
              No description yet for this project.
            </p>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-[12px] text-text-muted">{hasVoted ? 'You already voted on this one' : ''}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => commitVote('dislike')}
                aria-label="Dislike"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-card transition-transform active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="min-w-[1.5ch] text-[13px] text-text-muted">{counts.dislikes}</span>
              <button
                type="button"
                onClick={() => commitVote('like')}
                aria-label="Like"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-card transition-transform active:scale-95"
              >
                <Heart className="h-5 w-5 fill-current" />
              </button>
              <span className="min-w-[1.5ch] text-[13px] text-text-muted">{counts.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
