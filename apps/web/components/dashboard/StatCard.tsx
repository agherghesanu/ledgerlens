// StatCard — one of the three top-row stat boxes.
// Skeleton variant used while loading.

import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  /** Trailing element (sparkline bars, etc.) rendered inside the value row */
  trailing?: ReactNode
}

export function StatCard({ label, value, sub, icon, trailing }: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[10px] border border-border flex justify-between items-center gap-3 p-[18px]"
      style={{ background: 'var(--card)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="cap mb-1.5">{label}</div>
        <div className="flex items-baseline gap-2">
          <div
            className="font-mono font-medium leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 44, color: 'var(--text)' }}
          >
            {value}
          </div>
          {sub && (
            <div className="font-mono text-sm" style={{ color: 'var(--text-dim)' }}>
              {sub}
            </div>
          )}
        </div>
        {trailing && <div className="mt-1">{trailing}</div>}
      </div>
      {icon && (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(128,131,255,0.2)', color: 'var(--indigo)' }}
        >
          {icon}
        </div>
      )}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div
      className="rounded-[10px] border border-border p-[18px] flex justify-between items-center gap-3"
      style={{ background: 'var(--card)' }}
    >
      <div className="flex-1 space-y-2 animate-pulse">
        <div className="h-2.5 w-28 rounded" style={{ background: 'var(--card-3)' }} />
        <div className="h-11 w-20 rounded" style={{ background: 'var(--card-3)' }} />
      </div>
      <div className="w-12 h-12 rounded-full animate-pulse" style={{ background: 'var(--card-3)' }} />
    </div>
  )
}

// Smoke: <StatCard label="CASES REVIEWED" value={12} icon={<FolderIcon size={20} />} />
// Smoke: <StatCardSkeleton />
