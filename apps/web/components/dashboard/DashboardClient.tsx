'use client'

// DashboardClient — wires React Query hooks to dashboard components.
// The server page renders the skeleton instantly, this hydrates with real data.

import { useQuery } from '@tanstack/react-query'
import {
  getCases,
  getProfileStats,
  getRecentReviews,
  type CasePublic,
} from '@/lib/api'
import { StatCard, StatCardSkeleton } from './StatCard'
import { ActiveCaseCard, ActiveCaseCardSkeleton } from './ActiveCaseCard'
import { ProgressChart, ProgressChartSkeleton } from './ProgressChart'
import { RecentCasesList, RecentCasesListSkeleton } from './RecentCasesList'
import { FolderIcon } from '@/components/icons/folder'
import { FlameIcon } from '@/components/icons/flame'
import { TrendUpIcon } from '@/components/icons/trend-up'
import { PlusIcon } from '@/components/icons/plus'
import Link from 'next/link'

export function DashboardClient() {
  const statsQ = useQuery({
    queryKey: ['profile', 'stats'],
    queryFn: () => getProfileStats(),
  })

  const recentQ = useQuery({
    queryKey: ['profile', 'recent'],
    queryFn: () => getRecentReviews(),
  })

  const casesQ = useQuery({
    queryKey: ['cases'],
    queryFn: () => getCases(),
  })

  // Pick the first hard-pending case, fall back to any pending case
  const activeCase: CasePublic | null = casesQ.data
    ? (casesQ.data.find((c) => c.difficulty === 'hard') ??
       casesQ.data[0] ??
       null)
    : null

  const stats = statsQ.data
  const recent = recentQ.data ?? []

  // Determine overall loading state
  const isLoading = statsQ.isLoading || recentQ.isLoading || casesQ.isLoading

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex justify-between items-end">
        <div>
          <h1
            className="font-display font-bold text-[32px] leading-[1.1] tracking-[-0.01em] m-0 mb-1.5"
            style={{ color: 'var(--text)' }}
          >
            Dashboard
          </h1>
          <p className="text-[15px]" style={{ color: 'var(--text-dim)' }}>
            Overview of your recent financial review activity.
          </p>
        </div>
        <Link
          href="/case"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg font-mono font-medium text-[13px] tracking-[0.04em] transition-colors"
          style={{
            background: 'var(--indigo)',
            color: 'var(--indigo-dark)',
            border: '1px solid var(--indigo)',
            boxShadow: '0px 2px 6px -2px rgba(192,193,255,0.4)',
            textDecoration: 'none',
          }}
        >
          <PlusIcon size={14} /> NEW CASE
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="CASES REVIEWED"
              value={stats?.cases_reviewed ?? 0}
              icon={<FolderIcon size={20} />}
            />

            <StatCard
              label="ACCURACY"
              value={stats?.accuracy !== null && stats?.accuracy !== undefined ? `${stats.accuracy}%` : '—'}
              sub={
                stats?.accuracy_delta !== null && stats?.accuracy_delta !== undefined ? (
                  <span style={{ color: stats.accuracy_delta >= 0 ? 'var(--green)' : 'var(--rose)' }}>
                    <TrendUpIcon
                      size={12}
                      style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 } as React.CSSProperties}
                    />
                    {stats.accuracy_delta >= 0 ? '+' : ''}{stats.accuracy_delta}%
                  </span>
                ) : undefined
              }
            />

            <StatCard
              label="CURRENT STREAK"
              value={stats?.streak_days ?? 0}
              sub="days"
              icon={<FlameIcon size={22} />}
            />
          </>
        )}
      </div>

      {/* Bento: left col (active case + chart) and right col (recent cases) */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <>
              <ActiveCaseCardSkeleton />
              <ProgressChartSkeleton />
            </>
          ) : (
            <>
              <ActiveCaseCard activeCase={activeCase} />
              {stats?.progress && stats.progress.length > 0 && (
                <ProgressChart points={stats.progress} />
              )}
            </>
          )}
        </div>

        {/* Right column */}
        {isLoading ? (
          <RecentCasesListSkeleton />
        ) : (
          <RecentCasesList
            recent={recent}
            nextCase={casesQ.data && casesQ.data.length > 1 ? casesQ.data[1] : null}
          />
        )}
      </div>
    </div>
  )
}

