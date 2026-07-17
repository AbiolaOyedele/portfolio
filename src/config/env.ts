import { z } from 'zod'

/**
 * Treats an empty string the same as an absent value before validation.
 * Some environments (e.g. `.env.local` with `KEY=`) set optional vars to
 * `''` rather than omitting them, which `.optional()` alone does not accept.
 */
const optionalString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional())

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: optionalString(z.string().min(1)),
  ADMIN_EMAIL: z.string().email(),
  SENTRY_DSN: optionalString(z.string().url()),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten())
  throw new Error('Environment validation failed. App cannot start.')
}

export const env = parsed.data
