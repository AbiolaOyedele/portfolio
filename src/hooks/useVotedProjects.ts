'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio:graphics:voted-projects'

function readStoredIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed.filter((id): id is string => typeof id === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

/**
 * Tracks which projects this browser has already voted on, so a returning
 * visit to the swipe deck can show a small "already voted" indicator.
 *
 * This is a UX nicety, not an abuse-prevention control — there is no rate
 * limiting anywhere in this app, and `markVoted` never blocks a repeat
 * vote, it only records one for display purposes.
 */
export function useVotedProjects(): { votedIds: Set<string>; markVoted: (projectId: string) => void } {
  // SSR-safe default (empty, matches the server) — corrected from
  // localStorage after mount, same pattern as `useResponsiveSizes()` in
  // circle-menu.tsx.
  const [votedIds, setVotedIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    setVotedIds(readStoredIds())
  }, [])

  const markVoted = useCallback((projectId: string) => {
    setVotedIds((prev) => {
      if (prev.has(projectId)) return prev
      const next = new Set(prev)
      next.add(projectId)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
      } catch {
        // Private mode / storage quota — swallow, this is a nicety only.
      }
      return next
    })
  }, [])

  return { votedIds, markVoted }
}
