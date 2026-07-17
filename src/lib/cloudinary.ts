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
