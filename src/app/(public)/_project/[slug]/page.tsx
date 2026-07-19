import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Tag from '@/components/ui/Tag'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createStaticSupabaseClient } from '@/lib/supabase/static'
import { getProjectBySlug, getPublicProjects } from '@/services/projects.service'
import { GRAPHICS_SUBCATEGORIES } from '@/types/project'
import ProjectGallery from './project-gallery'

const DESCRIPTION_TRUNCATE_LENGTH = 155

export interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Pre-renders every visible project's slug at build time for SSG. If the
 * data source is unreachable at build time, returns no params instead of
 * failing the whole build — `dynamicParams` defaults to true, so pages
 * simply render on-demand at request time instead of being pre-rendered.
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const client = createStaticSupabaseClient()
    const projects = await getPublicProjects(client)
    return projects.map((project) => ({ slug: project.slug }))
  } catch (err) {
    logger.error({ errorCode: 'STATIC_PARAMS_PROJECTS_FETCH_FAILED', err }, 'Falling back to on-demand rendering for project pages')
    return []
  }
}

function truncateDescription(description: string): string {
  if (description.length <= DESCRIPTION_TRUNCATE_LENGTH) return description
  return `${description.slice(0, DESCRIPTION_TRUNCATE_LENGTH).trimEnd()}…`
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params

  let project: Awaited<ReturnType<typeof getProjectBySlug>>
  try {
    const client = await createServerSupabaseClient()
    project = await getProjectBySlug(client, slug)
  } catch (err) {
    logger.error({ errorCode: 'PROJECT_METADATA_FETCH_FAILED', err, slug }, 'Falling back to default metadata')
    return {}
  }

  if (!project) return {}

  const description = project.description
    ? truncateDescription(project.description)
    : `${project.title} — a project by Abiola Oyedele.`

  return {
    title: project.title,
    description,
    openGraph: {
      title: project.title,
      description,
      ...(project.cover_url ? { images: [{ url: project.cover_url }] } : {}),
    },
  }
}

/**
 * Returns the correct "back" destination for a project: graphics projects
 * go back to their subcategory hub (mapping the stored `subcategory` key
 * to its URL slug via `GRAPHICS_SUBCATEGORIES`), everything else goes back
 * to its category page.
 */
function getBackLink(project: { category: string; subcategory: string | null }): { href: string; label: string } {
  if (project.category === 'graphics' && project.subcategory) {
    const meta = GRAPHICS_SUBCATEGORIES.find((s) => s.key === project.subcategory)
    if (meta) return { href: `/graphics/${meta.slug}`, label: meta.label }
  }

  const label = project.category.charAt(0).toUpperCase() + project.category.slice(1)
  return { href: `/${project.category}`, label }
}

/**
 * Project detail page — Server Component. Fetches the project by slug and
 * calls `notFound()` when it doesn't exist, rendering the scoped
 * `not-found.tsx` (which keeps the same Navbar/Footer chrome the old page
 * showed for its inline "Project not found" message — the confirmed
 * improvement over that old inline-message approach).
 *
 * Navbar/Footer are rendered once by the root layout, so this page (and its
 * sibling `loading.tsx`/`not-found.tsx`) render only their own content.
 */
export default async function ProjectDetailPage({ params }: ProjectDetailPageProps): Promise<React.JSX.Element> {
  const { slug } = await params
  const client = await createServerSupabaseClient()
  const project = await getProjectBySlug(client, slug)

  if (!project) {
    notFound()
  }

  const images = project.images ?? []
  const backLink = getBackLink(project)

  return (
    <main className="flex-1">
      <div className="max-w-[860px] mx-auto px-6 py-12">
        <Link
          href={backLink.href}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
          style={{ fontWeight: 300 }}
        >
          <ArrowLeft className="w-4 h-4" />
          {backLink.label}
        </Link>

        <h1 className="text-[30px] md:text-[48px] text-text-primary mb-4 leading-tight" style={{ fontWeight: 400 }}>
          {project.title}
        </h1>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        {project.cover_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
            <Image
              src={cloudinaryUrl(project.cover_url, { width: 1200 })}
              alt={project.title}
              fill
              sizes="(max-width: 860px) 100vw, 860px"
              priority
              className="object-cover"
            />
          </div>
        )}

        {project.description ? (
          <p className="text-[17px] leading-[1.8] text-text-secondary mb-12" style={{ fontWeight: 300 }}>
            {project.description}
          </p>
        ) : (
          <p className="text-[15px] text-text-muted mb-12" style={{ fontWeight: 300 }}>
            No description yet for this project.
          </p>
        )}

        <ProjectGallery images={images} title={project.title} />

        {project.video_url && (
          <div className="mb-12">
            <p className="text-[13px] text-text-muted mb-3" style={{ fontWeight: 300 }}>
              Watch the reel
            </p>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black/5">
              <iframe
                src={project.video_url}
                title={`${project.title} video`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
