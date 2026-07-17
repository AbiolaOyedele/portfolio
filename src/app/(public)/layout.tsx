import SiteMenu from '@/components/features/navigation/SiteMenu'
import Footer from '@/components/features/navigation/Footer'

export interface PublicLayoutProps {
  children: React.ReactNode
}

/**
 * Shared chrome for every public-facing page (home, graphics, motion,
 * playground, project detail, about, thoughts). Scoped to this route group
 * only — deliberately not in the root layout — so /admin/* routes (which
 * have their own AdminNav via the (admin) group layout) never show the
 * public marketing nav. error.tsx/not-found.tsx live in this same group so
 * they stay wrapped by this layout (Next.js error boundaries replace
 * content from their own segment down — a layout has to be at or above the
 * boundary to keep rendering through it). SiteMenu is fixed-position, so
 * where it sits in this tree doesn't affect page flow.
 */
export default function PublicLayout({ children }: PublicLayoutProps): React.JSX.Element {
  return (
    <>
      {children}
      <Footer />
      <SiteMenu />
    </>
  )
}
