import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found · LedgerLens',
}

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
      style={{ background: 'var(--bg)' }}
    >
      {/* Glow orb */}
      <div
        className="absolute rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, var(--indigo), transparent 70%)',
          top: '30%', left: '50%',
          transform: 'translate(-50%,-50%)',
        }}
      />

      <div className="relative flex flex-col items-center text-center gap-4 max-w-lg">
        {/* 404 display number */}
        <div
          className="font-mono font-medium leading-none select-none"
          style={{ fontSize: 120, color: 'var(--card-3)', letterSpacing: '-0.05em' }}
        >
          404
        </div>

        <div className="flex flex-col gap-2">
          <h1
            className="font-display font-bold m-0"
            style={{ fontSize: 28, color: 'var(--text)' }}
          >
            Case file not found
          </h1>
          <p className="text-[15px] m-0" style={{ color: 'var(--text-dim)' }}>
            The page you're looking for doesn't exist or has been moved. No anomaly here — just a wrong turn.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg font-mono font-medium text-sm tracking-[0.04em]"
            style={{
              background: 'var(--indigo)',
              color: 'var(--indigo-dark)',
              border: '1px solid var(--indigo)',
              boxShadow: '0px 2px 6px -2px rgba(192,193,255,0.4)',
              textDecoration: 'none',
            }}
          >
            Back to Dashboard
          </Link>
          <Link
            href="/case"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg font-mono font-medium text-sm border"
            style={{
              background: 'var(--card)',
              color: 'var(--text)',
              borderColor: 'var(--border)',
              textDecoration: 'none',
            }}
          >
            Browse Cases
          </Link>
        </div>
      </div>
    </div>
  )
}
