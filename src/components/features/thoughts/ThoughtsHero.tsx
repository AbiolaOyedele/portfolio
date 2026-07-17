'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Cloud from './Cloud'

/**
 * Full-viewport animated sky hero for the Thoughts page. Ported from the
 * "Hero" block of the old ThoughtsPage.jsx, minus the "Available" status
 * pill (banned UI pattern — a rounded pill with a pulsing green dot — see
 * house rules). Isolated as a client leaf because it uses Framer Motion
 * entrance animations; the rest of the page stays a Server Component.
 */
export default function ThoughtsHero(): React.JSX.Element {
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        minHeight: 'calc(100vh - 64px)',
        background:
          'linear-gradient(180deg, #B8DEF8 0%, #CCE9FA 30%, #E2F3FD 65%, #F4FAFF 85%, #FFFFFF 100%)',
      }}
    >
      {/* Cloud shapes — decorative background */}
      <Cloud
        className="absolute w-[420px] pointer-events-none top-[8%] -left-[4%]"
        opacity={0.9}
        scale={1}
      />
      <Cloud
        className="absolute w-[360px] pointer-events-none top-[6%] -right-[2%]"
        opacity={0.8}
        scale={0.85}
      />
      <Cloud
        className="absolute w-[280px] pointer-events-none top-[28%] left-[55%]"
        opacity={0.5}
        scale={0.7}
      />
      <Cloud
        className="absolute w-[240px] pointer-events-none top-[35%] left-[6%]"
        opacity={0.45}
        scale={0.65}
      />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-24">
        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[52px] sm:text-[64px] lg:text-[80px] text-text-primary leading-[1.02] max-w-[800px]"
          style={{ fontWeight: 400 }}
        >
          Ideas that keep
          <br />
          me up at night.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[16px] text-text-secondary mt-5 max-w-[480px] leading-relaxed"
          style={{ fontWeight: 300 }}
        >
          Notes on design, motion, and building things that actually feel right.
        </motion.p>

        {/* CTA */}
        <motion.a
          href="#posts"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-8 inline-flex items-center gap-2 bg-text-primary text-white rounded-full px-7 py-3.5 text-[14px] hover:opacity-90 transition-opacity duration-200"
          style={{ fontWeight: 400 }}
        >
          Read latest
          <ArrowRight className="w-4 h-4" />
        </motion.a>
      </div>

      {/* Fade to white at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #ffffff)',
        }}
      />
    </div>
  )
}
