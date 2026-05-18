// RecentCasesList — last 3 scored reviews + "Next up" slot.
// Ported from mockup dashboard.jsx Recent Cases card.

import type { RecentReview } from '@/lib/api'
import type { CasePublic } from '@/lib/api'
import { Chip } from '@/components/ui/Chip'
import { ClockIcon } from '@/components/icons/clock'

interface RecentCasesListProps {
  recent: RecentReview[]
  nextCase: CasePublic | null
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Yesterday'
  return `${d} days ago`
}

export function RecentCasesList({ recent, nextCase }: RecentCasesListProps) {
  const isEmpty = recent.length === 0 && !nextCase

  return (
    <div
      className="rounded-xl border border-border overflow-hidden h-full flex flex-col"
      style={{ background: 'var(--card)' }}
    >
      <div
        className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)' }}
      >
        <h3 className="font-display font-bold text-[18px]" style={{ color: 'var(--text)' }}>
          Recent Cases
        </h3>
        {recent.length > 0 && (
          <button
            className="font-mono text-[11px] uppercase tracking-[0.08em] border-none bg-transparent cursor-pointer"
            style={{ color: 'var(--indigo)' }}
          >
            View All
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--card-3)', color: 'var(--text-mute)' }}
          >
            <ClockIcon size={20} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            No cases reviewed yet.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-mute)' }}>
            Start your first case above to see results here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {recent.map((r) => (
              <div
                key={r.review_id}
                className="flex items-center justify-between gap-3 px-5 py-4 transition-colors cursor-pointer"
                style={{ borderColor: 'var(--border)' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = 'transparent')
                }
              >
                <div className="min-w-0">
                  <div
                    className="font-display font-semibold text-[15px] truncate"
                    style={{ color: 'var(--text)' }}
                  >
                    {r.case_title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    {timeAgo(r.submitted_at)}
                  </div>
                </div>
                {r.score_total !== null ? (
                  <Chip variant={r.tone as 'green' | 'amber' | 'rose'}>
                    {r.score_total}%
                  </Chip>
                ) : (
                  <Chip variant="amber">Scoring…</Chip>
                )}
              </div>
            ))}
          </div>

          {nextCase && (
            <div
              className="mt-auto px-5 py-4 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="cap mb-2">NEXT UP</div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div
                    className="font-display font-semibold text-[15px]"
                    style={{ color: 'var(--text)' }}
                  >
                    {nextCase.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    Scheduled · {nextCase.difficulty}
                  </div>
                </div>
                <ClockIcon size={16} style={{ color: 'var(--text-mute)', flexShrink: 0 } as React.CSSProperties} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function RecentCasesListSkeleton() {
  return (
    <div
      className="rounded-xl border border-border overflow-hidden"
      style={{ background: 'var(--card)' }}
    >
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <div className="h-4 w-32 rounded animate-pulse" style={{ background: 'var(--card-3)' }} />
        <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--card-3)' }} />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="px-5 py-4 border-b border-border flex justify-between items-center gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-48 rounded animate-pulse" style={{ background: 'var(--card-3)' }} />
            <div className="h-2.5 w-24 rounded animate-pulse" style={{ background: 'var(--card-3)' }} />
          </div>
          <div className="h-6 w-14 rounded-md animate-pulse" style={{ background: 'var(--card-3)' }} />
        </div>
      ))}
    </div>
  )
}

// Smoke: <RecentCasesList recent={[]} nextCase={null} />
