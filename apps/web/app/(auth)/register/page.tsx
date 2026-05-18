'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { registerUser, verifyEmail, resendVerification, login as apiLogin } from '@/lib/api'

export default function RegisterPage() {
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const { login } = useAuth()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerUser({
        email,
        password,
        full_name: fullName || undefined,
        date_of_birth: dateOfBirth || undefined,
      })
      setStep('verify')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyEmail(email, code)
      const params = new URLSearchParams()
      params.append('username', email)
      params.append('password', password)
      const data = await apiLogin(params)
      login(data.access_token)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed')
      setLoading(false)
    }
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <div className="w-full max-w-sm flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="font-display font-bold text-xl text-indigo tracking-[0.04em]">LL</div>
            <h1 className="font-display font-bold text-2xl text-text m-0">Verify your email</h1>
            <p className="text-text-dim text-sm text-center">
              A 6-digit code was sent to <span className="text-text">{email}</span>.
              {' '}Check your inbox or the API logs if SMTP is not configured.
            </p>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-lg border border-rose/30 bg-rose/10 text-rose text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-mute">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="h-12 px-3 rounded-lg border border-border bg-card text-text outline-none focus:border-indigo transition-colors text-center font-mono text-2xl tracking-[0.3em]"
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="h-10 mt-2 rounded-lg font-mono text-sm font-medium bg-indigo text-[#0d0d15] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-sm text-text-mute hover:text-text transition-colors"
                onClick={() => { setStep('register'); setCode(''); setError('') }}
              >
                ← Back
              </button>
              <button
                type="button"
                className="text-sm text-indigo hover:underline transition-colors"
                onClick={async () => {
                  setResendMsg('')
                  await resendVerification(email)
                  setResendMsg('New code sent — check your inbox.')
                }}
              >
                Resend code
              </button>
            </div>
            {resendMsg && <p className="text-xs text-green text-center m-0">{resendMsg}</p>}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="font-display font-bold text-xl text-indigo tracking-[0.04em]">LL</div>
          <h1 className="font-display font-bold text-2xl text-text m-0">Create an account</h1>
          <p className="text-text-dim text-sm text-center">Start reviewing financial cases and track your accuracy.</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg border border-rose/30 bg-rose/10 text-rose text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-mute">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-card text-text outline-none focus:border-indigo transition-colors"
              placeholder="Jane Smith"
            />
          </div>

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
            <label className="text-sm font-medium text-text-mute">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-card text-text outline-none focus:border-indigo transition-colors"
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
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-10 mt-2 rounded-lg font-mono text-sm font-medium bg-indigo text-[#0d0d15] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-sm text-text-mute">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
