import Link from 'next/link'

// NOTE: Does not render <Navbar />/<Footer /> — the root layout.tsx already
// wraps this segment's `{children}` slot with site chrome (same boundary
// nesting as error.tsx; see the note there for details), so adding them here
// would duplicate the nav and footer.
export default function NotFound(): React.JSX.Element {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <h1 className="text-[24px] text-text-primary mb-3" style={{ fontWeight: 500 }}>
          Page not found
        </h1>
        <p className="text-[14px] text-text-secondary mb-8" style={{ fontWeight: 400 }}>
          We couldn&apos;t find the page you were looking for.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-full bg-text-primary text-white text-[14px] hover:opacity-90 transition-opacity"
          style={{ fontWeight: 400 }}
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
