// FeedbackPanel — rewrites the stub.
// Renders the LLM-generated feedback_summary and expert_would_do paragraphs,
// plus the evaluator-notes card (extracted from the feedback_summary's first sentence).
// Matches mockup: card with card-head, body prose, and amber tip box.

import { SparklesIcon } from '@/components/icons/sparkles'
import { Chip } from '@/components/ui/Chip'

interface FeedbackPanelProps {
  feedbackSummary: string
  expertWouldDo: string
}

export function FeedbackPanel({ feedbackSummary, expertWouldDo }: FeedbackPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Feedback Summary card */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
        <div
          className="px-5 py-4 border-b border-border flex items-center justify-between"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)' }}
        >
          <h3 className="font-display font-bold text-[18px]" style={{ color: 'var(--text)', margin: 0 }}>
            Feedback Summary
          </h3>
          <Chip variant="indigo">EXPERT REVIEW · COMPARED</Chip>
        </div>
        <div className="p-5">
          <p
            className="text-sm leading-[1.65] m-0"
            style={{ color: 'var(--text-dim)' }}
          >
            {feedbackSummary}
          </p>
        </div>
      </div>

      {/* Expert tip box — matches mockup .tip */}
      <div
        className="rounded-lg px-5 py-[18px]"
        style={{
          borderLeft: '3px solid var(--amber)',
          border: '1px solid var(--border)',
          borderLeftWidth: 3,
          borderLeftColor: 'var(--amber)',
          background: 'linear-gradient(180deg, rgba(255,183,131,0.05), transparent 80%), var(--card)',
        }}
      >
        <div
          className="flex items-center gap-2 mb-2"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
          }}
        >
          <SparklesIcon size={14} />
          WHAT AN EXPERT WOULD DO
        </div>
        <p
          className="text-sm leading-[1.6] m-0"
          style={{ color: 'var(--text)' }}
        >
          {expertWouldDo}
        </p>
      </div>
    </div>
  )
}

export function FeedbackPanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border overflow-hidden animate-pulse" style={{ background: 'var(--card)' }}>
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <div className="h-4 w-40 rounded" style={{ background: 'var(--card-3)' }} />
          <div className="h-6 w-36 rounded-md" style={{ background: 'var(--card-3)' }} />
        </div>
        <div className="p-5 space-y-2">
          <div className="h-3.5 w-full rounded" style={{ background: 'var(--card-3)' }} />
          <div className="h-3.5 w-full rounded" style={{ background: 'var(--card-3)' }} />
          <div className="h-3.5 w-2/3 rounded" style={{ background: 'var(--card-3)' }} />
        </div>
      </div>
      <div className="rounded-lg h-24 animate-pulse" style={{ background: 'var(--card-3)' }} />
    </div>
  )
}

// Smoke: <FeedbackPanel feedbackSummary="You correctly spotted..." expertWouldDo="An expert would..." />
