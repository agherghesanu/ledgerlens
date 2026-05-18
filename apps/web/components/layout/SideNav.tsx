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
  Shield,
} from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

const NAV = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'cases',     href: '/case',      icon: Briefcase,       label: 'Cases' },
  { id: 'profile',   href: '/profile',   icon: User,            label: 'Profile' },
  { id: 'settings',  href: '/settings',  icon: Settings,        label: 'Settings' },
] as const

type NavId = (typeof NAV)[number]['id']

function isActive(id: NavId, pathname: string): boolean {
  switch (id) {
    case 'dashboard': return pathname === '/dashboard'
    case 'cases':     return pathname.startsWith('/case') || pathname.startsWith('/evaluation')
    case 'profile':   return pathname === '/profile'
    case 'settings':  return pathname === '/settings'
  }
}

export function SideNav() {
  const pathname = usePathname()
  const { user } = useAuth()

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

      {/* Admin */}
      {user?.account_type === 'institutional_admin' && (
        <Link
          href="/admin"
          title="Admin"
          className={`relative flex items-center justify-center w-full h-10 transition-colors ${
            pathname.startsWith('/admin') ? 'text-indigo bg-indigo-soft' : 'text-text-mute'
          }`}
        >
          {pathname.startsWith('/admin') && (
            <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r bg-indigo" />
          )}
          <Shield size={18} />
        </Link>
      )}

      {/* Help */}
      <div className="mt-auto">
        <button title="Help" className="flex items-center justify-center w-10 h-10 text-text-mute transition-colors">
          <Sparkles size={18} />
        </button>
      </div>
    </nav>
  )
}
