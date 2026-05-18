'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { getCase, apiFetch } from '@/lib/api'
import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { RouteError } from '@/components/layout/RouteError'

export default function CaseDrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [action, setAction] = useState<'Approve' | 'Reject' | 'Escalate' | null>(null)
  const [reasoning, setReasoning] = useState('')

  const { data: caseData, isLoading, error } = useQuery({
    queryKey: ['case', id],
    queryFn: () => getCase(id),
  })

  const submitMutation = useMutation({
    mutationFn: async (body: any) => {
      return apiFetch<{ review_id: string }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: (data) => {
      router.push(`/evaluation/${data.review_id}`)
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-card-3" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-96 rounded-xl bg-card" />
          <div className="h-96 rounded-xl bg-card" />
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return <RouteError error={error as Error || new Error('Case not found')} reset={() => window.location.reload()} fallbackHref="/case" fallbackLabel="Browse Cases" />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!action) return
    submitMutation.mutate({
      case_id: id,
      action,
      reasoning,
      time_spent_seconds: 42, // stub for now
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="cap text-[10px] py-0.5 px-2 rounded-full" style={{ background: 'var(--card-3)', color: 'var(--text-mute)' }}>
            {caseData.category}
          </span>
          <span className="cap text-[10px]" style={{ color: caseData.difficulty === 'hard' ? 'var(--rose)' : 'var(--amber)' }}>
            {caseData.difficulty}
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl text-text m-0 mb-1">{caseData.title}</h1>
        <p className="text-sm text-text-dim max-w-3xl m-0">Review the case details below.</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Left: AI Output & Context */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display font-bold text-lg text-text m-0 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo" />
              AI Analysis Output
            </h3>
            <div className="prose prose-invert max-w-none text-sm text-text-dim">
              <pre className="font-mono text-xs whitespace-pre-wrap bg-card-2 p-4 rounded-lg border border-border">
                {caseData.aiNarrative}
              </pre>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display font-bold text-lg text-text m-0 mb-4">Contextual Evidence</h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-card-2 border-b border-border">
                    <th className="px-4 py-3 font-medium text-text-dim whitespace-nowrap">Account</th>
                    <th className="px-4 py-3 font-medium text-text-dim text-right">Budget</th>
                    <th className="px-4 py-3 font-medium text-text-dim text-right">Actual</th>
                    <th className="px-4 py-3 font-medium text-text-dim text-right">Variance</th>
                    <th className="px-4 py-3 font-medium text-text-dim">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {caseData.dataset.map((row, i) => (
                    <tr key={i} className={`border-b border-border last:border-0 ${row.flagged ? 'bg-rose/5' : ''}`}>
                      <td className="px-4 py-3 flex items-center gap-2">
                        {row.flagged && <span className="w-1.5 h-1.5 rounded-full bg-rose flex-shrink-0" title="Flagged by AI" />}
                        <span className={row.flagged ? 'text-rose font-medium' : 'text-text'}>{row.account}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-text-mute">
                        ${row.budget.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-text">
                        ${row.actual.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-medium ${row.variance > 0 ? 'text-green' : row.variance < 0 ? 'text-rose' : 'text-text-mute'}`}>
                        {row.variance > 0 ? '+' : row.variance < 0 ? '-' : ''}
                        {row.variance === 0 ? '-' : `$${Math.abs(row.variance).toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-dim min-w-[200px]">
                        {row.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Submission Form */}
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-5 sticky top-24">
            <h3 className="font-display font-bold text-lg text-text m-0">Your Decision</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-dim">Action</label>
              <div className="flex flex-col gap-2">
                {['Approve', 'Reject', 'Escalate'].map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${action === opt ? 'border-indigo bg-indigo-soft/20 text-indigo' : 'border-border bg-card-2 text-text-dim'}`}>
                    <input
                      type="radio"
                      name="action"
                      value={opt}
                      checked={action === opt}
                      onChange={(e) => setAction(e.target.value as any)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${action === opt ? 'border-indigo' : 'border-text-mute'}`}>
                      {action === opt && <div className="w-2 h-2 rounded-full bg-indigo" />}
                    </div>
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-dim">Reasoning</label>
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Explain why you made this decision..."
                className="w-full h-32 p-3 rounded-lg border border-border bg-card-2 text-text text-sm outline-none focus:border-indigo transition-colors resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!action || !reasoning || submitMutation.isPending}
              className="h-10 rounded-lg font-mono text-sm font-medium bg-indigo text-indigo-dark disabled:opacity-50 transition-all"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
