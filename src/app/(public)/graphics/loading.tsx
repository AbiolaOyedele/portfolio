/**
 * Route-level Suspense fallback for `/graphics` — the "global loader" shown
 * while the new interactive canvas's server-side project fetch resolves.
 * Reliably fires because the page calls `createServerSupabaseClient()` →
 * `cookies()`, which forces per-request dynamic rendering, same mechanism
 * already used by `project/[slug]/loading.tsx`.
 */
export default function GraphicsLoading(): React.JSX.Element {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-bg">
      <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">(Graphics)</p>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  )
}
