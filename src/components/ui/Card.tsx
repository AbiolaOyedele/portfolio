import type { HTMLAttributes, ReactNode } from 'react'

interface BaseCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export type CardProps = BaseCardProps & Omit<HTMLAttributes<HTMLDivElement>, keyof BaseCardProps>

export default function Card({ children, className = '', hover = true, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl shadow-card ${
        hover
          ? 'transition-all duration-200 hover:shadow-card-hover hover:scale-[1.02] active:shadow-card-hover active:scale-[1.02]'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
