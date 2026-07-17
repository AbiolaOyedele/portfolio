import { GRAPHICS_PLACEHOLDER_IMAGES } from '@/lib/graphics-placeholder-images'
import type { Project } from '@/types/project'

export interface CardLayout {
  top: number
  left: number
  width: number
  height: number
  rotate: number
}

export interface MasonryBucket {
  columns: number
  columnWidth: number
  gap: number
  /** Canvas floor size, so panning has real range even with few cards. */
  minWidth: number
  minHeight: number
}

export const MASONRY_BUCKETS: Record<'mobile' | 'tablet' | 'desktop', MasonryBucket> = {
  mobile: { columns: 4, columnWidth: 150, gap: 14, minWidth: 1600, minHeight: 1800 },
  tablet: { columns: 5, columnWidth: 220, gap: 18, minWidth: 2000, minHeight: 2000 },
  desktop: { columns: 6, columnWidth: 280, gap: 20, minWidth: 2400, minHeight: 2200 },
}

// Width-to-height ratios cards are deterministically assigned from, giving
// the scattered/masonry look without any two adjacent cards necessarily
// matching — indexed by `hashStringToInt(project.id) % ASPECT_VARIANTS.length`.
// Only used as a fallback for cover images with no measured aspect ratio
// (e.g. a real DB row whose upload isn't in GRAPHICS_PLACEHOLDER_IMAGES).
const ASPECT_VARIANTS = [1, 4 / 3, 3 / 4, 16 / 9, 9 / 16]

// Real, measured aspect ratios keyed by cover_url — takes precedence over
// the hash-based guess above so each placeholder card's box actually matches
// its image instead of cropping it into an arbitrary bucket.
const KNOWN_ASPECT_BY_COVER_URL: ReadonlyMap<string, number> = new Map(
  GRAPHICS_PLACEHOLDER_IMAGES.map((image) => [image.file, image.aspect]),
)

/**
 * Deterministic (not Math.random(), which would break SSR hydration —
 * server and client must compute the exact same layout from the exact same
 * input) DJB2-style string hash, used to derive each card's aspect-ratio
 * variant and rotation jitter purely from its project id.
 */
export function hashStringToInt(value: string): number {
  let hash = 5381
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i)
  }
  return Math.abs(hash)
}

/**
 * A project's real (measured) aspect ratio when its cover image is in
 * GRAPHICS_PLACEHOLDER_IMAGES, falling back to the deterministic hash-based
 * guess otherwise. Exported (not just inlined in computeMasonryLayout) so
 * TileFocusOverlay can size the focused view to match the same real
 * proportions the grid card already uses, without threading layout data
 * through GraphicsExperience just for one number.
 */
export function getProjectAspect(project: Project): number {
  const hash = hashStringToInt(project.id)
  const knownAspect = project.cover_url ? KNOWN_ASPECT_BY_COVER_URL.get(project.cover_url) : undefined
  return knownAspect ?? ASPECT_VARIANTS[hash % ASPECT_VARIANTS.length]!
}

export interface MasonryLayoutResult {
  layouts: CardLayout[]
  canvasWidth: number
  canvasHeight: number
}

/**
 * Shortest-column-first placement (classic Pinterest/masonry algorithm):
 * each card goes into whichever column is currently shortest, advancing
 * that column's running height by the card's own height plus the gap.
 */
export function computeMasonryLayout(projects: Project[], bucket: MasonryBucket): MasonryLayoutResult {
  const { columns, columnWidth, gap } = bucket
  const columnHeights = new Array<number>(columns).fill(gap)
  const layouts: CardLayout[] = []

  for (const project of projects) {
    const hash = hashStringToInt(project.id)
    const aspect = getProjectAspect(project)
    const height = Math.round(columnWidth / aspect)
    const rotate = (hash % 7) - 3 // -3..3 degrees

    let column = 0
    for (let i = 1; i < columns; i++) {
      if (columnHeights[i]! < columnHeights[column]!) column = i
    }

    const top = columnHeights[column]!
    const left = gap + column * (columnWidth + gap)

    layouts.push({ top, left, width: columnWidth, height, rotate })
    columnHeights[column] = top + height + gap
  }

  const contentWidth = gap + columns * (columnWidth + gap)
  const contentHeight = Math.max(...columnHeights, gap)

  return {
    layouts,
    canvasWidth: Math.max(contentWidth, bucket.minWidth),
    canvasHeight: Math.max(contentHeight, bucket.minHeight),
  }
}
