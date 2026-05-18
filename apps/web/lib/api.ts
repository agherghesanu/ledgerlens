const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  cases: {
    list: () => apiFetch<Case[]>("/cases"),
    get: (id: string) => apiFetch<Case>(`/cases/${id}`),
  },
  reviews: {
    submit: (caseId: string, body: ReviewPayload) =>
      apiFetch<Review>("/reviews", { method: "POST", body: JSON.stringify({ case_id: caseId, ...body }) }),
  },
  scores: {
    get: (reviewId: string) => apiFetch<Score>(`/reviews/${reviewId}/score`),
  },
  profile: {
    get: () => apiFetch<Profile>("/profile"),
  },
};

// Local type aliases until shared package is wired
type Case = import("@ledgerlens/types").Case;
type Review = import("@ledgerlens/types").Review;
type Score = import("@ledgerlens/types").Score;
type ReviewPayload = { answers: Record<string, string> };
type Profile = { user_id: string; skill_aggregates: Record<string, number> };
