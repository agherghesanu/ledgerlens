'use client'

interface SegProps {
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}

/**
 * Segmented control — exact mockup .seg spec:
 * card-3 bg, border, 8px radius, 3px internal padding.
 * Active tab: card bg + inset border-1 (box-shadow), text color.
 * Inactive tabs: text-dim, hover text.
 * Font: JetBrains Mono 12px, 0.04em letter-spacing.
 */
export function Seg({ value, options, onChange }: SegProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-border gap-0.5"
      style={{
        background: 'var(--card-3)',
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="rounded-[6px] font-mono text-xs tracking-[0.04em] cursor-pointer border-none transition-all duration-150"
            style={{
              padding: '6px 14px',
              background: active ? 'var(--card)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text-dim)',
              boxShadow: active ? 'inset 0 0 0 1px var(--border)' : 'none',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// Smoke: <Seg value="Medium" options={['Easy','Medium','Hard','Adaptive']} onChange={() => {}} />
