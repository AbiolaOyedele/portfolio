import { getProjectAspect, hashStringToInt } from '@/lib/masonry'
import type { Project } from '@/types/project'

/**
 * The four fixed tile aspect ratios the reference (hamzatariq.info) uses —
 * 3/4, 4/5, 1/1, 4/3. Every card is snapped to one of these so the columns
 * read as a deliberate grid rather than an organic masonry of arbitrary
 * proportions.
 */
export const GRAPHICS_ASPECTS = [3 / 4, 4 / 5, 1, 4 / 3] as const

/** Snap any measured ratio to the nearest of the four reference ratios. */
function snapAspect(aspect: number): number {
  let best = GRAPHICS_ASPECTS[0]
  let bestDelta = Math.abs(aspect - best)
  for (const candidate of GRAPHICS_ASPECTS) {
    const delta = Math.abs(aspect - candidate)
    if (delta < bestDelta) {
      best = candidate
      bestDelta = delta
    }
  }
  return best
}

export interface GraphicsBucket {
  /** Column width in px — 216 / 360 / 480 across the reference breakpoints. */
  columnWidth: number
  /** Uniform gap on both axes (16px in the reference). */
  gap: number
  /** How many columns make up one repeatable block. */
  columns: number
}

export const GRAPHICS_BUCKETS: Record<'mobile' | 'desktop' | 'wide', GraphicsBucket> = {
  mobile: { columnWidth: 216, gap: 16, columns: 4 },
  desktop: { columnWidth: 360, gap: 16, columns: 5 },
  wide: { columnWidth: 480, gap: 16, columns: 6 },
}

export function getGraphicsBucket(viewportWidth: number): GraphicsBucket {
  if (viewportWidth >= 1920) return GRAPHICS_BUCKETS.wide
  if (viewportWidth >= 768) return GRAPHICS_BUCKETS.desktop
  return GRAPHICS_BUCKETS.mobile
}

export interface GraphicsTileLayout {
  project: Project
  left: number
  top: number
  width: number
  height: number
  aspect: number
}

export interface GraphicsBlockLayout {
  tiles: GraphicsTileLayout[]
  /** Width of one repeatable block (all columns + gaps). */
  blockWidth: number
  /** Height of one repeatable block (tallest column + trailing gap). */
  blockHeight: number
}

interface ColumnTile {
  project: Project
  aspect: number
  height: number
}

/**
 * Lay every project out into a single repeatable block of fixed-width columns
 * (shortest-column-first, no rotation) — the unit the infinite canvas tiles
 * seamlessly in both axes. Deterministic so server and client agree (no
 * Math.random), driven purely by project id + measured cover aspect.
 *
 * Every column is then justified to fill the block's full height by spreading
 * its leftover space evenly between its own tiles. Without this, shorter
 * columns end well above the tallest one and leave a dead empty band at the
 * vertical wrap seam; with it, each column tiles seamlessly against its own
 * next copy and the canvas has no gaps.
 */
export function computeGraphicsBlock(projects: Project[], bucket: GraphicsBucket): GraphicsBlockLayout {
  const { columnWidth, gap, columns } = bucket

  const columnTiles: ColumnTile[][] = Array.from({ length: columns }, () => [])
  // Running packed height (tiles + gaps) per column, used only to pick the
  // shortest column for the next tile.
  const packedHeights = new Array<number>(columns).fill(gap)
  // Sum of tile heights per column (no gaps) — the basis for justification.
  const contentHeights = new Array<number>(columns).fill(0)

  for (const project of projects) {
    const aspect = snapAspect(getProjectAspect(project))
    const height = Math.round(columnWidth / aspect)

    let column = 0
    for (let i = 1; i < columns; i++) {
      if (packedHeights[i]! < packedHeights[column]!) column = i
    }

    columnTiles[column]!.push({ project, aspect, height })
    packedHeights[column] = packedHeights[column]! + height + gap
    contentHeights[column] = contentHeights[column]! + height
  }

  const blockHeight = Math.max(...packedHeights, gap)

  const tiles: GraphicsTileLayout[] = []
  for (let c = 0; c < columns; c++) {
    const list = columnTiles[c]!
    const left = gap + c * (columnWidth + gap)
    // Even gap that makes this column's tiles + gaps sum to exactly
    // blockHeight, so its next vertical copy butts up flush (no dead space).
    // The tallest column resolves to ~`gap`; shorter columns breathe a little
    // more. First tile sits at the block edge; the seam gap is the trailing one.
    const gapEach = list.length > 0 ? (blockHeight - contentHeights[c]!) / list.length : 0
    let top = 0
    for (const t of list) {
      tiles.push({ project: t.project, left, top, width: columnWidth, height: t.height, aspect: t.aspect })
      top += t.height + gapEach
    }
  }

  const blockWidth = gap + columns * (columnWidth + gap)
  return { tiles, blockWidth, blockHeight }
}

/** Stable per-tile key that stays unique across the tiled block copies. */
export function tileCopyKey(projectId: string, copyCol: number, copyRow: number): string {
  return `${projectId}:${copyCol}:${copyRow}:${hashStringToInt(projectId) % 97}`
}
