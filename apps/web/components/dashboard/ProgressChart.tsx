// ProgressChart — SVG area line chart, ported from mockup ProgressChart.
// Receives real weekly accuracy points from the API.

import type { ProgressPoint } from '@/lib/api'

interface ProgressChartProps {
  points: ProgressPoint[]
}

export function ProgressChart({ points }: ProgressChartProps) {
  const W = 100
  const H = 100
  const stepX = W / Math.max(points.length - 1, 1)
  const values = points.map((p) => p.accuracy)
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1)
  const norm = (v: number) => ((v - min) / (max - min)) * H

  const pathD = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${H - norm(v)}`)
    .join(' ')
  const areaD = `${pathD} L ${(values.length - 1) * stepX} ${H} L 0 ${H} Z`

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-border"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)',
        }}
      >
        <h3 className="font-display font-bold text-[18px]" style={{ color: 'var(--text)' }}>
          Accuracy Progress
        </h3>
        <span className="cap" style={{ color: 'var(--indigo)' }}>LAST 9 WEEKS</span>
      </div>
      <div className="p-5">
        <div
          className="relative"
          style={{
            height: 240,
            background: 'var(--bg-2)',
            border: '1px solid var(--border-dim)',
            borderRadius: 8,
            padding: '16px 20px',
          }}
        >
          {/* Grid lines */}
          <div className="absolute inset-x-5 top-4 bottom-7 flex flex-col justify-between pointer-events-none opacity-40">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-px" style={{ background: 'var(--border-dim)' }} />
            ))}
          </div>

          {/* SVG line + area */}
          <svg
            className="absolute"
            style={{ inset: '16px 20px 28px 20px', width: 'calc(100% - 40px)', height: 'calc(100% - 44px)' }}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="area-grad-ll" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C0C1FF" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#C0C1FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#area-grad-ll)" />
            <path
              d={pathD}
              fill="none"
              stroke="#C0C1FF"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
            {values.map((v, i) => (
              <circle
                key={i}
                cx={i * stepX}
                cy={H - norm(v)}
                r="0.9"
                fill="#C0C1FF"
                stroke="#13131B"
                strokeWidth="0.4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* X labels */}
          <div
            className="absolute left-5 right-5 bottom-0 flex justify-between"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-mute)',
              letterSpacing: '0.04em',
            }}
          >
            {points.map((p, i) => (
              <span key={i}>{p.week}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProgressChartSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <div className="h-4 w-40 rounded animate-pulse" style={{ background: 'var(--card-3)' }} />
        <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'var(--card-3)' }} />
      </div>
      <div className="p-5">
        <div
          className="h-[240px] rounded-lg animate-pulse"
          style={{ background: 'var(--card-3)' }}
        />
      </div>
    </div>
  )
}

// Smoke: <ProgressChart points={[{week:'Sep 1',accuracy:45},{week:'Sep 8',accuracy:60},{week:'Today',accuracy:73}]} />
