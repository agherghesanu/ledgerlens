// Evaluation loading — matches the pending skeleton in EvaluationClient
// but rendered server-side by Next.js before the client chunk hydrates.
export default function EvaluationLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Topbar */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded animate-pulse" style={{ background: 'var(--card-3)' }} />
        <div className="flex gap-2">
          <div className="h-6 w-28 rounded-md animate-pulse" style={{ background: 'var(--card-3)' }} />
          <div className="h-6 w-32 rounded-md animate-pulse" style={{ background: 'var(--card-3)' }} />
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Left */}
        <div className="flex flex-col gap-6">
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-64 rounded" style={{ background: 'var(--card-3)' }} />
            <div className="h-4 w-80 rounded" style={{ background: 'var(--card-3)' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-[10px] border border-border animate-pulse" style={{ background: 'var(--card-2)', minHeight: 150 }} />
            ))}
          </div>
          <div className="rounded-xl border border-border animate-pulse" style={{ background: 'var(--card)', height: 180 }} />
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border animate-pulse" style={{ background: 'var(--card)', height: 160 }} />
          <div className="rounded-xl border border-border animate-pulse" style={{ background: 'var(--card)', height: 120 }} />
          <div className="h-11 rounded-lg animate-pulse" style={{ background: 'var(--card-3)' }} />
          <div className="h-9 rounded-lg animate-pulse" style={{ background: 'var(--card-3)' }} />
        </div>
      </div>
    </div>
  )
}
