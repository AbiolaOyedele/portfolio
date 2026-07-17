'use client'

import { motion } from 'framer-motion'
import type { ReactElement } from 'react'

export interface HeroNameProps {
  name: string
  tagline: string
}

/**
 * Client leaf for the homepage name/tagline entrance fade (Framer Motion).
 * Extracted so `page.tsx` itself can stay a Server Component.
 */
export default function HeroName({ name, tagline }: HeroNameProps): ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-16"
    >
      <p className="text-[16px] text-text-muted" style={{ fontWeight: 400 }}>
        {name}
      </p>
      <p className="text-[13px] text-text-muted mt-1" style={{ fontWeight: 300 }}>
        {tagline}
      </p>
    </motion.div>
  )
}
