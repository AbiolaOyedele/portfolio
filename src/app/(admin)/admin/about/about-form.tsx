'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import type { AboutInput } from '@/types/about'
import { saveAboutAction } from './actions'

export interface AboutFormProps {
  defaultValues: AboutInput
  existingId: string | null
}

interface FormFieldProps {
  label: string
  children: React.ReactNode
}

function FormField({ label, children }: FormFieldProps): React.JSX.Element {
  return (
    <div>
      <label className="block text-sm text-text-secondary mb-2">{label}</label>
      {children}
    </div>
  )
}

const inputClasses =
  'w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-text-primary/20'

/**
 * Admin about form. Client Component — owns all local form state and talks
 * to the server exclusively through `saveAboutAction`. `tools` and
 * `clients` are edited as comma-separated strings and split into arrays
 * only at submit time, mirroring the array-field handling on the project
 * form.
 */
export default function AboutForm({ defaultValues, existingId }: AboutFormProps): React.JSX.Element {
  const router = useRouter()

  const [name, setName] = useState<string>(defaultValues.name ?? '')
  const [tagline, setTagline] = useState<string>(defaultValues.tagline ?? '')
  const [bio, setBio] = useState<string>(defaultValues.bio ?? '')
  const [photoUrl, setPhotoUrl] = useState<string>(defaultValues.photo_url ?? '')
  const [email, setEmail] = useState<string>(defaultValues.email ?? '')
  const [toolsInput, setToolsInput] = useState<string>((defaultValues.tools ?? []).join(', '))
  const [clientsInput, setClientsInput] = useState<string>((defaultValues.clients ?? []).join(', '))

  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSavedAt(null)

    const input: AboutInput = {
      name: name.trim() === '' ? null : name,
      tagline: tagline.trim() === '' ? null : tagline,
      bio: bio.trim() === '' ? null : bio,
      photo_url: photoUrl.trim(),
      email: email.trim(),
      tools: toolsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      clients: clientsInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
    }

    const result = await saveAboutAction(input, existingId)

    setSaving(false)

    if (!result.success) {
      setError(result.error ?? 'We could not save your changes. Please try again.')
      return
    }

    setSavedAt(Date.now())
    // Re-run the server component so a first-time save (which just created
    // the row) picks up the new `id` as `existingId` on next submit, and so
    // this form's defaultValues reflect what was actually persisted.
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {savedAt !== null && !error && (
        <div className="rounded-xl px-4 py-3 text-sm bg-green-50 border border-green-200 text-green-700">
          Saved. Your about page has been updated.
        </div>
      )}

      <FormField label="Name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Tagline">
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Bio">
        <textarea
          rows={5}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Photo URL">
        <input
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className={inputClasses}
        />
      </FormField>

      <FormField label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Tools (comma-separated)">
        <input
          type="text"
          value={toolsInput}
          onChange={(e) => setToolsInput(e.target.value)}
          placeholder="After Effects, Photoshop, Figma"
          className={inputClasses}
        />
      </FormField>

      <FormField label="Clients (comma-separated)">
        <input
          type="text"
          value={clientsInput}
          onChange={(e) => setClientsInput(e.target.value)}
          placeholder="Client A, Client B"
          className={inputClasses}
        />
      </FormField>

      <button
        type="submit"
        disabled={saving}
        className="bg-text-primary text-white rounded-full px-8 py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}
