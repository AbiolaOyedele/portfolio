'use client'

import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useMagnetic } from '@/hooks/useMagnetic'
import { MenuToggle } from '@/components/ui/menu-toggle'
import { LottieArrow } from '@/components/ui/lottie-arrow'

/**
 * Items fan out across a quarter-arc from "left" (180deg) to "straight up" (270deg) —
 * the only arc that stays on-screen for a bottom-right-anchored trigger at any viewport
 * size. A full 360deg spread (the usual radial-menu pattern) would push roughly half the
 * items off the bottom/right edge from a corner position.
 */
const ARC_START_DEG = 180
const ARC_END_DEG = 270
const OPEN_STAGGER = 0.02
// Cadence each item retracts at when closing, staggered in reverse (last-opened item
// retracts first). MenuTrigger's catch-pulse reuses this exact value so its pulses land
// in sync with items actually arriving, instead of playing on its own unrelated clock.
const ITEM_CLOSE_STEP = 0.028

interface SizeBucket {
  trigger: number
  item: number
  radius: number
}

const MOBILE: SizeBucket = { trigger: 60, item: 52, radius: 210 }
const TABLET: SizeBucket = { trigger: 66, item: 56, radius: 240 }
const DESKTOP: SizeBucket = { trigger: 72, item: 60, radius: 280 }

function getSizes(width: number): SizeBucket {
  if (width >= 1024) return DESKTOP
  if (width >= 640) return TABLET
  return MOBILE
}

