'use client'

import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import Image from 'next/image'
import { Heart, X as XIcon } from 'lucide-react'
import { cloudinaryUrl } from '@/lib/cloudinary'
import type { Project, VoteType } from '@/types/project'

const SWIPE_OFFSET_THRESHOLD = 120
const SWIPE_VELOCITY_THRESHOLD = 500
const FLY_OFF_DISTANCE = 600
// Matches circle-menu.tsx's established spring constants, for consistency
// rather than inventing new ones.
const SPRING = { type: 'spring' as const, stiffness: 320, damping: 28 }

export interface SwipeDeckCardProps {
  project: Project
  isFront: boolean
  stackDepth: number
  forceSwipe: VoteType | null
  onSwipeComplete: (direction: VoteType) => void
  onTapImage: () => void
}

/**
 * One card in the Tinder-style stack. Only the front card is draggable —
 * peek cards behind it are purely decorative. `dragConstraints` pinned to
 * {0,0,0,0} + `dragElastic={1}` lets the card move freely under the
 * pointer while still auto-springing back to center on release (via
 * `dragTransition`) when the swipe threshold isn't met — no manual
 * spring-back code needed for that path.
 */
export function SwipeDeckCard({
  project,
  isFront,
  stackDepth,
  forceSwipe,
  onSwipeComplete,
  onTapImage,
}: SwipeDeckCardProps): React.JSX.Element {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-18, 18])
  const likeOpacity = useTransform(x, [10, 120], [0, 1])
  const nopeOpacity = useTransform(x, [-120, -10], [1, 0])
  // Guards onSwipeComplete to fire at most once per card instance — without
  // this, a double-fire (observed from the forceSwipe effect re-running)
  // recorded two votes and advanced the deck by two cards for one click.
  const hasCompletedRef = useRef(false)

  const flyOff = (direction: VoteType): void => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    void animate(x, direction === 'like' ? FLY_OFF_DISTANCE : -FLY_OFF_DISTANCE, {
      ...SPRING,
      onComplete: () => onSwipeComplete(direction),
    })
  }

  useEffect(() => {
    if (forceSwipe) flyOff(forceSwipe)
    // flyOff is recreated each render (closes over onSwipeComplete) — only forceSwipe changing should retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceSwipe])

  const handleDragEnd = (_event: unknown, info: PanInfo): void => {
    if (info.offset.x > SWIPE_OFFSET_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      flyOff('like')
    } else if (info.offset.x < -SWIPE_OFFSET_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      flyOff('dislike')
    }
    // Otherwise: dragConstraints + dragElastic auto-springs back to x=0.
  }

  const coverUrl = cloudinaryUrl(project.cover_url, { width: 800 })

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x,
        rotate,
        scale: isFront ? 1 : 1 - stackDepth * 0.04,
        y: isFront ? 0 : stackDepth * 10,
        zIndex: 10 - stackDepth,
        pointerEvents: isFront ? 'auto' : 'none',
      }}
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      dragTransition={{ bounceStiffness: 320, bounceDamping: 28 }}
      {...(isFront ? { onDragEnd: handleDragEnd, onTap: onTapImage } : {})}
    >
      <div className="relative h-full w-full touch-none overflow-hidden rounded-2xl border border-border bg-surface shadow-card-hover">
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 90vw, 420px"
            className="pointer-events-none object-cover"
            priority={isFront}
          />
        )}

        {isFront && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 rounded-2xl border-2 border-accent bg-surface/90 px-3 py-1.5 text-accent"
            >
              <Heart className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium uppercase tracking-wide">Like</span>
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="pointer-events-none absolute right-4 top-4 flex items-center gap-1.5 rounded-2xl border-2 border-border bg-surface/90 px-3 py-1.5 text-text-muted"
            >
              <XIcon className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wide">Nope</span>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}
