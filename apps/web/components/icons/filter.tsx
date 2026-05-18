import type { SVGProps } from 'react'

export function FilterIcon({ size = 18, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18M6 12h12M10 18h4" />
    </svg>
  )
}
// Smoke: <FilterIcon />
