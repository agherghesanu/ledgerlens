import type { SVGProps } from 'react'

export function StarIcon({
  size = 14,
  filled = true,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number; filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M12 2.3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.1l-5.8 3.1 1.1-6.5L2.6 9.1l6.5-.9z" />
    </svg>
  )
}

// Smoke: <StarIcon filled /> <StarIcon filled={false} />
