'use client'

// RouteError — used inside every route's error.tsx.
// The error boundary is always a client component; this provides the UI.

import Link from 'next/link'
import { useEffect } from 'react'

interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  /** e.g. "/dashboard" */
  fallbackHref?: string
  fallbackLabel?: string
}

export function RouteError({
  error,
  reset,
  fallbackHref = '/dashboard',
  fallbackLabel = 'Back to Dashboard',
}: RouteErrorProps) {
  useEffect(() => {
    console.error('[LedgerLens] Route error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(244,63,94,0.12)', color: 'var(--rose)' }}
      >
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/>
          <path d="M12 9v4"/><path d="M12 17h.01"/>
        </svg>
      </div>

      <div className="max-w-md">
        <h2 className="font-display font-bold text-xl m-0 mb-2" style={{ color: 'var(--text)' }}>
          Something went wrong
        </h2>
        <p className="text-sm m-0" style={{ color: 'var(--text-dim)' }}>
          This page failed to load. This has been logged.
        </p>
        {error.digest && (
          <p className="font-mono text-xs mt-2 m-0" style={{ color: 'var(--text-mute)' }}>
            ref: {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          type="button"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg font-mono text-sm font-medium border-none cursor-pointer"
          style={{ background: 'var(--indigo)', color: 'var(--indigo-dark)' }}
        >
          Try Again
        </button>
        <Link
          href={fallbackHref}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg font-mono text-sm border"
          style={{ background: 'var(--card)', color: 'var(--text)', borderColor: 'var(--border)', textDecoration: 'none' }}
        >
          {fallbackLabel}
        </Link>
      </div>
    </div>
  )
}
