import type { ReactElement } from 'react'
import RotatingHero from './RotatingHero'

/**
 * Landing page — rebuilt section by section. Currently the hero only;
 * the nav and footer are added next. Stays a Server Component — the
 * rotating headline is isolated in the `RotatingHero` client leaf.
 */
export default function HomePage(): ReactElement {
  return (
    <main className="min-h-screen">
      <section className="flex min-h-screen items-center px-6 md:px-12 lg:px-20">
        <RotatingHero />
      </section>
    </main>
  )
}
