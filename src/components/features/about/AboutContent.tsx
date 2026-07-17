'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { Mail } from 'lucide-react'

import Tag from '@/components/ui/Tag'
import type { About } from '@/types/about'

export interface AboutContentProps {
  about: About
}

interface Lane {
  key: string
  label: string
  desc: string
  borderColor: string
}

const lanes: Lane[] = [
  { key: 'graphics', label: 'Graphics', desc: 'Branding, visual identity, and print design.', borderColor: '#E8F0FE' },
  { key: 'motion', label: 'Motion', desc: 'Animation, motion graphics, and video work.', borderColor: '#FEF3E8' },
  { key: 'playground', label: 'Playground', desc: 'Digital products, interfaces, and creative code.', borderColor: '#EDFAEE' },
]

type FadeInUpProps = Pick<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'viewport' | 'transition'>

/**
 * Same fadeInUp scroll-triggered animation as the old AboutPage.jsx —
 * `whileInView` with `viewport: { once: true, margin: '-40px' }`.
 */
function fadeInUp(delay = 0): FadeInUpProps {
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] },
  }
}

/**
 * Client component rendering the About page's scroll-triggered sections
 * (photo/name/tagline, bio, what-I-do, tools, clients, contact). Ported
 * 1:1 from the old AboutPage.jsx, with the Supabase fetch + loading state
 * removed since the parent Server Component now fetches `about` up front.
 */
export default function AboutContent({ about }: AboutContentProps): React.JSX.Element {
  const name = about.name || 'Abiola Oyedele'
  const tools = about.tools?.length ? about.tools : []
  const clients = about.clients?.length ? about.clients : []

  return (
    <div className="max-w-[680px] mx-auto px-6 py-24 lg:py-32 space-y-16">
      {/* Photo + Name + Tagline */}
      <motion.div
        {...fadeInUp(0)}
        className="flex flex-col sm:flex-row items-center sm:items-start gap-6"
      >
        {about.photo_url ? (
          <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0">
            <Image
              src={about.photo_url}
              alt={about.name || 'Portrait photo'}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-border shrink-0 flex items-center justify-center">
            <span className="text-[28px] text-text-muted" style={{ fontWeight: 400 }}>
              A
            </span>
          </div>
        )}
        <div className="text-center sm:text-left">
          <h1 className="text-[32px] text-text-primary" style={{ fontWeight: 400 }}>
            {name}
          </h1>
          <p className="text-[16px] text-text-muted mt-1" style={{ fontWeight: 300 }}>
            {about.tagline || 'Designer. Strategist. Builder.'}
          </p>
        </div>
      </motion.div>

      {/* Bio */}
      <motion.div {...fadeInUp(0.08)}>
        <p className="text-[17px] leading-[1.8] text-text-secondary" style={{ fontWeight: 300 }}>
          {about.bio || ''}
        </p>
      </motion.div>

      {/* What I do */}
      <motion.div {...fadeInUp(0.16)}>
        <h2 className="text-[14px] uppercase tracking-widest text-text-primary mb-6" style={{ fontWeight: 500 }}>
          What I do
        </h2>
        <div className="space-y-4">
          {lanes.map((lane) => (
            <div key={lane.key} className="pl-4 py-2 border-l-[3px]" style={{ borderLeftColor: lane.borderColor }}>
              <p className="text-[15px] text-text-primary" style={{ fontWeight: 500 }}>
                {lane.label}
              </p>
              <p className="text-[14px] text-text-secondary mt-0.5" style={{ fontWeight: 300 }}>
                {lane.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tools */}
      <motion.div {...fadeInUp(0.24)}>
        <h2 className="text-[14px] uppercase tracking-widest text-text-primary mb-4" style={{ fontWeight: 500 }}>
          Tools I use
        </h2>
        {tools.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <Tag key={tool}>{tool}</Tag>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-text-muted" style={{ fontWeight: 300 }}>
            No tools listed yet.
          </p>
        )}
      </motion.div>

      {/* Clients */}
      <motion.div {...fadeInUp(0.32)}>
        <h2 className="text-[14px] uppercase tracking-widest text-text-primary mb-4" style={{ fontWeight: 500 }}>
          Brands and clients
        </h2>
        {clients.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {clients.map((client) => (
              <Tag key={client}>{client}</Tag>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-text-muted" style={{ fontWeight: 300 }}>
            No clients listed yet.
          </p>
        )}
      </motion.div>

      {/* Contact */}
      {about.email && (
        <motion.div {...fadeInUp(0.4)}>
          <a
            href={`mailto:${about.email}`}
            className="inline-flex items-center gap-2 border border-border rounded-full px-6 py-3 text-[14px] text-text-primary hover:bg-text-primary hover:text-white transition-all duration-200"
            style={{ fontWeight: 400 }}
          >
            <Mail className="w-4 h-4" />
            {about.email}
          </a>
        </motion.div>
      )}
    </div>
  )
}
