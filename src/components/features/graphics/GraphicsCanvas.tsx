'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Folder, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { computeGraphicsBlock, getGraphicsBucket, GRAPHICS_BUCKETS } from '@/lib/graphics-layout'
import { GRAPHICS_SUBCATEGORIES, type Project } from '@/types/project'
import { GraphicsCanvasCard } from './GraphicsCanvasCard'

// null = "All" — first stop in the cycle the category pill steps through.
const FILTER_CYCLE: readonly (string | null)[] = [null, ...GRAPHICS_SUBCATEGORIES.map((sub) => sub.key)]

function filterLabel(filter: string | null): string {
  if (filter === null) return 'All'
  return GRAPHICS_SUBCATEGORIES.find((sub) => sub.key === filter)?.label ?? 'All'
}

const INERTIA_DECAY = 0.92
const MIN_VELOCITY = 0.05

export interface GraphicsCanvasProps {
  projects: Project[]
  isInert: boolean
  focusedProjectId: string | null
  onCardFocus: (project: Project) => void
}

/**
 * Infinite, free-scrolling canvas of scratch-to-reveal tiles. One repeatable
 * block of columns is tiled across the viewport in both axes and wrapped with
 * modular arithmetic, so panning (pointer drag with velocity inertia) and
 * trackpad/wheel scrolling roam endlessly in every direction. Pan is applied
 * imperatively to a single transform — the tile DOM never re-renders while
 * moving.
 */
export function GraphicsCanvas({ projects, isInert, focusedProjectId, onCardFocus }: GraphicsCanvasProps): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const [bucket, setBucket] = useState(GRAPHICS_BUCKETS.mobile)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())
  const [showTooltip, setShowTooltip] = useState(true)

  // Pan + inertia live in refs so movement never triggers React renders.
  const panRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef<{ active: boolean; lastX: number; lastY: number; lastT: number }>({
    active: false,
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
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, lastT: performance.now() }
    velocityRef.current = { x: 0, y: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current
    if (!drag.active) return
    const now = performance.now()
    const dx = e.clientX - drag.lastX
    const dy = e.clientY - drag.lastY
    const dt = Math.max(1, now - drag.lastT)
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
    e.currentTarget.releasePointerCapture(e.pointerId)
    runInertia()
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

  const handleReveal = (id: string): void => {
    setRevealedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const handleCycleFilter = (): void => {
    const currentIndex = FILTER_CYCLE.indexOf(activeFilter)
    setActiveFilter(FILTER_CYCLE[(currentIndex + 1) % FILTER_CYCLE.length] ?? null)
  }

  const isTileVisible = (project: Project): boolean =>
    activeFilter === null || project.subcategory === activeFilter

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
                  isVisible={isTileVisible(tile.project)}
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

      {/* Tooltip — reference copy, shown until the first interaction. */}
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 rounded-full border border-black/10 bg-[#3399FF] px-3 py-1.5 text-[14px] leading-tight text-white shadow-ui transition-opacity duration-300',
          showTooltip && !isInert ? 'opacity-100' : 'opacity-0',
        )}
      >
        Hover, drag, and click to explore.
      </div>

      {/* Category pill — bottom-center, cycles All → subcategories (no counter). */}
      <div
        className={cn(
          'absolute bottom-8 left-1/2 z-20 -translate-x-1/2 transition-opacity duration-200',
          isInert && 'pointer-events-none opacity-0',
        )}
      >
        <button
          type="button"
          onClick={handleCycleFilter}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-14 w-[200px] items-center justify-between rounded-full border border-black/10 bg-white px-5 text-[16px] text-black shadow-ui transition-transform duration-200 hover:scale-[1.025] active:scale-95"
        >
          <span className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-[#2384E6]" />
            {filterLabel(activeFilter)}
          </span>
          <LayoutGrid className="h-4 w-4 text-black/40" />
        </button>
      </div>
    </div>
  )
}
