import type { ReactNode } from 'react'

interface TagProps {
  children: ReactNode
  className?: string
}

export default function Tag({ children, className = '' }: TagProps) {
  return (
    <span
      className={`inline-block bg-bg text-text-secondary text-[12px] sm:text-[13px] px-3 py-1.5 rounded-full border border-border ${className}`}
      style={{ fontWeight: 300 }}
    >
      {children}
    </span>
  )
}
