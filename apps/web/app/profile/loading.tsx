// Profile loading skeleton — 3 section layout: stats strip + skill/gauge row + patterns row + table.
export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-2 animate-pulse">
          <div className="h-9 w-48 rounded-lg" style={{ background: 'var(--card-3)' }} />
          <div className="h-4 w-80" style={{ background: 'var(--card-3)', borderRadius: 6 }} />
        </div>
        <div className="h-7 w-40 rounded-md animate-pulse" style={{ background: 'var(--card-3)' }} />
      </div>

      {/* Stats strip */}
      <div className="flex gap-6 animate-pulse">
        {[80, 60, 70].map((w, i) => (
          <div key={i} className="h-4 rounded" style={{ width: w + 60, background: 'var(--card-3)' }} />
        ))}
      </div>

      {/* Top row */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="rounded-xl border border-border animate-pulse" style={{ background: 'var(--card)', height: 320 }} />
        <div className="rounded-xl border border-border animate-pulse" style={{ background: 'var(--card)', height: 320 }} />
      </div>

      {/* Patterns row */}
      <div className="grid grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border animate-pulse" style={{ background: 'var(--card)', height: 220 }} />
        ))}
      </div>

      {/* History table */}
      <div className="rounded-xl border border-border animate-pulse" style={{ background: 'var(--card)', height: 320 }} />
    </div>
  )
}
