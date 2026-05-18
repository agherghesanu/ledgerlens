// SkillBreakdown — horizontal bar chart for per-category accuracy.
// Ported from mockup .skill-row exactly.

import type { SkillBar } from '@/lib/api'

interface SkillBreakdownProps {
  skills: SkillBar[]
}

export function SkillBreakdown({ skills }: SkillBreakdownProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div
        className="px-5 py-4 border-b border-border flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)' }}
      >
        <h3 className="font-display font-bold text-[18px] m-0" style={{ color: 'var(--text)' }}>
          Skill Breakdown
        </h3>
        <button
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] border-none bg-transparent cursor-pointer"
          style={{ color: 'var(--indigo)' }}
        >
          {/* TrendUp inline SVG */}
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
            <path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" />
          </svg>
          CHART
        </button>
      </div>

      <div className="px-5 pt-3 pb-2 flex flex-col gap-0">
        {skills.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-4 py-3"
            style={{ borderBottom: '1px solid var(--border-dim)' }}
          >
            {/* Name */}
            <div
              className="text-sm font-medium flex-shrink-0"
              style={{ color: 'var(--text-dim)', width: 200 }}
            >
              {s.name}
            </div>

            {/* Bar track */}
            <div
              className="flex-1 rounded-full overflow-hidden"
              style={{ height: 6, background: 'var(--card-3)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${s.pct}%`,
                  background:
                    s.pct >= 80
                      ? 'var(--green)'
                      : s.pct >= 60
                      ? 'var(--indigo)'
                      : 'var(--amber)',
                }}
              />
            </div>

            {/* Percentage */}
            <div
              className="font-mono text-sm font-medium flex-shrink-0 text-right"
              style={{ width: 40, color: 'var(--text)' }}
            >
              {s.pct}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkillBreakdownSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden animate-pulse" style={{ background: 'var(--card)' }}>
      <div className="px-5 py-4 border-b border-border">
        <div className="h-4 w-36 rounded" style={{ background: 'var(--card-3)' }} />
      </div>
      <div className="px-5 pt-3 pb-2 flex flex-col gap-0">
        {[140, 110, 160, 120, 100].map((w, i) => (
          <div key={i} className="flex items-center gap-4 py-3" style={{ borderBottom: '1px solid var(--border-dim)' }}>
            <div className="rounded flex-shrink-0" style={{ width: w, height: 12, background: 'var(--card-3)' }} />
            <div className="flex-1 rounded-full" style={{ height: 6, background: 'var(--card-3)' }} />
            <div className="rounded flex-shrink-0" style={{ width: 32, height: 12, background: 'var(--card-3)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Smoke: <SkillBreakdown skills={[{name:'Revenue Recognition',pct:83},{name:'Variance Analysis',pct:68}]} />
