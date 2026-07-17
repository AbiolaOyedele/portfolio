/**
 * Real design work supplied to fill the /graphics canvas while the admin
 * hasn't created any rows in the live database yet. Aspect ratios are
 * measured from the actual source files (not guessed) so the masonry layout
 * in `masonry.ts` can size each card to match its image instead of cropping
 * it into a generic bucket.
 */
export interface GraphicsPlaceholderImage {
  file: string
  aspect: number
}

/**
 * All placeholder covers are served from Cloudinary (uploaded from the old
 * `public/graphics` files) so tiles load as small, CDN-cached, auto-format
 * transforms instead of multi-MB PNGs from the app origin.
 */
export const GRAPHICS_CDN_BASE = 'https://res.cloudinary.com/diud4qb2x/image/upload/portfolio-graphics'

export const GRAPHICS_PLACEHOLDER_IMAGES: readonly GraphicsPlaceholderImage[] = [
  { file: `${GRAPHICS_CDN_BASE}/graphics-01.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-02.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-03.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-04.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-05.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-06.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-07.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-08.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-09.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-10.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-11.png`, aspect: 1.3333 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-12.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-13.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-14.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-15.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-16.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-17.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-18.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-19.png`, aspect: 1.3998 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-20.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-21.jpg`, aspect: 1.796 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-22.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-23.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-24.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-25.jpeg`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-26.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-27.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-28.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-29.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-30.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-31.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-32.png`, aspect: 1.9108 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-33.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-34.jpg`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-35.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-36.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-37.jpg`, aspect: 1.7778 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-38.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-39.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-40.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-41.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-42.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-43.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-44.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-45.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-46.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-47.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-48.jpeg`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-49.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-50.png`, aspect: 1.9108 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-51.jpeg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-52.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-53.png`, aspect: 1.9108 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-54.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-55.jpg`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-56.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-57.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-58.jpg`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-59.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-60.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-61.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-62.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-63.png`, aspect: 1 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-64.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-65.jpg`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-66.png`, aspect: 0.8 },
  { file: `${GRAPHICS_CDN_BASE}/graphics-67.png`, aspect: 0.8 },
] as const
