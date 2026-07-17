'use client'

import { useId, useRef, useState } from 'react'
import { Loader2, UploadCloud } from 'lucide-react'
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary'

const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm'
const ALLOWED_TYPES = new Set(DEFAULT_ACCEPT.split(','))
const DEFAULT_MAX_BYTES = 100 * 1024 * 1024 // 100MB (covers short video clips)

export interface CloudinaryUploadButtonProps {
  /** Called with the delivered secure_url after a successful upload. */
  onUploaded: (url: string) => void
  /** Button text. Defaults to "Upload". */
  label?: string
  /** Comma-separated accept list; also enforced against the file's MIME type. */
  accept?: string
  /** Max allowed file size in bytes. */
  maxBytes?: number
}

/**
 * Admin-only file picker that uploads a single image/video to Cloudinary via
 * the unsigned preset and hands back the resulting URL. Validates MIME type
 * and size client-side before the request, shows an in-progress state, and
 * surfaces errors in plain English. Hidden entirely when Cloudinary isn't
 * configured, so the paste-a-URL flow remains the fallback.
 */
export default function CloudinaryUploadButton({
  onUploaded,
  label = 'Upload',
  accept = DEFAULT_ACCEPT,
  maxBytes = DEFAULT_MAX_BYTES,
}: CloudinaryUploadButtonProps): React.JSX.Element | null {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isCloudinaryConfigured()) return null

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    // Reset the input so selecting the same file again re-triggers change.
    e.target.value = ''
    if (!file) return

    setError(null)

    if (!ALLOWED_TYPES.has(file.type)) {
      setError('That file type isn’t supported. Use PNG, JPG, WEBP, GIF, or MP4/WEBM.')
      return
    }
    if (file.size > maxBytes) {
      setError(`That file is too large. Max size is ${Math.round(maxBytes / (1024 * 1024))}MB.`)
      return
    }

    setUploading(true)
    try {
      const { secureUrl } = await uploadToCloudinary(file)
      onUploaded(secureUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
        className="sr-only"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-border disabled:opacity-60"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        {uploading ? 'Uploading…' : label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
