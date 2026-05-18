// RecommendedFocus — third column of the patterns row.
// Highlights the weakest category and suggests focused practice.
// Ported from mockup .rec-card.

import Link from 'next/link'

interface RecommendedFocusProps {
  focusCategory: string | null
}

export function RecommendedFocus({ focusCategory }: RecommendedFocusProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div
        className="px-5 py-4 border-b border-border flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)' }}
      >
        <h3 className="font-display font-bold text-[18px] m-0" style={{ color: 'var(--text)' }}>
          Recommended Focus
        </h3>
        {/* Sparkles icon */}
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--indigo)' }}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </svg>
      </div>

      <div className="p-4 flex flex-col gap-3.5">
        {focusCategory ? (
          <>
            {/* Rec card */}
            <div
              className="rounded-lg p-4"
              style={{
                background: 'var(--card-2)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="flex items-center gap-1.5 mb-2"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--indigo)' }}
              >
                {/* Target icon */}
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx={12} cy={12} r={10} /><circle cx={12} cy={12} r={6} /><circle cx={12} cy={12} r={2} />
                </svg>
                NEXT 5 SESSIONS
              </div>
              <div className="text-sm leading-[1.6]" style={{ color: 'var(--text-dim)' }}>
                Practice cases in{' '}
                <strong style={{ color: 'var(--text)' }}>{focusCategory}</strong>
                {' '}to improve your weakest skill area.
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/case?category=${encodeURIComponent(focusCategory)}`}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg font-mono font-medium text-sm tracking-[0.04em] w-full"
              style={{
                background: 'var(--indigo)',
                color: 'var(--indigo-dark)',
                border: '1px solid var(--indigo)',
                boxShadow: '0px 2px 6px -2px rgba(192,193,255,0.4)',
                textDecoration: 'none',
              }}
            >
              {/* Lightning icon */}
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
              </svg>
              START FOCUS DRILL
            </Link>

            <p className="text-xs text-center m-0" style={{ color: 'var(--text-mute)' }}>
              Est. uplift: +6% accuracy in 2 weeks
            </p>
          </>
        ) : (
          <p className="text-sm py-4 text-center m-0" style={{ color: 'var(--text-mute)' }}>
            Complete more reviews to unlock your recommended focus area.
          </p>
        )}
      </div>
    </div>
  )
}

export function RecommendedFocusSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden animate-pulse" style={{ background: 'var(--card)' }}>
      <div className="px-5 py-4 border-b border-border">
        <div className="h-4 w-36 rounded" style={{ background: 'var(--card-3)' }} />
      </div>
      <div className="p-4 flex flex-col gap-3.5">
        <div className="rounded-lg h-24" style={{ background: 'var(--card-3)' }} />
        <div className="h-10 w-full rounded-lg" style={{ background: 'var(--card-3)' }} />
      </div>
    </div>
  )
}

// Smoke: <RecommendedFocus focusCategory="Cash Flow Logic" />
