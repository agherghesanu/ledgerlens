'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  User,
  History,
  Settings,
  Sparkles,
} from 'lucide-react'

const NAV = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'cases',     href: '/dashboard', icon: Briefcase,       label: 'Cases' },
  { id: 'profile',   href: '/profile',   icon: User,            label: 'Profile' },
  { id: 'history',   href: '/profile',   icon: History,         label: 'History' },
  { id: 'settings',  href: '/settings',  icon: Settings,        label: 'Settings' },
] as const

type NavId = (typeof NAV)[number]['id']

function isActive(id: NavId, pathname: string): boolean {
  switch (id) {
    case 'dashboard': return pathname === '/dashboard'
    case 'cases':     return pathname.startsWith('/case')
    case 'profile':   return pathname === '/profile'
    case 'history':   return pathname.startsWith('/evaluation')
    case 'settings':  return pathname === '/settings'
  }
}

export function SideNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col items-center py-4 gap-1 flex-shrink-0 sticky top-0 self-start w-[72px] min-h-screen bg-bg-2 border-r border-border">
      {/* Logo */}
      <div className="flex flex-col items-center mb-4 gap-0.5">
        <span className="font-display font-bold text-sm text-indigo tracking-[0.04em]">LL</span>
        <span className="cap text-[9px]">Finance</span>
      </div>

      {/* Nav items */}
      {NAV.map(({ id, href, icon: Icon, label }) => {
        const active = isActive(id, pathname)
        return (
          <Link
            key={id}
            href={href}
            title={label}
            className={`relative flex items-center justify-center w-full h-10 transition-colors ${
              active ? 'text-indigo bg-indigo-soft' : 'text-text-mute'
            }`}
          >
            {active && (
              <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r bg-indigo" />
            )}
            <Icon size={18} />
          </Link>
        )
      })}

      {/* Help */}
      <div className="mt-auto">
        <button title="Help" className="flex items-center justify-center w-10 h-10 text-text-mute transition-colors">
          <Sparkles size={18} />
        </button>
      </div>
    </nav>
  )
}
