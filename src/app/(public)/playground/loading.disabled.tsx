/**
 * Route-level fallback for `/playground`. The page renders a static bento grid
 * (no data fetch), so this rarely shows — it mirrors the grid's shape with
 * neutral placeholder tiles to avoid layout shift.
 */
export default function PlaygroundLoading(): React.JSX.Element {
  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-16 sm:px-6 lg:pt-24">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[16/10] animate-pulse rounded-lg bg-border/40" />
          ))}
        </div>
      </div>
    </main>
  )
}
