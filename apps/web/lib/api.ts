import type { Case, Review, Score } from '@ledgerlens/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// Public case shape — API never sends hiddenTruth to the client
export type CasePublic = Omit<Case, 'hiddenTruth'>

export type ReviewCreate = {
  case_id: string
  action: Review['action']
  reasoning: string
  time_spent_seconds: number
}

export type ReviewCreated = { review_id: string }

export type ScoreOrPending = Score | { status: 'pending' }

export function getCases(): Promise<CasePublic[]> {
  return apiFetch<CasePublic[]>('/cases')
}

export function getCase(id: string): Promise<CasePublic> {
  return apiFetch<CasePublic>(`/cases/${id}`)
}

export function submitReview(payload: ReviewCreate): Promise<ReviewCreated> {
  return apiFetch<ReviewCreated>('/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getScore(reviewId: string): Promise<ScoreOrPending> {
  return apiFetch<ScoreOrPending>(`/reviews/${reviewId}/score`)
}
