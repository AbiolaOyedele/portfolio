import type { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { placeholderAbout } from '@/lib/placeholder'
import * as aboutRepository from '@/repositories/about.repository'
import { aboutSchema, type About, type AboutInput } from '@/types/about'

/**
 * Public about-page read. Falls back to placeholder data when Supabase has
 * no row yet, matching the old `useAbout` hook's fallback behavior.
 */
export async function getPublicAbout(client: SupabaseClient): Promise<About> {
  try {
    const about = await aboutRepository.findAbout(client)
    return about ?? placeholderAbout
  } catch (err) {
    logger.error({ errorCode: 'DB_QUERY_ABOUT_FAILED', err }, 'Failed to load public about data')
    return placeholderAbout
  }
}

/**
 * Admin about-page read — NO placeholder fallback. The admin must see the
 * real (possibly empty) row so they never mistake placeholder content for
 * real data and accidentally save it back.
 */
export async function getAboutForAdmin(client: SupabaseClient): Promise<About | null> {
  try {
    return await aboutRepository.findAbout(client)
  } catch (err) {
    logger.error({ errorCode: 'DB_QUERY_ABOUT_ADMIN_FAILED', err }, 'Failed to load admin about data')
    throw new AppError(500, 'We could not load your about page right now. Please try again shortly.', 'DB_QUERY_ABOUT_ADMIN_FAILED', err)
  }
}

export async function saveAbout(
  client: SupabaseClient,
  input: AboutInput,
  existingId: string | null,
): Promise<About> {
  const parsed = aboutSchema.parse(input)
  try {
    return await aboutRepository.upsertAbout(client, parsed, existingId)
  } catch (err) {
    logger.error({ errorCode: 'DB_UPSERT_ABOUT_FAILED', err }, 'Failed to save about data')
    throw new AppError(500, 'We could not save your changes. Please try again.', 'DB_UPSERT_ABOUT_FAILED', err)
  }
}
