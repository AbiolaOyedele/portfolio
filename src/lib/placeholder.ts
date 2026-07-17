import { GRAPHICS_PLACEHOLDER_IMAGES } from '@/lib/graphics-placeholder-images'
import { hashStringToInt } from '@/lib/masonry'
import type { About } from '@/types/about'
import type { Project } from '@/types/project'

/**
 * Placeholder data used when Supabase tables are empty.
 * Real data from Supabase always takes precedence — the service layer only
 * reads from here as a fallback for public-facing reads (never for admin
 * reads, so the admin never mistakes placeholder content for real data).
 * Images use picsum.photos with fixed seeds for consistency.
 */

function img(seed: string, w = 800, h = 500): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

/**
 * Real client social graphics, standing in for /graphics until the admin
 * creates real rows. Every sampled image reads as a social-media ad (not
 * branding-guideline or deck-slide content), so all are tagged "Social
 * Media" rather than force a 3-way split with no basis — see
 * GRAPHICS_PLACEHOLDER_IMAGES. Titles/descriptions stay generic and honest
 * (no invented client names) since only the images themselves are real;
 * likes/dislikes use the same deterministic hash as masonry layout so they
 * don't change between server and client renders.
 */
type RawProject = Omit<Project, 'tools' | 'scope'>

// A few muted-loop sample clips, spread across the canvas so the video-tile
// mechanic (hover-to-play, badge-on-discovery) is exercised end-to-end until
// real hosted clips exist. Keyed by tile index → local /public path.
const SAMPLE_VIDEOS = [
  '/graphics/videos/vid-01.mp4',
  '/graphics/videos/vid-02.mp4',
  '/graphics/videos/vid-03.mp4',
  '/graphics/videos/vid-04.mp4',
] as const
const VIDEO_TILE_INTERVAL = 13 // roughly every 13th tile is a video

const graphicsPlaceholders: RawProject[] = GRAPHICS_PLACEHOLDER_IMAGES.map((image, index) => {
  const n = index + 1
  const padded = String(n).padStart(2, '0')
  const id = `ph-graphics-${padded}`
  const hash = hashStringToInt(id)
  const isVideo = index % VIDEO_TILE_INTERVAL === 2
  const videoUrl = isVideo ? SAMPLE_VIDEOS[(index / VIDEO_TILE_INTERVAL | 0) % SAMPLE_VIDEOS.length]! : ''
  return {
    id,
    title: `Social Graphic ${padded}`,
    slug: `social-graphic-${padded}`,
    category: 'graphics',
    subcategory: 'Social Media',
    cover_url: image.file,
    description: 'Client social media design.',
    tags: ['Social Media', 'Design'],
    images: [],
    video_url: videoUrl,
    visible: true,
    sort_order: n,
    created_at: new Date(0).toISOString(),
    likes: 5 + (hash % 60),
    dislikes: 1 + (hash % 10),
  }
})

/* ─── About ─────────────────────────────────────────────────── */
export const placeholderAbout: About = {
  id: 'placeholder',
  name: 'Abiola Oyedele',
  tagline: 'Designer. Strategist. Builder.',
  bio: `I'm a Lagos-based graphic designer, motion artist, and product builder with over six years of
experience crafting work that connects with people. I believe design is problem-solving dressed
beautifully — whether that's a brand system, a motion sequence, or a digital product. I move
between disciplines fluidly, which means the work I deliver tends to be coherent from logo to
landing page to launch film.`,
  photo_url: '',
  email: 'abiolaoyedele55@gmail.com',
  tools: ['After Effects', 'Photoshop', 'Figma', 'Adobe Media Encoder', 'Supabase', 'React'],
  clients: ['Teemplot', 'Wimly', 'SNT', 'Bigbelly', 'IPC', 'Bioclean', 'Zero to 16', 'FFDM'],
  updated_at: new Date(0).toISOString(),
}

/* ─── Projects ───────────────────────────────────────────────── */
/**
 * Reasonable default "Tools + Tech" / "Scope" for placeholder rows, derived
 * from the project category (real rows carry their own DB values). Keeps the
 * graphics detail panel populated before the admin fills in real metadata.
 */
