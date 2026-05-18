// Dashboard loading skeleton — shown by Next.js during server component streaming.
// Matches the dashboard's 3-stat + bento layout exactly.
export default function DashboardLoading() {
  const Skel = ({ w, h, r = 6 }: { w: number | string; h: number; r?: number }) => (
    <div
      className="animate-pulse"
      style={{ width: w, height: h, borderRadius: r, background: 'var(--card-3)', flexShrink: 0 }}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <Skel w={180} h={36} r={8} />
          <Skel w={300} h={16} />
        </div>
        <Skel w={100} h={36} r={8} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-[10px] border border-border p-[18px] flex justify-between items-center gap-3 animate-pulse" style={{ background: 'var(--card)' }}>
            <div className="space-y-2">
              <Skel w={100} h={10} />
              <Skel w={60} h={44} r={6} />
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--card-3)' }} />
          </div>
        ))}
      </div>

      {/* Bento */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border animate-pulse" style={{ background: 'var(--card)', height: 220 }} />
          <div className="rounded-xl border border-border animate-pulse" style={{ background: 'var(--card)', height: 320 }} />
        </div>
        <div className="rounded-xl border border-border animate-pulse" style={{ background: 'var(--card)', height: 400 }} />
      </div>
    </div>
  )
}
