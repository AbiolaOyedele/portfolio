import type { ReactElement } from 'react'
import RotatingHero from './RotatingHero'
import LockBodyScroll from './LockBodyScroll'

/**
 * Landing page — a single fixed-height hero that never scrolls. Stays a Server
 * Component; the rotating headline (`RotatingHero`) and the scroll lock
 * (`LockBodyScroll`) are isolated client leaves.
 */
export default function HomePage(): ReactElement {
  return (
    <main className="h-[100dvh] overflow-hidden">
      <LockBodyScroll />
      <section className="flex h-[100dvh] items-center px-6 md:px-12 lg:px-20">
        <RotatingHero />
      </section>
    </main>
  )
}
