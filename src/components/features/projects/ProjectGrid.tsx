'use client'

import { motion } from 'framer-motion'
import type { Project } from '@/types/project'
import ProjectCard from '@/components/ui/ProjectCard'

export interface ProjectGridProps {
  projects: Project[]
  emptyMessage: string
}

/**
 * Responsive grid of `ProjectCard`s with a staggered fade/slide-up entrance
 * animation, ported from the old GraphicsPage/VibeCodePage card grids.
 *
 * Renders `emptyMessage` in a centered plain-English block when there are
 * no projects to show (the required "empty" state for data-fetching pages).
 */
export default function ProjectGrid({ projects, emptyMessage }: ProjectGridProps): React.JSX.Element {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-center text-text-muted" style={{ fontWeight: 300 }}>
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </div>
  )
}
