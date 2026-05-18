// ScoreCriterionCard — one cell in the 2×2 score-card grid.
// Matches the mockup's .score-card with .pass / .fail / .partial / .neutral tone classes.
// Replaces the stub at components/eval/ScoreCard.tsx.

import type { Tone, CriterionName } from '@ledgerlens/types'
import type { ReactNode } from 'react'

// ── Tone colour maps (mirrors mockup CSS exactly) ────────────────────────────

const TONE_VAL_COLOR: Record<Tone, string> = {
  pass:    'var(--green)',
  fail:    'var(--rose)',
  partial: 'var(--amber)',
  neutral: 'var(--text)',
}

const TONE_BLUR_BG: Record<Tone, string> = {
  pass:    'rgba(16,185,129,0.08)',
  fail:    'rgba(244,63,94,0.08)',
  partial: 'rgba(245,158,11,0.07)',
  neutral: 'rgba(99,102,241,0.06)',
}

const TONE_BADGE: Record<Tone, string> = {
  pass:    'rgba(16,185,129,0.12)',
  fail:    'rgba(147,0,10,0.18)',
  partial: 'var(--amber-soft)',
  neutral: 'var(--card-3)',
}

const TONE_BADGE_BORDER: Record<Tone, string> = {
  pass:    'rgba(16,185,129,0.3)',
  fail:    'rgba(147,0,10,0.6)',
  partial: 'rgba(217,119,33,0.4)',
  neutral: 'var(--border)',
}

const TONE_BADGE_COLOR: Record<Tone, string> = {
  pass:    'var(--green)',
  fail:    'var(--rose)',
  partial: 'var(--amber)',
  neutral: 'var(--indigo)',
}

// ── Criterion metadata ────────────────────────────────────────────────────────

interface CriterionMeta {
  label: string
  icon: ReactNode
  /** true = display as Pass/Missed text; false = display as numeric score/10 */
  textual: boolean
}

// Import lazily at runtime to avoid circular issues — render as inline SVGs
function PassIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="m20 6-11 11-5-5" />
    </svg>
  )
}
function FailIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/>
      <path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  )
}
function LinesIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  )
}

const CRITERION_META: Record<CriterionName, CriterionMeta> = {
  caught_main_issue:       { label: 'CAUGHT MAIN ISSUE',         icon: <PassIcon />,  textual: true  },
  over_trusted_ai:         { label: 'OVER-TRUSTED AI',           icon: <FailIcon />,  textual: true  },
  escalated_appropriately: { label: 'ESCALATED APPROPRIATELY',   icon: <AlertIcon />, textual: false },
  explanation_quality:     { label: 'EXPLANATION QUALITY',       icon: <LinesIcon />, textual: false },
}

function toneLabel(tone: Tone, textual: boolean, score: number): string {
  if (!textual) return String(score)
  return tone === 'pass' ? 'Pass' : 'Missed'
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ScoreCriterionCardProps {
  name: CriterionName
  score: number     // 0–10
  tone: Tone
  rationale?: string
}

export function ScoreCriterionCard({ name, score, tone, rationale }: ScoreCriterionCardProps) {
  const meta = CRITERION_META[name]
  const valColor = TONE_VAL_COLOR[tone]
  const displayVal = toneLabel(tone, meta.textual, score)

  return (
    <div
      className="relative overflow-hidden rounded-[10px] border border-border flex flex-col gap-4"
      style={{ background: 'var(--card-2)', padding: 20, minHeight: 150 }}
      title={rationale}
    >
      {/* Decorative blur orb top-right */}
      <div
        className="absolute rounded-full"
        style={{
          top: -32, right: -32,
          width: 140, height: 140,
          background: TONE_BLUR_BG[tone],
          filter: 'blur(1px)',
          pointerEvents: 'none',
        }}
      />

      {/* Label */}
      <div className="cap" style={{ position: 'relative', zIndex: 1 }}>
        {meta.label}
      </div>

      {/* Value row */}
      <div
        className="flex justify-between items-end mt-auto"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Value */}
        <div
          style={{
            fontFamily: meta.textual ? 'var(--font-display)' : 'var(--font-mono)',
            fontWeight: meta.textual ? 700 : 500,
            fontSize: 30,
            lineHeight: 1.05,
            color: valColor,
            letterSpacing: meta.textual ? 0 : '-0.02em',
          }}
        >
          {displayVal}
          {!meta.textual && (
            <span
              style={{
                fontSize: 16,
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-geist-sans)',
                fontWeight: 500,
                marginLeft: 4,
              }}
            >
              /10
            </span>
          )}
        </div>

        {/* Badge icon */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: TONE_BADGE[tone],
            border: `1px solid ${TONE_BADGE_BORDER[tone]}`,
            color: TONE_BADGE_COLOR[tone],
          }}
        >
          {meta.icon}
        </div>
      </div>

      {/* Sub-label for partial tones (matches mockup .sub) */}
      {tone === 'partial' && !meta.textual && (
        <div
          className="cap absolute"
          style={{ right: 80, bottom: 24, fontSize: 10 }}
        >
          Moderate
        </div>
      )}
    </div>
  )
}

export function ScoreCriterionCardSkeleton() {
  return (
    <div
      className="rounded-[10px] border border-border animate-pulse"
      style={{ background: 'var(--card-2)', padding: 20, minHeight: 150 }}
    >
      <div className="h-2.5 w-32 rounded mb-4" style={{ background: 'var(--card-3)' }} />
      <div className="h-8 w-20 rounded" style={{ background: 'var(--card-3)' }} />
    </div>
  )
}

// Smoke: <ScoreCriterionCard name="caught_main_issue" score={8} tone="pass" />
// Smoke: <ScoreCriterionCard name="over_trusted_ai" score={3} tone="fail" />
// Smoke: <ScoreCriterionCard name="escalated_appropriately" score={4} tone="partial" />
// Smoke: <ScoreCriterionCard name="explanation_quality" score={8} tone="neutral" />
