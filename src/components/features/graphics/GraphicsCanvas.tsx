'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Folder, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { computeMasonryLayout, MASONRY_BUCKETS, type MasonryBucket } from '@/lib/masonry'
import { GRAPHICS_SUBCATEGORIES, type Project } from '@/types/project'
import { GraphicsCanvasCard } from './GraphicsCanvasCard'

function getBucket(width: number): MasonryBucket {
  if (width >= 1024) return MASONRY_BUCKETS.desktop
  if (width >= 640) return MASONRY_BUCKETS.tablet
  return MASONRY_BUCKETS.mobile
}

// null = "All" — first stop in the cycle the category pill steps through.
const FILTER_CYCLE: readonly (string | null)[] = [null, ...GRAPHICS_SUBCATEGORIES.map((sub) => sub.key)]

function filterLabel(filter: string | null): string {
  if (filter === null) return 'All'
  return GRAPHICS_SUBCATEGORIES.find((sub) => sub.key === filter)?.label ?? 'All'
}

export interface GraphicsCanvasProps {
  projects: Project[]
  isInert: boolean
  focusedProjectId: string | null
  onCardFocus: (project: Project) => void
}

/**
 * Pannable/draggable canvas of blurred, spotlight-revealed project cards —
 * the /graphics landing experience. Clicking a card hands focus up to
 * `GraphicsExperience`, which renders the zoomed `TileFocusOverlay`; this
 * component only owns pan/layout/filter/discovery-count state.
 */
export function GraphicsCanvas({ projects, isInert, focusedProjectId, onCardFocus }: GraphicsCanvasProps): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null)
  // Measured once on mount (like useResponsiveSizes() in circle-menu.tsx),
  // deliberately not re-measured on resize — relaying-out mid-pan would
  // relocate every card under an actively panning/scratching pointer.
  const [bucket, setBucket] = useState<MasonryBucket>(MASONRY_BUCKETS.mobile)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setBucket(getBucket(window.innerWidth))
  }, [])

  const { layouts, canvasWidth, canvasHeight } = useMemo(
    () => computeMasonryLayout(projects, bucket),
    [projects, bucket],
  )

  const visibleProjects = useMemo(
    () => (activeFilter ? projects.filter((p) => p.subcategory === activeFilter) : projects),
    [projects, activeFilter],
  )
  const visibleIds = useMemo(() => new Set(visibleProjects.map((p) => p.id)), [visibleProjects])
  const revealedInFilter = useMemo(
    () => visibleProjects.filter((p) => revealedIds.has(p.id)).length,
    [visibleProjects, revealedIds],
  )

  const handleFirstReveal = (id: string): void => {
    setRevealedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const handleCycleFilter = (): void => {
    const currentIndex = FILTER_CYCLE.indexOf(activeFilter)
    const nextFilter = FILTER_CYCLE[(currentIndex + 1) % FILTER_CYCLE.length]
    setActiveFilter(nextFilter ?? null)
  }

  return (
    <div ref={wrapperRef} className="relative h-dvh w-full touch-none overflow-hidden bg-bg" inert={isInert}>
      <motion.div
        drag
        dragConstraints={wrapperRef}
        dragElastic={0.05}
        className={cn('absolute touch-none transition-[filter,opacity] duration-300', isInert && 'blur-md opacity-40')}
        style={{ width: canvasWidth, height: canvasHeight }}
      >
        {projects.map((project, index) => (
          <GraphicsCanvasCard
            key={project.id}
            project={project}
            layout={layouts[index]!}
            isVisible={visibleIds.has(project.id)}
            isFocused={focusedProjectId === project.id}
            onFocus={() => onCardFocus(project)}
            onFirstReveal={handleFirstReveal}
          />
        ))}
      </motion.div>

      <div
        className={cn(
          'absolute bottom-6 left-4 z-10 flex items-center gap-2 transition-opacity duration-200 sm:bottom-8 sm:left-6 lg:bottom-12 lg:left-10',
          isInert && 'pointer-events-none opacity-0',
        )}
      >
        <button
          type="button"
          onClick={handleCycleFilter}
          className="flex h-11 min-w-[152px] items-center justify-between gap-3 rounded-full border border-border bg-surface px-4 text-[13px] text-text-primary shadow-card transition-colors hover:border-accent"
        >
          <span className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-accent" />
            {filterLabel(activeFilter)}
          </span>
          <LayoutGrid className="h-4 w-4 text-text-muted" />
        </button>

        <div className="flex h-11 items-center rounded-full border border-border bg-surface px-4 text-[13px] text-text-secondary shadow-card">
          {revealedInFilter}/{visibleProjects.length}
        </div>
      </div>
    </div>
  )
}
