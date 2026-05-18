'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCases, getCase, submitReview, getScore } from '@/lib/api'
import type { ReviewCreate } from '@/lib/api'
import type { Score } from '@ledgerlens/types'

export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: getCases,
  })
}

export function useCase(id: string) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => getCase(id),
    enabled: Boolean(id),
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReviewCreate) => submitReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })
}

// ── useScore ──────────────────────────────────────────────────────────────────
// Polls GET /reviews/{reviewId}/score every 800ms until the score is resolved.
// Stops polling once a real Score (not { status: "pending" }) arrives.

export type ScoreResult =
  | { score: Score;  isPending: false; isLoading: false; error: null }
  | { score: null;   isPending: true;  isLoading: false; error: null }
  | { score: null;   isPending: false; isLoading: true;  error: null }
  | { score: null;   isPending: false; isLoading: false; error: Error }

export function useScore(reviewId: string | null): ScoreResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['score', reviewId],
    queryFn: () => getScore(reviewId as string),
    enabled: Boolean(reviewId),
    // Poll every 800ms while still pending
    refetchInterval: (query) => {
      const d = query.state.data
      if (!d) return 800
      if ('status' in d && d.status === 'pending') return 800
      return false
    },
    retry: 1,
  })

  if (isLoading) {
    return { score: null, isPending: false, isLoading: true, error: null }
  }
  if (error) {
    return { score: null, isPending: false, isLoading: false, error: error as Error }
  }
  if (!data || ('status' in data && data.status === 'pending')) {
    return { score: null, isPending: true, isLoading: false, error: null }
  }
  return { score: data as Score, isPending: false, isLoading: false, error: null }
}
