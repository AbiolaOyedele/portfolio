const SKELETON_CARD_COUNT = 6

/**
 * Loading skeleton matching `ProjectGrid`'s grid shape and `ProjectCard`'s
 * proportions (16:10 cover image + title/tag block). Used by route
 * `loading.tsx` files while project data is being fetched.
 */
export default function ProjectGridSkeleton(): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="rounded-2xl overflow-hidden">
            <div className="aspect-[16/10] bg-border" />
            <div className="pt-3 pb-1 space-y-2">
              <div className="h-4 bg-border rounded w-3/4" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 w-16 bg-border rounded-full" />
                <div className="h-6 w-12 bg-border rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
