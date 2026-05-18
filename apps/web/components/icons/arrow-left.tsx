import type { SVGProps } from 'react'

export function ArrowLeftIcon({ size = 18, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M19 12H5M11 5l-7 7 7 7" />
    </svg>
  )
}

// Smoke: <ArrowLeftIcon />
