import type { Metadata } from 'next'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAboutForAdmin } from '@/services/about.service'
import { isAppError } from '@/lib/errors'
import type { AboutInput } from '@/types/about'
import AboutForm from './about-form'

export const metadata: Metadata = {
  title: 'Edit About',
  robots: { index: false, follow: false },
}

const emptyDefaults: AboutInput = {
  name: null,
  tagline: null,
  bio: null,
  photo_url: '',
  email: '',
  tools: [],
  clients: [],
}

/**
 * Admin About page. Server Component — fetches the about row with
 * `getAboutForAdmin`, the NO-placeholder-fallback variant. The admin must
 * always see the real, possibly-empty row here so they can never mistake
 * placeholder content for real data and accidentally save it back
 * (unlike the public `/about` page, which uses `getPublicAbout` and its
 * placeholder fallback).
 */
export default async function AdminAboutPage(): Promise<React.JSX.Element> {
  const supabase = await createServerSupabaseClient()

  let defaultValues: AboutInput = emptyDefaults
  let existingId: string | null = null
  let loadError: string | null = null

  try {
    const about = await getAboutForAdmin(supabase)

    if (about) {
      defaultValues = {
        name: about.name,
        tagline: about.tagline,
        bio: about.bio,
        photo_url: about.photo_url ?? '',
        email: about.email ?? '',
        tools: about.tools ?? [],
        clients: about.clients ?? [],
      }
      existingId = about.id
    }
  } catch (err) {
    loadError = isAppError(err)
      ? err.message
      : 'We could not load your about page right now. Please try again shortly.'
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-xl font-medium text-text-primary mb-8">Edit About Page</h1>

      {loadError ? (
        <div className="rounded-xl px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700">
          {loadError}
        </div>
      ) : (
        <>
          {existingId === null && (
            <div className="mb-6 rounded-xl px-4 py-3 text-sm bg-surface border border-border text-text-secondary">
              You don&apos;t have an about page yet. Fill in the fields below and save to create one.
            </div>
          )}
          <AboutForm defaultValues={defaultValues} existingId={existingId} />
        </>
      )}
    </div>
  )
}
