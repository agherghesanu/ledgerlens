// OverTrustGauge — SVG circle gauge for the Over-Trust Index.
// Ported from mockup .gauge / .ring exactly.
// Low OTI = good (calibrated). High OTI = bad (over-trusting).

interface OverTrustGaugeProps {
  value: number | null  // 0–100; null = no data
}

function gaugeColor(val: number): string {
  if (val > 70) return '#FFB4AB'  // --rose (risk zone)
  if (val > 50) return '#FFB783'  // --amber (watch zone)
  return '#C0C1FF'                // --indigo (safe zone)
}

function gaugeLabel(val: number): string {
  if (val > 70) return 'AT RISK'
  if (val > 50) return 'WATCH'
  return 'CALIBRATED'
}

function gaugeDesc(val: number): string {
  if (val > 70) return 'High AI over-trust detected. Focus on independent verification.'
  if (val > 50) return 'Moderate over-trust tendency. Risk zone begins at 70%.'
  return 'Maintains healthy skepticism. Risk zone begins at 70%.'
}

export function OverTrustGauge({ value }: OverTrustGaugeProps) {
  const R = 70
  const circ = 2 * Math.PI * R
  const displayVal = value ?? 0
  const offset = circ - (displayVal / 100) * circ
  const color = gaugeColor(displayVal)
  const label = gaugeLabel(displayVal)
  const desc = gaugeDesc(displayVal)

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div
        className="px-5 py-4 border-b border-border flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)' }}
      >
        <h3 className="font-display font-bold text-[18px] m-0" style={{ color: 'var(--text)' }}>
          Over-Trust Index
        </h3>
        <span className="cap">CURRENT</span>
      </div>

      <div className="p-5 flex flex-col items-center gap-4">
        {/* SVG gauge ring */}
        <div className="relative flex items-center justify-center">
          <svg width={180} height={180} viewBox="0 0 180 180">
            {/* Track */}
            <circle cx={90} cy={90} r={R} fill="none" stroke="var(--card-3)" strokeWidth={14} />
            {/* Progress */}
            <circle
              cx={90}
              cy={90}
              r={R}
              fill="none"
              stroke={value !== null ? color : 'var(--border)'}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={value !== null ? offset : circ}
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.4s ease' }}
            />
          </svg>

          {/* Center value */}
          <div className="absolute flex flex-col items-center gap-0.5">
            <div
              className="font-mono font-medium leading-none"
              style={{ fontSize: 28, color: value !== null ? color : 'var(--text-mute)', letterSpacing: '-0.02em' }}
            >
              {value !== null ? `${displayVal}%` : '—'}
            </div>
            <div className="cap" style={{ fontSize: 10, color: value !== null ? color : 'var(--text-mute)' }}>
              {value !== null ? label : 'NO DATA'}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-center leading-relaxed m-0" style={{ color: 'var(--text-dim)' }}>
          {value !== null ? desc : 'Complete some reviews to see your over-trust index.'}
        </p>

        {/* Legend */}
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.04em]" style={{ color: 'var(--text-dim)' }}>
          {[
            { color: '#C0C1FF', label: 'SAFE' },
            { color: '#FFB783', label: 'WATCH' },
            { color: '#FFB4AB', label: 'RISK' },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span style={{ display: 'block', width: 8, height: 8, borderRadius: 9999, background: item.color, flexShrink: 0 }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function OverTrustGaugeSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden animate-pulse" style={{ background: 'var(--card)' }}>
      <div className="px-5 py-4 border-b border-border">
        <div className="h-4 w-36 rounded" style={{ background: 'var(--card-3)' }} />
      </div>
      <div className="p-5 flex flex-col items-center gap-4">
        <div className="w-[180px] h-[180px] rounded-full" style={{ background: 'var(--card-3)' }} />
        <div className="h-3 w-48 rounded" style={{ background: 'var(--card-3)' }} />
      </div>
    </div>
  )
}

// Smoke: <OverTrustGauge value={45} /> <OverTrustGauge value={null} />
