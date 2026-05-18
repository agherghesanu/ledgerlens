import type { SVGProps } from 'react'

export function VolumeIcon({ size = 18, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 5 6 9H2v6h4l5 4V5ZM15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12" />
    </svg>
  )
}
// Smoke: <VolumeIcon />
