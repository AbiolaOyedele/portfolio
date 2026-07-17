'use server'

import { isAppError } from '@/lib/errors'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { voteOnProject } from '@/services/projects.service'
import { VOTE_TYPES, type VoteType } from '@/types/project'

export type VoteActionResult =
  | { success: true; likes: number; dislikes: number }
  | { success: false; error: string }

/**
 * Public write — deliberately no `requireAdminSession` call, unlike every
 * other Server Action in this app. Anonymous visitors vote on the
 * /graphics swipe deck; the database-level `increment_project_vote`
 * function (see supabase/schema.sql) is what keeps this safe, atomically
 * incrementing exactly one counter rather than trusting a client-supplied
 * value.
 *
 * No `revalidatePath` here: this app has no ISR/ `revalidate` usage
 * anywhere, and busting the server cache wouldn't reach the `SwipeDeck`
 * instance already open in the visitor's browser anyway. The RPC's own
 * return value is the fresh, authoritative count from the exact statement
 * that just wrote it — callers use that directly for an optimistic update.
 */
export async function voteOnProjectAction(
  projectId: string,
  voteType: VoteType,
): Promise<VoteActionResult> {
  if (!projectId || !VOTE_TYPES.includes(voteType)) {
    return { success: false, error: 'Invalid vote.' }
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { likes, dislikes } = await voteOnProject(supabase, projectId, voteType)
    return { success: true, likes, dislikes }
  } catch (err) {
    if (isAppError(err)) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'We could not record your vote. Please try again.' }
  }
}
