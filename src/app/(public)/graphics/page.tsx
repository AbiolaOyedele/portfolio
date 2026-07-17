import type { Metadata } from 'next'

import { GraphicsExperience } from '@/components/features/graphics/GraphicsExperience'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPublicProjects } from '@/services/projects.service'

export const metadata: Metadata = {
  title: 'Graphics — Abiola Oyedele',
  description: 'Branding, social media, and deck design work by Abiola Oyedele.',
}

/**
 * `/graphics` — the interactive canvas: a pannable, spotlight-revealed
 * board of every graphics project, opening into a swipe-to-vote deck on
 * click. Replaces the old hub → subcategory-grid → project-page drill-down
 * (`/graphics/[subcategory]` now redirects here — see next.config.ts).
 *
 * Fetches every graphics project flattened (no per-subcategory covers) —
 * `getPublicProjects` already supports this via `{category: 'graphics'}`
 * alone, it was just never called that way before this rewrite.
 */
export default async function GraphicsPage(): Promise<React.JSX.Element> {
  const client = await createServerSupabaseClient()
  const projects = await getPublicProjects(client, { category: 'graphics' })

  return <GraphicsExperience projects={projects} />
}
