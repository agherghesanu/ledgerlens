'use client'

// Kitchen-sink visual regression page — dev-only.
// Access at /app/_design (only rendered in NODE_ENV !== 'production').
// Shows every primitive at every variant so regressions are instantly visible.

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Chip } from '@/components/ui/Chip'
import { Seg } from '@/components/ui/Seg'
import { Stars } from '@/components/ui/Stars'
import { Toggle } from '@/components/ui/Toggle'
import * as Icons from '@/components/icons'

// Sections helper
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2
        className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-dim border-b border-border pb-2"
      >
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  )
}

// Icon grid row
function IconRow() {
  const iconMap: Record<string, React.ComponentType<{ size?: number }>> = Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>
  return (
    <div className="flex flex-wrap gap-4">
      {Object.entries(iconMap).map(([name, Ic]) => (
        <div key={name} className="flex flex-col items-center gap-1.5 w-16">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-card-2 border border-border text-text-dim">
            <Ic size={18} />
          </div>
          <span className="font-mono text-[9px] text-text-mute text-center leading-tight">
            {name.replace('Icon', '')}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function DesignPage() {
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="p-8 font-mono text-rose text-sm">
        Design kitchen sink is disabled in production.
      </div>
    )
  }

  const [toggleA, setToggleA] = useState(false)
  const [toggleB, setToggleB] = useState(true)
  const [seg, setSeg] = useState('Medium')
  const [seg2, setSeg2] = useState('USD')

  return (
    <div
      className="min-h-screen p-8 font-body"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Header */}
      <div className="mb-10">
        <h1
          className="font-display font-bold text-3xl tracking-tight mb-1"
          style={{ color: 'var(--text)' }}
        >
          Design Kitchen Sink
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          Visual regression surface for all primitive components. Dev-only.
        </p>
      </div>

      <div className="flex flex-col gap-10 max-w-5xl">

        {/* ── Icons ─────────────────────────────────────────────── */}
        <Section title="Icons — all 36">
          <IconRow />
        </Section>

        {/* ── Avatar ────────────────────────────────────────────── */}
        <Section title="Avatar">
          <Avatar initials="JD" size={32} />
          <Avatar initials="AB" size={24} />
          <Avatar initials="XY" size={48} />
          <Avatar initials="ml" size={40} />
          <Avatar initials="ZZ" size={56} />
        </Section>

        {/* ── Stars ─────────────────────────────────────────────── */}
        <Section title="Stars">
          <Stars count={0} total={5} />
          <Stars count={1} total={5} />
          <Stars count={2} total={5} />
          <Stars count={3} total={5} />
          <Stars count={4} total={5} />
          <Stars count={5} total={5} />
        </Section>

        {/* ── Chip ──────────────────────────────────────────────── */}
        <Section title="Chip — default size">
          <Chip>DEFAULT</Chip>
          <Chip variant="indigo">INDIGO</Chip>
          <Chip variant="green">GREEN</Chip>
          <Chip variant="rose">ROSE</Chip>
          <Chip variant="amber">AMBER</Chip>
        </Section>

        <Section title="Chip — lg variant">
          <Chip lg>DEFAULT LG</Chip>
          <Chip variant="indigo" lg>INDIGO LG</Chip>
          <Chip variant="green" lg>GREEN LG</Chip>
          <Chip variant="rose" lg>ROSE LG</Chip>
          <Chip variant="amber" lg>AMBER LG</Chip>
        </Section>

        <Section title="Chip — with icons">
          <Chip variant="indigo"><Icons.LightningIcon size={11} /> PEER TOP 23%</Chip>
          <Chip variant="green"><Icons.CheckIcon size={11} /> CONNECTED</Chip>
          <Chip variant="rose"><span style={{ width: 6, height: 6, borderRadius: 9999, background: 'var(--rose-2)', display: 'inline-block' }} /> LIVE</Chip>
          <Chip variant="amber">REQUIRED FOR VOICE</Chip>
        </Section>

        {/* ── Toggle ────────────────────────────────────────────── */}
        <Section title="Toggle">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Toggle on={toggleA} onChange={setToggleA} />
              <span className="font-mono text-xs text-text-dim">
                Demo Mode — {toggleA ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Toggle on={toggleB} onChange={setToggleB} />
              <span className="font-mono text-xs text-text-dim">
                Voice Feedback — {toggleB ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </Section>

        {/* ── Seg ───────────────────────────────────────────────── */}
        <Section title="Segmented Control">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="cap">Difficulty</span>
              <Seg
                value={seg}
                options={['Easy', 'Medium', 'Hard', 'Adaptive']}
                onChange={setSeg}
              />
              <span className="font-mono text-xs text-text-mute">Selected: {seg}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="cap">Currency</span>
              <Seg
                value={seg2}
                options={['USD', 'EUR', 'GBP', 'JPY']}
                onChange={setSeg2}
              />
              <span className="font-mono text-xs text-text-mute">Selected: {seg2}</span>
            </div>
          </div>
        </Section>

        {/* ── Color Tokens ──────────────────────────────────────── */}
        <Section title="Color Tokens">
          {[
            { label: '--bg',         val: '#13131B' },
            { label: '--bg-2',       val: '#0D0D15' },
            { label: '--card',       val: '#1B1B23' },
            { label: '--card-2',     val: '#1F1F27' },
            { label: '--card-3',     val: '#292932' },
            { label: '--border',     val: '#464554' },
            { label: '--text',       val: '#E4E1ED' },
            { label: '--text-dim',   val: '#C7C4D7' },
            { label: '--text-mute',  val: '#8a879b' },
            { label: '--indigo',     val: '#C0C1FF' },
            { label: '--green',      val: '#4EDEA3' },
            { label: '--rose',       val: '#FFB4AB' },
            { label: '--amber',      val: '#FFB783' },
          ].map(({ label, val }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className="w-12 h-12 rounded-lg border border-border/40"
                style={{ background: `var(${label})` }}
              />
              <span className="font-mono text-[9px] text-text-mute text-center">{label}</span>
            </div>
          ))}
        </Section>

        {/* ── Typography ────────────────────────────────────────── */}
        <Section title="Typography">
          <div className="flex flex-col gap-4 w-full">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-dim mb-1">Display (Hanken Grotesk 700)</p>
              <p className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>
                Finance Judgment Score
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-dim mb-1">Body (Geist)</p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                Junior analysts review AI-generated finance work, identify mistakes, and get scored on judgment quality.
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-dim mb-1">.cap label (JetBrains Mono uppercase)</p>
              <span className="cap">CASES REVIEWED · ACCURACY · STREAK</span>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-dim mb-1">Mono data value</p>
              <span className="font-mono text-4xl font-medium tracking-[-0.02em]" style={{ color: 'var(--text)' }}>73%</span>
            </div>
          </div>
        </Section>

      </div>
    </div>
  )
}
