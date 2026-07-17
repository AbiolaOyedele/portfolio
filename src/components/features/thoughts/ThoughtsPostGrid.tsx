'use client'

import { motion } from 'framer-motion'
import type { Thought } from '@/types/thought'
import ThoughtPostCard from './ThoughtPostCard'

export interface ThoughtsPostGridProps {
  posts: Thought[]
  emptyMessage: string
}

/**
 * Responsive grid of `ThoughtPostCard`s with a staggered fade/slide-up
 * entrance animation, ported from the old ThoughtsPage.jsx post grid.
 * Isolated as a client leaf (same pattern as `ProjectGrid`) so the page
 * itself can stay a Server Component.
 *
 * Renders `emptyMessage` in a centered plain-English block when there are
 * no posts to show (the required "empty" state for the grid).
 */
export default function ThoughtsPostGrid({ posts, emptyMessage }: ThoughtsPostGridProps): React.JSX.Element {
  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-center text-text-muted" style={{ fontWeight: 300 }}>
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {posts.map((post, index) => (
        <motion.div
          key={post.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ThoughtPostCard post={post} />
        </motion.div>
      ))}
    </div>
  )
}
