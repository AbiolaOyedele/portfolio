const DESKTOP_SKELETON_CARD_COUNT = 3
const MOBILE_SKELETON_CARD_COUNT = 2

/**
 * Loading skeleton for the Motion page, matching `MotionCard`'s large
 * ~600px-wide / near-viewport-height proportions rather than the standard
 * grid skeleton, since this page uses a horizontal-scroll rail on desktop
 * and a stacked column on mobile instead of a grid.
 */
export default function MotionLoading(): React.JSX.Element {
  return (
    <div className="flex flex-col">
      {/* ── Desktop split layout ── */}
      <div className="hidden lg:flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="w-[320px] shrink-0 border-r border-border" />
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-5 h-full px-10 py-12">
            {Array.from({ length: DESKTOP_SKELETON_CARD_COUNT }).map((_, index) => (
              <div
                key={index}
                className="shrink-0 rounded-2xl overflow-hidden animate-pulse flex flex-col bg-surface border border-border"
                style={{ width: '600px', height: 'calc(100vh - 64px - 96px)' }}
              >
                <div style={{ flex: '3.2 0 0' }} className="bg-border" />
                <div className="bg-white px-6 py-5 space-y-3" style={{ flex: '1.5 0 0' }}>
                  <div className="h-4 bg-border rounded w-3/4" />
                  <div className="h-3 bg-border rounded w-full" />
                  <div className="h-3 bg-border rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden flex-1 px-6 pb-20">
        <div className="pt-16 pb-8">
          <div className="h-11 w-11 rounded-full bg-border animate-pulse" />
          <div className="h-10 bg-border rounded w-2/3 mt-6 animate-pulse" />
          <div className="h-4 bg-border rounded w-1/2 mt-3 animate-pulse" />
        </div>
        <div className="flex flex-col gap-5">
          {Array.from({ length: MOBILE_SKELETON_CARD_COUNT }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden animate-pulse flex flex-col bg-surface border border-border w-full"
              style={{ height: 'calc(100vh - 64px - 96px)' }}
            >
              <div style={{ flex: '3.2 0 0' }} className="bg-border" />
              <div className="bg-white px-6 py-5 space-y-3" style={{ flex: '1.5 0 0' }}>
                <div className="h-4 bg-border rounded w-3/4" />
                <div className="h-3 bg-border rounded w-full" />
                <div className="h-3 bg-border rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
