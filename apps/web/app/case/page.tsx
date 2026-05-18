'use client'

import { useQuery } from '@tanstack/react-query'
import { getCases } from '@/lib/api'
import type { CasePublic } from '@/lib/api'
import Link from 'next/link'

const DIFFICULTY_STYLES: Record<string, string> = {
  easy:   'text-green bg-green-soft',
  medium: 'text-amber bg-amber-soft',
  hard:   'text-rose  bg-rose-soft',
}

function CaseCard({ c }: { c: CasePublic }) {
  const rowCount = c.dataset?.length ?? 0
  const flaggedRows = c.dataset?.filter((r: { flagged?: boolean }) => r.flagged).length ?? 0
  // Show first ~180 chars of the narrative as the scenario excerpt
  const excerpt = c.aiNarrative.length > 180
    ? c.aiNarrative.slice(0, 180).replace(/\s\S*$/, '') + '…'
    : c.aiNarrative

  return (
    <Link
      href={`/case/${c.id}`}
      className="group flex flex-col gap-4 p-5 rounded-xl border border-border bg-card hover:border-indigo/40 hover:bg-card-2 transition-all duration-200 cursor-pointer no-underline"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <span className="cap text-[10px] px-2 py-0.5 rounded-full bg-card-3 text-text-mute">
          {c.category}
        </span>
        <span className={`cap text-[10px] px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[c.difficulty] ?? 'bg-card-3 text-text-mute'}`}>
          {c.difficulty}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-[17px] leading-snug text-text m-0 group-hover:text-indigo transition-colors">
        {c.title}
      </h3>

      {/* AI narrative excerpt */}
      <div className="flex flex-col gap-1.5">
        <span className="cap text-[9px] text-indigo/70">AI ANALYSIS PREVIEW</span>
        <p className="text-[13px] leading-relaxed text-text-dim m-0">{excerpt}</p>
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-dim">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-text-mute">
            {rowCount} line items
          </span>
          {flaggedRows > 0 && (
            <span className="font-mono text-[11px] text-rose">
              {flaggedRows} flagged
            </span>
          )}
        </div>
        <span className="font-mono text-[12px] text-indigo group-hover:underline">
          Review →
        </span>
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

export default function CaseBrowserPage() {
  const { data: cases, isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: getCases,
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-[32px] leading-[1.1] tracking-[-0.01em] m-0 mb-1.5 text-text">
          Case Browser
        </h1>
        <p className="text-[15px] m-0 text-text-dim">
          Select a financial scenario to drill your review skills. Each case contains an AI-generated analysis with at least one hidden flaw.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {cases?.map((c) => <CaseCard key={c.id} c={c} />)}
      </div>
    </div>
  )
}
