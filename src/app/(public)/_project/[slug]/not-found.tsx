import Link from 'next/link'

/**
 * Scoped 404 for `/project/[slug]`. Rendered by `notFound()` in `page.tsx`
 * when no project matches the slug. Navbar/Footer are rendered once by the
 * root layout, so this keeps the same chrome the old inline "Project not
 * found" message showed (Navbar staying visible) without re-rendering it —
 * the confirmed improvement over the old page's inline-message approach.
 */
export default function ProjectNotFound(): React.JSX.Element {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-text-muted mb-6" style={{ fontWeight: 300 }}>
          We couldn&apos;t find that project.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          style={{ fontWeight: 300 }}
        >
          Back to work
        </Link>
      </div>
    </main>
  )
}
