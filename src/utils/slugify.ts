/**
 * Converts arbitrary text into a URL-safe slug: lowercases, replaces every
 * run of non-alphanumeric characters with a single hyphen, and trims any
 * leading/trailing hyphen. Pure function, no side effects.
 *
 * Ported from the old `slugify` helper in `AdminProjectForm.jsx`.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
