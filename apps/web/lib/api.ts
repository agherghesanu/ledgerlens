import type { Case, Review, Score } from '@ledgerlens/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let headers: Record<string, string> = { 'Content-Type': 'application/json' }
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ledgerlens:token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`API ${res.status}: ${path} - ${errText}`)
  }
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

// ── Profile ──────────────────────────────────────────────────────────────────

export interface ProgressPoint {
  /** e.g. "Sep 1" */
  week: string
  /** 0–100 */
  accuracy: number
}

export interface ProfileStats {
  cases_reviewed: number
  /** null when no scored reviews yet */
  accuracy: number | null
  /** percentage-point delta vs prior 30-day window; null if < 2 windows */
  accuracy_delta: number | null
  streak_days: number
  /** last 9 weekly data points */
  progress: ProgressPoint[]
}

export interface RecentReview {
  review_id: string
  case_id: string
  case_title: string
  submitted_at: string
  score_total: number | null
  tone: 'green' | 'amber' | 'rose'
}

// ── Profile aggregate (GET /profile) ─────────────────────────────────────────

export interface SkillBar {
  name: string
  pct: number
}

export interface PatternItem {
  direction: 'strength' | 'weakness'
  criterion: string
  user_mean: number
  global_mean: number
  z_score: number
}

export interface HistoryRow {
  review_id: string
  case_id: string
  date: string
  title: string
  score: number
  time_spent: string
  tone: 'green' | 'amber' | 'rose'
}

export interface ProfileAggregate {
  cases_reviewed: number
  accuracy: number | null
  streak_days: number
  skills: SkillBar[]
  over_trust_index: number | null
  patterns: PatternItem[]
  focus_category: string | null
  history: HistoryRow[]
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

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

export function getProfileStats(): Promise<ProfileStats> {
  return apiFetch<ProfileStats>('/profile/stats')
}

export function getRecentReviews(): Promise<RecentReview[]> {
  return apiFetch<RecentReview[]>('/profile/recent')
}

export function getProfile(): Promise<ProfileAggregate> {
  return apiFetch<ProfileAggregate>('/profile')
}

// ── Stripe ────────────────────────────────────────────────────────────────────

export function createCheckoutSession(tier: 'pro' | 'teams'): Promise<{ checkout_url: string }> {
  return apiFetch('/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier }),
  })
}

// ── Organizations ─────────────────────────────────────────────────────────────

export type OrgResponse = {
  id: string
  name: string
  admin_user_id: string
  subscription_status: string
  max_members: number
}

export type CustomCaseCreate = {
  title: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  scenario_text: string
  dataset?: object[]
  correct_decision?: string
  correct_issue_summary?: string
}

export type CustomCaseResponse = {
  id: string
  title: string
  category: string
  difficulty: string
  scenario_text: string
  dataset: object[]
  organization_id: string
  created_by: string
}

export function createOrganization(name: string): Promise<OrgResponse> {
  return apiFetch('/organizations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
}

export function getOrganization(orgId: string): Promise<OrgResponse> {
  return apiFetch(`/organizations/${orgId}`)
}

export function createCustomCase(orgId: string, payload: CustomCaseCreate): Promise<CustomCaseResponse> {
  return apiFetch(`/organizations/${orgId}/cases`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
}

export function getCustomCases(orgId: string): Promise<CustomCaseResponse[]> {
  return apiFetch(`/organizations/${orgId}/cases`)
}

export function inviteMember(orgId: string, email: string): Promise<{ status: string; member_id: string }> {
  return apiFetch(`/organizations/${orgId}/invite`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(credentials: URLSearchParams) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: credentials,
  })
  if (!res.ok) throw new Error('Invalid credentials')
  return res.json() as Promise<{ access_token: string }>
}

export type RegisterPayload = {
  email: string
  password: string
  full_name?: string
  date_of_birth?: string
}

export type UpdateProfilePayload = {
  full_name?: string
  email?: string
  date_of_birth?: string
  current_password?: string
  new_password?: string
}

export async function registerUser(data: RegisterPayload) {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) })
}

export async function getMe(token?: string) {
  const init: RequestInit = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {}
  return apiFetch('/auth/me', init)
}

export function updateMe(data: UpdateProfilePayload) {
  return apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(data) })
}
