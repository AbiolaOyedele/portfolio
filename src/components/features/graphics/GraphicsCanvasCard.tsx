'use client'

import { useEffect, useRef, useState } from 'react'
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
// Once this fraction of the card is scratched, snap the whole tile open —
// the "scratch 60–80% → it just reveals" behaviour.
const AUTO_REVEAL_COVERAGE = 0.7

/** A local `/graphics/videos/*.mp4` (or any .mp4) plays inline as a video tile. */
function isPlayableVideo(url: string | null): url is string {
  return !!url && /\.mp4($|\?)/i.test(url)
}

export interface GraphicsCanvasCardProps {
  project: Project
  aspect: number
  /** Hidden (filtered out) tiles stay mounted but non-interactive. */
  isVisible: boolean
  /** Fully revealed (threshold hit, clicked, or another copy revealed it). */
  isRevealed: boolean
  isFocused: boolean
  onReveal: (id: string) => void
  onFocus: () => void
}

/**
 * A single canvas tile. Starts blurred; the pointer "scratches" a sharp layer
 * into view through an accumulating radial-gradient mask, and once ~70% of the
 * tile has been scratched it snaps fully open. Video tiles play their muted
 * loop on hover/focus, and the "video" badge only appears once discovered —
 * matching the reference's discovery mechanic on top of the scratch reveal.
 */
export function GraphicsCanvasCard({
  project,
  aspect,
  isVisible,
  isRevealed,
  isFocused,
  onReveal,
  onFocus,
}: GraphicsCanvasCardProps): React.JSX.Element {
  const maskRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pointsRef = useRef<Array<{ x: number; y: number }>>([])
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const cellsRef = useRef<Set<string>>(new Set())
  const rafRef = useRef<number | null>(null)
  const revealedRef = useRef(false)
  const [hovered, setHovered] = useState(false)

  const isVideo = isPlayableVideo(project.video_url)
  const coverUrl = cloudinaryUrl(project.cover_url, { width: 640 })
  // Discovered = threshold auto-reveal, click, or a sibling copy revealed it.
  const discovered = isRevealed || revealedRef.current

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
    if (discovered) return
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

    // Estimate coverage on a coarse grid; snap open past the threshold.
    cellsRef.current.add(`${Math.floor(x / COVERAGE_CELL)},${Math.floor(y / COVERAGE_CELL)}`)
    const cols = Math.max(1, Math.ceil(rect.width / COVERAGE_CELL))
    const rows = Math.max(1, Math.ceil(rect.height / COVERAGE_CELL))
    if (cellsRef.current.size / (cols * rows) >= AUTO_REVEAL_COVERAGE) markRevealed()
  }

  // Claim the gesture so scratching a tile doesn't also pan the canvas.
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>): void => {
    e.stopPropagation()
  }

  const handleClick = (): void => {
    markRevealed()
    onFocus()
  }

  const handleEnter = (): void => {
    setHovered(true)
    if (isVideo) void videoRef.current?.play().catch(() => {})
  }

  const handleLeave = (): void => {
    setHovered(false)
    if (isVideo && videoRef.current) videoRef.current.pause()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      aria-label={`Open ${project.title}`}
      tabIndex={isVisible ? 0 : -1}
      style={{ aspectRatio: aspect, opacity: isFocused || !isVisible ? 0 : 1 }}
      className={cn(
        'relative block h-full w-full touch-none overflow-hidden rounded-lg bg-surface transition-opacity duration-200',
        !isVisible && 'pointer-events-none',
      )}
    >
      {/* Blurred base layer — the "undiscovered" state. */}
      {coverUrl && (
        <Image
          src={coverUrl}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
          style={{ filter: discovered ? 'blur(0px)' : 'blur(8px)', transform: discovered ? 'none' : 'scale(1.06)', transition: 'filter 350ms ease-out, transform 350ms ease-out' }}
        />
      )}

      {/* Sharp layer, scratched into view (or fully shown once discovered). */}
      <div
        ref={maskRef}
        className="absolute inset-0"
        style={
          discovered
            ? undefined
            : {
                maskImage: 'radial-gradient(circle 0px at 0px 0px, black 0%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle 0px at 0px 0px, black 0%, transparent 100%)',
              }
        }
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={project.video_url ?? undefined}
            poster={coverUrl || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          coverUrl && <Image src={coverUrl} alt={project.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
        )}
      </div>

      {/* Video badge — hidden until the tile is discovered, per the reference. */}
      {isVideo && (
        <span
          className={cn(
            'pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-[4px] border border-black/10 bg-white px-1.5 py-0.5 text-[10px] font-medium text-black transition-opacity duration-200',
            discovered && !hovered ? 'opacity-100' : 'opacity-0',
          )}
        >
          <svg viewBox="0 0 8 8" className="h-2 w-2 fill-current" aria-hidden="true">
            <path d="M1 0.5 L7 4 L1 7.5 Z" />
          </svg>
          video
        </span>
      )}
    </button>
  )
}
