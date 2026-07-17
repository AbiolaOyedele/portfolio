'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * Pointer-only magnetic hover (GSAP): the element leans toward the cursor
 * and snaps back elastically. Registered only for fine pointers with motion
 * allowed, so touch devices and reduced-motion users get a plain control —
 * the effect is pure enhancement, never a dependency.
 *
 * Ported from the Dumpty site's button hover interaction.
 */
export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const mm = gsap.matchMedia()
    mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const handleMouseMove = (e: MouseEvent): void => {
        const rect = element.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        gsap.to(element, {
          x: x * 0.4,
          y: y * 0.4,
          scale: 1.05,
          ease: 'power2.out',
          duration: 0.4,
        })
      }
      const handleMouseLeave = (): void => {
        gsap.to(element, {
          x: 0,
          y: 0,
          scale: 1,
          ease: 'elastic.out(1, 0.3)',
          duration: 1.2,
        })
      }
      element.addEventListener('mousemove', handleMouseMove)
      element.addEventListener('mouseleave', handleMouseLeave)
      return () => {
        element.removeEventListener('mousemove', handleMouseMove)
        element.removeEventListener('mouseleave', handleMouseLeave)
      }
    })

    return () => mm.revert()
  }, [])

  return ref
}
