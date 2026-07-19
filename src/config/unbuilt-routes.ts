/**
 * Public routes that exist in the codebase but are not ready to ship.
 *
 * Each listed page calls `notFound()` before rendering anything, which hands
 * off to that segment's `not-found.tsx` (a `<ComingSoon />` placeholder) and
 * returns a genuine 404 status so search engines skip the page. The page
 * implementations themselves are untouched — to launch a page, delete its
 * entry here and the `isUnbuilt` guard at the top of its `page.tsx`.
 *
 * Two things to be aware of when un-gating a route:
 *
 * 1. A segment with a `loading.tsx` streams its shell before the page
 *    component runs, which commits a 200 status and defeats the 404. The
 *    gated segments' loading files are parked as `loading.disabled.tsx`
 *    (not a Next.js reserved filename, so no Suspense boundary is created);
 *    rename them back to `loading.tsx` when the page ships.
 * 2. `/project/[slug]` is gated differently — the whole segment was renamed
 *    to `(public)/_project`. A leading underscore marks a private folder, so
 *    Next.js drops it from the router entirely and any `/project/...` URL
 *    falls through to the group 404. It fought every in-page gate (as an SSG
 *    route Next served its prerendered `notFound()` output with a 200), and
 *    nothing in the site links to it. Rename the folder back to `project`
 *    to restore it.
 *
 * Keep this in sync with `src/app/sitemap.ts`, which must not advertise a
 * route that answers 404.
 */
export const UNBUILT_ROUTES = [
  '/about',
  '/thoughts',
  '/motion',
  '/playground',
  '/project',
] as const

export type UnbuiltRoute = (typeof UNBUILT_ROUTES)[number]

/**
 * True when the given route is gated behind the coming-soon placeholder.
 * Accepts any string so callers can pass a literal path without casting.
 */
export function isUnbuilt(route: string): boolean {
  return (UNBUILT_ROUTES as readonly string[]).includes(route)
}
