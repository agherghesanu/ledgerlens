'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCases, getCustomCases, apiFetch, getMe } from '@/lib/api'
import type { CasePublic, CustomCaseResponse } from '@/lib/api'
import Link from 'next/link'
import { useState } from 'react'

const DIFFICULTY_STYLES: Record<string, string> = {
  easy:   'text-green bg-green-soft',
  medium: 'text-amber bg-amber-soft',
  hard:   'text-rose  bg-rose-soft',
}

const CATEGORIES = [
  'Revenue Recognition', 'Variance Analysis', 'Reconciliation',
  'Budget vs Actual', 'Cost Classification', 'Cash Flow Analysis', 'Accounts Receivable',
]

function CaseCard({ c }: { c: CasePublic }) {
  const rowCount = c.dataset?.length ?? 0
  const flaggedRows = c.dataset?.filter((r: { flagged?: boolean }) => r.flagged).length ?? 0
  const excerpt = c.aiNarrative && c.aiNarrative.length > 180
    ? c.aiNarrative.slice(0, 180).replace(/\s\S*$/, '') + '…'
    : (c.aiNarrative ?? '')

  return (
    <Link
      href={`/case/${c.id}`}
      className="group flex flex-col gap-4 p-5 rounded-xl border border-border bg-card hover:border-indigo/40 hover:bg-card-2 transition-all duration-200 cursor-pointer no-underline"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="cap text-[10px] px-2 py-0.5 rounded-full bg-card-3 text-text-mute">
          {c.category}
        </span>
        <span className={`cap text-[10px] px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[c.difficulty] ?? 'bg-card-3 text-text-mute'}`}>
          {c.difficulty}
        </span>
      </div>

      <h3 className="font-display font-bold text-[17px] leading-snug text-text m-0 group-hover:text-indigo transition-colors">
        {c.title}
      </h3>

      <div className="flex flex-col gap-1.5">
        <span className="cap text-[9px] text-indigo/70">AI ANALYSIS PREVIEW</span>
        <p className="text-[13px] leading-relaxed text-text-dim m-0">{excerpt}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-dim">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-text-mute">{rowCount} line items</span>
          {flaggedRows > 0 && (
            <span className="font-mono text-[11px] text-rose">{flaggedRows} flagged</span>
          )}
        </div>
        <span className="font-mono text-[12px] text-indigo group-hover:underline">Review →</span>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border border-border bg-card animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-24 rounded-full bg-card-3" />
        <div className="h-4 w-12 rounded-full bg-card-3" />
      </div>
      <div className="h-5 w-3/4 rounded bg-card-3" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full rounded bg-card-3" />
        <div className="h-3 w-5/6 rounded bg-card-3" />
        <div className="h-3 w-4/6 rounded bg-card-3" />
      </div>
      <div className="h-px bg-border-dim mt-auto" />
      <div className="flex justify-between">
        <div className="h-3 w-20 rounded bg-card-3" />
        <div className="h-3 w-14 rounded bg-card-3" />
      </div>
    </div>
  )
}

function CustomCaseCard({ c }: { c: CustomCaseResponse }) {
  const excerpt = c.scenario_text && c.scenario_text.length > 180
    ? c.scenario_text.slice(0, 180).replace(/\s\S*$/, '') + '…'
    : (c.scenario_text ?? '')

  return (
    <Link
      href={`/case/${c.id}`}
      className="group flex flex-col gap-4 p-5 rounded-xl border border-border bg-card hover:border-indigo/40 hover:bg-card-2 transition-all duration-200 cursor-pointer no-underline"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="cap text-[10px] px-2 py-0.5 rounded-full bg-indigo/10 text-indigo">{c.category}</span>
        <span className={`cap text-[10px] px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[c.difficulty] ?? 'bg-card-3 text-text-mute'}`}>
          {c.difficulty}
        </span>
      </div>
      <h3 className="font-display font-bold text-[17px] leading-snug text-text m-0 group-hover:text-indigo transition-colors">{c.title}</h3>
      <div className="flex flex-col gap-1.5">
        <span className="cap text-[9px] text-indigo/70">SCENARIO</span>
        <p className="text-[13px] leading-relaxed text-text-dim m-0">{excerpt}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-dim">
        <span className="font-mono text-[11px] text-text-mute">{c.dataset?.length ?? 0} line items</span>
        <span className="font-mono text-[12px] text-indigo group-hover:underline">Review →</span>
      </div>
    </Link>
  )
}

function GeneratingCard() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-indigo/30 bg-card" style={{ minHeight: 220 }}>
      <div className="w-6 h-6 rounded-full border-2 border-indigo border-t-transparent animate-spin" />
      <span className="cap text-[10px] text-indigo">GEMINI GENERATING…</span>
      <p className="text-[12px] text-text-mute text-center m-0">Creating a new finance scenario with hidden flaws</p>
    </div>
  )
}

export default function CaseBrowserPage() {
  const queryClient = useQueryClient()
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [genError, setGenError] = useState('')

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => getMe() as Promise<{ organization_id?: string | null }> })
  const orgId = me?.organization_id ?? null

  const { data: cases, isLoading } = useQuery({
    queryKey: ['cases', category, difficulty],
    queryFn: () => getCases({ category: category || undefined, difficulty: difficulty || undefined }),
  })

  const { data: customCases } = useQuery({
    queryKey: ['custom-cases', orgId],
    queryFn: () => getCustomCases(orgId!),
    enabled: !!orgId,
  })

  const generateMutation = useMutation({
    mutationFn: () =>
      apiFetch<CasePublic>('/cases/generate', {
        method: 'POST',
        body: JSON.stringify({
          category: category || null,
          difficulty: (difficulty as 'easy' | 'medium' | 'hard') || null,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      setGenError('')
    },
    onError: (e: Error) => setGenError(e.message),
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-[32px] leading-[1.1] tracking-[-0.01em] m-0 mb-1.5 text-text">
            Case Browser
          </h1>
          <p className="text-[15px] m-0 text-text-dim">
            Each case contains an AI-generated analysis with at least one hidden flaw.
          </p>
        </div>

        {/* Generate controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 px-3 rounded-lg border text-sm outline-none font-mono"
            style={{ background: 'var(--card-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="">Any category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="h-9 px-3 rounded-lg border text-sm outline-none font-mono"
            style={{ background: 'var(--card-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button
            type="button"
            disabled={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
            className="h-9 px-4 rounded-lg font-mono text-sm font-medium cursor-pointer disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'var(--indigo)', color: 'var(--indigo-dark)', border: 'none' }}
          >
            {generateMutation.isPending ? (
              <>
                <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                Generating…
              </>
            ) : '✦ Generate Case'}
          </button>
        </div>
      </div>

      {genError && (
        <div className="px-4 py-3 rounded-lg text-sm font-mono" style={{ background: 'rgba(255,180,171,0.1)', color: 'var(--rose)', border: '1px solid rgba(255,180,171,0.3)' }}>
          {genError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {generateMutation.isPending && <GeneratingCard />}
        {cases?.map((c) => <CaseCard key={c.id} c={c} />)}
      </div>

      {customCases && customCases.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-bold text-[20px] text-text m-0">Organization Cases</h2>
            <span className="cap text-[10px] px-2 py-0.5 rounded-full bg-indigo/10 text-indigo">{customCases.length} cases</span>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {customCases.map((c) => <CustomCaseCard key={c.id} c={c} />)}
          </div>
        </div>
      )}
    </div>
  )
}
