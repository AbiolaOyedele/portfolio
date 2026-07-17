'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState, type ReactElement } from 'react'

/**
 * The three word-banks the hero cycles through, one per line — mirroring the
 * reference's "designing (…) / for (…) / with (…)" structure.
 *
 * - Deliverables lead with "Solutions" (shown first on load).
 * - Qualities are freshly worded, not copied from the source.
 */
const DELIVERABLES = ['Solutions', 'Brands', 'Systems', 'Interfaces', 'Stories', 'Products'] as const
const AUDIENCES = ['Founders', 'Startups', 'Studios', 'Innovators', 'Teams', 'Challengers'] as const
const QUALITIES = ['Purpose', 'Taste', 'Conviction', 'Restraint', 'Soul', 'Clarity'] as const

const LINES = [
  { prefix: 'Creating', words: DELIVERABLES },
  { prefix: 'for', words: AUDIENCES },
  { prefix: 'with', words: QUALITIES },
] as const

/**
 * How long between word changes. Matching the reference, only ONE line changes
 * per tick — cascading top → middle → bottom — so any single line updates once
 * every `TICK_MS * LINES.length`.
 */
const TICK_MS = 1400

interface RotatingWordProps {
  /** The word currently shown; changing it triggers the reveal animation. */
  word: string
}

/**
 * A single bracketed word. Each letter animates its width open (and shut on
 * exit) so the letters push the layout apart — sliding the closing bracket out
 * and back, exactly like the reference. Blur + fade ride along on top.
 */
function RotatingWord({ word }: RotatingWordProps): ReactElement {
  const prefersReducedMotion = useReducedMotion()
  const chars = useMemo(() => word.split(''), [word])

  return (
    <span className="inline-flex items-baseline text-text-muted">
      <span>(</span>
      <AnimatePresence mode="wait">
        <motion.span key={word} className="inline-flex text-text-primary" style={{ fontWeight: 500 }}>
          {chars.map((char, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="inline-block overflow-hidden"
              style={{ whiteSpace: 'pre' }}
              initial={
                prefersReducedMotion
                  ? { opacity: 0, maxWidth: '2ch' }
                  : { opacity: 0, filter: 'blur(6px)', maxWidth: 0 }
              }
              animate={{ opacity: 1, filter: 'blur(0px)', maxWidth: '2ch' }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0, maxWidth: 0 }
                  : { opacity: 0, filter: 'blur(6px)', maxWidth: 0 }
              }
              transition={{
                duration: 0.32,
                delay: prefersReducedMotion ? 0 : i * 0.03,
                ease: 'easeOut',
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
      <span>)</span>
    </span>
  )
}

/**
 * Landing hero — the reference's three-line rotating headline, reworked:
 * "Creating (…) / for (…) / with (…)". One word changes per tick, cascading
 * down the lines in sequence (top → middle → bottom).
 */
export default function RotatingHero(): ReactElement {
  const [indices, setIndices] = useState<[number, number, number]>([0, 0, 0])

  useEffect(() => {
    let tick = 0
    const id = window.setInterval(() => {
      const line = tick % LINES.length
      const wordCount = LINES[line]?.words.length ?? 1
      setIndices((prev) => {
        const next: [number, number, number] = [...prev]
        next[line] = ((prev[line] ?? 0) + 1) % wordCount
        return next
      })
      tick += 1
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  const srLabel = LINES.map((l, i) => `${l.prefix} ${l.words[indices[i] ?? 0]}`).join(' ')

  return (
    <h1 className="text-text-primary leading-[1.05] tracking-tight text-[clamp(2.25rem,11vw,8rem)]">
      <span className="sr-only">{srLabel}.</span>

      <span aria-hidden className="flex flex-col gap-y-[0.2em] sm:gap-y-[0.05em]" style={{ fontWeight: 300 }}>
        {LINES.map((line, i) => (
          // Mobile: prefix and bracketed word stack (each on its own line),
          // matching the reference. Desktop (sm+): they sit inline, baseline-aligned.
          <span key={line.prefix} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-x-[0.25em]">
            <span>{line.prefix}</span>
            <RotatingWord word={line.words[indices[i] ?? 0] ?? line.words[0]} />
          </span>
        ))}
      </span>
    </h1>
  )
}
