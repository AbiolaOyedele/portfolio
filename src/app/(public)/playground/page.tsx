import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isUnbuilt } from '@/config/unbuilt-routes'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Digital products, tools, and interfaces by Abiola Oyedele.',
}

/**
 * `/playground` — not launched yet. The real page (a bento grid of case
 * cards, with `/playground/[case]` subpages behind it) is still in progress
 * locally; this committed version is deliberately a stub so the route can
 * answer a real 404 without dragging the unfinished feature into the build.
 * Restore the implementation and drop the guard together — see
 * src/config/unbuilt-routes.ts.
 */
export default function PlaygroundPage(): React.JSX.Element {
  // Renders this segment's not-found.tsx (<ComingSoon />) with a 404 status.
  if (isUnbuilt('/playground')) notFound()

  return <main className="flex-1 bg-white" />
}
