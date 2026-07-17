'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { computeGraphicsBlock, getGraphicsBucket, GRAPHICS_BUCKETS } from '@/lib/graphics-layout'
import type { Project } from '@/types/project'
import { GraphicsCanvasCard } from './GraphicsCanvasCard'

const INERTIA_DECAY = 0.92
const MIN_VELOCITY = 0.05
// A pointer that travels further than this before release is a pan, not a tap
// — its click on a tile is swallowed so dragging never accidentally opens one.
const TAP_SLOP = 8

export interface GraphicsCanvasProps {
  projects: Project[]
  isInert: boolean
  focusedProjectId: string | null
  onCardFocus: (project: Project) => void
}

/**
 * Infinite, free-scrolling canvas of image tiles. One repeatable block of
 * columns is tiled across the viewport in both axes and wrapped with modular
 * arithmetic, so panning (pointer drag with velocity inertia, starting
 * anywhere — including on a tile) and trackpad/wheel scrolling roam endlessly
 * in every direction. Pan is applied imperatively to a single transform — the
 * tile DOM never re-renders while moving.
 */
export function GraphicsCanvas({ projects, isInert, focusedProjectId, onCardFocus }: GraphicsCanvasProps): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const [bucket, setBucket] = useState(GRAPHICS_BUCKETS.mobile)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [showTooltip, setShowTooltip] = useState(true)
  // Scratch-to-reveal is desktop-only (real pointer + room to hover). Tiles are
  // shown immediately on mobile/tablet. Revealed ids are shared so every tiled
  // copy of the same project opens together.
  const [scratchEnabled, setScratchEnabled] = useState(false)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())

  // Pan + inertia live in refs so movement never triggers React renders.
  const panRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef<{ active: boolean; moved: number; lastX: number; lastY: number; lastT: number }>({
    active: false,
    moved: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
  })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const measure = (): void => {
      setBucket(getGraphicsBucket(window.innerWidth))
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
    const update = (): void => setScratchEnabled(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const handleReveal = (id: string): void => {
    setRevealedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const { tiles, blockWidth, blockHeight } = useMemo(
    () => computeGraphicsBlock(projects, bucket),
    [projects, bucket],
  )

  // Enough block copies to cover the viewport plus a one-block margin each way.
  const cols = viewport.w > 0 ? Math.ceil(viewport.w / blockWidth) + 2 : 3
  const rows = viewport.h > 0 ? Math.ceil(viewport.h / blockHeight) + 2 : 3

  const applyTransform = (): void => {
    const inner = innerRef.current
    if (!inner) return
    const wrapX = ((panRef.current.x % blockWidth) + blockWidth) % blockWidth
    const wrapY = ((panRef.current.y % blockHeight) + blockHeight) % blockHeight
    inner.style.transform = `translate3d(${wrapX - blockWidth}px, ${wrapY - blockHeight}px, 0)`
  }

  // Keep the wrap correct whenever the block size (breakpoint) changes.
  useEffect(applyTransform, [blockWidth, blockHeight, cols, rows])

  const stopInertia = (): void => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const runInertia = (): void => {
    const step = (): void => {
      const v = velocityRef.current
      panRef.current.x += v.x
      panRef.current.y += v.y
      v.x *= INERTIA_DECAY
      v.y *= INERTIA_DECAY
      applyTransform()
      if (Math.abs(v.x) > MIN_VELOCITY || Math.abs(v.y) > MIN_VELOCITY) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        rafRef.current = null
      }
    }
    stopInertia()
    rafRef.current = requestAnimationFrame(step)
  }

  const dismissTooltip = (): void => setShowTooltip(false)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    stopInertia()
    dismissTooltip()
    dragRef.current = { active: true, moved: 0, lastX: e.clientX, lastY: e.clientY, lastT: performance.now() }
    velocityRef.current = { x: 0, y: 0 }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current
    if (!drag.active) return
    const now = performance.now()
    const dx = e.clientX - drag.lastX
    const dy = e.clientY - drag.lastY
    const dt = Math.max(1, now - drag.lastT)
    drag.moved += Math.abs(dx) + Math.abs(dy)
    // Capture only once this is clearly a pan — capturing on pointer-down
    // would retarget the eventual click to the wrapper and break tile taps.
    if (drag.moved > TAP_SLOP && !e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    panRef.current.x += dx
    panRef.current.y += dy
    velocityRef.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 }
    drag.lastX = e.clientX
    drag.lastY = e.clientY
    drag.lastT = now
    applyTransform()
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    runInertia()
  }

  // Swallow tile clicks that were really the tail end of a pan gesture.
  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (dragRef.current.moved > TAP_SLOP) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Trackpad / wheel = free 2D scroll in every direction.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const onWheel = (e: WheelEvent): void => {
      e.preventDefault()
      stopInertia()
      dismissTooltip()
      panRef.current.x -= e.deltaX
      panRef.current.y -= e.deltaY
      applyTransform()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockWidth, blockHeight])

  useEffect(() => stopInertia, [])

  const copyIndices = useMemo(
    () => Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => ({ c, r }))).flat(),
    [rows, cols],
  )

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'fixed inset-0 touch-none select-none overflow-hidden bg-canvas',
        isInert ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing',
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
      aria-hidden={isInert}
    >
      <div
        ref={innerRef}
        className={cn('absolute left-0 top-0 will-change-transform transition-[filter,opacity] duration-300', isInert && 'blur-md opacity-40')}
        style={{ transform: `translate3d(-${blockWidth}px, -${blockHeight}px, 0)` }}
      >
        {copyIndices.map(({ c, r }) => (
          <div
            key={`copy-${c}-${r}`}
            className="absolute"
            style={{ left: c * blockWidth, top: r * blockHeight, width: blockWidth, height: blockHeight }}
          >
            {tiles.map((tile) => (
              <div
                key={`${tile.project.id}-${c}-${r}`}
                className="absolute"
                style={{ left: tile.left, top: tile.top, width: tile.width, height: tile.height }}
              >
                <GraphicsCanvasCard
                  project={tile.project}
                  aspect={tile.aspect}
                  isVisible
                  scratchEnabled={scratchEnabled}
                  isRevealed={revealedIds.has(tile.project.id)}
                  isFocused={focusedProjectId === tile.project.id}
                  onReveal={handleReveal}
                  onFocus={() => onCardFocus(tile.project)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip — shown until the first interaction. */}
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-black/10 bg-accent px-4 py-2 text-center text-[13px] font-medium text-white shadow-ui transition-opacity duration-300 sm:text-[14px]',
          showTooltip && !isInert ? 'opacity-100' : 'opacity-0',
        )}
      >
        {scratchEnabled ? 'Hover to reveal · drag to explore' : 'Drag to explore · tap any image'}
      </div>
    </div>
  )
}
