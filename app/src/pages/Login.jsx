import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Store, LoaderCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const FRIENDLY_ERRORS = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/too-many-requests': 'Too many attempts — please wait a minute and try again.',
  'auth/network-request-failed': 'Network problem — check your connection.',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password || busy) return
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(FRIENDLY_ERRORS[err.code] || err.message || 'Login failed.')
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-zinc-100 to-brand-100 p-4 dark:from-zinc-950 dark:via-zinc-900 dark:to-brand-950/40">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <Store size={30} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">SwiftGo Restaurant Panel</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to manage your orders and menu
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <label className="mb-1.5 block text-sm font-semibold">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@restaurant.com"
            className="mb-4 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800"
          />

          <label className="mb-1.5 block text-sm font-semibold">Password</label>
          <div className="relative mb-5">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 pr-11 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !email || !password}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <LoaderCircle size={18} className="animate-spin" />}
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Need an account? Contact SwiftGo support.
        </p>
      </div>
    </div>
  )
}