function useResponsiveSizes(): SizeBucket {
  const [sizes, setSizes] = useState<SizeBucket>(MOBILE)

  useEffect(() => {
    const update = (): void => setSizes(getSizes(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return sizes
}

function pointOnArc(index: number, total: number, radius: number): { x: number; y: number } {
  const angleDeg =
    total > 1 ? ARC_START_DEG + (index * (ARC_END_DEG - ARC_START_DEG)) / (total - 1) : (ARC_START_DEG + ARC_END_DEG) / 2
  const angleRad = (angleDeg * Math.PI) / 180
  return { x: radius * Math.cos(angleRad), y: radius * Math.sin(angleRad) }
}

export interface CircleMenuItem {
  label: string
  icon: ReactNode
  href: string
  active?: boolean
}

interface MenuItemProps extends CircleMenuItem {
  index: number
  totalItems: number
  isOpen: boolean
  size: number
  radius: number
  onNavigate: () => void
}

function MenuItem({
  icon,
  label,
  href,
  index,
  totalItems,
  isOpen,
  size,
  radius,
  active = false,
  onNavigate,
}: MenuItemProps): React.JSX.Element {
  const { x, y } = pointOnArc(index, totalItems, radius)
  const magneticRef = useMagnetic<HTMLAnchorElement>()

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        animate={{
          x: isOpen ? x : 0,
          y: isOpen ? y : 0,
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0.4,
        }}
        transition={{
          delay: isOpen ? index * OPEN_STAGGER : (totalItems - index) * ITEM_CLOSE_STEP,
          type: 'spring',
          stiffness: 320,
          damping: 28,
        }}
        // opacity-0 + a transform mirror the closed `animate` values as plain CSS, so
        // items are correctly hidden/collapsed on first paint — before Framer Motion's
        // client-side JS has mounted to apply `animate` itself (server-rendered HTML, or
        // the gap before hydration). Deliberately `[transform:scale(...)]`, NOT Tailwind's
        // `scale-*` utility: Tailwind v4's `scale-*` sets the independent CSS `scale`
        // property, which composes *multiplicatively* with Framer Motion's own transform
        // instead of being replaced by it — every item would stay permanently shrunk.
        // Targeting `transform` directly means Framer Motion's inline style (same
        // property) cleanly overwrites this the instant it takes over.
        className="absolute flex flex-col items-center gap-1.5 opacity-0 [transform:scale(0.4)]"
      >
        <Link
          ref={magneticRef}
          href={href}
          onClick={onNavigate}
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          tabIndex={isOpen ? 0 : -1}
          style={{ width: size, height: size }}
          className={cn(
            'peer flex items-center justify-center rounded-full border shadow-card transition-colors duration-150',
            active
              ? 'border-accent bg-accent text-white'
              : 'border-border bg-surface text-text-primary hover:border-accent hover:text-accent'
          )}
        >
          {icon}
        </Link>
        <span
          className={cn(
            'pointer-events-none whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] opacity-0 shadow-card transition-opacity duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100 sm:text-[11px]',
            active ? 'border-accent bg-accent text-white' : 'border-border bg-surface text-text-secondary'
          )}
        >
          {label}
        </span>
      </motion.div>
    </div>
  )
}

interface MenuTriggerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  itemsLength: number
  size: number
}

function MenuTrigger({ isOpen, onOpenChange, itemsLength, size }: MenuTriggerProps): React.JSX.Element {
  const pulseControls = useAnimationControls()
  const iconSize = Math.round(size * 0.4)

  // One small pulse per item retracting, fired on the same cadence items actually use to
  // stagger their retraction (ITEM_CLOSE_STEP) — so the trigger visibly "catches" each one
  // as it flies back in, rather than playing a fixed flourish unrelated to the item count.
  const playCatchPulse = async (): Promise<void> => {
    for (let i = 0; i < itemsLength; i++) {
      void pulseControls.start({
        scale: [1, 1.16, 1],
        transition: { duration: ITEM_CLOSE_STEP * 3, ease: 'easeOut' },
      })
      if (i !== itemsLength - 1) {
        await new Promise((resolve) => setTimeout(resolve, ITEM_CLOSE_STEP * 1000))
      }
    }
  }

  return (
    <motion.div
      animate={pulseControls}
      style={{ height: size, width: size }}
      className="relative z-50 flex items-center justify-center rounded-full bg-accent shadow-card-hover transition-transform duration-150 hover:scale-105"
    >
      <MenuToggle
        open={isOpen}
        onOpenChange={(next) => {
          if (!next) void playCatchPulse()
          onOpenChange(next)
        }}
        label="Navigation menu"
        style={{ width: iconSize, height: iconSize }}
        strokeWidth={2.5}
        className="text-white"
      />
    </motion.div>
  )
}

export interface CircleMenuProps {
  items: CircleMenuItem[]
  /** Pass a value that changes on navigation (e.g. pathname) to force the menu shut. */
  resetKey?: string
  /** Show a small "Tap here" hint above the arrow (home page only). */
  showTapHint?: boolean
  className?: string
}

/**
 * Corner-anchored radial navigation menu. Fixed to the bottom-right of the viewport;
 * items fan out along a top-left quarter-arc so nothing spreads off-screen at any size.
 */
export function CircleMenu({ items, resetKey, showTapHint = false, className }: CircleMenuProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const sizes = useResponsiveSizes()

  useEffect(() => {
    setIsOpen(false)
  }, [resetKey])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-[var(--color-text-primary)]/10"
          />
        )}
      </AnimatePresence>

      <nav
        aria-label="Primary"
        className={cn('fixed right-4 bottom-6 z-50 sm:right-6 sm:bottom-8 lg:right-10 lg:bottom-12', className)}
      >
        <div className="relative" style={{ width: sizes.trigger, height: sizes.trigger }}>
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute bottom-full left-1/2 mb-1 flex -translate-x-1/2 flex-col items-center"
              >
                {showTapHint && (
                  <span className="mb-0.5 whitespace-nowrap text-[11px] font-medium text-text-secondary sm:text-xs">
                    Tap here
                  </span>
                )}
                <span className="h-10 w-10 sm:h-12 sm:w-12">
                  <LottieArrow className="h-full w-full" />
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <MenuTrigger isOpen={isOpen} onOpenChange={setIsOpen} itemsLength={items.length} size={sizes.trigger} />

          {items.map((item, index) => (
            <MenuItem
              key={item.href}
              index={index}
              totalItems={items.length}
              isOpen={isOpen}
              size={sizes.item}
              radius={sizes.radius}
              onNavigate={() => setIsOpen(false)}
              {...item}
            />
          ))}
        </div>
      </nav>
    </>
  )
}
