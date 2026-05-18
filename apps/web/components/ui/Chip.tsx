const VARIANTS = {
  default: 'bg-card-2 text-text-dim',
  indigo:  'bg-indigo-soft text-indigo',
  green:   'bg-green-soft text-green',
  rose:    'bg-rose-soft text-rose',
  amber:   'bg-amber-soft text-amber',
} as const

type Variant = keyof typeof VARIANTS

export function Chip({ label, variant = 'default' }: { label: string; variant?: Variant }) {
  return (
    <span className={`inline-flex items-center h-6 px-2 rounded-[6px] font-mono text-xs ${VARIANTS[variant]}`}>
      {label}
    </span>
  )
}
