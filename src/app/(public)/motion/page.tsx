import type { Metadata } from 'next'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPublicProjects } from '@/services/projects.service'
import { isAppError } from '@/lib/errors'
import type { Project } from '@/types/project'
import MotionCard from '@/components/features/projects/MotionCard'

export const metadata: Metadata = {
  title: 'Motion',
  description: 'Animation and video production work by Abiola Oyedele.',
}

/**
 * Motion category page. Server Component — fetches motion projects and
 * renders them in the large-card treatment ported from the old
 * MotionPage.jsx: a horizontal-scroll rail of ~600px cards on desktop
 * (`lg:` and up), falling back to a stacked flex column on mobile.
 *
 * Loading is handled by the sibling `loading.tsx`. This component itself
 * covers the empty and error states, since both depend on the fetch result.
 */
export default async function MotionPage(): Promise<React.JSX.Element> {
  let projects: Project[]
  let loadError: string | null = null

  try {
    const client = await createServerSupabaseClient()
    projects = await getPublicProjects(client, { category: 'motion' })
  } catch (err) {
    projects = []
    loadError = isAppError(err)
      ? err.message
      : 'We could not load projects right now. Please try again shortly.'
  }

  return (
    <div className="flex flex-col">
      {/* ── Desktop split layout ── */}
      <div
        className="hidden lg:flex flex-1 overflow-hidden"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {/* Left panel — content pinned to bottom */}
        <div className="w-[320px] shrink-0 flex flex-col justify-end px-10 pb-12 border-r border-border">
          <svg
            width="160"
            height="112"
            viewBox="0 0 172 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-text-primary"
          >
            <path
              d="M12 60 H148 M100 16 L148 60 L100 104"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <h1 className="text-[52px] text-text-primary leading-[1.04] mt-6" style={{ fontWeight: 400 }}>
            Motion
          </h1>
          <p className="text-[15px] text-text-muted mt-2" style={{ fontWeight: 300 }}>
            Animation and video production.
          </p>
          {!loadError && projects.length > 0 && (
            <p className="text-[13px] text-text-muted mt-1" style={{ fontWeight: 300 }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Right scroll area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          {loadError ? (
            <div className="h-full flex items-center justify-center px-10">
              <p className="text-center text-text-muted" style={{ fontWeight: 300 }}>
                {loadError}
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-text-muted" style={{ fontWeight: 300 }}>
                Projects coming soon.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-5 h-full px-10 py-12" style={{ width: 'max-content' }}>
              {projects.map((project) => (
                <MotionCard key={project.id} project={project} />
              ))}
              <div className="w-6 shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden flex-1">
        <div className="px-6 pt-16 pb-8">
          <svg
            width="112"
            height="80"
            viewBox="0 0 172 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-text-primary"
          >
            <path
              d="M12 60 H148 M100 16 L148 60 L100 104"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-[44px] text-text-primary leading-tight mt-6" style={{ fontWeight: 400 }}>
            Motion
          </h1>
          <p className="text-[15px] text-text-muted mt-2" style={{ fontWeight: 300 }}>
            Animation and video production.
          </p>
        </div>

        <div className="px-6 pb-20">
          {loadError ? (
            <p className="text-center text-text-muted py-16" style={{ fontWeight: 300 }}>
              {loadError}
            </p>
          ) : projects.length === 0 ? (
            <p className="text-center text-text-muted py-16" style={{ fontWeight: 300 }}>
              Projects coming soon.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {projects.map((project) => (
                <MotionCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
