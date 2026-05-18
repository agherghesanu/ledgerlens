import type { SVGProps } from 'react'

export function PlayIcon({ size = 12, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
// Smoke: <PlayIcon />
