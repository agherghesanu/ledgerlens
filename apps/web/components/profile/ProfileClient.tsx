'use client'

// ProfileClient — wires GET /profile to all profile components.
// Renders tasteful skeletons while loading; empty states for new users.

import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/lib/api'
import { SkillBreakdown, SkillBreakdownSkeleton } from './SkillBreakdown'
import { OverTrustGauge, OverTrustGaugeSkeleton } from './OverTrustGauge'
import { PatternCard, PatternCardSkeleton } from './PatternCard'
import { RecommendedFocus, RecommendedFocusSkeleton } from './RecommendedFocus'
import { HistoryTable, HistoryTableSkeleton } from './HistoryTable'
import { Chip } from '@/components/ui/Chip'

export function ProfileClient() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'aggregate'],
    queryFn: () => getProfile(),
    staleTime: 30_000,
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex justify-between items-end">
        <div>
          <h1
            className="font-display font-bold m-0 mb-1.5 tracking-[-0.01em]"
            style={{ fontSize: 32, lineHeight: 1.1, color: 'var(--text)' }}
          >
            Skill Tracking
          </h1>
          <p className="text-[15px] m-0" style={{ color: 'var(--text-dim)' }}>
            Detailed breakdown of analytical competencies and historical performance.
          </p>
        </div>

        {/* Peer comparison chip */}
        {profile && profile.accuracy !== null && (
          <Chip variant="indigo" lg>
            {/* Lightning icon */}
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
            </svg>
            PEER COMPARISON · TOP 23%
          </Chip>
        )}
      </div>

      {/* Stats strip */}
      {profile && (
        <div className="flex items-center gap-6 font-mono text-sm" style={{ color: 'var(--text-dim)' }}>
          <div>
            <span className="cap mr-2">CASES REVIEWED</span>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{profile.cases_reviewed}</span>
          </div>
          {profile.accuracy !== null && (
            <div>
              <span className="cap mr-2">ACCURACY</span>
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>{profile.accuracy}%</span>
            </div>
          )}
          <div>
            <span className="cap mr-2">STREAK</span>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{profile.streak_days} days</span>
          </div>
        </div>
      )}

      {/* ── Top row: skill breakdown (2fr) + gauge (1fr) ─────────────────── */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        {isLoading ? (
          <>
            <SkillBreakdownSkeleton />
            <OverTrustGaugeSkeleton />
          </>
        ) : (
          <>
            <SkillBreakdown skills={profile?.skills ?? []} />
            <OverTrustGauge value={profile?.over_trust_index ?? null} />
          </>
        )}
      </div>

      {/* ── Middle row: strengths, weaknesses, focus (1fr each) ──────────── */}
      <div className="grid grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <PatternCardSkeleton />
            <PatternCardSkeleton />
            <RecommendedFocusSkeleton />
          </>
        ) : (
          <>
            <PatternCard
              title="Strength Patterns"
              badge="SIGNAL HIGH"
              direction="strength"
              patterns={profile?.patterns ?? []}
              emptyMessage="No significant strengths detected yet. Keep reviewing!"
            />
            <PatternCard
              title="Weakness Patterns"
              badge="FOCUS AREAS"
              direction="weakness"
              patterns={profile?.patterns ?? []}
              emptyMessage="No focus areas flagged yet. Patterns appear after 10+ reviews."
            />
            <RecommendedFocus focusCategory={profile?.focus_category ?? null} />
          </>
        )}
      </div>

      {/* ── History table ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <HistoryTableSkeleton />
      ) : (
        <HistoryTable history={profile?.history ?? []} />
      )}
    </div>
  )
}
