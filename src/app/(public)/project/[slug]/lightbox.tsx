'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'

import { cloudinaryUrl } from '@/lib/cloudinary'

export interface LightboxProps {
  images: string[]
  initialIndex: number
  altPrefix: string
  onClose: () => void
}

/**
 * Full-screen image viewer. Ported from the old React Router
 * `ProjectDetailPage`'s inline `Lightbox` component:
 * - Escape closes, ArrowLeft/ArrowRight navigate.
 * - Body scroll is locked while open, restored on close/unmount.
 * - Index state is owned here (was owned by the parent page before) since
 *   this is now a self-contained client island passed only the image list.
 */
export default function Lightbox({ images, initialIndex, altPrefix, onClose }: LightboxProps): React.JSX.Element | null {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex)

  const handlePrev = useCallback((): void => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const handleNext = useCallback((): void => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    },
    [onClose, handlePrev, handleNext],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const currentImage = images[currentIndex]
  if (!currentImage) return null

  // Only close when the click lands directly on the backdrop itself, not
  // when it bubbles up from a child (image, buttons) — avoids needing
  // `stopPropagation` (and the a11y issues that come with attaching click
  // handlers to non-interactive elements) on every child.
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        onClick={handleBackdropClick}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-6 right-6 text-white/70 hover:text-white z-50 p-2"
        >
          <X className="w-6 h-6" />
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50 p-2"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50 p-2"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}
        <div className="relative w-[90vw] h-[90vh]">
          <Image
            src={cloudinaryUrl(currentImage, { width: 1400 })}
            alt={`${altPrefix} — ${currentIndex + 1} of ${images.length}`}
            fill
            sizes="90vw"
            className="object-contain rounded-lg"
            priority
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
