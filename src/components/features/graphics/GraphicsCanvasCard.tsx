'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/project'

const REVEAL_RADIUS = 78
// A new mask point is only recorded once the pointer has moved this far from
// the last one — bounds point density by geometry rather than by evicting old
// points (which would un-reveal earlier strokes).
const MIN_POINT_DISTANCE = 16
const MAX_POINTS = 240
// Coarse grid cell used to estimate how much of the card has been scratched.
const COVERAGE_CELL = 56
// Once this fraction of the card is scratched, snap the whole tile open.
const AUTO_REVEAL_COVERAGE = 0.7

export interface GraphicsCanvasCardProps {
  project: Project
  aspect: number
  /** Hidden (filtered out) tiles stay mounted but non-interactive. */
  isVisible: boolean
  /**
   * Desktop-only scratch-to-reveal. When false (mobile/tablet) the image is
   * shown immediately — matching the "images visible at once" behaviour there.
   */
  scratchEnabled: boolean
  /** Fully revealed (threshold hit, clicked, or another copy revealed it). */
  isRevealed: boolean
  isFocused: boolean
  onReveal: (id: string) => void
  onFocus: () => void
}

/**
 * A single canvas tile. On desktop it starts blurred and the mouse "scratches"
 * a sharp layer into view through an accumulating radial-gradient mask; once
 * ~70% is uncovered (or it's clicked) it snaps fully open, and every tiled copy
 * of the same project reveals together via the shared `onReveal`. On
 * mobile/tablet (`scratchEnabled` false) the image is simply shown. Clicking
 * always opens the full-screen viewer.
 */
export function GraphicsCanvasCard({
  project,
  aspect,
  isVisible,
  scratchEnabled,
  isRevealed,
  isFocused,
  onReveal,
  onFocus,
}: GraphicsCanvasCardProps): React.JSX.Element {
  const maskRef = useRef<HTMLDivElement>(null)
  const pointsRef = useRef<Array<{ x: number; y: number }>>([])
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const cellsRef = useRef<Set<string>>(new Set())
  const rafRef = useRef<number | null>(null)
  const revealedRef = useRef(false)

  const coverUrl = cloudinaryUrl(project.cover_url, { width: 640 })
  // Show the sharp image when scratch is off, or once discovered by any means.
  const revealed = !scratchEnabled || isRevealed || revealedRef.current

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
        .map((p) => `radial-gradient(circle ${REVEAL_RADIUS}px at ${p.x}px ${p.y}px, black 0%, black 55%, transparent 100%)`)
        .join(', ')
      mask.style.setProperty('mask-image', gradients)
      mask.style.setProperty('-webkit-mask-image', gradients)
      mask.style.setProperty('mask-composite', 'add')
      mask.style.setProperty('-webkit-mask-composite', 'source-over')
    })
  }

  const markRevealed = (): void => {
    if (revealedRef.current) return
    revealedRef.current = true
    onReveal(project.id)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>): void => {
    // Scratch on hover only (no button pressed); a pressed-drag is a canvas pan
    // and must not also scratch. Mobile/tablet never scratch.
    if (!scratchEnabled || revealed || e.buttons !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

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

    cellsRef.current.add(`${Math.floor(x / COVERAGE_CELL)},${Math.floor(y / COVERAGE_CELL)}`)
    const cols = Math.max(1, Math.ceil(rect.width / COVERAGE_CELL))
    const rows = Math.max(1, Math.ceil(rect.height / COVERAGE_CELL))
    if (cellsRef.current.size / (cols * rows) >= AUTO_REVEAL_COVERAGE) markRevealed()
  }

  const handleClick = (): void => {
    markRevealed()
    onFocus()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      aria-label={`Open ${project.title}`}
      tabIndex={isVisible ? 0 : -1}
      style={{ aspectRatio: aspect, opacity: isFocused || !isVisible ? 0 : 1 }}
      className={cn(
        'relative block h-full w-full touch-none overflow-hidden rounded-lg bg-surface transition-opacity duration-200',
        !isVisible && 'pointer-events-none',
      )}
    >
      {coverUrl && (
        <>
          {/* Base layer — blurred while undiscovered (desktop), sharp otherwise. */}
          <Image
            src={coverUrl}
            alt={revealed ? project.title : ''}
            aria-hidden={!revealed}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
            draggable={false}
            unoptimized
            style={
              revealed
                ? undefined
                : { filter: 'blur(8px)', transform: 'scale(1.06)', transition: 'filter 350ms ease-out, transform 350ms ease-out' }
            }
          />

          {/* Sharp layer scratched into view (desktop, pre-reveal only). */}
          {!revealed && (
            <div
              ref={maskRef}
              className="absolute inset-0"
              style={{
                maskImage: 'radial-gradient(circle 0px at 0px 0px, black 0%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle 0px at 0px 0px, black 0%, transparent 100%)',
              }}
            >
              <Image src={coverUrl} alt={project.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" draggable={false} unoptimized />
            </div>
          )}
        </>
      )}
    </button>
  )
}
