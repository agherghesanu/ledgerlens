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
    <nav
      className="flex flex-col items-center py-4 gap-1 flex-shrink-0"
      style={{
        width: 72,
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-4 gap-0.5">
        <span
          className="font-display font-bold text-sm"
          style={{ color: 'var(--indigo)', letterSpacing: '0.04em' }}
        >
          LL
        </span>
        <span className="cap" style={{ fontSize: 9 }}>Finance</span>
      </div>

      {/* Nav items */}
      {NAV.map(({ id, href, icon: Icon, label }) => {
        const active = isActive(id, pathname)
        return (
          <Link
            key={id}
            href={href}
            title={label}
            className="relative flex items-center justify-center w-full transition-colors"
            style={{
              height: 40,
              color: active ? 'var(--indigo)' : 'var(--text-mute)',
              background: active ? 'var(--indigo-soft)' : 'transparent',
            }}
          >
            {active && (
              <span
                className="absolute left-0 rounded-r"
                style={{ top: 6, bottom: 6, width: 3, background: 'var(--indigo)' }}
              />
            )}
            <Icon size={18} />
          </Link>
        )
      })}

      {/* Help */}
      <div className="mt-auto">
        <button
          title="Help"
          className="flex items-center justify-center w-10 h-10 transition-colors"
          style={{ color: 'var(--text-mute)' }}
        >
          <Sparkles size={18} />
        </button>
      </div>
    </nav>
  )
}
