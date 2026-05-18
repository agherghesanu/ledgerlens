'use client'

interface ToggleProps {
  /** Current on/off state */
  on: boolean
  /** Called with the new boolean value when toggled */
  onChange: (value: boolean) => void
}

/**
 * Toggle switch — exact mockup spec:
 * 40×22px pill, knob 18×18px moves 18px right when on.
 * Off: card-3 bg, text-dim knob. On: indigo bg, indigo-dark knob.
 */
export function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative flex-shrink-0 rounded-full border-none cursor-pointer transition-colors duration-200"
      style={{
        width: 40,
        height: 22,
        background: on ? 'var(--indigo)' : 'var(--card-3)',
        padding: 0,
      }}
    >
      <span
        className="absolute rounded-full transition-all duration-200"
        style={{
          top: 2,
          left: 2,
          width: 18,
          height: 18,
          background: on ? 'var(--indigo-dark)' : 'var(--text-dim)',
          transform: on ? 'translateX(18px)' : 'translateX(0)',
        }}
      />
    </button>
  )
}

// Smoke: <Toggle on={false} onChange={() => {}} /> <Toggle on={true} onChange={() => {}} />