function defaultToolsScope(category: Project['category']): { tools: string[]; scope: string[] } {
  switch (category) {
    case 'motion':
      return { tools: ['After Effects', 'Cinema 4D', 'Figma'], scope: ['Motion Design', 'Art Direction'] }
    case 'playground':
      return { tools: ['React', 'TypeScript', 'Next.js', 'Tailwind'], scope: ['Web', 'Product', 'Engineering'] }
    case 'graphics':
    default:
      return { tools: ['Photoshop', 'Illustrator', 'Figma'], scope: ['Art Direction', 'Social Design'] }
  }
}

const rawPlaceholders: RawProject[] = [
  /* ── GRAPHICS ── */
  ...graphicsPlaceholders,

  /* ── MOTION ── */
  {
    id: 'ph-motion-1',
    title: 'Teemplot Launch Film',
    slug: 'teemplot-launch-film',
    category: 'motion',
    subcategory: null,
    cover_url: img('motion-teemplot', 800, 500),
    description: `Brand launch film produced entirely in After Effects. Built from the ground up — concept,
storyboard, animation, and sound design — to introduce Teemplot to their target audience
across social and OOH screens.`,
    tags: ['Motion', 'After Effects', 'Brand Film'],
    images: [img('motion-teemplot-2', 800, 600), img('motion-teemplot-3', 800, 600)],
    video_url: 'https://player.vimeo.com/video/76979871',
    visible: true,
    sort_order: 1,
    created_at: new Date(0).toISOString(),
    likes: 64,
    dislikes: 9,
  },
  {
    id: 'ph-motion-2',
    title: 'Product Demo Reel',
    slug: 'product-demo-reel',
    category: 'motion',
    subcategory: null,
    cover_url: img('motion-demo', 800, 500),
    description: `A 60-second product demo reel for a SaaS dashboard product. Animated UI flows and
interaction states using After Effects and a custom easing library — no screen recording,
pure motion design throughout.`,
    tags: ['Motion', 'Product', 'UI Animation'],
    images: [img('motion-demo-2', 800, 600)],
    video_url: '',
    visible: true,
    sort_order: 2,
    created_at: new Date(0).toISOString(),
    likes: 45,
    dislikes: 5,
  },
  {
    id: 'ph-motion-3',
    title: 'Zero to 16 Title Sequence',
    slug: 'zero-to-16-title-sequence',
    category: 'motion',
    subcategory: null,
    cover_url: img('motion-zeroto16', 800, 500),
    description: `Kinetic typography title sequence for Zero to 16's flagship programme. The brief was bold,
fast, and confident — type as the hero, with every frame designed for maximum legibility at
broadcast resolution.`,
    tags: ['Motion', 'Typography', 'Broadcast'],
    images: [img('motion-zeroto16-2', 800, 600), img('motion-zeroto16-3', 800, 600)],
    video_url: '',
    visible: true,
    sort_order: 3,
    created_at: new Date(0).toISOString(),
    likes: 31,
    dislikes: 4,
  },

  /* ── PLAYGROUND ── */
  {
    id: 'ph-vibe-1',
    title: 'Wimly Dashboard',
    slug: 'wimly-dashboard',
    category: 'playground',
    subcategory: null,
    cover_url: img('vibe-wimly', 800, 500),
    description: `Full product design and frontend build for Wimly's analytics dashboard. Designed in Figma,
built in React and Tailwind CSS, connected to a Supabase backend. Shipped in three weeks,
zero bugs in production on day one.`,
    tags: ['Product', 'React', 'Dashboard', 'Supabase'],
    images: [img('vibe-wimly-2', 800, 600), img('vibe-wimly-3', 800, 600)],
    video_url: '',
    visible: true,
    sort_order: 1,
    created_at: new Date(0).toISOString(),
    likes: 39,
    dislikes: 6,
  },
  {
    id: 'ph-vibe-2',
    title: 'Bioclean Landing Page',
    slug: 'bioclean-landing-page',
    category: 'playground',
    subcategory: null,
    cover_url: img('vibe-bioclean', 800, 500),
    description: `Marketing site for Bioclean built with React and Framer Motion. Designed for conversion
with clear hierarchy, micro-interactions on every CTA, and a Lighthouse performance score
above 95.`,
    tags: ['Web', 'React', 'Framer Motion', 'Marketing'],
    images: [img('vibe-bioclean-2', 800, 600)],
    video_url: '',
    visible: true,
    sort_order: 2,
    created_at: new Date(0).toISOString(),
    likes: 28,
    dislikes: 3,
  },
]

export const placeholderProjects: Project[] = rawPlaceholders.map((p) => ({
  ...p,
  ...defaultToolsScope(p.category),
}))
