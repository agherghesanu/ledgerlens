// ActiveCaseCard — the highlighted "start review" card on the dashboard.
// Shows the first hard/pending case; falls back gracefully.

import type { CasePublic } from '@/lib/api'
import { Stars } from '@/components/ui/Stars'
import { Chip } from '@/components/ui/Chip'
import { ArrowRightIcon } from '@/components/icons/arrow-right'
import Link from 'next/link'

interface ActiveCaseCardProps {
  activeCase: CasePublic | null
}

const DIFFICULTY_STARS: Record<string, number> = {
  easy: 2,
  medium: 3,
  hard: 5,
}

const DIFFICULTY_CHIP: Record<string, 'rose' | 'amber' | 'green'> = {
  hard: 'rose',
  medium: 'amber',
  easy: 'green',
}

export function ActiveCaseCard({ activeCase }: ActiveCaseCardProps) {
  if (!activeCase) {
    return (
      <div
        className="relative overflow-hidden rounded-xl border border-border flex flex-col items-center justify-center gap-4 p-8 text-center"
        style={{ background: 'var(--card)', minHeight: 220 }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'var(--indigo-soft)', color: 'var(--indigo)' }}
        >
          <ArrowRightIcon size={24} />
        </div>
        <div>
          <p className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
            All caught up!
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>
            No pending cases right now. Check back later.
          </p>
        </div>
      </div>
    )
  }

  const stars = DIFFICULTY_STARS[activeCase.difficulty] ?? 3
  const chipVariant = DIFFICULTY_CHIP[activeCase.difficulty] ?? 'amber'
  const EST_MINS: Record<string, string> = { easy: '10m', medium: '15m', hard: '20m' }
  const est = EST_MINS[activeCase.difficulty] ?? '15m'

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border"
      style={{ background: 'var(--card)' }}
    >
      {/* Top gradient bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-60"
        style={{
          background: 'linear-gradient(90deg, var(--indigo) 0%, var(--green) 50%, var(--amber) 100%)',
        }}
      />

      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between gap-6">
          <div className="flex flex-col gap-2.5">
            {/* Badge row */}
            <div className="flex gap-2 flex-wrap">
              <Chip variant="indigo">{activeCase.category.toUpperCase()}</Chip>
              <Chip variant={chipVariant}>
                {activeCase.difficulty.toUpperCase()}
              </Chip>
            </div>
            <h2
              className="font-display font-bold text-2xl leading-[1.2] mt-1"
              style={{ color: 'var(--text)', margin: 0 }}
            >
              {activeCase.title}
            </h2>
            <p className="text-sm leading-[1.55]" style={{ color: 'var(--text-dim)', maxWidth: 560 }}>
              {((activeCase as unknown as Record<string, string>)['ai_narrative'] ?? activeCase.aiNarrative ?? '').slice(0, 160).replace(/\s\S+$/, '…')}
            </p>
          </div>
          <div className="flex-shrink-0 pt-1">
            <Stars count={stars} total={5} />
          </div>
        </div>

        {/* Action row */}
        <div
          className="flex justify-between items-center pt-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="flex gap-4 font-mono text-xs tracking-[0.04em]"
            style={{ color: 'var(--text-dim)' }}
          >
            <span>
              EST. <b className="font-medium" style={{ color: 'var(--text)' }}>{est}</b>
            </span>
            <span>
              CASE <b className="font-medium" style={{ color: 'var(--text)' }}>#{activeCase.id}</b>
            </span>
          </div>
          <Link
            href={`/case/${activeCase.id}`}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg font-mono font-medium text-sm tracking-[0.04em] transition-colors"
            style={{
              background: 'var(--indigo)',
              color: 'var(--indigo-dark)',
              border: '1px solid var(--indigo)',
              boxShadow: '0px 2px 6px -2px rgba(192,193,255,0.4)',
              textDecoration: 'none',
            }}
          >
            Start Review <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function ActiveCaseCardSkeleton() {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border"
      style={{ background: 'var(--card)', minHeight: 220 }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-20 animate-pulse"
        style={{ background: 'var(--indigo)' }}
      />
      <div className="p-6 flex flex-col gap-4 animate-pulse">
        <div className="flex gap-2">
          <div className="h-6 w-28 rounded-md" style={{ background: 'var(--card-3)' }} />
          <div className="h-6 w-14 rounded-md" style={{ background: 'var(--card-3)' }} />
        </div>
        <div className="space-y-2">
          <div className="h-7 w-3/4 rounded" style={{ background: 'var(--card-3)' }} />
          <div className="h-4 w-full rounded" style={{ background: 'var(--card-3)' }} />
          <div className="h-4 w-2/3 rounded" style={{ background: 'var(--card-3)' }} />
        </div>
        <div className="h-11 w-36 rounded-lg mt-2" style={{ background: 'var(--card-3)' }} />
      </div>
    </div>
  )
}

// Smoke: <ActiveCaseCard activeCase={null} />
// Smoke: <ActiveCaseCardSkeleton />
