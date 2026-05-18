import type { Metadata } from 'next'
import { EvaluationClient } from '@/components/eval/EvaluationClient'

export const metadata: Metadata = {
  title: 'Case Assessment — LedgerLens',
  description: 'Review your score and expert feedback for a completed finance case.',
}

/**
 * Evaluation page — server shell.
 * EvaluationClient owns all data fetching (polls useScore every 800ms)
 * and renders skeleton → score once the backend finishes scoring.
 *
 * Route: /evaluation/[reviewId]
 * Navigation target after submitReview() resolves in the case review flow.
 */
export default async function EvaluationPage({
  params,
  searchParams,
}: {
  params: Promise<{ reviewId: string }>
  searchParams: Promise<{ caseId?: string; submittedAt?: string; caseLabel?: string }>
}) {
  const { reviewId } = await params
  const { caseId, submittedAt, caseLabel } = await searchParams

  return (
    <EvaluationClient
      reviewId={reviewId}
      caseId={caseId}
      submittedAt={submittedAt}
      caseLabel={caseLabel}
    />
  )
}
