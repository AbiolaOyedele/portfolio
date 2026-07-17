import type { Thought } from '@/types/thought'

/**
 * Hardcoded placeholder posts for the Thoughts page, ported verbatim from
 * the old ThoughtsPage.jsx `posts` array. Still a static array with no
 * database table or per-post route behind it — dynamic per-post routing is
 * explicitly out of scope for this pass.
 */
export const thoughts: Thought[] = [
  {
    slug: 'space-between-design-and-code',
    title: 'The space between design and code',
    date: 'April 10, 2026',
    readTime: '4 min',
    tags: ['Design', 'Development'],
    excerpt:
      'Most designers stop at Figma. Most engineers stop at the browser. The interesting work — and the best outcomes — happen in the gap between them.',
  },
  {
    slug: 'why-i-design-in-motion-first',
    title: 'Why I design in motion first',
    date: 'March 28, 2026',
    readTime: '6 min',
    tags: ['Motion', 'Process'],
    excerpt:
      'Static mockups lie. They tell you how a screen looks but not how it feels. Starting with motion forces you to make decisions about time, feedback, and flow from day one.',
  },
  {
    slug: 'lagos-constraints-as-creative-fuel',
    title: 'Lagos: constraints as creative fuel',
    date: 'March 15, 2026',
    readTime: '8 min',
    tags: ['Design', 'Strategy'],
    excerpt:
      'Designing for a city with variable power, patchy internet, and a loud visual culture trains you to strip everything down to what actually matters. It turns out that is useful everywhere.',
  },
  {
    slug: 'on-shipping',
    title: 'On shipping: done is better than perfect — but perfect ships better',
    date: 'February 20, 2026',
    readTime: '3 min',
    tags: ['Process'],
    excerpt:
      'The "ship it" culture has a shadow side. Work that is rushed out the door often costs more to fix than it would have to do right. There is a third path.',
  },
  {
    slug: 'invisible-details',
    title: 'The invisible details that make software feel right',
    date: 'February 5, 2026',
    readTime: '5 min',
    tags: ['Design', 'Development'],
    excerpt:
      'Nobody notices the 200ms transition on the modal. Nobody notices the easing curve on the button press. Together, a thousand unnoticed details become something people call "polished."',
  },
  {
    slug: 'brand-is-behavior',
    title: 'Brand is behaviour, not aesthetics',
    date: 'January 22, 2026',
    readTime: '5 min',
    tags: ['Branding', 'Strategy'],
    excerpt:
      'A logo is not a brand. A colour palette is not a brand. A brand is the sum of every decision a company makes when nobody is looking — and design is just the visible residue of those decisions.',
  },
]
