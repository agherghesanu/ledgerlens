'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getMe } from './api'

interface User {
  id: string
  email: string
  subscription_status: string
  account_type: 'individual' | 'institutional_admin' | 'institutional_member'
  organization_id: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ['/login', '/register']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedToken = localStorage.getItem('ledgerlens:token')
    if (storedToken) {
      setToken(storedToken)
    } else {
      setIsLoading(false)
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push('/login')
      }
    }
  }, [pathname, router])

  useEffect(() => {
    if (!token) return

    let mounted = true
    getMe(token)
      .then((data) => {
        if (mounted) {
          const raw = data as Omit<User, 'account_type'> & { account_type?: User['account_type'] }
          setUser({
            ...raw,
            account_type: raw.account_type ?? 'individual',
            organization_id: raw.organization_id ?? null,
          } as User)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          localStorage.removeItem('ledgerlens:token')
          setToken(null)
          setUser(null)
          setIsLoading(false)
          router.push('/login')
        }
      })

    return () => {
      mounted = false
    }
  }, [token, router])

  const login = (newToken: string) => {
    localStorage.setItem('ledgerlens:token', newToken)
    setToken(newToken)
    router.push('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('ledgerlens:token')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  // Prevent flashing protected content before auth is resolved
  if (isLoading && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 rounded-full border-2 border-indigo border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
