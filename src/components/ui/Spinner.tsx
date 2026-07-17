interface SpinnerProps {
  className?: string
}

export default function Spinner({ className = '' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="w-8 h-8 border-2 border-border border-t-text-primary rounded-full animate-spin" />
    </div>
  )
}
