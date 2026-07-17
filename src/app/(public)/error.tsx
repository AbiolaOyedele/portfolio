'use client'

// NOTE: This does NOT render <Navbar />/<Footer /> itself. Next.js inserts the
// error boundary for a segment's error.tsx *inside* that segment's parent
// layout's `{children}` slot — the root layout.tsx (which renders
// `<Navbar />{children}<Footer />`) stays mounted and keeps rendering site
// chrome around whatever this component outputs. Rendering Navbar/Footer here
// too would duplicate them. This only stops applying for errors thrown by the
// root layout itself, which requires a separate `global-error.tsx` (not
// covered here) since there is no parent boundary above the root layout.
export interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps): React.JSX.Element {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <h1 className="text-[24px] text-text-primary mb-3" style={{ fontWeight: 500 }}>
          Something went wrong
        </h1>
        <p className="text-[14px] text-text-secondary mb-8" style={{ fontWeight: 400 }}>
          We ran into a problem loading this page. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-full bg-text-primary text-white text-[14px] hover:opacity-90 transition-opacity"
          style={{ fontWeight: 400 }}
        >
          Try again
        </button>
      </div>
    </main>
  )
}
