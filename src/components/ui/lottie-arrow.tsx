'use client'

import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import scrollPromptAnimation from '@/lib/animations/ScrollPrompt.json'

const FALLBACK_ACCENT = '#FF4F03'

function hexToLottieRgb(hex: string): number[] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ]
}

function isWhite(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === 3 && value.every((component) => component === 1)
}

/** Walks a Lottie JSON tree, swapping every white ([1,1,1]) shape color for `rgb`. */
function recolor(node: unknown, rgb: number[]): unknown {
  if (Array.isArray(node)) return node.map((item) => recolor(item, rgb))
  if (node && typeof node === 'object') {
    const entries = Object.entries(node as Record<string, unknown>).map(([key, value]) => {
      if (key === 'c' && value && typeof value === 'object' && isWhite((value as { k?: unknown }).k)) {
        return [key, { ...(value as object), k: rgb }] as const
      }
      return [key, recolor(value, rgb)] as const
    })
    return Object.fromEntries(entries)
  }
  return node
}

export interface LottieArrowProps {
  className?: string
}

/**
 * Looping "point here" arrow, ported from the Ruff sites' ScrollPrompt Lottie
 * animation (originally a scroll-down hero prompt; unrotated it already points
 * down, which is what we want above the menu button). Recolored at mount from
 * whatever --color-accent currently resolves to, so it stays tied to the same
 * single accent token as the rest of the site instead of a color baked into
 * the JSON.
 */
export function LottieArrow({ className }: LottieArrowProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || FALLBACK_ACCENT
    const animationData = recolor(scrollPromptAnimation, hexToLottieRgb(accent))

    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationData as object,
    })

    return () => anim.destroy()
  }, [])

  return <div ref={containerRef} className={className} aria-hidden="true" />
}
