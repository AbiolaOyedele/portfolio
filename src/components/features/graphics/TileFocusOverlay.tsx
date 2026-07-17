'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import gsap from 'gsap'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { getProjectAspect } from '@/lib/masonry'
import type { Project } from '@/types/project'

// Reference focus/expand easing + duration — GSAP power3.out ≈ cubic-bezier(.2,0,0,1).
const FOCUS_EASE = 'power3.out'
const FOCUS_DURATION = 0.5

export interface TileFocusOverlayProps {
  project: Project
  isDetailOpen: boolean
  onClose: () => void
  onMoreInfo: () => void
}

/**
 * The zoomed "focused" view a card grows into on click. GSAP drives the grow
 * (card scales/fades up, backdrop blurs in) and the reverse on close, matching
 * the reference's power3.out focus animation. Stays mounted while the detail
 * modal is open on top of it.
 */
export function TileFocusOverlay({ project, isDetailOpen, onClose, onMoreInfo }: TileFocusOverlayProps): React.JSX.Element {
  const backdropRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)

  const coverUrl = cloudinaryUrl(project.cover_url, { width: 1080 })
  const thumbUrl = cloudinaryUrl(project.cover_url, { width: 120 })
  const aspect = getProjectAspect(project)

  // Enter animation.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: FOCUS_DURATION, ease: FOCUS_EASE })
      gsap.fromTo(
        cardRef.current,
        { scale: 0.86, opacity: 0, y: 24 },
        { scale: 1, opacity: 1, y: 0, duration: FOCUS_DURATION, ease: FOCUS_EASE },
      )
      gsap.fromTo(
        [closeRef.current, captionRef.current],
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: FOCUS_DURATION, ease: FOCUS_EASE, delay: 0.08 },
      )
    })
    return () => ctx.revert()
  }, [])

  // GSAP-driven exit, then hand control back to the parent.
  const animateClose = useCallback((): void => {
    if (closingRef.current) return
    closingRef.current = true
    gsap.to([cardRef.current, closeRef.current, captionRef.current], { scale: 0.9, opacity: 0, y: 16, duration: 0.28, ease: 'power2.in' })
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.28, ease: 'power2.in', onComplete: onClose })
  }, [onClose])

  // Deferred while the detail modal is open (it owns its own Escape listener).
  useEffect(() => {
    if (isDetailOpen) return
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') animateClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDetailOpen, animateClose])

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#f1f1f1]/70 px-6 py-10 backdrop-blur-md"
      style={{ opacity: 0 }}
    >
      {/* Full-screen backdrop close target (accessible, keyboard via Escape). */}
      <button type="button" aria-label="Close" onClick={animateClose} className="absolute inset-0 cursor-default" />

      <div
        ref={cardRef}
        style={{ aspectRatio: aspect, opacity: 0 }}
        className="relative z-10 w-[90vw] max-w-[333px] overflow-hidden rounded-lg border border-black/10 bg-white shadow-ui sm:max-w-[399px] lg:max-w-[540px]"
      >
        {coverUrl && (
          <Image src={coverUrl} alt={project.title} fill sizes="(max-width: 768px) 90vw, 540px" className="object-cover" priority />
        )}
      </div>

      <button
        ref={closeRef}
        type="button"
        onClick={animateClose}
        aria-label="Close"
        style={{ opacity: 0 }}
        className="fixed right-4 top-6 z-[61] flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-ui transition-transform duration-200 hover:scale-[1.025] active:scale-95 sm:right-8"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Caption card — reference: project thumb + caption + "more info +".
          Centered via a non-transformed flex container so GSAP's y transform
          on the card itself doesn't fight a centering transform. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[61] flex justify-center px-4">
        <div
          ref={captionRef}
          style={{ opacity: 0 }}
          className="pointer-events-auto flex h-16 w-[328px] max-w-full items-center gap-3 overflow-hidden rounded-lg border border-black/10 bg-white py-[9px] pl-3 pr-6 text-left shadow-ui"
        >
          {thumbUrl && (
            <span className="relative h-full aspect-square shrink-0 overflow-hidden rounded-md">
              <Image src={thumbUrl} alt="" aria-hidden="true" fill sizes="48px" className="object-cover" />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-[14px] text-black">{project.title}</span>
          <button
            type="button"
            onClick={onMoreInfo}
            className="shrink-0 whitespace-nowrap text-[12px] text-black/65 underline underline-offset-2"
          >
            more info +
          </button>
        </div>
      </div>
    </div>
  )
}
