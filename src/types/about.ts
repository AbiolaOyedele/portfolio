import { z } from 'zod'

/**
 * The single-row `about` table. Nullable DB columns are typed `T | null`
 * (never optional `?:`) because Supabase-js always returns explicit `null`
 * for empty columns, and `exactOptionalPropertyTypes` is enabled project-wide.
 */
export interface About {
  id: string
  name: string | null
  tagline: string | null
  bio: string | null
  photo_url: string | null
  email: string | null
  tools: string[] | null
  clients: string[] | null
  updated_at: string
}

export const aboutSchema = z.object({
  name: z.string().trim().max(120, 'Name must be 120 characters or fewer.').nullable(),
  tagline: z.string().trim().max(160, 'Tagline must be 160 characters or fewer.').nullable(),
  bio: z.string().trim().max(4000, 'Bio must be 4000 characters or fewer.').nullable(),
  photo_url: z
    .union([z.string().url('Photo URL must be a valid URL.'), z.literal('')])
    .nullable(),
  email: z.union([z.string().email('Email must be a valid email address.'), z.literal('')]).nullable(),
  tools: z
    .array(z.string().trim().max(60, 'Each tool must be 60 characters or fewer.'))
    .max(30, 'You can add up to 30 tools.')
    .nullable(),
  clients: z
    .array(z.string().trim().max(60, 'Each client must be 60 characters or fewer.'))
    .max(50, 'You can add up to 50 clients.')
    .nullable(),
})

export type AboutInput = z.infer<typeof aboutSchema>
