import type { Metadata } from 'next'

import AboutContent from '@/components/features/about/AboutContent'
import { getPublicAbout } from '@/services/about.service'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'About',
  description: 'Designer, strategist, and builder — graphics, motion, and digital product work.',
}

/**
 * Public About page. Server Component — fetches the single `about` row
 * server-side and hands it to the client-rendered `AboutContent`, which
 * owns all the scroll-triggered (`whileInView`) animations.
 *
 * `getPublicAbout` never throws (it falls back to placeholder data
 * internally), so `about` should never be null in practice. We still
 * type-narrow defensively rather than assume that invariant holds forever.
 */
export default async function AboutPage(): Promise<React.JSX.Element> {
  const supabase = await createServerSupabaseClient()
  const about = await getPublicAbout(supabase)

  return (
    <main className="flex-1">
      {about ? (
        <AboutContent about={about} />
      ) : (
        <div className="max-w-[680px] mx-auto px-6 py-24 text-center">
          <p className="text-[16px] text-text-secondary" style={{ fontWeight: 300 }}>
            We couldn&apos;t load this page right now. Please try again shortly.
          </p>
        </div>
      )}
    </main>
  )
}
