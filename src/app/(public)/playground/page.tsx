import type { Metadata } from 'next'

import ProjectGrid from '@/components/features/projects/ProjectGrid'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPublicProjects } from '@/services/projects.service'
import { isAppError } from '@/lib/errors'

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Digital products and interfaces — code and product work by Abiola Oyedele.',
}

const TOOL_SWATCHES: ReadonlyArray<{ label: string; bg: string }> = [
  { label: 'React', bg: '#EDFAEE' },
  { label: 'Figma', bg: '#E8F0FE' },
  { label: 'Supabase', bg: '#FEF3E8' },
]

/**
 * `/playground` — public listing of shipped digital products and interfaces.
 * Server Component: fetches once per request, no client-side loading state
 * needed here (see `loading.tsx` for the route-level Suspense fallback).
 *
 * Ported verbatim from the old `VibeCodePage.jsx` hero/stat copy; the card
 * grid itself now uses the shared `ProjectGrid`/`ProjectCard` components.
 */
export default async function PlaygroundPage(): Promise<React.JSX.Element> {
  const client = await createServerSupabaseClient()

  let projects: Awaited<ReturnType<typeof getPublicProjects>>
  try {
    projects = await getPublicProjects(client, { category: 'playground' })
  } catch (err) {
    const message = isAppError(err)
      ? err.message
      : 'We could not load projects right now. Please try again shortly.'

    return (
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <p className="text-center text-text-muted" style={{ fontWeight: 300 }}>
            {message}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 lg:pt-24 lg:pb-16">
        <div className="flex items-start justify-between gap-8">
          {/* Left — heading */}
          <div className="flex-1">
            <h1 className="text-[44px] md:text-[64px] lg:text-[72px] leading-[1.05] text-text-primary">
              <span style={{ fontWeight: 300 }}>Digital products</span>
              <br />
              <span style={{ fontWeight: 400 }}>and interfaces.</span>
            </h1>

            {/* Arrow + CTA — inline, same visual line as last text row */}
            <div className="flex items-center gap-4 mt-5">
              <span
                className="text-[36px] md:text-[48px] text-text-primary leading-none"
                style={{ fontWeight: 300 }}
              >
                &rarr;
              </span>
              <a
                href="mailto:abiolaoyedele55@gmail.com"
                className="inline-flex items-center gap-2 bg-text-primary text-white rounded-full px-6 py-3 text-[14px] hover:opacity-90 transition-opacity duration-200"
                style={{ fontWeight: 400 }}
              >
                Get in touch
              </a>
            </div>
          </div>

          {/* Right — project count stat */}
          {projects.length > 0 && (
            <div className="hidden md:flex flex-col items-center shrink-0 pt-2">
              {/* Stacked tool pills */}
              <div className="flex -space-x-2 mb-3">
                {TOOL_SWATCHES.map((tool, i) => (
                  <div
                    key={tool.label}
                    className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white"
                    style={{
                      fontWeight: 500,
                      backgroundColor: tool.bg,
                      color: '#1A1A1A',
                      zIndex: TOOL_SWATCHES.length - i,
                    }}
                  >
                    {tool.label[0]}
                  </div>
                ))}
                <div
                  className="w-10 h-10 rounded-full border-2 border-white bg-border flex items-center justify-center text-[11px] text-text-secondary"
                  style={{ fontWeight: 400, zIndex: 0 }}
                >
                  +
                </div>
              </div>
              <p className="text-[28px] text-text-primary leading-none" style={{ fontWeight: 400 }}>
                {projects.length}+
              </p>
              <p className="text-[13px] text-text-muted mt-1 text-center" style={{ fontWeight: 300 }}>
                Shipped products
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cards grid */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <ProjectGrid projects={projects} emptyMessage="Projects coming soon." />
      </div>
    </main>
  )
}
