// HistoryTable — full scored review history with date, title, score chip, time.
// Ported from mockup .history-table.

import type { HistoryRow } from '@/lib/api'
import { Chip } from '@/components/ui/Chip'
import Link from 'next/link'

interface HistoryTableProps {
  history: HistoryRow[]
}

export function HistoryTable({ history }: HistoryTableProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div
        className="px-5 py-4 border-b border-border flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)' }}
      >
        <h3 className="font-display font-bold text-[18px] m-0" style={{ color: 'var(--text)' }}>
          Recent History
        </h3>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] border-none bg-transparent cursor-pointer"
            style={{ color: 'var(--text-dim)' }}
          >
            {/* Filter icon */}
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            FILTER
          </button>
          <button
            className="font-mono text-[11px] uppercase tracking-[0.08em] border-none bg-transparent cursor-pointer"
            style={{ color: 'var(--text-dim)' }}
          >
            EXPORT
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
          <p className="text-sm m-0" style={{ color: 'var(--text-dim)' }}>
            No reviewed cases yet.
          </p>
          <p className="text-xs m-0" style={{ color: 'var(--text-mute)' }}>
            Complete your first case to see your history here.
          </p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Date', 'Case Title', 'Score', 'Time Spent', ''].map((h) => (
                <th
                  key={h}
                  className="text-left"
                  style={{
                    padding: '10px 20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-mute)',
                    fontWeight: 500,
                    width: h === 'Date' ? 120 : h === 'Score' ? 120 : h === 'Time Spent' ? 110 : h === '' ? 48 : undefined,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr
                key={row.review_id}
                style={{ borderBottom: '1px solid var(--border-dim)', cursor: 'pointer' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')
                }
              >
                <td
                  className="font-mono"
                  style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-mute)' }}
                >
                  {row.date}
                </td>
                <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--text)' }}>
                  {row.title}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <Chip variant={row.tone}>{row.score}/100</Chip>
                </td>
                <td
                  className="font-mono"
                  style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-mute)' }}
                >
                  {row.time_spent}
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <Link
                    href={`/evaluation/${row.review_id}?caseId=${row.case_id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'var(--text-dim)', display: 'inline-flex' }}
                  >
                    {/* ChevronRight */}
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function HistoryTableSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden animate-pulse" style={{ background: 'var(--card)' }}>
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <div className="h-4 w-36 rounded" style={{ background: 'var(--card-3)' }} />
        <div className="h-3 w-24 rounded" style={{ background: 'var(--card-3)' }} />
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="px-5 py-3.5 flex items-center gap-4" style={{ borderBottom: '1px solid var(--border-dim)' }}>
          <div className="h-3 w-24 rounded" style={{ background: 'var(--card-3)' }} />
          <div className="flex-1 h-3 rounded" style={{ background: 'var(--card-3)' }} />
          <div className="h-6 w-16 rounded-md" style={{ background: 'var(--card-3)' }} />
          <div className="h-3 w-12 rounded" style={{ background: 'var(--card-3)' }} />
        </div>
      ))}
    </div>
  )
}

// Smoke: <HistoryTable history={[]} />
