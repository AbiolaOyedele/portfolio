'use client'

import { Plus, X } from 'lucide-react'
import { useId, useState } from 'react'
import CloudinaryUploadButton from './CloudinaryUploadButton'

export interface ImageUrlListInputProps {
  /** Current list of image URLs. */
  value: string[]
  /** Called with the full next array whenever a URL is added or removed. */
  onChange: (next: string[]) => void
  /** Field label rendered above the list. Defaults to "Images". */
  label?: string
}

/**
 * Reusable add/remove list input for an array of image URL strings — used
 * for the project `images` field. Ported from the inline image-list markup
 * in the old `AdminProjectForm.jsx`, extracted into its own component.
 */
export default function ImageUrlListInput({
  value,
  onChange,
  label = 'Images',
}: ImageUrlListInputProps): React.JSX.Element {
  const [draft, setDraft] = useState('')
  const listId = useId()

  function handleAdd(): void {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
    setDraft('')
  }

  function handleRemove(index: number): void {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label htmlFor={listId} className="block text-sm text-text-secondary mb-2">
        {label}
      </label>

      {value.map((url, i) => (
        <div key={`${i}-${url}`} className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-surface"
          />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            aria-label={`Remove image URL ${i + 1}`}
            className="p-2 text-red-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          id={listId}
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="Add image URL"
          className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-text-primary/20"
        />
        <button
          type="button"
          onClick={handleAdd}
          aria-label="Add image URL"
          className="p-2.5 bg-border rounded-xl hover:bg-text-muted/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2">
        <CloudinaryUploadButton
          label="Upload image"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onUploaded={(url) => onChange([...value, url])}
        />
      </div>
    </div>
  )
}
