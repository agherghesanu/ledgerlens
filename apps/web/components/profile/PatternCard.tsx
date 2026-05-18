// PatternCard — shows strength or weakness patterns derived from σ analysis.
// Ported from mockup .pattern-list / .pattern-item strength|weakness.

import type { PatternItem } from '@/lib/api'

interface PatternCardProps {
  title: string
  badge: string
  direction: 'strength' | 'weakness'
  patterns: PatternItem[]
  emptyMessage: string
}

export function PatternCard({ title, badge, direction, patterns, emptyMessage }: PatternCardProps) {
  const accentColor = direction === 'strength' ? 'var(--green)' : 'var(--rose)'
  const markerBg = direction === 'strength' ? 'var(--green-soft)' : 'var(--rose-soft)'

  const matching = patterns.filter((p) => p.direction === direction)

  // Icon inline SVG
  const Icon =
    direction === 'strength' ? (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{ color: accentColor }}>
        <path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" />
      </svg>
    ) : (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{ color: accentColor }}>
        <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/>
        <path d="M12 9v4"/><path d="M12 17h.01"/>
      </svg>
    )

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div
        className="px-5 py-4 border-b border-border flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)' }}
      >
        <h3 className="font-display font-bold text-[18px] m-0 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          {Icon} {title}
        </h3>
        <span className="cap">{badge}</span>
      </div>

      <div className="px-5 pb-4 pt-2">
        {matching.length === 0 ? (
          <p className="text-sm py-4 text-center m-0" style={{ color: 'var(--text-mute)' }}>
            {emptyMessage}
          </p>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {matching.map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                {/* Marker dot */}
                <div
                  className="flex-shrink-0 rounded-full mt-1.5"
                  style={{ width: 8, height: 8, background: accentColor, boxShadow: `0 0 0 3px ${markerBg}` }}
                />
                <div>
                  <div className="text-sm leading-[1.6]" style={{ color: 'var(--text-dim)' }}>
                    {p.criterion}
                  </div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-mute)' }}>
                    {direction === 'strength' ? '+' : ''}{p.z_score.toFixed(1)}σ · avg {(p.user_mean * 10).toFixed(0)}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function PatternCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden animate-pulse" style={{ background: 'var(--card)' }}>
      <div className="px-5 py-4 border-b border-border">
        <div className="h-4 w-36 rounded" style={{ background: 'var(--card-3)' }} />
      </div>
      <div className="px-5 pb-4 pt-2 flex flex-col gap-3 mt-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--card-3)' }} />
            <div className="flex-1 space-y-1">
              <div className="h-3 rounded" style={{ background: 'var(--card-3)' }} />
              <div className="h-2.5 w-1/2 rounded" style={{ background: 'var(--card-3)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Smoke: <PatternCard title="Strength Patterns" badge="SIGNAL HIGH" direction="strength" patterns={[]} emptyMessage="No patterns yet." />
