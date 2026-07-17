'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ProjectCategory } from '@/types/project'

interface CategoryConfigEntry {
  label: string
  name: string
  description: string
  pastel: string
  circle: string
  path: string
}

const categoryConfig: Record<ProjectCategory, CategoryConfigEntry> = {
  graphics: {
    label: 'GRAPHICS',
    name: 'Graphics',
    description: 'Visual identity & print design',
    pastel: '#E8F0FE',
    circle: '#D2E3FC',
    path: '/graphics',
  },
  motion: {
    label: 'MOTION',
    name: 'Motion',
    description: 'Animation & video production',
    pastel: '#FEF3E8',
    circle: '#FDDCB5',
    path: '/motion',
  },
  playground: {
    label: 'PLAYGROUND',
    name: 'Playground',
    description: 'Digital products & interfaces',
    pastel: '#EDFAEE',
    circle: '#C8F0CB',
    path: '/playground',
  },
}

// Fan: left card rests at -3deg/x(-10), center 0, right +3deg/x(10)
// Initial mount from more dramatic angles per spec
const fanRestAngles = [-3, 0, 3]
const fanRestX = [-10, 0, 10]
const fanInitialAngles = [-6, 0, 6]
const fanInitialX = [-20, 0, 20]

export interface CategoryCardProps {
  category: ProjectCategory
  index: number
  disableFan?: boolean
}

export default function CategoryCard({ category, index, disableFan = false }: CategoryCardProps) {
  const config = categoryConfig[category]
  if (!config) return null

  const restRotate = disableFan ? 0 : fanRestAngles[index] ?? 0
  const restX = disableFan ? 0 : fanRestX[index] ?? 0
  const initRotate = disableFan ? 0 : fanInitialAngles[index] ?? 0
  const initX = disableFan ? 0 : fanInitialX[index] ?? 0

  return (
    <motion.div
      initial={
        disableFan
          ? { opacity: 0, y: 20 }
          : { opacity: 0, rotate: initRotate, x: initX, scale: index === 1 ? 0.95 : 1 }
      }
      animate={
        disableFan
          ? { opacity: 1, y: 0 }
          : { opacity: 1, rotate: restRotate, x: restX, scale: 1 }
      }
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={
        disableFan
          ? { y: -4 }
          : { rotate: 0, x: 0, y: -4, zIndex: 10 }
      }
      style={{ transformOrigin: 'bottom center' }}
      className="relative cursor-pointer"
    >
      <Link href={config.path} className="block group">
        <div className="w-full max-w-[280px] aspect-[7/9] sm:w-[280px] sm:h-[360px] rounded-2xl overflow-hidden flex flex-col transition-[shadow,transform] duration-200 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] group-active:shadow-[0_8px_32px_rgba(0,0,0,0.10)] group-active:scale-[0.98]">
          {/* Top 60% — pastel fill with circle placeholder */}
          <div
            className="relative flex-[3] flex items-center justify-center"
            style={{ backgroundColor: config.pastel }}
          >
            <div
              className="w-20 h-20 rounded-full"
              style={{ backgroundColor: config.circle }}
            />
          </div>

          {/* Bottom 40% — white content area */}
          <div className="flex-[2] bg-white px-5 py-4 flex flex-col justify-center">
            <p
              className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-1"
              style={{ fontWeight: 300 }}
            >
              {config.label}
            </p>
            <h3
              className="text-[22px] leading-snug text-text-primary"
              style={{ fontWeight: 500 }}
            >
              {config.name}
            </h3>
            <p
              className="text-[13px] text-text-muted mt-0.5"
              style={{ fontWeight: 300 }}
            >
              {config.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
