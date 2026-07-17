'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { cn } from '@/lib/utils'
import type { CardLayout } from '@/lib/masonry'
import type { Project } from '@/types/project'

const REVEAL_RADIUS = 75
// The real performance lever: a new point is only recorded once the pointer
// has moved this far from the last one, bounding point density by geometry
// rather than by evicting old points (an evicting ring buffer would
// un-reveal earlier strokes, contradicting the "stays revealed permanently"
// behavior this is modeled on).
const MIN_POINT_DISTANCE = 16
// Hard ceiling, never evicted. By the time this many well-spaced points
// exist on a card this size at a 75px reveal radius, the card is already at
// or near full visual coverage — freezing further movement is imperceptible.
const MAX_POINTS = 220

export interface GraphicsCanvasCardProps {
  project: Project
  layout: CardLayout
  isVisible: boolean
  isFocused: boolean
  onFocus: () => void
  onFirstReveal: (id: string) => void
}

export function GraphicsCanvasCard({
  project,
  layout,
  isVisible,
  isFocused,
  onFocus,
  onFirstReveal,
}: GraphicsCanvasCardProps): React.JSX.Element {
  const maskRef = useRef<HTMLDivElement>(null)
  const pointsRef = useRef<Array<{ x: number; y: number }>>([])
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const rafRef = useRef<number | null>(null)
  const hasRevealedRef = useRef(false)

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const scheduleMaskUpdate = (): void => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const mask = maskRef.current
      if (!mask) return
      const gradients = pointsRef.current
        .map(
          (p) =>
            `radial-gradient(circle ${REVEAL_RADIUS}px at ${p.x}px ${p.y}px, black 0%, black 60%, transparent 100%)`,
        )
        .join(', ')
      mask.style.setProperty('mask-image', gradients)
      mask.style.setProperty('-webkit-mask-image', gradients)
      mask.style.setProperty('mask-composite', 'add')
      mask.style.setProperty('-webkit-mask-composite', 'source-over')
    })
  }

  // Pointer Events unify mouse-hover and touch-drag automatically — a
  // pointermove for a touch input only fires while a finger is actually
  // down, which is exactly the "reveals only while actively touching"
  // behavior confirmed on the reference site's mobile view.
  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (!hasRevealedRef.current) {
      hasRevealedRef.current = true
      onFirstReveal(project.id)
    }

    const last = lastPointRef.current
    if (last) {
      const dx = x - last.x
      const dy = y - last.y
      if (dx * dx + dy * dy < MIN_POINT_DISTANCE * MIN_POINT_DISTANCE) return
    }

    if (pointsRef.current.length < MAX_POINTS) {
      pointsRef.current.push({ x, y })
      lastPointRef.current = { x, y }
      scheduleMaskUpdate()
    }
  }

  // Claims the gesture so a drag starting on this card reveals it instead of
  // bubbling up to pan the ancestor canvas out from under the same pointer.
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>): void => {
    e.stopPropagation()
  }

  // A click is a valid "I found this" too, not just hover/drag reveal — so
  // clicking a still-blurred card counts it before opening focus, instead of
  // leaving the counter permanently undercounting cards someone jumped
  // straight to.
  const handleClick = (): void => {
    if (!hasRevealedRef.current) {
      hasRevealedRef.current = true
      onFirstReveal(project.id)
    }
    onFocus()
  }

  const coverUrl = cloudinaryUrl(project.cover_url, { width: Math.round(layout.width * 2) })

  return (
    <motion.div
      layoutId={`tile-${project.id}`}
      className={cn('absolute transition-opacity duration-200', isVisible ? 'opacity-100' : 'pointer-events-none opacity-0')}
      style={{ top: layout.top, left: layout.left, width: layout.width, height: layout.height }}
    >
      <button
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        aria-label={`Open ${project.title}`}
        tabIndex={isVisible ? 0 : -1}
        style={{ transform: `rotate(${layout.rotate}deg)`, opacity: isFocused ? 0 : 1 }}
        className="relative block h-full w-full touch-none overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-opacity duration-150"
      >
        {coverUrl && (
          <Image
            src={coverUrl}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
            style={{ filter: 'blur(14px)', transform: 'scale(1.1)' }}
          />
        )}

        {/* Starts fully masked (zero-radius reveal) — without an explicit initial
            mask, this layer would render completely unmasked (i.e. fully visible),
            hiding the blurred layer beneath it entirely before any pointer interaction. */}
        <div
          ref={maskRef}
          className="absolute inset-0"
          style={{
            maskImage: 'radial-gradient(circle 0px at 0px 0px, black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle 0px at 0px 0px, black 0%, transparent 100%)',
          }}
        >
          {coverUrl && (
            <Image src={coverUrl} alt={project.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
          )}
        </div>

        {project.video_url && (
          <span className="absolute left-2 top-2 rounded-full border border-border bg-surface/90 px-2 py-0.5 text-[10px] text-text-secondary shadow-card">
            video
          </span>
        )}
      </button>
    </motion.div>
  )
}
