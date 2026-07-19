import type { MetadataRoute } from 'next'

import { isUnbuilt } from '@/config/unbuilt-routes'
import { logger } from '@/lib/logger'
import { createStaticSupabaseClient } from '@/lib/supabase/static'
import { getPublicProjects } from '@/services/projects.service'

const BASE_URL = 'https://abiola.theruff.agency'

// Only routes that actually render. Everything in `UNBUILT_ROUTES`
// (src/config/unbuilt-routes.ts) answers 404, so it must stay out of the
// sitemap — add each path back as it launches.
const STATIC_ROUTES: readonly string[] = ['', '/graphics']

/**
 * Builds the sitemap for all static marketing routes plus every visible
 * project's detail page. Falls back gracefully to static routes only if
 * project data cannot be fetched (getPublicProjects already handles its own
 * placeholder fallback, so this should rarely be hit).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }))

  // `/project/[slug]` is gated too — skip the fetch entirely rather than
  // publish detail URLs that answer 404.
  if (isUnbuilt('/project')) return staticEntries

  try {
    const supabase = createStaticSupabaseClient()
    const projects = await getPublicProjects(supabase)

    const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
      url: `${BASE_URL}/project/${project.slug}`,
      lastModified: new Date(project.created_at),
    }))

    return [...staticEntries, ...projectEntries]
  } catch (err) {
    logger.error({ errorCode: 'SITEMAP_PROJECTS_FETCH_FAILED', err }, 'Falling back to static-only sitemap')
    return staticEntries
  }
}
