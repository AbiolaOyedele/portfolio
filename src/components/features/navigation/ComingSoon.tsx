import Link from 'next/link'

/**
 * Placeholder shown on routes that are built locally but not ready to ship
 * (see `UNBUILT_ROUTES` in `src/config/unbuilt-routes.ts`). Rendered through
 * each segment's `not-found.tsx` so the response carries a real 404 status —
 * search engines skip the page instead of indexing a half-finished one.
 *
 * Site chrome (nav + footer) comes from `(public)/layout.tsx`, which sits
 * above every not-found boundary, so this renders content only.
 */
export default function ComingSoon(): React.JSX.Element {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24">
      <div className="max-w-[34rem] text-center">
        <p
          className="mb-6 text-[64px] leading-none text-accent sm:mb-8 sm:text-[88px]"
          style={{ fontWeight: 700 }}
        >
          404
        </p>
        <p
          className="text-[18px] leading-relaxed text-text-primary sm:text-[22px] sm:leading-relaxed"
          style={{ fontWeight: 400 }}
        >
          Okay, soooo I know you expected to see something here, but hey, I&apos;m still working
          on it, sooooooo check back later&hellip; sooner&hellip; maybe.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex min-h-[44px] items-center justify-center rounded-full bg-text-primary px-6 text-[14px] text-white transition-opacity hover:opacity-90"
          style={{ fontWeight: 400 }}
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
