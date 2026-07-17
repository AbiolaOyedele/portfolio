'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, ArrowRight } from 'lucide-react'
import { cloudinaryUrl } from '@/lib/cloudinary'
import type { Project } from '@/types/project'
import Tag from '@/components/ui/Tag'

export interface MotionCardProps {
  project: Project
}

/**
 * Motion-page-specific large card: a fixed ~600px-wide, near-viewport-height
 * portrait card on desktop (used in a horizontal scroll rail) that falls
 * back to a flex-col block on mobile. Ported from the old MotionPage.jsx.
 */
export default function MotionCard({ project }: MotionCardProps): React.JSX.Element {
  const firstTag = project.tags?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full shrink-0 group flex flex-col md:w-[600px]"
      style={{ height: 'calc(100vh - 64px - 96px)' }}
    >
      <Link
        href={`/project/${project.slug}`}
        className="block w-full h-full rounded-2xl overflow-hidden flex flex-col transition-shadow duration-200 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.13)]"
        style={{ backgroundColor: '#FEF3E8' }}
      >
        {/* Cover image — top ~68% */}
        <div className="relative overflow-hidden" style={{ flex: '3.2 0 0' }}>
          {project.cover_url ? (
            <Image
              src={cloudinaryUrl(project.cover_url, { width: 700 })}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: '#FEF3E8' }} />
          )}
          {project.video_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-6 h-6 text-text-primary ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
        </div>

        {/* Info — bottom ~32% */}
        <div
          className="flex flex-col justify-between bg-white px-6 py-5"
          style={{ flex: '1.5 0 0' }}
        >
          <div>
            <h3 className="text-[17px] text-text-primary leading-snug" style={{ fontWeight: 500 }}>
              {project.title}
            </h3>
            {project.description && (
              <p
                className="text-[13px] text-text-muted mt-2 leading-relaxed"
                style={{
                  fontWeight: 300,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            {firstTag ? <Tag>{firstTag}</Tag> : <span />}
            <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors duration-200" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
