export interface CloudProps {
  className?: string
  opacity?: number
  scale?: number
}

/**
 * Decorative cloud SVG used in the Thoughts page hero sky. Purely
 * presentational and static, so it renders on the server. Ported as-is
 * from the old ThoughtsPage.jsx `Cloud` function.
 */
export default function Cloud({ className = '', opacity = 0.85, scale = 1 }: CloudProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 320 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: `scale(${scale})`, opacity }}
    >
      <ellipse cx="160" cy="80" rx="150" ry="55" fill="white" />
      <ellipse cx="100" cy="65" rx="70" ry="60" fill="white" />
      <ellipse cx="220" cy="62" rx="65" ry="55" fill="white" />
      <ellipse cx="160" cy="55" rx="80" ry="50" fill="white" />
    </svg>
  )
}
