'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import gsap from 'gsap'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { getProjectAspect } from '@/lib/masonry'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/project'

// Reference focus/expand easing + duration — GSAP power3.out ≈ cubic-bezier(.2,0,0,1).
const FOCUS_EASE = 'power3.out'
const FOCUS_DURATION = 0.5
// Horizontal travel (or fling velocity) needed for a swipe to change image.
const SWIPE_DISTANCE = 60
const SWIPE_VELOCITY = 0.5

export interface TileFocusOverlayProps {
  projects: Project[]
  initialIndex: number
  onClose: () => void
}

/**
 * Full-screen viewer a tile opens into: one image at a time, swipe (touch
 * drag), arrow keys, or the edge buttons to move through every project in
 * order. GSAP drives the grow-in/out and each slide transition; the card
 * follows the finger live during a drag so navigation feels physical.
 */
export function TileFocusOverlay({ projects, initialIndex, onClose }: TileFocusOverlayProps): React.JSX.Element {
  const backdropRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const chromeRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)
  const animatingRef = useRef(false)
  const dragRef = useRef<{ active: boolean; startX: number; lastX: number; lastT: number; velocity: number }>({
    active: false,
    startX: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  })
  const [index, setIndex] = useState(initialIndex)

  const project = projects[index] ?? projects[0]!
  const coverUrl = cloudinaryUrl(project.cover_url, { width: 1080 })
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
      gsap.fromTo(chromeRef.current, { opacity: 0 }, { opacity: 1, duration: FOCUS_DURATION, ease: FOCUS_EASE, delay: 0.08 })
    })
    return () => ctx.revert()
  }, [])

  // GSAP-driven exit, then hand control back to the parent.
  const animateClose = useCallback((): void => {
    if (closingRef.current) return
    closingRef.current = true
    gsap.to(cardRef.current, { scale: 0.9, opacity: 0, y: 16, duration: 0.28, ease: 'power2.in' })
    gsap.to([backdropRef.current, chromeRef.current], { opacity: 0, duration: 0.28, ease: 'power2.in', onComplete: onClose })
  }, [onClose])

  // Slide the current card out, swap the image, slide the next one in.
  const goTo = useCallback(
    (direction: 1 | -1): void => {
      if (animatingRef.current || closingRef.current) return
      animatingRef.current = true
      const card = cardRef.current
      gsap.to(card, {
        x: -direction * 80,
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          setIndex((prev) => (prev + direction + projects.length) % projects.length)
          gsap.fromTo(
            card,
            { x: direction * 80, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.3,
              ease: FOCUS_EASE,
              onComplete: () => {
                animatingRef.current = false
              },
            },
          )
        },
      })
    },
    [projects.length],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') animateClose()
      if (e.key === 'ArrowRight') goTo(1)
      if (e.key === 'ArrowLeft') goTo(-1)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [animateClose, goTo])

  // Touch/pointer swipe — the card tracks the finger, then springs or flies.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (animatingRef.current || closingRef.current) return
    dragRef.current = { active: true, startX: e.clientX, lastX: e.clientX, lastT: performance.now(), velocity: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current
    if (!drag.active) return
    const now = performance.now()
    const dt = Math.max(1, now - drag.lastT)
    drag.velocity = (e.clientX - drag.lastX) / dt
    drag.lastX = e.clientX
    drag.lastT = now
    gsap.set(cardRef.current, { x: e.clientX - drag.startX })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current
    if (!drag.active) return
    drag.active = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    const offset = drag.lastX - drag.startX
    if (offset < -SWIPE_DISTANCE || drag.velocity < -SWIPE_VELOCITY) {
      goTo(1)
    } else if (offset > SWIPE_DISTANCE || drag.velocity > SWIPE_VELOCITY) {
      goTo(-1)
    } else if (Math.abs(offset) < 4) {
      // A plain tap on the backdrop (not a swipe) closes the viewer.
      if (e.target === e.currentTarget || e.target === backdropRef.current) animateClose()
      gsap.to(cardRef.current, { x: 0, duration: 0.25, ease: FOCUS_EASE })
    } else {
      gsap.to(cardRef.current, { x: 0, duration: 0.25, ease: FOCUS_EASE })
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[60] flex touch-none select-none items-center justify-center bg-[#f1f1f1]/70 px-6 py-10 backdrop-blur-md"
      style={{ opacity: 0 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        ref={cardRef}
        style={{ aspectRatio: aspect, opacity: 0 }}
        className="pointer-events-none relative z-10 w-[90vw] max-w-[333px] overflow-hidden rounded-lg border border-black/10 bg-white shadow-ui sm:max-w-[399px] lg:max-w-[540px]"
      >
        {coverUrl && (
          <Image src={coverUrl} alt={project.title} fill sizes="(max-width: 768px) 90vw, 540px" className="object-cover" priority draggable={false} unoptimized />
        )}
      </div>

      <div ref={chromeRef} style={{ opacity: 0 }}>
        <button
          type="button"
          onClick={animateClose}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Close"
          className="fixed right-4 top-6 z-[61] flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-ui transition-transform duration-200 hover:scale-[1.025] active:scale-95 sm:right-8"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Prev/next — desktop affordance; on touch you just swipe. */}
        {([-1, 1] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => goTo(direction)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={direction === 1 ? 'Next image' : 'Previous image'}
            className={cn(
              'fixed top-1/2 z-[61] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-ui transition-transform duration-200 hover:scale-[1.05] active:scale-95 sm:flex',
              direction === 1 ? 'right-4 lg:right-8' : 'left-4 lg:left-8',
            )}
          >
            {direction === 1 ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        ))}

        {/* Position indicator — replaces the old caption/details card. */}
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[61] flex justify-center">
          <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[13px] tabular-nums text-black/70 shadow-ui">
            {index + 1} / {projects.length}
          </span>
        </div>
      </div>
    </div>
  )
}
