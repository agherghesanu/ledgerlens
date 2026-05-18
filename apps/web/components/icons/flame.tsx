import type { SVGProps } from 'react'

export function FlameIcon({ size = 18, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 14a4 4 0 0 0 8 0c0-1.5-1-3-2-4 0 0-1 2-3 2 0 0 0-3 2-5-3 1-7 4-7 9 0 4 3 7 7 7 4 0 6-3 6-6" />
    </svg>
  )
}

// Smoke: <FlameIcon />
