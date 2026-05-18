'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell } from 'lucide-react'

type BarConfig = {
  showSearch: boolean
  searchPh?: string
  title?: string
  crumb?: string
}

function getConfig(pathname: string): BarConfig {
  if (pathname === '/dashboard')
    return { showSearch: true, searchPh: 'Search cases...' }
  if (pathname.startsWith('/case'))
    return { showSearch: false, title: 'LedgerLens', crumb: 'Case Review' }
  if (pathname.startsWith('/evaluation'))
    return { showSearch: false, title: 'Evaluation Feedback' }
  if (pathname === '/settings')
    return { showSearch: true, title: 'Settings', searchPh: 'Search settings...' }
  return { showSearch: false, title: 'LedgerLens' }
}

export function TopBar() {
  const pathname = usePathname()
  const cfg = getConfig(pathname)

  return (
    <header
      className="flex items-center justify-between flex-shrink-0 sticky top-0 z-10"
      style={{
        height: 64,
        paddingInline: 32,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {cfg.showSearch && (
          <div
            className="flex items-center gap-2 px-3"
            style={{
              height: 36,
              width: 240,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
          >
            <Search size={14} style={{ color: 'var(--text-mute)', flexShrink: 0 }} />
            <input
              placeholder={cfg.searchPh}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text)' }}
            />
            <span
              className="cap"
              style={{
                fontSize: 10,
                padding: '2px 6px',
                background: 'var(--card-3)',
                borderRadius: 4,
                flexShrink: 0,
              }}
            >
              ⌘K
            </span>
          </div>
        )}
        {cfg.title && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              {cfg.title}
            </span>
            {cfg.crumb && (
              <>
                <span style={{ color: 'var(--border)', fontSize: 16 }}>|</span>
                <span className="text-sm" style={{ color: 'var(--text-mute)' }}>
                  {cfg.crumb}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          title="Notifications"
          className="relative flex items-center justify-center"
          style={{ color: 'var(--text-mute)' }}
        >
          <Bell size={18} />
          <span
            className="absolute rounded-full"
            style={{
              width: 6,
              height: 6,
              top: 0,
              right: 0,
              transform: 'translate(25%, -25%)',
              background: 'var(--rose)',
            }}
          />
        </button>

        <div
          className="flex items-center justify-center rounded-full text-xs font-medium"
          style={{
            width: 32,
            height: 32,
            background: 'var(--indigo-soft)',
            color: 'var(--indigo)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          JD
        </div>
      </div>
    </header>
  )
}
