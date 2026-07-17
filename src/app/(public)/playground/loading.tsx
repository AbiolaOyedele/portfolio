import SiteMenu from '@/components/features/navigation/SiteMenu'
import Footer from '@/components/features/navigation/Footer'
import ProjectGridSkeleton from '@/components/features/projects/ProjectGridSkeleton'

/**
 * Route-level Suspense fallback for `/playground`, shown while the Server
 * Component page fetches project data. Mirrors the page's hero layout with
 * a static heading (no data) and the shared grid skeleton in place of cards.
 */
export default function PlaygroundLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="flex-1">
            <h1 className="text-[44px] md:text-[64px] lg:text-[72px] leading-[1.05] text-text-primary">
              <span style={{ fontWeight: 300 }}>Digital products</span>
              <br />
              <span style={{ fontWeight: 400 }}>and interfaces.</span>
            </h1>

            <div className="flex items-center gap-4 mt-5">
              <span
                className="text-[36px] md:text-[48px] text-text-primary leading-none"
                style={{ fontWeight: 300 }}
              >
                &rarr;
              </span>
              <a
                href="mailto:abiolaoyedele55@gmail.com"
                className="inline-flex items-center gap-2 bg-text-primary text-white rounded-full px-6 py-3 text-[14px] hover:opacity-90 transition-opacity duration-200"
                style={{ fontWeight: 400 }}
              >
                Get in touch
              </a>
            </div>
          </div>
        </div>

        {/* Cards grid skeleton */}
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <ProjectGridSkeleton />
        </div>
      </main>
      <Footer />
      <SiteMenu />
    </div>
  )
}
