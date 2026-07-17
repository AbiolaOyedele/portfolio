import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import type { Thought } from '@/types/thought'
import Tag from '@/components/ui/Tag'

export interface ThoughtPostCardProps {
  post: Thought
}

/**
 * Single post card for the Thoughts grid. Ported from the old
 * ThoughtsPage.jsx `PostCard` function, minus the Framer Motion entrance
 * wrapper (moved up to `ThoughtsPostGrid`, the client leaf that owns the
 * stagger animation) so this card itself can stay a plain server-renderable
 * component.
 */
export default function ThoughtPostCard({ post }: ThoughtPostCardProps): React.JSX.Element {
  return (
    <Link
      href={`/thoughts/${post.slug}`}
      className="group block bg-white border border-border rounded-2xl p-6 h-full hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-200"
    >
      {/* Date + read time */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] text-text-muted" style={{ fontWeight: 300 }}>
          {post.date}
        </span>
        <div className="flex items-center gap-1 text-[12px] text-text-muted" style={{ fontWeight: 300 }}>
          <Clock className="w-3.5 h-3.5" />
          {post.readTime}
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-[18px] text-text-primary leading-snug mb-3 group-hover:opacity-70 transition-opacity duration-200"
        style={{ fontWeight: 400 }}
      >
        {post.title}
      </h3>

      {/* Excerpt */}
      <p
        className="text-[14px] text-text-secondary leading-relaxed mb-5"
        style={{
          fontWeight: 300,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {post.excerpt}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0" />
      </div>
    </Link>
  )
}
