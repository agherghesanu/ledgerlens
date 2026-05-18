'use client'

// Root error boundary — catches unhandled errors in the whole app.
// Per-route error.tsx files provide more contextual messages.

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console in dev; wire to Sentry/etc. in production
    console.error('[LedgerLens] Unhandled error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ background: '#13131B', color: '#E4E1ED', fontFamily: 'ui-sans-serif, system-ui', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#FFB4AB" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/>
              <path d="M12 9v4"/><path d="M12 17h.01"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 24, margin: '0 0 8px', color: '#E4E1ED' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#C7C4D7', fontSize: 15, margin: 0, maxWidth: 400 }}>
              An unexpected error occurred. The team has been notified.
            </p>
            {error.digest && (
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#8a879b', marginTop: 8 }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={reset}
              style={{ height: 40, padding: '0 20px', borderRadius: 8, fontFamily: 'monospace', fontSize: 13, background: '#C0C1FF', color: '#1000A9', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              Try Again
            </button>
            <a
              href="/dashboard"
              style={{ height: 40, padding: '0 20px', borderRadius: 8, fontFamily: 'monospace', fontSize: 13, background: '#1B1B23', color: '#E4E1ED', border: '1px solid #464554', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
