'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { login as apiLogin } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const params = new URLSearchParams()
      params.append('username', email)
      params.append('password', password)
      const data = await apiLogin(params)
      login(data.access_token)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="font-display font-bold text-xl text-indigo tracking-[0.04em]">LL</div>
          <h1 className="font-display font-bold text-2xl text-text m-0">Welcome back</h1>
          <p className="text-text-dim text-sm text-center">Enter your credentials to access your workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg border border-rose/30 bg-rose/10 text-rose text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-mute">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-card text-text outline-none focus:border-indigo transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-mute">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-card text-text outline-none focus:border-indigo transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="h-10 mt-2 rounded-lg font-mono text-sm font-medium bg-indigo text-indigo-dark hover:brightness-110 transition-all cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <div className="text-center text-sm text-text-mute">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
