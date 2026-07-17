import { z } from 'zod'

/**
 * The three top-level project categories supported by the site.
 * Matches the `check (category in (...))` constraint in supabase/schema.sql.
 */
export type ProjectCategory = 'graphics' | 'motion' | 'playground'

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  'graphics',
  'motion',
  'playground',
] as const

/**
 * A single portfolio project row, matching the `projects` table exactly.
 * Nullable DB columns are typed `T | null` (never optional `?:`) because
 * Supabase-js always returns explicit `null` for empty columns, and
 * `exactOptionalPropertyTypes` is enabled project-wide.
 */
export interface Project {
  id: string
  title: string
  slug: string
  category: ProjectCategory
  subcategory: string | null
  description: string | null
  cover_url: string | null
  images: string[] | null
  video_url: string | null
  tags: string[] | null
  visible: boolean
  sort_order: number
  created_at: string
  likes: number
  dislikes: number
}

/**
 * Vote kinds for the /graphics swipe-to-vote feature. Server-managed
 * counters — deliberately not part of createProjectSchema/updateProjectSchema,
 * same treatment as `id`/`created_at`.
 */
export type VoteType = 'like' | 'dislike'
export const VOTE_TYPES: readonly VoteType[] = ['like', 'dislike'] as const

export interface VoteResult {
  likes: number
  dislikes: number
}

/**
 * Metadata for a single "graphics" subcategory. `key` is the exact string
 * stored in the `projects.subcategory` column (matches the old
 * `subcategoryMeta[slug].key` / `subcategories[i].key` values in the legacy
 * React app) — `slug` is only ever used in URLs.
 */
export interface GraphicsSubcategoryMeta {
  slug: string
  key: string
  label: string
  number: string
}

/**
 * The three graphics subcategories, in display order. Single source of
 * truth for `/graphics` and `/graphics/[subcategory]` — ported from
 * `subcategories` in the old `GraphicsPage.jsx` and `subcategoryMeta` in the
 * old `GraphicsSubcategoryPage.jsx`.
 */
export const GRAPHICS_SUBCATEGORIES: readonly GraphicsSubcategoryMeta[] = [
  { slug: 'branding', key: 'Branding', label: 'Branding', number: '01' },
  { slug: 'social-media', key: 'Social Media', label: 'Social Media', number: '02' },
  { slug: 'decks', key: 'Decks', label: 'Decks', number: '03' },
] as const

const categoryEnum = z.enum(['graphics', 'motion', 'playground'])

/**
 * Base object schema shared by create/update. `subcategory` is only
 * permitted (non-null) when `category === 'graphics'` — enforced via
 * `.refine` on the composed schema below.
 */
const projectBaseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(120, 'Title must be 120 characters or fewer.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only.'),
  category: categoryEnum,
  subcategory: z
    .string()
    .trim()
    .max(60, 'Subcategory must be 60 characters or fewer.')
    .nullable(),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must be 2000 characters or fewer.')
    .nullable(),
  cover_url: z.string().url('Cover URL must be a valid URL.').nullable(),
  images: z
    .array(z.string().url('Each image must be a valid URL.'))
    .max(20, 'You can add up to 20 images.'),
  video_url: z
    .union([z.string().url('Video URL must be a valid URL.'), z.literal('')])
    .nullable(),
  tags: z
    .array(z.string().trim().max(30, 'Each tag must be 30 characters or fewer.'))
    .max(10, 'You can add up to 10 tags.'),
  visible: z.boolean(),
  sort_order: z.int().nonnegative('Sort order must be zero or a positive whole number.'),
})

const subcategoryRefinement = (
  data: Pick<z.infer<typeof projectBaseSchema>, 'category' | 'subcategory'>,
): boolean => data.category === 'graphics' || data.subcategory === null

const subcategoryRefinementMessage: { message: string; path: [string] } = {
  message: 'Subcategory can only be set when the category is "graphics".',
  path: ['subcategory'],
}

export const createProjectSchema = projectBaseSchema.refine(
  subcategoryRefinement,
  subcategoryRefinementMessage,
)

export const updateProjectSchema = projectBaseSchema
  .partial()
  .extend({ id: z.string().min(1, 'Project id is required.') })
  .refine(
    (data) => data.category === undefined || data.category === 'graphics' || !data.subcategory,
    subcategoryRefinementMessage,
  )

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
