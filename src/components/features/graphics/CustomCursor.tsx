'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Small circular pointer-follower for the graphics canvas, matching the
 * reference site's desktop cursor accent. Gated behind a live
 * `(hover: hover) and (pointer: fine)` check before rendering or attaching
 * any listener at all, so touch devices run none of this code — mobile-first
 * requires nothing depend on hover, and this adds a hover-only decoration
 * without depending on it for any actual functionality.
 */
export function CustomCursor(): React.JSX.Element | null {
  const [enabled, setEnabled] = useState(false)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
    setEnabled(mql.matches)
    const handleChange = (e: MediaQueryListEvent): void => setEnabled(e.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const handleMove = (e: PointerEvent): void => {
      const dot = dotRef.current
      if (!dot) return
      dot.style.transform = `translate3d(${e.clientX - 8}px, ${e.clientY - 8}px, 0)`
    }
    document.addEventListener('pointermove', handleMove)
    return () => document.removeEventListener('pointermove', handleMove)
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-4 w-4 rounded-full border border-border bg-white shadow-card"
    />
  )
}
