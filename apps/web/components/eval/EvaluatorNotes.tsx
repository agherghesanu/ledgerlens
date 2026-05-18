// EvaluatorNotes — amber left-border card in the right sidebar.
// Extracts a first-sentence "headline" from feedback_summary for the
// strong callout, and uses the full rationale from the caught_main_issue
// criterion for the recommendation line.
//
// Matches mockup .evaluator-notes exactly:
// amber left border (3px), amber gradient top, amber h4.

import type { Score } from '@ledgerlens/types'

interface EvaluatorNotesProps {
  score: Score
}

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]+[.!?]/)
  return m ? m[0] : text.slice(0, 120)
}

export function EvaluatorNotes({ score }: EvaluatorNotesProps) {
  const cmi = score.criteria.find((c) => c.name === 'caught_main_issue')
  const eq = score.criteria.find((c) => c.name === 'explanation_quality')

  const headline = firstSentence(score.feedback_summary)
  const recommendation = eq?.rationale ?? cmi?.rationale ?? ''

  return (
    <div
      className="rounded-xl border border-border overflow-hidden"
      style={{
        padding: 20,
        borderLeft: '3px solid var(--amber)',
        background: 'linear-gradient(180deg, rgba(255,183,131,0.04), transparent 70%), var(--card)',
      }}
    >
      <h4
        className="m-0 mb-3"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--amber)',
        }}
      >
        EVALUATOR NOTES
      </h4>
      <div className="text-sm leading-[1.6]" style={{ color: 'var(--text-dim)' }}>
        <p className="m-0 mb-2.5">{headline}</p>
        {recommendation && (
          <p className="m-0">
            {recommendation}
          </p>
        )}
      </div>
    </div>
  )
}

export function EvaluatorNotesSkeleton() {
  return (
    <div
      className="rounded-xl border overflow-hidden animate-pulse"
      style={{
        padding: 20,
        borderLeft: '3px solid var(--amber)',
        background: 'var(--card)',
      }}
    >
      <div className="h-2.5 w-32 rounded mb-3" style={{ background: 'var(--card-3)' }} />
      <div className="space-y-2">
        <div className="h-3 w-full rounded" style={{ background: 'var(--card-3)' }} />
        <div className="h-3 w-4/5 rounded" style={{ background: 'var(--card-3)' }} />
        <div className="h-3 w-2/3 rounded" style={{ background: 'var(--card-3)' }} />
      </div>
    </div>
  )
}

// Smoke: <EvaluatorNotes score={mockScore} />
