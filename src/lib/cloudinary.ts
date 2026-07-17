/**
 * Public Cloudinary config for unsigned browser uploads. `NEXT_PUBLIC_*` vars
 * are inlined at build time, so these read correctly in client components.
 */
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ''

/** True when an unsigned upload can be attempted (cloud name + preset present). */
export function isCloudinaryConfigured(): boolean {
  return CLOUDINARY_CLOUD_NAME.length > 0 && CLOUDINARY_UPLOAD_PRESET.length > 0
}

export interface CloudinaryUploadResult {
  secureUrl: string
  resourceType: string
  format: string
  bytes: number
}

interface CloudinaryUploadResponse {
  secure_url?: string
  resource_type?: string
  format?: string
  bytes?: number
  error?: { message?: string }
}

/**
 * Upload a single file to Cloudinary using the unsigned preset (`auto`
 * resource type handles both images and video). Returns the delivered
 * `secure_url` on success; throws a plain-English `Error` otherwise. Runs in
 * the browser — no API secret involved.
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Uploads aren’t set up yet. Add your Cloudinary cloud name and upload preset.')
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  let response: Response
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: form,
    })
  } catch {
    throw new Error('Upload failed — please check your connection and try again.')
  }

  const data = (await response.json()) as CloudinaryUploadResponse
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? 'Upload failed. Please try again.')
  }

  return {
    secureUrl: data.secure_url,
    resourceType: data.resource_type ?? 'image',
    format: data.format ?? '',
    bytes: data.bytes ?? file.size,
  }
}

export interface CloudinaryUrlOptions {
  width?: number
  quality?: string
  format?: string
}

/**
 * Append Cloudinary transformation parameters to a URL.
 * If the URL already contains `/upload/`, inserts the transforms after it.
 * Otherwise returns the URL unchanged. Returns `''` for a null/empty URL.
 */
export function cloudinaryUrl(url: string | null, opts: CloudinaryUrlOptions = {}): string {
  const { width = 800, quality = 'auto', format = 'auto' } = opts
  if (!url) return ''
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${width},f_${format},q_${quality}/`)
  }
  return url
}
