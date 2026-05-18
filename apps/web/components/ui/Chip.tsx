'use client'

const VARIANTS = {
  default: 'bg-card-3 text-text',
  indigo: 'text-indigo',
  green:  'text-green',
  rose:   'text-rose border border-rose-700/80',
  amber:  'text-amber',
} as const

const VARIANT_BG: Record<keyof typeof VARIANTS, string> = {
  default: 'var(--card-3)',
  indigo:  'rgba(192,193,255,0.12)',
  green:   'rgba(78,222,163,0.12)',
  rose:    'var(--rose-soft)',
  amber:   'var(--amber-soft)',
}

export type ChipVariant = keyof typeof VARIANTS

interface ChipProps {
  children: React.ReactNode
  variant?: ChipVariant
  /** Large size — 28px height, 13px font, 12px horizontal padding */
  lg?: boolean
  className?: string
}

/**
 * Chip — inline label badge.
 * Default: 24px height, 10px h-padding, JetBrains Mono 12px.
 * lg: 28px height, 12px h-padding, 13px font.
 * Variants: default / indigo / green / rose / amber.
 * Rose variant includes a subtle border (per mockup .chip.rose rule).
 */
export function Chip({ children, variant = 'default', lg = false, className = '' }: ChipProps) {
  const height = lg ? 28 : 24
  const px = lg ? 12 : 10
  const fontSize = lg ? 13 : 12

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[6px] font-mono font-normal tracking-[0.02em] ${VARIANTS[variant]} ${className}`}
      style={{
        height,
        paddingLeft: px,
        paddingRight: px,
        fontSize,
        background: VARIANT_BG[variant],
      }}
    >
      {children}
    </span>
  )
}

// Smoke: <Chip>DEFAULT</Chip> <Chip variant="indigo">INDIGO</Chip> <Chip variant="rose">ROSE</Chip> <Chip variant="green" lg>LARGE GREEN</Chip>
