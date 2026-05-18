'use client'

// EvaluationClient — client wrapper for the evaluation page.
// Polls useScore(reviewId) every 800ms until a real Score arrives.
// Renders skeleton while loading/pending, real content when resolved,
// error state on failure.

import Link from 'next/link'
import { useScore } from '@/lib/hooks'
import { ScoreCriterionCard, ScoreCriterionCardSkeleton } from './ScoreCard'
import { FeedbackPanel, FeedbackPanelSkeleton } from './FeedbackPanel'
import { EvaluatorNotes, EvaluatorNotesSkeleton } from './EvaluatorNotes'
import { AudioPlayer } from './AudioPlayer'
import { Chip } from '@/components/ui/Chip'
import { ArrowLeftIcon } from '@/components/icons/arrow-left'
import { ArrowRightIcon } from '@/components/icons/arrow-right'
import type { CriterionName } from '@ledgerlens/types'

// Criterion order exactly as in the mockup's 2×2 grid
const CRITERION_ORDER: CriterionName[] = [
  'caught_main_issue',
  'over_trusted_ai',
  'escalated_appropriately',
  'explanation_quality',
]

// ── Pending / loading skeleton ─────────────────────────────────────────────────

function PendingSkeleton({ reviewId }: { reviewId: string }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Topbar row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-dim)' }}>
          <ArrowLeftIcon size={14} />
          <span className="text-sm">Back to Case</span>
        </div>
        <div className="flex items-center gap-2">
          <Chip>SCORING…</Chip>
          <Chip variant="indigo">{reviewId.slice(0, 8).toUpperCase()}</Chip>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        <div className="flex flex-col gap-6">
          {/* Title skeleton */}
          <div className="animate-pulse space-y-2">
            <div className="h-8 w-72 rounded" style={{ background: 'var(--card-3)' }} />
            <div className="h-4 w-96 rounded" style={{ background: 'var(--card-3)' }} />
          </div>

          {/* Score grid skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {CRITERION_ORDER.map((k) => (
              <ScoreCriterionCardSkeleton key={k} />
            ))}
          </div>

          <FeedbackPanelSkeleton />
        </div>

        <div className="flex flex-col gap-4" style={{ position: 'sticky', top: 96 }}>
          <EvaluatorNotesSkeleton />
          <div className="rounded-xl h-40 animate-pulse" style={{ background: 'var(--card)' }} />
          <div className="h-11 w-full rounded-lg animate-pulse" style={{ background: 'var(--card-3)' }} />
          <div className="h-9 w-full rounded-lg animate-pulse" style={{ background: 'var(--card-3)' }} />
        </div>
      </div>

      {/* Pulsing "Scoring in progress" indicator */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-[10px] border border-border z-50"
        style={{
          background: 'var(--card)',
          borderLeft: '3px solid var(--indigo)',
          padding: '14px 18px',
          boxShadow: '0 12px 32px -8px rgba(0,0,0,0.5)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: 'var(--indigo)', boxShadow: '0 0 0 4px rgba(192,193,255,0.2)' }}
        />
        <span className="text-sm" style={{ color: 'var(--text-dim)' }}>
          Scoring in progress…
        </span>
      </div>
    </div>
  )
}

// ── Error state ────────────────────────────────────────────────────────────────

function ErrorState({ error, caseId }: { error: Error; caseId?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: 'var(--rose-soft)', color: 'var(--rose)' }}
      >
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/>
          <path d="M12 9v4"/><path d="M12 17h.01"/>
        </svg>
      </div>
      <div>
        <p className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
          Could not load score
        </p>
        <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-mute)' }}>
          {error.message}
        </p>
      </div>
      {caseId && (
        <Link
          href={`/case/${caseId}`}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg font-mono text-sm border border-border"
          style={{ background: 'var(--card)', color: 'var(--text)', textDecoration: 'none' }}
        >
          <ArrowLeftIcon size={14} /> Back to Case
        </Link>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface EvaluationClientProps {
  reviewId: string
  /** case_id is read from URL state or passed as a prop for Back link */
  caseId?: string
  submittedAt?: string
  caseLabel?: string
}

export function EvaluationClient({
  reviewId,
  caseId,
  submittedAt,
  caseLabel,
}: EvaluationClientProps) {
  const { score, isPending, isLoading, error } = useScore(reviewId)

  if (isLoading || isPending) {
    return <PendingSkeleton reviewId={reviewId} />
  }

  if (error) {
    return <ErrorState error={error} caseId={caseId} />
  }

  // Format submission time
  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }) + ' UTC'
    : null

  return (
    <div className="flex flex-col gap-6">
      {/* Topbar row — back + meta chips */}
      <div className="flex items-center justify-between">
        <Link
          href={caseId ? `/case/${caseId}` : '/dashboard'}
          className="inline-flex items-center gap-2 border-none bg-transparent cursor-pointer no-underline"
          style={{ padding: 0, background: 'none', color: 'var(--text-dim)', textDecoration: 'none' }}
        >
          <ArrowLeftIcon size={14} />
          <span className="text-[13px]">Back to Case</span>
        </Link>
        <div className="flex items-center gap-2.5">
          {submittedLabel && (
            <Chip>SUBMITTED {submittedLabel}</Chip>
          )}
          {caseLabel && (
            <Chip variant="indigo">{caseLabel.toUpperCase()}</Chip>
          )}
        </div>
      </div>

      {/* Two-column layout: 2fr left, 1fr right sticky */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>

        {/* ── Left column ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Page title */}
          <div>
            <h1
              className="font-display font-bold m-0 mb-1.5"
              style={{ fontSize: 28, color: 'var(--text)', lineHeight: 1.15 }}
            >
              Case Assessment Score
            </h1>
            <p
              className="text-[15px] m-0"
              style={{ color: 'var(--text-dim)' }}
            >
              Here is how your analysis compared against our expert baseline.
            </p>
          </div>

          {/* 2×2 scorecard grid */}
          <div className="grid grid-cols-2 gap-4">
            {CRITERION_ORDER.map((name) => {
              const criterion = score.criteria.find((c) => c.name === name)
              if (!criterion) return null
              return (
                <ScoreCriterionCard
                  key={name}
                  name={criterion.name}
                  score={criterion.score}
                  tone={criterion.tone}
                  rationale={criterion.rationale}
                />
              )
            })}
          </div>

          {/* Feedback summary + expert tip */}
          <FeedbackPanel
            feedbackSummary={score.feedback_summary}
            expertWouldDo={score.expert_would_do}
          />
        </div>

        {/* ── Right column (sticky) ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4" style={{ position: 'sticky', top: 96 }}>
          {/* Evaluator notes */}
          <EvaluatorNotes score={score} />

          {/* Audio player — feature-flagged */}
          <AudioPlayer text={score.expert_would_do} />

          {/* CTA buttons */}
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg font-mono font-medium text-sm tracking-[0.04em] transition-colors"
            style={{
              background: 'var(--indigo)',
              color: 'var(--indigo-dark)',
              border: '1px solid var(--indigo)',
              boxShadow: '0px 2px 6px -2px rgba(192,193,255,0.4)',
              textDecoration: 'none',
            }}
          >
            Next Case <ArrowRightIcon size={14} />
          </Link>

          {caseId && (
            <Link
              href={`/case/${caseId}`}
              className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg font-mono font-medium text-sm border border-border transition-colors"
              style={{
                background: 'var(--card)',
                color: 'var(--text)',
                textDecoration: 'none',
              }}
            >
              Review Case Again
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
