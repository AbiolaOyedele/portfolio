'use client'

import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/project'

export interface GraphicsCanvasCardProps {
  project: Project
  aspect: number
  /** Hidden (filtered out) tiles stay mounted but non-interactive. */
  isVisible: boolean
  isFocused: boolean
  onFocus: () => void
}

/**
 * A single canvas tile: the cover image, always fully visible, opening the
 * focused viewer on click/tap. Pointer-down is NOT claimed here so a drag
 * that starts on a tile still pans the canvas — GraphicsCanvas suppresses
 * the click when the gesture moved, so drag and tap never conflict.
 */
export function GraphicsCanvasCard({
  project,
  aspect,
  isVisible,
  isFocused,
  onFocus,
}: GraphicsCanvasCardProps): React.JSX.Element {
  const coverUrl = cloudinaryUrl(project.cover_url, { width: 640 })

  return (
    <button
      type="button"
      onClick={onFocus}
      aria-label={`Open ${project.title}`}
      tabIndex={isVisible ? 0 : -1}
      style={{ aspectRatio: aspect, opacity: isFocused || !isVisible ? 0 : 1 }}
      className={cn(
        'relative block h-full w-full touch-none overflow-hidden rounded-lg bg-surface transition-opacity duration-200',
        !isVisible && 'pointer-events-none',
      )}
    >
      {coverUrl && (
        <Image
          src={coverUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
          draggable={false}
          // Cloudinary already applies w/f_auto/q_auto — skipping the
          // /_next/image proxy lets the browser hit its CDN cache directly.
          unoptimized
        />
      )}
    </button>
  )
}
