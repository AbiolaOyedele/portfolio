'use client'

import { useEffect } from 'react'

/**
 * Locks page scroll for as long as it's mounted — used on the home page, which
 * is a single fixed viewport-height hero with no content below the fold. The
 * shared public layout still renders the Footer after the page; locking scroll
 * keeps it out of reach here (navigation stays available via the fixed menu)
 * without special-casing the layout. Restores scrolling on unmount so every
 * other route scrolls normally.
 */
export default function LockBodyScroll(): null {
  useEffect(() => {
    // The viewport scroll container is <html> in standards mode, so locking
    // only <body> leaves the below-fold Footer scrollable. Lock both.
    const root = document.documentElement
    const prevRoot = root.style.overflow
    const prevBody = document.body.style.overflow
    root.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prevRoot
      document.body.style.overflow = prevBody
    }
  }, [])

  return null
}
