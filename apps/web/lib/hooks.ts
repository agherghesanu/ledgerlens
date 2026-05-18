import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCases, getCase, submitReview, getScore } from '@/lib/api'
import type { ReviewCreate } from '@/lib/api'

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

export function useScore(reviewId: string | null) {
  return useQuery({
    queryKey: ['score', reviewId],
    queryFn: () => getScore(reviewId!),
    enabled: Boolean(reviewId),
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data || 'status' in data) return 2_000
      return false
    },
  })
}
