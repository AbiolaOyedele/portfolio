/**
 * Route-level loading skeleton for `/project/[slug]`, shown by Next.js
 * while the Server Component in `page.tsx` awaits `getProjectBySlug`.
 * Shape mirrors the real content: back link, title, tags, cover image,
 * description lines, gallery grid. Navbar/Footer are rendered once by the
 * root layout and stay mounted while this fallback shows.
 */
export default function ProjectDetailLoading(): React.JSX.Element {
  return (
    <main className="flex-1">
      <div className="max-w-[860px] mx-auto px-6 py-12 animate-pulse">
        <div className="h-4 w-24 bg-border rounded mb-8" />

        <div className="h-9 md:h-12 w-2/3 bg-border rounded mb-4" />

        <div className="flex flex-wrap gap-2 mb-8">
          <div className="h-7 w-16 bg-border rounded-full" />
          <div className="h-7 w-20 bg-border rounded-full" />
          <div className="h-7 w-14 bg-border rounded-full" />
        </div>

        <div className="aspect-video rounded-2xl bg-border mb-8" />

        <div className="space-y-3 mb-12">
          <div className="h-4 w-full bg-border rounded" />
          <div className="h-4 w-full bg-border rounded" />
          <div className="h-4 w-3/4 bg-border rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="aspect-square rounded-xl bg-border" />
          <div className="aspect-square rounded-xl bg-border" />
        </div>
      </div>
    </main>
  )
}
