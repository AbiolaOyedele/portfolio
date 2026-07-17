'use client'

import { motion } from 'framer-motion'
import type { ReactElement, ReactNode } from 'react'

export interface HeroHeadingProps {
  children: ReactNode
}

/**
 * Client leaf for the homepage heading entrance fade (Framer Motion).
 * Extracted so `page.tsx` itself can stay a Server Component.
 */
export default function HeroHeading({ children }: HeroHeadingProps): ReactElement {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="text-[34px] md:text-[52px] text-center text-text-primary mb-16 leading-tight"
      style={{ fontWeight: 400 }}
    >
      {children}
    </motion.h1>
  )
}
