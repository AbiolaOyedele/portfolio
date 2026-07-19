import type { Metadata } from 'next'
import ThoughtsHero from '@/components/features/thoughts/ThoughtsHero'
import ThoughtsPostGrid from '@/components/features/thoughts/ThoughtsPostGrid'
import { thoughts } from '@/components/features/thoughts/thoughts-data'
import { notFound } from 'next/navigation'

import { isUnbuilt } from '@/config/unbuilt-routes'

export const metadata: Metadata = {
  title: 'Thoughts',
  description:
    'Design & development writing — notes on design, motion, and building things that actually feel right.',
}

/**
 * Thoughts (blog) landing page. Ported from the old ThoughtsPage.jsx.
 * Fully static — the post list is a hardcoded array, so this stays a
 * Server Component with no data fetching, loading, or error state needed.
 * The hero and post grid are isolated into 'use client' leaves because
 * they use Framer Motion entrance animations. Navbar/Footer are rendered
 * once by the root layout (see ThoughtsHero's `calc(100vh - 64px)`, which
 * already accounts for the root Navbar's height) — this page renders only
 * its own content, matching every other route.
 */
export default function ThoughtsPage(): React.JSX.Element {
  // Not launched yet — see src/config/unbuilt-routes.ts. Renders the segment's
  // not-found.tsx (<ComingSoon />) with a real 404 status.
  if (isUnbuilt('/thoughts')) notFound()

  return (
    <>
      <ThoughtsHero />

      {/* Posts grid */}
      <main id="posts" className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <ThoughtsPostGrid posts={thoughts} emptyMessage="There is nothing here yet. Check back soon." />
        </div>
      </main>
    </>
  )
}
