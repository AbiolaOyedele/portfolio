import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

type ButtonVariant = 'solid' | 'outline' | 'ghost'

interface BaseButtonProps {
  children: ReactNode
  /** Internal route — renders a Next.js `Link`. */
  to?: string
  /** External URL — renders an `<a>`. */
  href?: string
  variant?: ButtonVariant
  className?: string
  /** Only for the original dynamic-font-weight pattern; no new inline styles. */
  style?: CSSProperties
}

export type ButtonProps = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps>

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 text-[14px] transition-all duration-200 cursor-pointer min-h-[44px]'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  solid: 'bg-text-primary text-white rounded-full px-6 py-3 hover:opacity-90 active:opacity-75 active:scale-[0.98]',
  outline:
    'border border-border rounded-full px-6 py-3 text-text-primary hover:bg-text-primary hover:text-white active:bg-text-primary active:text-white',
  ghost: 'text-text-secondary hover:text-text-primary px-4 py-2',
}

export default function Button({
  children,
  to,
  href,
  variant = 'solid',
  className = '',
  style,
  ...props
}: ButtonProps) {
  const classes = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`
  const mergedStyle: CSSProperties = { fontWeight: 400, ...style }

  if (to) {
    // `next/link`'s `LinkProps` and React's `AnchorHTMLAttributes` describe optional
    // event handlers slightly differently, which trips `exactOptionalPropertyTypes`
    // when spreading a generically-typed rest object — cast through `object` to bridge
    // the two upstream shapes without losing the rest-prop passthrough.
    const anchorProps = props as unknown as object
    return (
      <Link {...anchorProps} href={to} className={classes} style={mergedStyle}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        {...(props as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)}
        href={href}
        className={classes}
        style={mergedStyle}
      >
        {children}
      </a>
    )
  }

  return (
    <button className={classes} style={mergedStyle} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
