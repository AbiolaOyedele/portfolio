/**
 * A single hardcoded "thoughts" (blog) post entry. Ported as a static
 * placeholder array from the old ThoughtsPage.jsx — there is no database
 * table or per-post route behind this yet, so this type intentionally has
 * no `id`/timestamps beyond what the old page displayed. Dynamic per-post
 * routing is explicitly out of scope for this pass.
 */
export interface Thought {
  slug: string
  title: string
  date: string
  readTime: string
  tags: string[]
  excerpt: string
}
