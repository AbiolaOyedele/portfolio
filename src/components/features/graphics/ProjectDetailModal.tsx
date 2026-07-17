'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Heart, X } from 'lucide-react'
import gsap from 'gsap'
import { voteOnProjectAction } from '@/app/(public)/graphics/actions'
import { cloudinaryUrl } from '@/lib/cloudinary'
import type { Project, VoteResult, VoteType } from '@/types/project'

export interface ProjectDetailModalProps {
  project: Project
  voteOverrides: Record<string, VoteResult>
  votedIds: Set<string>
  onVoted: (projectId: string, result: VoteResult) => void
  onMarkVoted: (projectId: string) => void
  onClose: () => void
}

/** A 10px label above a comma-free list of items — the reference metadata column. */
function MetaColumn({ label, items }: { label: string; items: string[] | null }): React.JSX.Element | null {
  if (!items || items.length === 0) return null
  return (
    <div className="flex-1">
      <p className="mb-2 text-[10px] uppercase tracking-[0.04em] text-black/35">{label}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-[14px] leading-tight text-black/65">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The "more info" detail panel — reference layout (project image, title +
 * subtitle, description, and the "Tools + Tech" / "Scope" metadata columns)
 * with the site's bespoke like/dislike voting row kept underneath. GSAP slides
 * the panel up on open; closing always returns to the focused card.
 */
export function ProjectDetailModal({
  project,
  voteOverrides,
  votedIds,
  onVoted,
  onMarkVoted,
  onClose,
}: ProjectDetailModalProps): React.JSX.Element {
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)

  const animateClose = useCallback((): void => {
    if (closingRef.current) return
    closingRef.current = true
    gsap.to(panelRef.current, { y: 32, opacity: 0, duration: 0.26, ease: 'power2.in' })
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.26, ease: 'power2.in', onComplete: onClose })
  }, [onClose])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power3.out' })
      gsap.fromTo(panelRef.current, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
    })
    document.body.style.overflow = 'hidden'
    return () => {
      ctx.revert()
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') animateClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [animateClose])

  const commitVote = (direction: VoteType): void => {
    onMarkVoted(project.id)
    void voteOnProjectAction(project.id, direction).then((result) => {
      if (result.success) onVoted(project.id, { likes: result.likes, dislikes: result.dislikes })
    })
  }

  const coverUrl = cloudinaryUrl(project.cover_url, { width: 1000 })
  const counts = voteOverrides[project.id] ?? { likes: project.likes, dislikes: project.dislikes }
  const hasVoted = votedIds.has(project.id)
  const subtitle = project.subcategory ?? project.category

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: 'rgba(17,17,26,0.55)', opacity: 0 }}
    >
      {/* Full-screen backdrop close target (keyboard close via Escape). */}
      <button type="button" aria-label="Close" onClick={animateClose} className="absolute inset-0 cursor-default" />

      <button
        type="button"
        onClick={animateClose}
        aria-label="Close"
        className="absolute right-6 top-6 z-[72] flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-ui transition-transform duration-200 hover:scale-[1.025] active:scale-95"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        ref={panelRef}
        style={{ opacity: 0 }}
        className="relative z-10 max-h-[85vh] w-full max-w-[400px] overflow-y-auto rounded-2xl border border-black/10 bg-white shadow-ui"
      >
        {coverUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
            <Image src={coverUrl} alt={project.title} fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" priority />
          </div>
        )}

        <div className="p-5">
          <h2 className="text-[24px] leading-tight tracking-[-0.01em] text-black" style={{ fontWeight: 500 }}>
            {project.title}
          </h2>
          <p className="text-[24px] leading-tight tracking-[-0.01em] text-black/35">{subtitle}</p>

          {project.description && (
            <p className="mt-4 text-[14px] leading-[1.35] text-black/65">{project.description}</p>
          )}

          {((project.tools?.length ?? 0) > 0 || (project.scope?.length ?? 0) > 0) && (
            <div className="mt-6 flex gap-6">
              <MetaColumn label="Tools + Tech" items={project.tools} />
              <MetaColumn label="Scope" items={project.scope} />
            </div>
          )}

          {/* Bespoke voting row — kept alongside the reference metadata. */}
          <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
            <span className="text-[12px] text-black/35">{hasVoted ? 'You already voted on this one' : ''}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => commitVote('dislike')}
                aria-label="Dislike"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black/65 shadow-ui transition-transform active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="min-w-[1.5ch] text-[13px] text-black/35">{counts.dislikes}</span>
              <button
                type="button"
                onClick={() => commitVote('like')}
                aria-label="Like"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-ui transition-transform active:scale-95"
              >
                <Heart className="h-5 w-5 fill-current" />
              </button>
              <span className="min-w-[1.5ch] text-[13px] text-black/35">{counts.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
