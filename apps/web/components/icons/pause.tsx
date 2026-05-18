import type { SVGProps } from 'react'

export function PauseIcon({ size = 12, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  )
}
// Smoke: <PauseIcon />
