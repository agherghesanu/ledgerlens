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
    <header className="flex items-center justify-between flex-shrink-0 sticky top-0 z-10 h-16 px-8 bg-bg border-b border-border">
      {/* Left */}
      <div className="flex items-center gap-3">
        {cfg.showSearch && (
          <div className="flex items-center gap-2 px-3 h-9 w-60 bg-card border border-border rounded-lg">
            <Search size={14} className="text-text-mute shrink-0" />
            <input
              placeholder={cfg.searchPh}
              className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-mute"
            />
            <span className="cap text-[10px] py-0.5 px-1.5 bg-card-3 rounded shrink-0">⌘K</span>
          </div>
        )}
        {cfg.title && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-text">{cfg.title}</span>
            {cfg.crumb && (
              <>
                <span className="text-border text-base">|</span>
                <span className="text-sm text-text-mute">{cfg.crumb}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button title="Notifications" className="relative flex items-center justify-center text-text-mute">
          <Bell size={18} />
          <span className="absolute w-1.5 h-1.5 top-0 right-0 translate-x-[25%] -translate-y-[25%] rounded-full bg-rose" />
        </button>

        <div className="flex items-center justify-center rounded-full w-8 h-8 bg-indigo-soft text-indigo font-mono text-xs font-medium">
          JD
        </div>
      </div>
    </header>
  )
}
